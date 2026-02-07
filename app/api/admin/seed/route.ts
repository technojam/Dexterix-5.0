import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { storageService } from "@/lib/services/storage.service";
import { authService } from "@/lib/services/auth.service";
import { cosmosService, ITeam } from "@/lib/services/cosmos.service";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    // START: Server-side Auth Check
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;
    
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
        await storageService.uploadFile(file, `team_upload_${Date.now()}_${file.name}`);
    } catch (e) {
        console.warn("Audit Upload Failed:", e);
    }

    let records: any[] = [];

    // 2. Parse File (CSV or Excel)
    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0]; // Assume first sheet
        const sheet = workbook.Sheets[sheetName];
        records = XLSX.utils.sheet_to_json(sheet);
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

        const memberName = record["Members"];
        const leaderCol = record["Team Leader"] || record["Team Leader Name"];
        const email = record["Email"];
        const phone = record["Phone Number"];

        if (memberName) {
            // Check if this row represents the leader
            const isLeader = leaderCol && memberName.trim().toLowerCase() === leaderCol.trim().toLowerCase();

            if (isLeader) {
                team.leaderName = memberName;
                team.leaderEmail = email;
                team.phone = phone;
            } else {
                // Determine member details string
                let details = memberName;
                const extras = [];
                if (email) extras.push(email);
                if (phone) extras.push(phone);
                
                if (extras.length > 0) {
                    details += ` (${extras.join(", ")})`;
                }
                
                // Avoid redundant entries
                if (team.members && !team.members.includes(details)) {
                    team.members.push(details);
                }
            }
        }
    }

    // 2. Save grouped teams to Cosmos
    const teamsContainer = await cosmosService.getTeamsContainer();

    for (const team of teamsMap.values()) {
        if (team.name && team.leaderEmail) {
            // Check existence
            let query = `SELECT * FROM c WHERE c.leaderEmail = "${team.leaderEmail}"`;
            if (team.id) {
                 query += ` OR c.id = "${team.id}"`;
            }

            const { resources: existing } = await teamsContainer.items.query(query).fetchAll();

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
