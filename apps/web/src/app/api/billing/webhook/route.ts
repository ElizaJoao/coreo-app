import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getUserByStripeCustomerId, setUserPlan } from "../../../../lib/billing-service";
import { getStripe } from "../../../../lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] signature failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "pro" | "max" | undefined;
        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription : undefined;
        if (userId && plan) {
          await setUserPlan(userId, plan, subscriptionId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const plan = sub.metadata?.plan as "pro" | "max" | undefined;
        if (userId && plan && sub.status === "active") {
          await setUserPlan(userId, plan, sub.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) {
          // fall back to looking up by customer id
          const user = await getUserByStripeCustomerId(sub.customer as string);
          if (user) await setUserPlan(user.id, "free");
        } else {
          await setUserPlan(userId, "free");
        }
        break;
      }
    }
  } catch (err) {
    console.error("[webhook] handler error", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
