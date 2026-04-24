import { notFound } from "next/navigation";

import { auth } from "../../../auth";
import { getChoreographyById } from "../../../lib/choreography-service";
import { supabase } from "../../../lib/supabase";
import type { Plan } from "../../../constants/plans";
import { ChoreographyDetail } from "./ChoreographyDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ChoreographyPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) notFound();

  const choreography = await getChoreographyById(id, session.user.id);
  if (!choreography) notFound();

  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("id", session.user.id)
    .single();
  const plan = ((userData as { plan?: string } | null)?.plan ?? "free") as Plan;

  return <ChoreographyDetail choreography={choreography} plan={plan} />;
}
