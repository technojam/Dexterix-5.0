import { NextResponse } from "next/server";
import { cosmosService } from "@/lib/services/cosmos.service";
import { authService } from "@/lib/services/auth.service";
import { cookies } from "next/headers";

export async function GET() {
    // Optional: Auth check if you want it protected, but problems are generally public anyway.
    // Given it's under /admin/problems, maybe we keep it light or reuse the session check.
    // For dropdown on checkin page (which is protected), this is fine.
    try {
        const problems = await cosmosService.getAllProblemStatements();
        return NextResponse.json(problems);
    } catch {
        return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;
    
    // Auth Check
    if (!sessionToken || !(await authService.verifySessionCookie(sessionToken))) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
         return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    try {
        const container = await cosmosService.getProblemStatementsContainer();
        await container.item(id, id).delete();
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
