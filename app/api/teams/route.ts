import { NextResponse } from "next/server";
import { cosmosService } from "@/lib/services/cosmos.service";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
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
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
    }
}
