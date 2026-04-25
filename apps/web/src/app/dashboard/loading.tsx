import { Skeleton } from "../../components/Skeleton";
import styles from "./skeleton.module.css";

export default function DashboardLoading() {
  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Skeleton height={36} width={240} radius={8} />
          <Skeleton height={14} width={320} radius={4} />
        </div>
        <Skeleton height={36} width={140} radius={10} />
      </div>

      {/* Stats strip */}
      <div className={styles.statsStrip}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.statCard}>
            <Skeleton height={11} width={80} radius={4} />
            <Skeleton height={32} width={60} radius={6} />
            <Skeleton height={11} width={100} radius={4} />
          </div>
        ))}
      </div>

      {/* Section header */}
      <div className={styles.sectionHeader}>
        <Skeleton height={18} width={160} radius={5} />
        <Skeleton height={30} width={80} radius={8} />
      </div>

      {/* Card grid */}
      <div className={styles.cardGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.card}>
            <Skeleton height={11} width={60} radius={4} />
            <Skeleton height={20} width="80%" radius={5} />
            <Skeleton height={14} width="60%" radius={4} />
            <div className={styles.cardFooter}>
              <Skeleton height={24} width={70} radius={6} />
              <Skeleton height={24} width={70} radius={6} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
