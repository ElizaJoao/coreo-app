"use client";

import { useState, useRef, useEffect } from "react";
import type { Plan } from "../constants/plans";
import { IconHome, IconSpark, IconLibrary, IconCalendar, IconTrend, IconSettings, IconAdmin } from "./Icons";
import { PlanBadge } from "./PlanBadge";
import styles from "./Sidebar.module.css";

export type SidebarUser = {
  name: string;
  email: string;
  initials: string;
  plan: Plan;
  isAdmin?: boolean;
  avatarUrl?: string;
};

export type SidebarNavItem = {
  id: string;
  label: string;
  route: string;
  icon: React.FC<{ size?: number; className?: string }>;
  count?: number;
};

export type SidebarProps = {
  activeRoute: string;
  user: SidebarUser;
  libraryCount?: number;
  onNavigate: (route: string) => void;
  onSignOut: () => void;
  onSetPlan?: (plan: Plan) => void;
  settingPlan?: Plan | null;
};

const ICON_SIZE = 16;
const ADMIN_PLANS: Plan[] = ["free", "pro", "max"];

export function Sidebar({ activeRoute, user, libraryCount, onNavigate, onSignOut, onSetPlan, settingPlan }: SidebarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pillRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const primary: SidebarNavItem[] = [
    { id: "dashboard",  label: "Dashboard",          route: "/dashboard",          icon: IconHome },
    { id: "new",        label: "New choreography",   route: "/dashboard/new",      icon: IconSpark },
    { id: "library",    label: "Library",            route: "/dashboard/library",  icon: IconLibrary, count: libraryCount },
    { id: "schedule",   label: "Schedule",           route: "/dashboard/schedule", icon: IconCalendar },
    { id: "insights",   label: "Insights",           route: "/dashboard/insights", icon: IconTrend },
  ];

  const secondary: SidebarNavItem[] = [
    { id: "settings", label: "Settings", route: "/dashboard/settings", icon: IconSettings },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src="/logo-mark.svg" alt="Offbeat" className={styles.brandMark} />
        <div>
          <div className={styles.brandName}>Offbeat</div>
          <div className={styles.brandSub}>MOVE · STUDIO</div>
        </div>
      </div>

      <div className={styles.groupLabel}>Workspace</div>
      {primary.map((item) => {
        const Icon = item.icon;
        const active = activeRoute === item.route || (item.route !== "/dashboard" && activeRoute.startsWith(item.route));
        return (
          <button
            key={item.id}
            type="button"
            className={active ? styles.navItemActive : styles.navItem}
            onClick={() => onNavigate(item.route)}
          >
            <Icon size={ICON_SIZE} className={styles.navIcon} />
            <span>{item.label}</span>
            {item.count != null && <span className={styles.count}>{item.count}</span>}
          </button>
        );
      })}

      <div className={styles.groupLabel}>Account</div>
      {secondary.map((item) => {
        const Icon = item.icon;
        const active = activeRoute === item.route;
        return (
          <button
            key={item.id}
            type="button"
            className={active ? styles.navItemActive : styles.navItem}
            onClick={() => onNavigate(item.route)}
          >
            <Icon size={ICON_SIZE} className={styles.navIcon} />
            <span>{item.label}</span>
          </button>
        );
      })}

      {user.isAdmin && (
        <>
          <div className={styles.groupLabel}>Admin</div>
          <button
            type="button"
            className={activeRoute === "/dashboard/admin" ? styles.navItemActive : styles.navItem}
            onClick={() => onNavigate("/dashboard/admin")}
          >
            <IconAdmin size={ICON_SIZE} className={styles.navIcon} />
            <span>Metrics & logs</span>
          </button>
        </>
      )}

      {user.isAdmin && onSetPlan && (
        <div className={styles.adminCard}>
          <div className={styles.adminLabel}>⚡ Admin · Preview plan</div>
          <div className={styles.adminPlans}>
            {ADMIN_PLANS.map((p) => (
              <button
                key={p}
                type="button"
                className={user.plan === p ? styles.adminPlanActive : styles.adminPlan}
                onClick={() => user.plan !== p && onSetPlan(p)}
                disabled={!!settingPlan || user.plan === p}
              >
                {settingPlan === p ? "…" : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {user.plan === "free" && (
        <div className={styles.upgradeCard}>
          <div className={styles.upgradeTitle}>Upgrade to Pro</div>
          <div className={styles.upgradeDesc}>Unlimited choreographies & music search</div>
          <button type="button" className={styles.upgradeBtn} onClick={() => onNavigate("/dashboard/upgrade")}>
            View plans →
          </button>
        </div>
      )}

      {/* User pill — click to open dropdown */}
      <div className={styles.userPillWrap}>
        {dropdownOpen && (
          <div className={styles.userDropdown}>
            <button
              type="button"
              className={styles.dropdownItem}
              onClick={() => { setDropdownOpen(false); onNavigate("/dashboard/settings"); }}
            >
              <span className={styles.dropdownIcon}>👤</span>
              Profile
            </button>
            <div className={styles.dropdownDivider} />
            <button
              type="button"
              className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
              onClick={() => { setDropdownOpen(false); onSignOut(); }}
            >
              <span className={styles.dropdownIcon}>→</span>
              Sign out
            </button>
          </div>
        )}

        <button
          ref={pillRef}
          type="button"
          className={styles.userPill}
          onClick={() => setDropdownOpen((v) => !v)}
          aria-expanded={dropdownOpen}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className={styles.userAvatarImg} />
          ) : (
            <div className={styles.userAvatar}>{user.initials}</div>
          )}
          <div className={styles.userMeta}>
            <div className={styles.userNameRow}>
              <span className={styles.userName}>{user.name}</span>
              <PlanBadge plan={user.plan} />
            </div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
          <span className={styles.pillChevron}>{dropdownOpen ? "▴" : "▾"}</span>
        </button>
      </div>
    </aside>
  );
}
