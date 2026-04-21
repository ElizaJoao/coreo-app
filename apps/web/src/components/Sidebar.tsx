import type { Plan } from "../constants/plans";
import { IconHome, IconSpark, IconLibrary, IconCalendar, IconTrend, IconSettings } from "./Icons";
import { PlanBadge } from "./PlanBadge";
import styles from "./Sidebar.module.css";

export type SidebarUser = {
  name: string;
  email: string;
  initials: string;
  plan: Plan;
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
};

const ICON_SIZE = 16;

export function Sidebar({ activeRoute, user, libraryCount, onNavigate }: SidebarProps) {
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
        <div className={styles.brandMark}>O</div>
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

      {user.plan === "free" && (
        <div className={styles.upgradeCard}>
          <div className={styles.upgradeTitle}>Upgrade to Pro</div>
          <div className={styles.upgradeDesc}>Unlimited choreographies & music search</div>
          <button type="button" className={styles.upgradeBtn} onClick={() => onNavigate("/dashboard/upgrade")}>
            View plans →
          </button>
        </div>
      )}

      <div className={styles.userPill}>
        <div className={styles.userAvatar}>{user.initials}</div>
        <div className={styles.userMeta}>
          <div className={styles.userNameRow}>
            <span className={styles.userName}>{user.name}</span>
            <PlanBadge plan={user.plan} />
          </div>
          <div className={styles.userEmail}>{user.email}</div>
        </div>
      </div>
    </aside>
  );
}
