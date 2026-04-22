import { auth } from "../../../auth";
import { getChoreographiesByUser } from "../../../lib/choreography-service";
import styles from "./page.module.css";

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

export default async function InsightsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const choreos = userId ? await getChoreographiesByUser(userId) : [];

  const total = choreos.length;
  const totalMin = choreos.reduce((s, c) => s + c.duration, 0);
  const totalMoves = choreos.reduce((s, c) => s + c.moves.length, 0);
  const avgBPM = total
    ? Math.round(choreos.reduce((s, c) => s + (c.music?.bpm ?? 120), 0) / total)
    : 0;

  // Style breakdown
  const styleCounts: Record<string, number> = {};
  choreos.forEach((c) => { styleCounts[c.style] = (styleCounts[c.style] ?? 0) + 1; });
  const topStyles = Object.entries(styleCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Difficulty breakdown
  const diffCounts: Record<string, number> = {};
  choreos.forEach((c) => { diffCounts[c.difficulty] = (diffCounts[c.difficulty] ?? 0) + 1; });

  // Duration breakdown
  const durationBuckets: Record<string, number> = { "≤15m": 0, "30m": 0, "45m": 0, "60m": 0, "90m+": 0 };
  choreos.forEach((c) => {
    if (c.duration <= 15) durationBuckets["≤15m"]++;
    else if (c.duration <= 30) durationBuckets["30m"]++;
    else if (c.duration <= 45) durationBuckets["45m"]++;
    else if (c.duration <= 60) durationBuckets["60m"]++;
    else durationBuckets["90m+"]++;
  });

  // Generated per month (last 6 months)
  const monthLabels: string[] = [];
  const monthCounts: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short" });
    monthLabels.push(label);
    monthCounts.push(choreos.filter((c) => c.createdAt.startsWith(key)).length);
  }
  const maxMonth = Math.max(...monthCounts, 1);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Insights</h1>
        <p className={styles.pageSub}>Your choreography activity at a glance</p>
      </div>

      {/* Summary stats */}
      <div className={styles.statGrid}>
        {[
          { label: "Total choreographies", value: total },
          { label: "Total class minutes", value: totalMin },
          { label: "Total moves created", value: totalMoves },
          { label: "Average BPM", value: avgBPM },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <div className={styles.empty}>Generate your first choreography to see insights here.</div>
      ) : (
        <div className={styles.sections}>
          {/* Monthly activity */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Generated per month</div>
            <div className={styles.barChart}>
              {monthLabels.map((label, i) => (
                <div key={label} className={styles.barCol}>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ height: `${(monthCounts[i] / maxMonth) * 100}%` }}
                    />
                  </div>
                  <div className={styles.barLabel}>{label}</div>
                  <div className={styles.barCount}>{monthCounts[i]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.twoCol}>
            {/* Style breakdown */}
            <div className={styles.card}>
              <div className={styles.cardTitle}>Top styles</div>
              <div className={styles.rowChart}>
                {topStyles.map(([style, count]) => (
                  <div key={style} className={styles.rowItem}>
                    <span className={styles.rowLabel}>{style}</span>
                    <div className={styles.rowTrack}>
                      <div className={styles.rowFill} style={{ width: `${pct(count, total)}%` }} />
                    </div>
                    <span className={styles.rowCount}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty + duration */}
            <div className={styles.colStack}>
              <div className={styles.card}>
                <div className={styles.cardTitle}>By difficulty</div>
                <div className={styles.rowChart}>
                  {Object.entries(diffCounts).map(([diff, count]) => (
                    <div key={diff} className={styles.rowItem}>
                      <span className={styles.rowLabel}>{diff}</span>
                      <div className={styles.rowTrack}>
                        <div className={styles.rowFill} style={{ width: `${pct(count, total)}%` }} />
                      </div>
                      <span className={styles.rowCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardTitle}>By duration</div>
                <div className={styles.rowChart}>
                  {Object.entries(durationBuckets).filter(([, v]) => v > 0).map(([dur, count]) => (
                    <div key={dur} className={styles.rowItem}>
                      <span className={styles.rowLabel}>{dur}</span>
                      <div className={styles.rowTrack}>
                        <div className={styles.rowFill} style={{ width: `${pct(count, total)}%` }} />
                      </div>
                      <span className={styles.rowCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
