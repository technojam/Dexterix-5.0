import { NextResponse } from "next/server";
import { cosmosService } from "@/lib/services/cosmos.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const teamsContainer = await cosmosService.getTeamsContainer();
    // Fetch only the minimal fields needed for the public dropdown
    const query = "SELECT c.id, c.teamId, c.name, c.problemStatementId FROM c";
    
    const { resources: teams } = await teamsContainer.items
        .query(query)
        .fetchAll();

    const filtered = teams.filter((t: any) =>
      !t.problemStatementId || t.problemStatementId === ""
    );

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Failed to fetch unregistered teams:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
