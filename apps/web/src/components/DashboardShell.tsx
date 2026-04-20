"use client";

import { usePathname, useRouter } from "next/navigation";

import { ROUTES } from "../constants/routes";
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
  if (pathname.startsWith("/dashboard/")) return [{ label: "Dashboard" }, { label: "Choreography" }];
  return [{ label: "Dashboard" }];
}

export function DashboardShell({ children, user, libraryCount }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const crumbs = getCrumbs(pathname);

  return (
    <div className={styles.app}>
      <Sidebar
        activeRoute={pathname}
        user={user}
        libraryCount={libraryCount}
        onNavigate={(route) => router.push(route)}
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
