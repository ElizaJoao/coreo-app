import type { ReactNode } from "react";

import { auth } from "../../auth";
import { DashboardShell } from "../../components/DashboardShell";
import { getChoreographiesByUser } from "../../lib/choreography-service";

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

  const choreographies = userId ? await getChoreographiesByUser(userId) : [];

  return (
    <DashboardShell
      user={{ name, email, initials: getInitials(name) }}
      libraryCount={choreographies.length}
    >
      {children}
    </DashboardShell>
  );
}
