import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { cosmosService } from "@/lib/services/cosmos.service";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

async function verifyAuthAndGetRole() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    if (!sessionToken) return null;
    
    const user = await authService.getUserFromSession(sessionToken);
    if (!user || !user.email) return null;

    const email = user.email.toLowerCase();
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    const volunteerEmails = (process.env.VOLUNTEER_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

    if (adminEmails.includes(email)) return "admin";
    if (volunteerEmails.includes(email)) return "volunteer";
    
    return null;
}

export async function GET() {
    const role = await verifyAuthAndGetRole();
    if (!role) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const teams = await cosmosService.getAllTeams();
        return NextResponse.json({ teams, role });
    } catch {
        return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const role = await verifyAuthAndGetRole();
    if (!role || role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all");

    try {
        if (clearAll === "true") {
            await cosmosService.deleteAllTeams();
            return NextResponse.json({ success: true, message: "All teams deleted" });
        } else if (id) {
            await cosmosService.deleteTeam(id);
            return NextResponse.json({ success: true, message: `Team ${id} deleted` });
        } else {
            return NextResponse.json({ error: "Missing 'id' or 'all' parameter" }, { status: 400 });
        }
    } catch {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const role = await verifyAuthAndGetRole();
    if (!role) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role check logic
    if (role === "volunteer") {
        const settings = await cosmosService.getGlobalSettings();
        if (!settings?.volunteersCanEditTeams) {
             return NextResponse.json({ error: "Editing disabled for volunteers" }, { status: 403 });
        }
    } else if (role !== "admin") {
         return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const teamUpdates = await req.json();
        const { id, name, leaderEmail, phone, members, problemStatementId } = teamUpdates;

        if (!id) {
            return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
        }

        const team = await cosmosService.getTeam(id);
        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // Apply updates
        if (name) team.name = name;
        if (leaderEmail) team.leaderEmail = leaderEmail;
        if (phone) team.phone = phone;
        if (members) team.members = members; // Assumes array of strings
        if (typeof problemStatementId !== 'undefined') team.problemStatementId = problemStatementId; // Allow null to clear
        
        // Ensure ID is passed for update if needed by service, usually entire object is replaced
        await cosmosService.updateTeam(team);
        
        return NextResponse.json({ success: true, team });
    } catch (e) {
        console.error("Team update failed:", e);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const role = await verifyAuthAndGetRole();
    if (role !== "admin") {
         return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
         const body = await req.json();
         
         const teamId = body.id || uuidv4();
         
         const newTeam = {
             id: teamId,
             name: body.name || "",
             leaderName: body.leaderName || "",
             leaderEmail: body.leaderEmail || "",
             phone: body.phone || body.leaderPhone || "",
             members: body.members || [],
             checkedIn: body.checkedIn ?? false,
             problemStatementId: body.problemStatementId || null,
             score: body.score ?? 0,
             college: body.college || "",
             year: body.year || ""
         };
         
         await cosmosService.createTeam(newTeam);
         return NextResponse.json(newTeam);
    } catch (error) {
         console.error("Create Team Error", error);
         return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


