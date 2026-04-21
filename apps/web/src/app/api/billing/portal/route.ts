import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { createPortalSession } from "../../../../lib/billing-service";
import { ROUTES } from "../../../../constants/routes";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = new URL(request.url).origin;

  try {
    const url = await createPortalSession(
      session.user.id,
      `${origin}${ROUTES.DASHBOARD}`,
    );
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[billing/portal]", err);
    return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
  }
}
