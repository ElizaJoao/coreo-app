import type { Plan } from "../constants/plans";
import { getStripe } from "./stripe";
import { supabase } from "./supabase";

const PLAN_PRICE_IDS: Record<"pro" | "max", string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  max: process.env.STRIPE_MAX_PRICE_ID!,
};

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name: string,
): Promise<string> {
  const { data } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  const existing = (data as { stripe_customer_id: string | null } | null)?.stripe_customer_id;
  if (existing) return existing;

  const customer = await getStripe().customers.create({ email, name, metadata: { userId } });

  await supabase
    .from("users")
    .update({ stripe_customer_id: customer.id })
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
    phone_number_collection: { enabled: true }, // required for MB WAY
  });

  return session.url!;
}

export async function createPortalSession(
  userId: string,
  returnUrl: string,
): Promise<string> {
  const { data } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  const customerId = (data as { stripe_customer_id: string | null } | null)?.stripe_customer_id;
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

export async function getUserByStripeCustomerId(customerId: string) {
  const { data } = await supabase
    .from("users")
    .select("id, plan")
    .eq("stripe_customer_id", customerId)
    .single();
  return data as { id: string; plan: Plan } | null;
}
