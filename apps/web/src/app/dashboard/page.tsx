import Link from "next/link";

import { auth } from "../../auth";
import { DayCell } from "../../components/DayCell";
import { IconSpark } from "../../components/Icons";
import { StatCard } from "../../components/StatCard";
import { UpgradeBanner } from "../../components/UpgradeBanner";
import { WelcomeModal } from "../../components/WelcomeModal";
import { DASHBOARD_COPY } from "../../constants/ui";
import { ROUTES } from "../../constants/routes";
import { getChoreographiesByUser } from "../../lib/choreography-service";
import type { Choreography } from "../../types/choreography";
import styles from "./page.module.css";

type PageProps = {
  searchParams: Promise<{ success?: string; plan?: string }>;
};

function computeStats(choreos: Choreography[]) {
  const totalMinutes = choreos.reduce((s, c) => s + c.duration, 0);
  const avgBPM = choreos.length
    ? Math.round(choreos.reduce((s, c) => s + (c.music?.bpm ?? 120), 0) / choreos.length)
    : 0;
  return { totalChoreos: choreos.length, totalMinutes, avgBPM };
}

const WEEK_DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

function getWeekDays() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  return WEEK_DAY_NAMES.map((day, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      day,
      num: d.getDate(),
      classes: [] as string[],
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const STYLE_COLORS: Record<string, string> = {
  Zumba: "#e85d5d", "Hip Hop": "#5d9be8", Ballet: "#c45de8", Salsa: "#e8c45d",
  Yoga: "#5de8d4", Bachata: "#f5a9b8", Pilates: "#9b5de8", "Body Combat": "#e8875d",
  "Body Pump": "#d4e85d", Aerobics: "#5de87a", "K-Pop": "#9b5de8",
  Flamenco: "#e85d9b", Contemporary: "#5d9be8", Jazz: "#e8c45d",
};

function styleColor(style: string): string {
  return STYLE_COLORS[style] ?? "#888";
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const allChoreos = userId ? await getChoreographiesByUser(userId) : [];

  const params = await searchParams;
  const stats = computeStats(allChoreos);
  const week = getWeekDays();
  const recent = allChoreos.slice(0, 5);

  return (
    <div className={styles.page}>
      <WelcomeModal />
      {params.success === "1" && params.plan && (
        <UpgradeBanner plan={params.plan} />
      )}

      {/* Hero header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            {DASHBOARD_COPY.PAGE_TITLE_PLAIN}{" "}
            <span className={styles.accentWord}>{DASHBOARD_COPY.PAGE_TITLE_ACCENT}</span>
          </h1>
          <p className={styles.pageSub}>{DASHBOARD_COPY.PAGE_SUBTITLE}</p>
        </div>
        <div className={styles.pageActions}>
          <Link href={ROUTES.DASHBOARD_NEW} className={styles.btnPrimary}>
            <IconSpark size={14} /> Generate new
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className={styles.stats}>
        <StatCard label="Choreographies" value={stats.totalChoreos} trend="+2 this week" waveSeed={11} />
        <StatCard label="Total minutes" value={stats.totalMinutes} trend="Across all plans" waveSeed={22} />
        <StatCard label="Average tempo" value={stats.avgBPM} suffix="BPM" trend="Moderate-to-fast" waveSeed={33} />
        <StatCard label="Classes this week" value={6} trend="3 left to teach" waveSeed={44} up />
      </div>

      {/* This week */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>This week</h2>
        <Link href="/dashboard/schedule" className={styles.sectionAction}>View full schedule</Link>
      </div>
      <div className={styles.calRow}>
        {week.map((d) => (
          <DayCell key={d.day} day={d.day} num={d.num} classes={d.classes} isToday={d.isToday} />
        ))}
      </div>

      {/* Recent choreographies */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recent</h2>
        <Link href="/dashboard/library" className={styles.sectionAction}>View all in library →</Link>
      </div>

      {recent.length === 0 ? (
        <div className={styles.emptyRecent}>
          <p className={styles.emptyRecentText}>No choreographies yet.</p>
          <Link href={ROUTES.DASHBOARD_NEW} className={styles.btnPrimary}>
            <IconSpark size={13} /> Generate your first
          </Link>
        </div>
      ) : (
        <div className={styles.recentList}>
          {recent.map((c) => (
            <Link key={c.id} href={ROUTES.DASHBOARD_ITEM(c.id)} className={styles.recentRow}>
              <div className={styles.recentAccent} style={{ background: styleColor(c.style) }} />
              <div className={styles.recentMain}>
                <span className={styles.recentName}>{c.name}</span>
                <span className={styles.recentStyle}>{c.style}</span>
              </div>
              <div className={styles.recentChips}>
                <span className={styles.recentChip}>{c.difficulty}</span>
                <span className={styles.recentChip}>{c.duration} min</span>
                <span className={styles.recentChip}>{c.moves.length} moves</span>
              </div>
              <span className={styles.recentDate}>{timeAgo(c.updatedAt)}</span>
              <span className={styles.recentOpen}>Open →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
