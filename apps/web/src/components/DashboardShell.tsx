"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ROUTES } from "../constants/routes";
import type { Plan } from "../constants/plans";
import { Sidebar } from "./Sidebar";
import type { SidebarUser } from "./Sidebar";
import { Topbar } from "./Topbar";
import styles from "./DashboardShell.module.css";

export type DashboardShellProps = {
  children: React.ReactNode;
  user: SidebarUser;
  libraryCount?: number;
};

function getCrumbs(pathname: string): { label: string }[] {
  if (pathname === ROUTES.DASHBOARD) return [{ label: "Dashboard" }];
  if (pathname.startsWith(ROUTES.DASHBOARD_NEW)) return [{ label: "Dashboard" }, { label: "New choreography" }];
  if (pathname === "/dashboard/library") return [{ label: "Dashboard" }, { label: "Library" }];
  if (pathname === "/dashboard/schedule") return [{ label: "Dashboard" }, { label: "Schedule" }];
  if (pathname === "/dashboard/insights") return [{ label: "Dashboard" }, { label: "Insights" }];
  if (pathname === "/dashboard/settings") return [{ label: "Dashboard" }, { label: "Settings" }];
  if (pathname === "/dashboard/upgrade") return [{ label: "Dashboard" }, { label: "Upgrade" }];
  if (pathname === "/dashboard/admin") return [{ label: "Dashboard" }, { label: "Admin" }];
  if (pathname === "/dashboard/library") return [{ label: "Dashboard" }, { label: "Library" }];
  if (pathname === "/dashboard/schedule") return [{ label: "Dashboard" }, { label: "Schedule" }];
  if (pathname === "/dashboard/insights") return [{ label: "Dashboard" }, { label: "Insights" }];
  if (pathname === "/dashboard/settings") return [{ label: "Dashboard" }, { label: "Settings" }];
  if (pathname.startsWith("/dashboard/")) return [{ label: "Dashboard" }, { label: "Choreography" }];
  return [{ label: "Dashboard" }];
}

export function DashboardShell({ children, user, libraryCount }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [settingPlan, setSettingPlan] = useState<Plan | null>(null);
  const [currentUser, setCurrentUser] = useState(user);

  const crumbs = getCrumbs(pathname);

  async function handleSetPlan(plan: Plan) {
    setSettingPlan(plan);
    try {
      await fetch("/api/admin/set-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      setCurrentUser((u) => ({ ...u, plan }));
      router.refresh();
    } finally {
      setSettingPlan(null);
    }
  }

  return (
    <div className={styles.app}>
      <Sidebar
        activeRoute={pathname}
        user={currentUser}
        libraryCount={libraryCount}
        onNavigate={(route) => router.push(route)}
        onSetPlan={currentUser.isAdmin ? handleSetPlan : undefined}
        settingPlan={settingPlan}
      />
      <div className={styles.workspace}>
        <Topbar
          crumbs={crumbs}
          onNew={() => router.push(ROUTES.DASHBOARD_NEW)}
        />
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
