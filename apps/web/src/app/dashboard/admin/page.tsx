import { notFound } from "next/navigation";
import { auth } from "../../../auth";
import { supabase } from "../../../lib/supabase";
import { AdminDashboard } from "./AdminDashboard";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { data } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (!(data as { is_admin?: boolean } | null)?.is_admin) notFound();

  return <AdminDashboard />;
}
