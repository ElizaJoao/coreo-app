import { Skeleton } from "../../../components/Skeleton";
import styles from "../skeleton.module.css";

export default function InsightsLoading() {
  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Skeleton height={32} width={100} radius={8} />
          <Skeleton height={13} width={260} radius={4} />
        </div>
      </div>

      {/* Stats strip */}
      <div className={styles.statsStrip}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.statCard}>
            <Skeleton height={11} width={80} radius={4} />
            <Skeleton height={32} width={70} radius={6} />
            <Skeleton height={11} width={100} radius={4} />
          </div>
        ))}
      </div>

      {/* Two chart sections side by side */}
      <div className={styles.sectionHeader}>
        <Skeleton height={16} width={120} radius={5} />
      </div>
      <div className={styles.statsStrip} style={{ marginBottom: 16 }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className={styles.card} style={{ height: 220 }}>
            <Skeleton height={12} width={80} radius={4} />
            <div className={styles.insightsBars}>
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className={styles.insightsBarRow}>
                  <Skeleton height={11} width={70} radius={4} />
                  <Skeleton height={11} width={`${30 + ((j * 23) % 60)}%`} radius={3} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom chart area */}
      <div className={styles.sectionHeader}>
        <Skeleton height={16} width={140} radius={5} />
      </div>
      <div className={styles.card} style={{ height: 160 }}>
        <Skeleton height={12} width={90} radius={4} />
        <Skeleton height={100} radius={8} />
      </div>
    </div>
  );
}
