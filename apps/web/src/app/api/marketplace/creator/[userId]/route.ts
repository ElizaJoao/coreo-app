import { NextResponse } from "next/server";
import { getCreatorProfile } from "../../../../../lib/marketplace-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  try {
    const profile = await getCreatorProfile(userId);
    if (!profile) return NextResponse.json({ error: "Creator not found." }, { status: 404 });
    return NextResponse.json(profile);
  } catch (err) {
    console.error("[GET creator profile]", err);
    return NextResponse.json({ error: "Failed to load creator." }, { status: 500 });
  }
}
