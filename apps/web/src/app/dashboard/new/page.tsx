import { auth } from "../../../auth";
import { supabase } from "../../../lib/supabase";
import type { Plan } from "../../../constants/plans";
import { NewChoreographyClient } from "./NewChoreographyClient";

export default async function NewChoreographyPage() {
  const session = await auth();
  let plan: Plan = "free";

  if (session?.user?.id) {
    const { data } = await supabase
      .from("users")
      .select("plan")
      .eq("id", session.user.id)
      .single();
    plan = ((data as { plan?: string } | null)?.plan ?? "free") as Plan;
  }

  return <NewChoreographyClient plan={plan} />;
}
