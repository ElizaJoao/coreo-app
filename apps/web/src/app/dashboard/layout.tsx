import type { ReactNode } from "react";

import { auth } from "../../auth";
import { DashboardShell } from "../../components/DashboardShell";
import { getChoreographiesByUser } from "../../lib/choreography-service";
import { supabase } from "../../lib/supabase";
import type { Plan } from "../../constants/plans";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const name = session?.user?.name ?? "User";
  const email = session?.user?.email ?? "";
  const userId = session?.user?.id;

  // Read plan and isAdmin fresh from DB on every render (avoids stale JWT)
  let plan: Plan = "free";
  let isAdmin = false;
  if (userId) {
    const { data } = await supabase
      .from("users")
      .select("plan, is_admin")
      .eq("id", userId)
      .single();
    if (data) {
      plan = ((data as { plan?: string }).plan ?? "free") as Plan;
      isAdmin = (data as { is_admin?: boolean }).is_admin ?? false;
    }
  }

  const choreographies = userId ? await getChoreographiesByUser(userId) : [];

  return (
    <DashboardShell
      user={{ name, email, initials: getInitials(name), plan, isAdmin }}
      libraryCount={choreographies.length}
    >
      {children}
    </DashboardShell>
  );
}
