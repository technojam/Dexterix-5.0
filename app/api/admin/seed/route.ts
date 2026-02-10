import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import ExcelJS from "exceljs";
import { storageService } from "@/lib/services/storage.service";
import { authService } from "@/lib/services/auth.service";
import { cosmosService, ITeam } from "@/lib/services/cosmos.service";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

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

    // 1. Upload to Azure Storage (Audit) via Service
    try {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        await storageService.uploadFile(file, `team_upload_${Date.now()}_${sanitizedFileName}`);
    } catch (e) {
        console.warn("Audit Upload Failed:", e);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let records: any[] = [];

    // 2. Parse File (CSV or Excel)
    if (file.name.endsWith(".xlsx")) {
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        
        const headers: string[] = [];
        worksheet.eachRow((row, rowNumber) => {
             if (rowNumber === 1) {
                 row.eachCell((cell, colNumber) => {
                     headers[colNumber] = cell.value?.toString() || "";
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
                 records.push(rowData);
             }
        });
    } else if (file.name.endsWith(".xls")) {
        return NextResponse.json({ error: "Legacy .xls format is not supported. Please use .xlsx or .csv" }, { status: 400 });
    } else {
        const text = await file.text();
        records = parse(text, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
    }

    const teamsMap = new Map<string, ITeam>();
    let lastTeamId = "";

    // 1. Group rows into Teams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const record of records as any[]) {
        // Keys: "TeamId", "Team Name", "Team Leader", "Members", "Email", "Phone Number", "College/University", "Year"
        
        const rawId = record["TeamId"] || record["Team ID"] || record["id"];
        const currentId = rawId ? rawId.toString() : lastTeamId;
        
        if (!currentId) continue; // Skip if no ID tracked
        
        lastTeamId = currentId;

        if (!teamsMap.has(currentId)) {
             teamsMap.set(currentId, {
                 id: currentId,
                 name: record["Team Name"] || "",
                 leaderName: "",
                 leaderEmail: "",
                 members: [],
                 college: record["College/University"] || record["College"] || "",
                 year: record["Year"] || "",
                 problemStatementId: undefined,
                 score: 0,
                 checkedIn: false
             });
        }

        const team = teamsMap.get(currentId)!;
        
        // Update generic info if found (handling grouped rows)
        if (!team.name && record["Team Name"]) team.name = record["Team Name"];
        if (!team.college && (record["College/University"] || record["College"])) team.college = record["College/University"] || record["College"];
        if (!team.year && record["Year"]) team.year = record["Year"];

        const memberName = record["Name"] || record["Members"] || record["Member Name"];
        const leaderCol = record["Team Leader"] || record["Team Leader Name"] || record["Leader Name"];
        const email = record["Email"] || record["Email Address"];
        const phone = record["Phone Number"] || record["Phone"] || record["Mobile"] || record["Contact"];

        if (memberName) {
            // Check if this row represents the leader
            // Relaxed matching for multi-word names: "Anuj Singh" (Leader) matches "Anuj Singh" (Member) or even "Anuj" partially
            // But strict check is safer. The issue might be leading/trailing spaces or casing.
            const normalizedMember = memberName.toString().trim().toLowerCase();
            const normalizedLeaderCol = leaderCol ? leaderCol.toString().trim().toLowerCase() : "";
            
            // Check if this member IS the leader
            // Sometimes excel has just "Leader Name" column filled for one row, and "Members" has everyone including leader.
            // Or "Team Leader" column has the name, and "Name" column has the same name.
            const isLeader = normalizedLeaderCol && normalizedMember === normalizedLeaderCol;

            const memberObj = {
                name: memberName.toString().trim(),
                email: (email || "").toString().trim(),
                phone: (phone || "").toString().trim(),
                gender: (record["Gender"] || "").toString().trim(),
                course: (record["Course"] || "").toString().trim(),
                year: (record["Year"] || "").toString().trim(),
                college: (record["College/University"] || record["College"] || "").toString().trim(),
                isLeader: isLeader
            };

            if (isLeader || !team.leaderName) {
                // If strictly matched as leader OR if no leader set yet (fallback to first member?)
                // Better to rely on the column "Team Leader" existing.
                if (isLeader) {
                    team.leaderName = memberName.toString().trim();
                    team.leaderEmail = (email || "").toString().trim();
                    team.phone = (phone || "").toString().trim();
                    memberObj.isLeader = true;
                } else if (normalizedLeaderCol && !team.leaderName) {
                     // Leader defined in column but hasn't been found in rows yet?
                     // Or this row is just a member.
                     // Wait, if "Team Leader" column has a name "Anuj Singh"
                     // And this row is "Rohit", then isLeader=false.
                     // But if the row for "Anuj Singh" never comes? 
                     // Usually the leader is ONE of the rows.
                }

                // Fallback: If "Team Leader" column is empty in Excel, maybe the first row is leader?
                // User said "Team 20 skipped".
                // If logic requires `team.leaderEmail` to save, and `isLeader` logic failed, team won't save.
            }
            // Explicitly set leader info if this row *defines* the leader even if not matched by name (e.g. specialized columns)
            if (record["Leader Email"] && !team.leaderEmail) team.leaderEmail = record["Leader Email"];
            if (record["Leader Phone"] && !team.phone) team.phone = record["Leader Phone"];
            if (record["Team Leader"] && !team.leaderName) team.leaderName = record["Team Leader"];

            // Add to members array (avoid duplicates based on email or name)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const exists = team.members.find((m: any) => 
                (m.email && m.email === memberObj.email && memberObj.email) || m.name === memberObj.name
            );

            if (!exists) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (team.members as any).push(memberObj);
            }
        }
    }

    const results = [];
    let skippedCount = 0;
    const teamsContainer = await cosmosService.getTeamsContainer();

    for (const team of teamsMap.values()) {
        // Validation: Must have at least a Name and SOME contact info (Email or Leader Email)
        const validEmail = team.leaderEmail || (team.members.length > 0 ? (team.members[0] as any).email : null);
        
        if (team.name && validEmail) {
            // Apply fallback if leaderEmail was missing but member had it
            if (!team.leaderEmail) team.leaderEmail = validEmail;
            
            // Check existence: User requested strictly ID if present, otherwise fallback to Email
            let querySpec;
            
            if (team.id) {
                // If ID is provided in CSV, that is the single source of truth for duplication
                querySpec = {
                    query: "SELECT * FROM c WHERE c.id = @id",
                    parameters: [{ name: "@id", value: team.id }]
                };
            } else {
                // If no ID, use email to prevent creating new IDs for same person
                querySpec = {
                    query: "SELECT * FROM c WHERE c.leaderEmail = @email",
                    parameters: [{ name: "@email", value: team.leaderEmail }]
                };
            }

            const { resources: existing } = await teamsContainer.items.query(querySpec).fetchAll();

            if (existing.length === 0) {
                // Ensure ID is set
                if (!team.id) team.id = uuidv4();
                
                await cosmosService.createTeam(team);
                results.push(team);
            } else {
                skippedCount++;
            }
        }
    }

    return NextResponse.json({ success: true, count: results.length, skipped: skippedCount, teams: results });
  } catch (error) {
    console.error("CSV Upload Error:", error);
    return NextResponse.json({ error: "Failed to process CSV" }, { status: 500 });
  }
}
