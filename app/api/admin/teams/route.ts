import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { cosmosService } from "@/lib/services/cosmos.service";
import { cookies } from "next/headers";

async function verifyAuthAndGetRole() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;
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
    } catch (e) {
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
    } catch (e) {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
