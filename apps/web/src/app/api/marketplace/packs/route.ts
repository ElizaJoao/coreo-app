import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { listPacks, createPack } from "../../../../lib/marketplace-service";
import type { ListPacksFilter } from "../../../../lib/marketplace-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filter: ListPacksFilter = {
    style: searchParams.get("style") ?? undefined,
    difficulty: searchParams.get("diff") ?? undefined,
    sort: (searchParams.get("sort") as ListPacksFilter["sort"]) ?? "newest",
  };
  const priceParam = searchParams.get("maxPrice");
  if (priceParam) filter.maxPriceCents = parseInt(priceParam, 10);

  try {
    const packs = await listPacks(filter);
    return NextResponse.json(packs);
  } catch (err) {
    console.error("[GET marketplace/packs]", err);
    return NextResponse.json({ error: "Failed to load packs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const pack = await createPack({ ...body, userId: session.user.id });
    return NextResponse.json(pack);
  } catch (err) {
    console.error("[POST marketplace/packs]", err);
    return NextResponse.json({ error: "Failed to create pack." }, { status: 500 });
  }
}
