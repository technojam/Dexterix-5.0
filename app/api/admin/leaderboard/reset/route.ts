import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { cosmosService } from "@/lib/services/cosmos.service";
import { cookies } from "next/headers";

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

    const container = await cosmosService.getTeamsContainer();
    
    // Fetch all teams with a score
    // Optimisation: Only fetch ID and Score? No, need full item to replace usually, or patch.
    // Cosmos supports Patch operations which is better.
    const { resources: teams } = await container.items
        .query("SELECT * FROM c WHERE IS_DEFINED(c.score)")
        .fetchAll();

    let resetCount = 0;
    
    for (const team of teams) {
        // Remove score field or set to 0.
        // Let's set to 0.
        // Or better, delete the property so they drop off leaderboard if logic checks for existence.
        
        // Using Patch to remove /score path
        try {
             await container.item(team.id, team.id).patch([
                 { op: "remove", path: "/score" }
             ]);
             resetCount++;
        } catch (e) {
            console.error(`Failed to reset team ${team.id}`, e);
        }
    }

    return NextResponse.json({ 
        message: "Leaderboard reset complete",
        count: resetCount
    });

  } catch (error) {
    console.error("Leaderboard reset failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
