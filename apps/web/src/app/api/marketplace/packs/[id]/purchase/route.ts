import { NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { getPackById, purchaseFreePack } from "../../../../../../lib/marketplace-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const pack = await getPackById(id);
  if (!pack || pack.status !== "published") {
    return NextResponse.json({ error: "Pack not found." }, { status: 404 });
  }

  if (pack.priceCents > 0) {
    // Paid packs: Stripe payment intent flow (to be implemented with Stripe Connect)
    return NextResponse.json({ error: "Paid pack purchases require Stripe — coming soon." }, { status: 402 });
  }

  try {
    await purchaseFreePack(session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST purchase pack]", err);
    return NextResponse.json({ error: "Failed to add pack." }, { status: 500 });
  }
}
