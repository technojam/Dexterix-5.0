import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { cosmosService, ITeam } from "@/lib/services/cosmos.service";
import { cookies } from "next/headers";

async function verifyAuthAndGetRole() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    if (!sessionToken) return null;
    
    const user = await authService.getUserFromSession(sessionToken);
    if (!user || !user.email) return null;

    const email = user.email.toLowerCase();
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

    if (adminEmails.includes(email)) return "admin";
    
    return null; // Volunteers cannot reset all
}

export async function POST(req: Request) {
    const role = await verifyAuthAndGetRole();
    if (role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const teamsContainer = await cosmosService.getTeamsContainer();
        const { resources: teams } = await teamsContainer.items.query("SELECT * FROM c WHERE c.checkedIn = true").fetchAll();

        // Batch update is ideal, but for simplicity we'll loop or use a stored procedure if available.
        // Cosmos doesn't support "UPDATE WHERE" in one query easily without SP.
        // We'll fetch all checked-in teams and patch them.
        
        let count = 0;
        for (const team of teams) {
            const patchOperations = [
                { op: "replace" as const, path: "/checkedIn", value: false },
                { op: "add" as const, path: "/tableNumber", value: null } // Use add to overwrite or set to null
            ];
            await teamsContainer.item(team.id, team.id).patch(patchOperations);
            count++;
        }

        return NextResponse.json({ success: true, count, message: `Reset ${count} teams.` });

    } catch (e) {
        console.error("Reset Error:", e);
        return NextResponse.json({ error: "Reset failed" }, { status: 500 });
    }
}