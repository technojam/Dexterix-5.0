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

    const results = [];
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

        const memberName = record["Name"] || record["Members"];
        const leaderCol = record["Team Leader"] || record["Team Leader Name"];
        const email = record["Email"];
        const phone = record["Phone Number"];

        if (memberName) {
            // Check if this row represents the leader
            const isLeader = leaderCol && memberName.trim().toLowerCase() === leaderCol.trim().toLowerCase();

            const memberObj = {
                name: memberName,
                email: email || "",
                phone: phone || "",
                gender: record["Gender"] || "",
                course: record["Course"] || "",
                year: record["Year"] || "",
                college: record["College/University"] || record["College"] || "",
                isLeader: isLeader
            };

            if (isLeader) {
                team.leaderName = memberName;
                team.leaderEmail = email;
                team.phone = phone;
            }

            // Add to members array (avoid duplicates based on email or name)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const exists = team.members.find((m: any) => 
                (m.email && m.email === email && email) || m.name === memberName
            );

            if (!exists) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (team.members as any).push(memberObj);
            }
        }
    }

    // 2. Save grouped teams to Cosmos
    const teamsContainer = await cosmosService.getTeamsContainer();

    for (const team of teamsMap.values()) {
        if (team.name && team.leaderEmail) {
            // Check existence
            const querySpec = {
                query: "SELECT * FROM c WHERE c.leaderEmail = @email",
                parameters: [{ name: "@email", value: team.leaderEmail }]
            };
            if (team.id) {
                 querySpec.query += " OR c.id = @id";
                 querySpec.parameters.push({ name: "@id", value: team.id });
            }

            const { resources: existing } = await teamsContainer.items.query(querySpec).fetchAll();

            if (existing.length === 0) {
                // Ensure ID is set (should be from CSV, but fallback to UUID if missing logic fails)
                if (!team.id) team.id = uuidv4();
                
                await cosmosService.createTeam(team);
                results.push(team);
            }
        }
    }

    return NextResponse.json({ success: true, count: results.length, teams: results });
  } catch (error) {
    console.error("CSV Upload Error:", error);
    return NextResponse.json({ error: "Failed to process CSV" }, { status: 500 });
  }
}
