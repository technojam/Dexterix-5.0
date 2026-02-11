import { NextResponse } from "next/server";
import { cosmosService, IProblemStatement } from "@/lib/services/cosmos.service";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Case 1: Team Selecting a Problem (Has teamId)
    if (body.teamId && body.problemStatementId && body.leaderEmail) {
      const { teamId, problemStatementId, leaderEmail, leaderName, customTitle, customDescription } = body;

      // Check availability
      const ps = await cosmosService.getProblemStatement(problemStatementId);
      if (!ps) {
        return NextResponse.json({ error: "Problem statement not found" }, { status: 404 });
      }
      
      // Calculate current team count (inefficient in NoSQL without aggregation or explicit counter)
      // For this hackathon scale, fetching all teams or storing a count on PS is needed.
      // Let's assume we implement a simple count check by querying teams.
      const teamsContainer = await cosmosService.getTeamsContainer();
      const { resources: teams } = await teamsContainer.items
        .query({
            query: "SELECT * FROM c WHERE c.problemStatementId = @id",
            parameters: [{ name: "@id", value: problemStatementId }]
        })
        .fetchAll();

      if (teams.length >= ps.maxLimit) {
        return NextResponse.json({ error: "This problem statement is full" }, { status: 400 });
      }

      // Update Team
      const team = await cosmosService.getTeam(teamId);
      if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

      if (team.problemStatementId) {
        return NextResponse.json(
          { error: "Team has already selected a problem statement." },
          { status: 409 }
        );
      }
      
      // Verify Leader Details
      const normalizedEmail = leaderEmail.trim().toLowerCase();
      const dbEmail = (team.leaderEmail || "").trim().toLowerCase();
      
      if (!dbEmail || dbEmail !== normalizedEmail) {
         return NextResponse.json({ error: "Team Leader Email does not match our records." }, { status: 403 });
      }

      // Optional: Verify Name if provided (fuzzy match or exact?)
      // User asked to fill leader name, checks are safer if loose but consistency is key.
      if (leaderName) {
          const normalizedInputName = leaderName.trim().toLowerCase();
          const dbName = (team.leaderName || "").trim().toLowerCase();
          // Relaxed check: input name should be at least contained in DB name or vice-versa to handle "John" vs "John Doe"
          if (!dbName || !dbName.includes(normalizedInputName)) {
               // We won't block strictly on name to avoid frustration if they typed "John" vs "John D."
               // But if they are drastically different, maybe? 
               // For now, let's just log or trust Email as the primary key.
               // If strict check is needed: 
               // if (dbName !== normalizedInputName) return NextResponse.json({ error: "Leader Name mismatch" }, { status: 403 });
          }
      }
      
      team.problemStatementId = problemStatementId;
      if (customTitle) team.customProblemTitle = customTitle;
      if (customDescription) team.customProblemDescription = customDescription;
      await cosmosService.updateTeam(team);

      return NextResponse.json({ success: true, team });
    } 
    
    // Case 2: Admin Creating/Updating a Problem (Has title)
    else if (body.title && body.description) {
      const { id, title, description, maxLimit, category, domain } = body;
      
      const newPs: IProblemStatement = {
          id: id || uuidv4(), // Allow custom ID, else fallback
          title, 
          description,
          category: category || "Software",
          domain: domain || "",
          maxLimit: Number(maxLimit) || 10
      }
      
      // Upsert to support editing
      const container = await cosmosService.getProblemStatementsContainer();
      await container.items.upsert(newPs);

      return NextResponse.json(newPs);
    }

    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });

  } catch (error) {
    console.error("Error in problem statement POST:", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const isAdmin = searchParams.get('admin') === 'true'; // Allow admin override

        const settings = await cosmosService.getGlobalSettings();
        const problems = await cosmosService.getAllProblemStatements();
        const teamsContainer = await cosmosService.getTeamsContainer();
        
        // Filter based on settings (unless admin)
        const visibleProblems = isAdmin ? problems : problems.filter(ps => {
            if (ps.category === "Hardware" && !settings.showHardware) return false;
            // Treat unknown categories as Software or always show? Lets assume Software if not hardware.
            if ((ps.category === "Software" || !ps.category) && !settings.showSoftware) return false;
            return true;
        });

        // Enrich with counts
        const enrichedProblems = await Promise.all(visibleProblems.map(async (ps) => {
            const { resources } = await teamsContainer.items
                .query({
                    query: "SELECT VALUE COUNT(1) FROM c WHERE c.problemStatementId = @id",
                    parameters: [{ name: "@id", value: ps.id }]
                })
                .fetchAll();
            const count = resources[0] || 0;
            return {
                ...ps,
                _count: { teams: count }
            }
        }));

        // Append constraints for frontend
        const responseData = {
          problems: enrichedProblems,
          config: {
              canRegister: true, // Default open
              registrationOpenTime: settings.registrationOpenTime,
              registrationCloseTime: settings.registrationCloseTime,
              leaderboardColumns: settings.leaderboardColumns // Pass to frontend
          }
        };

        // Time Check
        const now = new Date();
        if (settings.registrationOpenTime && new Date(settings.registrationOpenTime) > now) {
            responseData.config.canRegister = false;
        }
        if (settings.registrationCloseTime && new Date(settings.registrationCloseTime) < now) {
            responseData.config.canRegister = false;
        }

        return NextResponse.json(responseData);
    } catch (error) {
        console.error("PS GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
    }
}
