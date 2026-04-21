import { auth } from "../../../auth";
import { PLANS, type Plan } from "../../../constants/plans";
import { supabase } from "../../../lib/supabase";
import { UpgradeClient } from "./UpgradeClient";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  let dbPlan: Plan = "free";
  if (session?.user?.id) {
    const { data } = await supabase
      .from("users")
      .select("plan")
      .eq("id", session.user.id)
      .single();
    dbPlan = ((data as { plan?: string } | null)?.plan ?? "free") as Plan;
  }

  const successPlan =
    params.plan && (PLANS as readonly string[]).includes(params.plan) && params.plan !== "free"
      ? (params.plan as Plan)
      : undefined;

  return <UpgradeClient currentPlan={dbPlan} successPlan={successPlan} />;
}
