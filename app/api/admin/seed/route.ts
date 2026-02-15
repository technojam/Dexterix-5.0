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

    const normalizeHeader = (header: string) => header.trim().toLowerCase().replace(/\s+/g, " ");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalizeRecord = (record: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized: any = {};
        for (const [key, value] of Object.entries(record)) {
            const normalizedKey = normalizeHeader(key);
            if (normalizedKey) normalized[normalizedKey] = value;
        }
        return normalized;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getField = (record: any, keys: string[]) => {
        for (const key of keys) {
            const val = record[key];
            if (val !== undefined && val !== null && `${val}`.trim() !== "") return val;
        }
        return undefined;
    };

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
                     headers[colNumber] = normalizeHeader(cell.value?.toString() || "");
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

    records = records.map((record) => normalizeRecord(record));

    const teamsMap = new Map<string, ITeam>();
    let lastTeamId = "";

    // 1. Group rows into Teams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const record of records as any[]) {
        const rawId = getField(record, ["team id", "teamid", "team id", "id", "team_id"]);
        const currentId = rawId ? rawId.toString().trim() : lastTeamId;
        
        if (!currentId) continue; // Skip if no ID tracked
        
        lastTeamId = currentId;

        if (!teamsMap.has(currentId)) {
             teamsMap.set(currentId, {
                 id: currentId,
                 name: getField(record, ["team name"]) || "",
                 leaderName: "",
                 leaderEmail: "",
                 members: [],
                 college: getField(record, ["college/university", "college"]) || "",
                 year: getField(record, ["year"]) || "",
                 problemStatementId: undefined,
                 score: 0,
                 checkedIn: false
             });
        }

        const team = teamsMap.get(currentId)!;
        
        // Update generic info if found (handling grouped rows)
        const teamName = getField(record, ["team name"]);
        const college = getField(record, ["college/university", "college"]);
        const year = getField(record, ["year"]);
        if (!team.name && teamName) team.name = teamName;
        if (!team.college && college) team.college = college;
        if (!team.year && year) team.year = year;

        const memberName = getField(record, ["name", "member name", "members"]);
        const leaderCol = getField(record, ["team leader", "team leader name", "leader name"]);
        const email = getField(record, ["email", "email address"]);
        const phone = getField(record, ["phone number", "phone", "mobile", "contact"]);
        const memberType = getField(record, ["member type", "role"]);

        if (memberName) {
            // Check if this row represents the leader
            // Relaxed matching for multi-word names: "Anuj Singh" (Leader) matches "Anuj Singh" (Member) or even "Anuj" partially
            // But strict check is safer. The issue might be leading/trailing spaces or casing.
            const normalizedMember = memberName.toString().trim().toLowerCase();
            const normalizedLeaderCol = leaderCol ? leaderCol.toString().trim().toLowerCase() : "";
            const normalizedMemberType = memberType ? memberType.toString().trim().toLowerCase() : "";
            
            // Check if this member IS the leader
            // Sometimes excel has just "Leader Name" column filled for one row, and "Members" has everyone including leader.
            // Or "Team Leader" column has the name, and "Name" column has the same name.
            const isLeaderByName = normalizedLeaderCol && normalizedMember === normalizedLeaderCol;
            const isLeaderByType = normalizedMemberType === "team leader" || normalizedMemberType === "leader";
            const isLeader = isLeaderByName || isLeaderByType;

            const memberObj = {
                name: memberName.toString().trim(),
                email: (email || "").toString().trim(),
                phone: (phone || "").toString().trim(),
                gender: (getField(record, ["gender"]) || "").toString().trim(),
                course: (getField(record, ["course"]) || "").toString().trim(),
                year: (getField(record, ["year"]) || "").toString().trim(),
                college: (getField(record, ["college/university", "college"]) || "").toString().trim(),
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
            const leaderEmail = getField(record, ["leader email"]);
            const leaderPhone = getField(record, ["leader phone", "leader contact"]);
            const leaderName = getField(record, ["team leader", "leader name", "team leader name"]);
            if (leaderEmail && !team.leaderEmail) team.leaderEmail = leaderEmail.toString().trim();
            if (leaderPhone && !team.phone) team.phone = leaderPhone.toString().trim();
            if (leaderName && !team.leaderName) team.leaderName = leaderName.toString().trim();

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
