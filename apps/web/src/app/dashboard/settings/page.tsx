import { notFound } from "next/navigation";
import { auth } from "../../../auth";
import { supabase } from "../../../lib/supabase";
import type { Plan } from "../../../constants/plans";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { data } = await supabase
    .from("users")
    .select("name, email, plan")
    .eq("id", session.user.id)
    .single();

  const row = data as { name?: string; email?: string; plan?: string } | null;

  return (
    <SettingsClient
      name={row?.name ?? session.user.name ?? ""}
      email={row?.email ?? session.user.email ?? ""}
      plan={(row?.plan ?? "free") as Plan}
    />
  );
}
