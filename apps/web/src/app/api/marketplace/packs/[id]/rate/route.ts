import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { ratepack } from "../../../../../../lib/marketplace-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { rating, review } = await request.json() as { rating: number; review?: string };

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
  }

  try {
    await ratepack(session.user.id, id, rating, review);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST rate pack]", err);
    return NextResponse.json({ error: "Failed to submit rating." }, { status: 500 });
  }
}
