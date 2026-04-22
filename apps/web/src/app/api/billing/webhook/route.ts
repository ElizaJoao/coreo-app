import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getUserByStripeCustomerId, setUserPlan, logPaymentEvent } from "../../../../lib/billing-service";
import { getStripe } from "../../../../lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    await logPaymentEvent({ eventType: "webhook.signature_missing", status: "error", errorMessage: "No stripe-signature header" });
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] signature failed", err);
    await logPaymentEvent({ eventType: "webhook.signature_invalid", status: "error", errorMessage: msg });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as "pro" | "max" | undefined;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : undefined;
        const amountCents = session.amount_total ?? undefined;

        if (userId && plan) {
          await setUserPlan(userId, plan, subscriptionId);
          await logPaymentEvent({
            userId,
            eventType: "checkout.session.completed",
            status: "success",
            plan,
            amountCents,
            metadata: { sessionId: session.id, subscriptionId },
          });
        } else {
          await logPaymentEvent({
            eventType: "checkout.session.completed",
            status: "warning",
            errorMessage: "Missing userId or plan in metadata",
            metadata: { sessionId: session.id, metadata: session.metadata },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const plan = sub.metadata?.plan as "pro" | "max" | undefined;
        if (userId && plan && sub.status === "active") {
          await setUserPlan(userId, plan, sub.id);
          await logPaymentEvent({
            userId,
            eventType: "subscription.updated",
            status: "success",
            plan,
            metadata: { subscriptionId: sub.id, subStatus: sub.status },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) {
          const user = await getUserByStripeCustomerId(sub.customer as string);
          if (user) {
            await setUserPlan(user.id, "free");
            await logPaymentEvent({
              userId: user.id,
              eventType: "subscription.cancelled",
              status: "info",
              plan: "free",
              metadata: { subscriptionId: sub.id },
            });
          }
        } else {
          await setUserPlan(userId, "free");
          await logPaymentEvent({
            userId,
            eventType: "subscription.cancelled",
            status: "info",
            plan: "free",
            metadata: { subscriptionId: sub.id },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const user = await getUserByStripeCustomerId(invoice.customer as string);
        await logPaymentEvent({
          userId: user?.id,
          eventType: "invoice.payment_failed",
          status: "error",
          amountCents: invoice.amount_due,
          errorMessage: invoice.last_finalization_error?.message ?? "Payment failed",
          metadata: { invoiceId: invoice.id, attemptCount: invoice.attempt_count },
        });
        break;
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] handler error", err);
    await logPaymentEvent({
      eventType: `webhook.handler_error`,
      status: "error",
      errorMessage: msg,
      metadata: { stripeEventType: event.type, stripeEventId: event.id },
    });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
