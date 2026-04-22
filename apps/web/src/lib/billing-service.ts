import type { Plan } from "../constants/plans";
import { getStripe } from "./stripe";
import { supabase } from "./supabase";

const PLAN_PRICE_IDS: Record<"pro" | "max", string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  max: process.env.STRIPE_MAX_PRICE_ID!,
};

function isTestMode(): boolean {
  return process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") ?? false;
}

function customerIdColumn(): "stripe_customer_id" | "stripe_test_customer_id" {
  return isTestMode() ? "stripe_test_customer_id" : "stripe_customer_id";
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string,
): Promise<string> {
  const col = customerIdColumn();
  const { data } = await supabase
    .from("users")
    .select(col)
    .eq("id", userId)
    .single();

  const existing = (data as Record<string, string | null> | null)?.[col];
  if (existing) return existing;

  const customer = await getStripe().customers.create({ email, name, metadata: { userId } });

  await supabase
    .from("users")
    .update({ [col]: customer.id })
    .eq("id", userId);

  return customer.id;
}

export async function createCheckoutSession(opts: {
  userId: string;
  email: string;
  name: string;
  plan: "pro" | "max";
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const customerId = await getOrCreateStripeCustomer(opts.userId, opts.email, opts.name);

  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: PLAN_PRICE_IDS[opts.plan], quantity: 1 }],
    currency: "eur",
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: { userId: opts.userId, plan: opts.plan },
    subscription_data: { metadata: { userId: opts.userId, plan: opts.plan } },
    locale: "pt" as const,
    phone_number_collection: { enabled: true },
  });

  return session.url!;
}

export async function createPortalSession(
  userId: string,
  returnUrl: string,
): Promise<string> {
  const col = customerIdColumn();
  const { data } = await supabase
    .from("users")
    .select(col)
    .eq("id", userId)
    .single();

  const customerId = (data as Record<string, string | null> | null)?.[col];
  if (!customerId) throw new Error("No Stripe customer found");

  const portal = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return portal.url;
}

export async function setUserPlan(userId: string, plan: Plan, subscriptionId?: string) {
  const patch: Record<string, string> = { plan };
  if (subscriptionId) patch.stripe_subscription_id = subscriptionId;
  await supabase.from("users").update(patch).eq("id", userId);
}

export async function logPaymentEvent(opts: {
  userId?: string;
  userEmail?: string;
  eventType: string;
  status: "success" | "error" | "warning" | "info";
  plan?: string;
  amountCents?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}) {
  await supabase.from("payment_logs").insert({
    user_id: opts.userId ?? null,
    user_email: opts.userEmail ?? null,
    event_type: opts.eventType,
    status: opts.status,
    plan: opts.plan ?? null,
    amount_cents: opts.amountCents ?? null,
    error_message: opts.errorMessage ?? null,
    metadata: opts.metadata ?? null,
  });
}

export async function getUserByStripeCustomerId(customerId: string) {
  const col = customerIdColumn();
  const { data } = await supabase
    .from("users")
    .select("id, plan")
    .eq(col, customerId)
    .single();
  return data as { id: string; plan: Plan } | null;
}
