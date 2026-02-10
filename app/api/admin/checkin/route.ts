import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { cosmosService } from "@/lib/services/cosmos.service";
import { cookies } from "next/headers";

export async function PATCH(req: Request) {
    // 1. Auth Check (Admins OR Volunteers)
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    
    if (!sessionToken) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // We don't check role again here because if they have a session, 
    // they are either admin or volunteer (filtered at login).
    // Both roles can check in.
    const isValid = await authService.verifySessionCookie(sessionToken);
    if (!isValid) {
        return NextResponse.json({ error: "Invalid Session" }, { status: 401 });
    }

    try {
        const { teamId, status, tableNumber, problemStatementId } = await req.json();
        
        // Use the getTeam method to find by ID (assuming internal ID is passed)
        // However, user might search by "Team ID" (public ID) which is stored in `teamId` field?
        // Wait, schema has `id` (internal) and `teamId` (public).
        // Let's assume request sends the internal `id` for update.
        
        const team = await cosmosService.getTeam(teamId);
        
        if (!team) {
             return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }
        
        // Handle PS Unassignment / Assignment specifically if provided (allow null for clear)
        if (problemStatementId !== undefined) {
             // If null is passed, it clears problemStatementId
             // If string is passed, it sets it.
             team.problemStatementId = problemStatementId === null ? undefined : problemStatementId;
        }

        if (status !== undefined) {
            team.checkedIn = status;
            
            if (status) {
                // Assign table (even if it was already assigned, we overwrite if provided)
                if (tableNumber) {
                    team.tableNumber = tableNumber.toString();
                }
            } else {
                // Clear table on checkout
                // We set it to undefined so it doesn't persist or shows as empty
                team.tableNumber = undefined;
            }
        }

        await cosmosService.updateTeam(team);
        
        return NextResponse.json({ success: true, team });
    } catch {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
