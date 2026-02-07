import { NextResponse } from "next/server";
import { cosmosService } from "@/lib/services/cosmos.service";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const teamsContainer = await cosmosService.getTeamsContainer();
        const problemsContainer = await cosmosService.getProblemStatementsContainer();
        
        // 1. Fetch all teams
        const { resources: teams } = await teamsContainer.items.readAll().fetchAll();
        
        // 2. Fetch all problems (for JOIN simulation)
        const { resources: problems } = await problemsContainer.items.readAll().fetchAll();
        const problemsMap = new Map(problems.map((p: any) => [p.id, p.title]));

        // 3. Map and Sort
        const leaderboard = teams
            .map((t: any) => ({
                id: t.id, // This is the UUID
                teamId: t.id, // Explicit teamId field asked by user
                name: t.name,
                problemStatement: t.problemStatementId 
                    ? problemsMap.get(t.problemStatementId) || "Unknown"
                    : "N/A",
                score: t.score || 0,
            }))
            .sort((a: any, b: any) => b.score - a.score);

        return NextResponse.json(leaderboard);
    } catch (error) {
        console.error("Leaderboard API Error:", error);
        return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }
}
