import { NextResponse } from "next/server";
import { cosmosService } from "@/lib/services/cosmos.service";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const settings = await cosmosService.getGlobalSettings();
        return NextResponse.json(settings);
    } catch {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

// Admin only update
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const updated = await cosmosService.updateGlobalSettings(body);
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
