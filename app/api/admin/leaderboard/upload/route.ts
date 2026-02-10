import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import ExcelJS from "exceljs";
import { authService } from "@/lib/services/auth.service";
import { cosmosService } from "@/lib/services/cosmos.service";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // START: Server-side Auth Check
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    
    if (!sessionToken) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const isValid = await authService.verifySessionCookie(sessionToken);
    if (!isValid) {
        return NextResponse.json({ error: "Invalid Session" }, { status: 401 });
    }
    // END: Auth Check

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let records: any[] = [];

    // Parse File (CSV or Excel)
    if (file.name.endsWith(".xlsx")) {
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        
        const headers: string[] = [];
        worksheet.eachRow((row, rowNumber) => {
             if (rowNumber === 1) {
                 row.eachCell((cell, colNumber) => {
                     headers[colNumber] = cell.value?.toString().trim() || "";
                 });
             } else {
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 const rowData: any = {};
                 row.eachCell((cell, colNumber) => {
                     const header = headers[colNumber];
                     if (header) {
                         let val = cell.value;
                         // Handle rich text / formulas
                         if (val && typeof val === "object") {
                             // eslint-disable-next-line @typescript-eslint/no-explicit-any
                             if ("result" in val) val = (val as any).result;
                             // eslint-disable-next-line @typescript-eslint/no-explicit-any
                             else if ("text" in val) val = (val as any).text;
                         }
                         rowData[header] = val;
                     }
                 });
                 if (Object.keys(rowData).length > 0) records.push(rowData);
             }
        });
    } else {
        const text = await file.text();
        records = parse(text, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
    }

    let updatedCount = 0;
    const errors: string[] = [];
    const missingIds: string[] = [];

    const container = await cosmosService.getTeamsContainer();

    // Fetch all existing teams to do lookups
    const { resources: allTeams } = await container.items.query("SELECT * FROM c").fetchAll();
    
    // Create a map for fast lookup by Team ID
    const teamMap = new Map<string, any>();

    const addToMap = (key: string | number, team: any) => {
        if (!key) return;
        const strKey = key.toString().trim().toLowerCase();
        if (!strKey) return;

        // 1. Exact Match
        if (!teamMap.has(strKey)) teamMap.set(strKey, team);
        
        // 2. Remove non-alphanumeric (e.g. "T-001" -> "t001")
        const stripped = strKey.replace(/[^a-z0-9]/g, "");
        if (stripped && stripped !== strKey) {
             if (!teamMap.has(stripped)) teamMap.set(stripped, team);
        }

        // 3. Number Normalization (handle "001" vs "1")
        // If the key is purely numeric or numeric with leading zeros
        if (/^\d+$/.test(stripped)) {
            const numVal = parseInt(stripped, 10);
            const simpleNum = numVal.toString(); // "1"

            if (!teamMap.has(simpleNum)) teamMap.set(simpleNum, team);
            
            // Common paddings
            const pad2 = simpleNum.padStart(2, '0');
            const pad3 = simpleNum.padStart(3, '0');
            const pad4 = simpleNum.padStart(4, '0');
            if (!teamMap.has(pad2)) teamMap.set(pad2, team);
            if (!teamMap.has(pad3)) teamMap.set(pad3, team);
            if (!teamMap.has(pad4)) teamMap.set(pad4, team);
        }
    };

    allTeams.forEach(t => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tAny = t as any;
        const possibleIds = [t.teamId, tAny.TeamId, tAny.TeamID, t.id];
        possibleIds.forEach(id => {
            if (id) addToMap(id, t);
        });
    });

    for (const record of records) {
        // Look for ID columns
        const rawTeamId = (
            record["Team ID"] || 
            record["TeamId"] || 
            record["Team Id"] || 
            record["ID"] || 
            record["id"]
        );
        
        const teamId = rawTeamId?.toString().trim();
        const score = record["Score"] || record["score"];
        
        if (!teamId) continue;

        // Try lookup:
        // 1. Exact
        let team = teamMap.get(teamId.toLowerCase());
        
        // 2. Stripped (e.g. input "T-001" vs DB "t001")
        if (!team) {
             const strippedInput = teamId.toLowerCase().replace(/[^a-z0-9]/g, "");
             team = teamMap.get(strippedInput);
        }
        
        // 3. Numeric (e.g. input "001" vs DB "1", or input "1" vs DB "001")
        if (!team && /^\d+$/.test(teamId)) {
             const asInt = parseInt(teamId, 10).toString();
             team = teamMap.get(asInt);
        }
        
        // 4. Suffix Match (Last Resort: Input "667" matches DB "TYDT-667")
        if (!team) {
            const suffix = teamId.toLowerCase();
            // Only try if suffix is at least 2 chars to avoid matching "-1" everywhere
            if(suffix.length >= 2) {
                // Find all candidates ending with this suffix
                const candidates = allTeams.filter(t => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const tid = (t.teamId || (t as any).TeamId || "").toString().toLowerCase();
                    return tid.endsWith(suffix) || tid.endsWith("-" + suffix); // "TYDT-667" ends with "667"
                });
                
                // Only auto-match if exactly one candidate found (safe)
                if(candidates.length === 1) {
                    team = candidates[0];
                }
            }
        }

        if (team) {
            try {
                // Determine update needed
                let isDirty = false;
                
                if (score !== undefined) {
                    const numScore = parseFloat(score);
                     if (!isNaN(numScore)) {
                        team.score = numScore;
                        isDirty = true;
                     }
                }

                if (isDirty) {
                    await container.item(team.id, team.id).replace(team);
                    updatedCount++;
                }
            } catch (e) {
                console.error(`Failed to update team ${teamId}:`, e);
                errors.push(`Error updating ${teamId}`);
            }
        } else {
            missingIds.push(teamId);
        }
    }
    
    // Consolidate errors
    if(missingIds.length > 0) {
        errors.push(`Teams not found: ${missingIds.join(", ")}`);
    }

    return NextResponse.json({ 
        message: "Processing complete",
        updated: updatedCount,
        errors: errors.slice(0, 10) // Limit output size
    });

  } catch (error) {
    console.error("Leaderboard upload failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
