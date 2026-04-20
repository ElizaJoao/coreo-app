import Link from "next/link";

import { auth } from "../../auth";
import { ChoreographyCard } from "../../components/ChoreographyCard";
import { CreateCard } from "../../components/CreateCard";
import { DayCell } from "../../components/DayCell";
import { IconGrid, IconSpark } from "../../components/Icons";
import { StatCard } from "../../components/StatCard";
import { DANCE_STYLES } from "../../constants/choreography";
import { DIFFICULTIES } from "../../constants/choreography";
import { DASHBOARD_COPY } from "../../constants/ui";
import { ROUTES } from "../../constants/routes";
import { getChoreographiesByUser } from "../../lib/choreography-service";
import type { Choreography } from "../../types/choreography";
import styles from "./page.module.css";

type PageProps = {
  searchParams: Promise<{ cat?: string; diff?: string }>;
};

function getCategory(style: string): string {
  return (DANCE_STYLES as readonly string[]).includes(style) ? "Dance" : "Fitness";
}

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

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const allChoreos = userId ? await getChoreographiesByUser(userId) : [];

  const params = await searchParams;
  const cat = params.cat ?? "All";
  const diff = params.diff ?? "All";

  const filtered = allChoreos.filter((c) => {
    if (cat !== "All" && getCategory(c.style) !== cat) return false;
    if (diff !== "All" && c.difficulty !== diff) return false;
    return true;
  });

  const stats = computeStats(allChoreos);
  const week = getWeekDays();

  function chipHref(key: "cat" | "diff", value: string): string {
    const sp = new URLSearchParams();
    if (key === "cat") {
      if (value !== "All") sp.set("cat", value);
      if (diff !== "All") sp.set("diff", diff);
    } else {
      if (cat !== "All") sp.set("cat", cat);
      if (value !== "All") sp.set("diff", value);
    }
    const qs = sp.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  }

  return (
    <div className={styles.page}>
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
          <button type="button" className={styles.btnGhost}>
            <IconGrid size={14} /> View
          </button>
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

      {/* Choreographies */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Your choreographies</h2>
        <div className={styles.filters}>
          {(["All", "Dance", "Fitness"] as const).map((c) => (
            <Link key={c} href={chipHref("cat", c)} className={cat === c ? styles.chipActive : styles.chip}>{c}</Link>
          ))}
          <div className={styles.filterDivider} />
          {(["All", ...DIFFICULTIES] as const).map((d) => (
            <Link key={d} href={chipHref("diff", d)} className={diff === d ? styles.chipActive : styles.chip}>{d}</Link>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.map((c) => (
          <ChoreographyCard key={c.id} choreography={c} href={ROUTES.DASHBOARD_ITEM(c.id)} />
        ))}
        <CreateCard />
      </div>
    </div>
  );
}
