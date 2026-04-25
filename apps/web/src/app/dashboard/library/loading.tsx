import { Skeleton } from "../../../components/Skeleton";
import styles from "../skeleton.module.css";

export default function LibraryLoading() {
  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <Skeleton height={32} width={120} radius={8} />
          <Skeleton height={13} width={280} radius={4} />
        </div>
        <Skeleton height={36} width={152} radius={10} />
      </div>

      {/* Filter chips */}
      <div className={styles.chipRow}>
        {[80, 60, 90, 70, 80, 60, 50].map((w, i) => (
          <Skeleton key={i} height={32} width={w} radius={99} />
        ))}
      </div>

      {/* Card grid */}
      <div className={styles.cardGrid}>
        {/* Create card placeholder */}
        <div className={styles.card}>
          <Skeleton height={32} width={32} radius={8} />
          <Skeleton height={18} width="60%" radius={5} />
          <Skeleton height={13} width="80%" radius={4} />
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={styles.card}>
            <Skeleton height={11} width={60} radius={4} />
            <Skeleton height={20} width="80%" radius={5} />
            <Skeleton height={13} width="55%" radius={4} />
            <div className={styles.cardFooter}>
              <Skeleton height={22} width={65} radius={6} />
              <Skeleton height={22} width={65} radius={6} />
              <Skeleton height={22} width={65} radius={6} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
