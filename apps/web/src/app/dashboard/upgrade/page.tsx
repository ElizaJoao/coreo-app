import { auth } from "../../../auth";
import type { Plan } from "../../../constants/plans";
import { supabase } from "../../../lib/supabase";
import { UpgradeClient } from "./UpgradeClient";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  let plan: Plan = "free";
  if (session?.user?.id) {
    const { data } = await supabase
      .from("users")
      .select("plan")
      .eq("id", session.user.id)
      .single();
    plan = ((data as { plan?: string } | null)?.plan ?? "free") as Plan;
  }

  return <UpgradeClient currentPlan={plan} success={params.success === "1"} />;
}
