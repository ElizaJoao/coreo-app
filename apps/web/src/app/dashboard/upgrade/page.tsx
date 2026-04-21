import { auth } from "../../../auth";
import type { Plan } from "../../../constants/plans";
import { UpgradeClient } from "./UpgradeClient";

export default async function UpgradePage() {
  const session = await auth();
  const plan = ((session?.user as { plan?: string })?.plan ?? "free") as Plan;
  return <UpgradeClient currentPlan={plan} />;
}
