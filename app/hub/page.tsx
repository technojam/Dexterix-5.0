import { cosmosService } from "@/lib/services/cosmos.service";
// Force dynamic rendering
import HubInterface, { PageData } from "@/components/custom/hub/hub-interface";

export const dynamic = "force-dynamic";

async function getHubData() {
    const settings = await cosmosService.getGlobalSettings();
    const problems = await cosmosService.getAllProblemStatements();
    const teamsContainer = await cosmosService.getTeamsContainer();
    
    // Safety check just in case methods return null/undefined
    if (!settings || !problems) return { problems: [], config: { canRegister: false } };

    // Fetch unregistered teams for dropdown
    // Relaxed query to match API logic: Fetch mostly everything, filter in UI if needed, 
    // but here we filter loose to pass smaller payload.
    let unregisteredTeams: { id: string, teamId: string, name: string }[] = [];
    try {
        // Just get all teams that exist.
        const { resources } = await teamsContainer.items
            .query("SELECT * FROM c") 
            .fetchAll();
        
        // Filter in memory for safety
        unregisteredTeams = resources.filter((t: any) => 
            !t.problemStatementId || t.problemStatementId === ""
        ).map((t: any) => ({
            id: t.id,
            teamId: t.teamId || "Unknown ID", // Fallback if missing
            name: t.name || "Unknown Team"
        }));
    } catch (e) {
        console.error("Failed to fetch unregistered teams", e);
    }

    const filteredProblems = problems.filter(ps => {
        if (ps.category === "Hardware" && !settings.showHardware) return false;
        if ((ps.category === "Software" || !ps.category) && !settings.showSoftware) return false;
        return true;
    });

    const enrichedProblems = await Promise.all(filteredProblems.map(async (ps) => {
        // Optimisation: This might be N+1, but with Cosmos it's often acceptable for small N (< 20 problems).
        // A better way would be ONE query for all groups, but Cosmos SQL API GROUP BY is specific.
        let count = 0;
        try {
             const { resources } = await teamsContainer.items
                .query(`SELECT VALUE COUNT(1) FROM c WHERE c.problemStatementId = "${ps.id}"`)
                .fetchAll();
             count = resources[0] || 0;
        } catch {
            console.error(`Failed to count teams for ps ${ps.id}`);
        }
        
        return {
            ...ps,
            _count: { teams: count }
        }
    }));

    // Sort by ID (Natural Sort: H1, H2, H10)
    enrichedProblems.sort((a, b) => {
        return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Calculate Registration Status
    const now = new Date();
    const openTime = settings.registrationOpenTime ? new Date(settings.registrationOpenTime) : null;
    const closeTime = settings.registrationCloseTime ? new Date(settings.registrationCloseTime) : null;
    
    const isRegistrationOpen = 
        (!!settings.registrationEnabled) &&
        (!openTime || now >= openTime) && 
        (!closeTime || now <= closeTime);

    return {
      problems: enrichedProblems,
      unregisteredTeams,
      config: {
        canRegister: isRegistrationOpen,
        registrationOpenTime: settings.registrationOpenTime || null,
        registrationCloseTime: settings.registrationCloseTime || null,
        leaderboardColumns: settings.leaderboardColumns
      }
    };
}

async function getLeaderboardData() {
    try {
        const teamsContainer = await cosmosService.getTeamsContainer();
        const { resources: teams } = await teamsContainer.items
            .query("SELECT * FROM c WHERE c.score > 0 OR c.problemStatementId != null") // Get active teams
            .fetchAll();
        
        const problems = await cosmosService.getAllProblemStatements();
        const psMap = new Map(problems.map(p => [p.id, p.title]));

        const lb = teams.map(t => ({
            id: t.id,
            teamId: t.teamId,
            name: t.name,
            problemStatement: psMap.get(t.problemStatementId || "") || "N/A",
            score: t.score || 0
        }))
        .sort((a, b) => b.score - a.score);

        return lb;
    } catch (e) {
        console.error("Leaderboard fetch failed", e);
        return [];
    }
}

export default async function HubPage() {
    const [pageData, leaderboard] = await Promise.all([
        getHubData(),
        getLeaderboardData()
    ]);

    // Cast types to match interface (handling any potential mismatch safely)
    const safeData: PageData = {
        problems: pageData.problems.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            category: (p.category as "Software" | "Hardware") || "Software",
            maxLimit: p.maxLimit,
            _count: { teams: p._count.teams || 0 }
        })),
        unregisteredTeams: pageData.unregisteredTeams,
        config: pageData.config
    };

    return (
        <HubInterface 
            initialData={safeData} 
            leaderboard={leaderboard}
        />
    );
}
