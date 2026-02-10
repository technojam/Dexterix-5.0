import { NextResponse } from "next/server";
import { cosmosService } from "@/lib/services/cosmos.service";

// This route handles TEAM login (still by Email check for now, unless they want full auth)
// Keeping this clean: verifies if the email exists in our DB.
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const teamsContainer = await cosmosService.getTeamsContainer();
    const { resources: teams } = await teamsContainer.items
        .query({
            query: "SELECT * FROM c WHERE c.leaderEmail = @email",
            parameters: [{ name: "@email", value: email }]
        })
        .fetchAll();

    const team = teams[0];

    if (!team) {
      return NextResponse.json({ error: "Team not found. Please check the email or contact support." }, { status: 404 });
    }
    
    // Enrich with problem data if needed
    if (team.problemStatementId) {
        const ps = await cosmosService.getProblemStatement(team.problemStatementId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (team as any).problemStatement = ps;
    }

    return NextResponse.json({ team });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

