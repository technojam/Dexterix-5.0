import { NextResponse } from "next/server";
import { cosmosService } from "@/lib/services/cosmos.service";
import { cookies } from "next/headers";
import { authService } from "@/lib/services/auth.service";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = (await cookies()).get("session")?.value;
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await authService.getUserFromSession(session);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const teamsContainer = await cosmosService.getTeamsContainer();
        // Fetch teams that haven't selected a problem yet? 
        // Or all teams so admin/user can find themselves?
        // Let's fetch basic info for dropdown: ID, Name, LeaderEmail
        
        const { resources: teams } = await teamsContainer.items
            .query("SELECT c.id, c.name, c.problemStatementId FROM c")
            .fetchAll();

        // Filter out teams that already have a problem statement? 
        // The user says "users can't really register... if time passed". 
        // But for selection, if they already picked one, maybe show it but disabled?
        // Let's return all. Frontend can filter.
        
        return NextResponse.json(teams);
    } catch {
        return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
    }
}
