import { auth } from "../../../auth";
import { getChoreographiesByUser } from "../../../lib/choreography-service";
import Link from "next/link";
import { ROUTES } from "../../../constants/routes";
import styles from "./page.module.css";

const WEEK_DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as const;

function getWeeks(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7; // Mon = 0
  const days: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export default async function SchedulePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const choreos = userId ? await getChoreographiesByUser(userId) : [];

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const weeks = getWeeks(year, month);

  const recentChoreos = choreos.slice(0, 5);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Schedule</h1>
          <p className={styles.pageSub}>{MONTH_NAMES[month]} {year}</p>
        </div>
        <Link href={ROUTES.DASHBOARD_NEW} className={styles.btnPrimary}>+ New class</Link>
      </div>

      <div className={styles.layout}>
        {/* Calendar */}
        <div className={styles.calCard}>
          <div className={styles.calHeader}>
            <span className={styles.calMonth}>{MONTH_NAMES[month]} {year}</span>
          </div>
          <div className={styles.calGrid}>
            {WEEK_DAY_NAMES.map((d) => (
              <div key={d} className={styles.calDayName}>{d}</div>
            ))}
            {weeks.map((week, wi) =>
              week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={[
                    styles.calCell,
                    day === null ? styles.calCellEmpty : "",
                    day === today ? styles.calCellToday : "",
                  ].join(" ")}
                >
                  {day ?? ""}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming */}
        <div className={styles.sidebar}>
          <div className={styles.sectionTitle}>Recently generated</div>
          {recentChoreos.length === 0 ? (
            <div className={styles.empty}>No choreographies yet. <Link href={ROUTES.DASHBOARD_NEW} className={styles.emptyLink}>Generate one →</Link></div>
          ) : (
            <div className={styles.classList}>
              {recentChoreos.map((c) => (
                <Link key={c.id} href={ROUTES.DASHBOARD_ITEM(c.id)} className={styles.classItem}>
                  <div className={styles.classStyle}>{c.style}</div>
                  <div className={styles.className}>{c.name}</div>
                  <div className={styles.classMeta}>{c.duration} min · {c.difficulty}</div>
                </Link>
              ))}
            </div>
          )}

          <div className={styles.sectionTitle} style={{ marginTop: 24 }}>Coming soon</div>
          <div className={styles.comingSoon}>
            Full class scheduling — pin choreographies to specific dates and get a weekly prep checklist.
          </div>
        </div>
      </div>
    </div>
  );
}
