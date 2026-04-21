import { NextResponse } from "next/server";

import { auth } from "../../../../auth";
import { createCheckoutSession } from "../../../../lib/billing-service";
import { ROUTES } from "../../../../constants/routes";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { plan?: string };
  const plan = body.plan;
  if (plan !== "pro" && plan !== "max") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;

  try {
    const url = await createCheckoutSession({
      userId: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? "",
      plan,
      successUrl: `${origin}${ROUTES.DASHBOARD}?success=1&plan=${plan}`,
      cancelUrl: `${origin}${ROUTES.DASHBOARD_UPGRADE}`,
    });

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[billing/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
