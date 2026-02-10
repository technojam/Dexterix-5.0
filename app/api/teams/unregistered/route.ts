import { NextResponse } from "next/server";
import { cosmosService } from "@/lib/services/cosmos.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const teamsContainer = await cosmosService.getTeamsContainer();
    // Fetch ALL teams and filter in memory to avoid query quirks
    // This is safe for hackathon scale (e.g. < 1000 teams)
    const query = `SELECT * FROM c`; 
    
    const { resources: teams } = await teamsContainer.items
        .query(query)
        .fetchAll();

    // Log count for server-side debugging if possible
    console.log(`Fetched ${teams.length} teams from DB`);

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Failed to fetch unregistered teams:", error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }
}
