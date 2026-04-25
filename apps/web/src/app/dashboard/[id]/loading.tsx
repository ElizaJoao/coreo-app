import { Skeleton } from "../../../components/Skeleton";
import styles from "./loading.module.css";

export default function ChoreographyLoading() {
  return (
    <div className={styles.root}>
      {/* View tab bar */}
      <div className={styles.viewBar}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={26} width={70} radius={6} />
        ))}
      </div>

      {/* Editor header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Skeleton height={13} width={90} radius={4} />
          <Skeleton height={8} width={10} radius={2} />
          <Skeleton height={16} width={180} radius={4} />
        </div>
        <div className={styles.headerMeta}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={14} width={55} radius={4} />
          ))}
        </div>
        <div className={styles.headerActions}>
          <Skeleton height={30} width={60} radius={8} />
          <Skeleton height={30} width={52} radius={8} />
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Stage */}
        <div className={styles.stage} />

        {/* Side panel */}
        <div className={styles.sidePanel}>
          <div className={styles.sidePanelSection}>
            <Skeleton height={11} width={60} radius={3} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.dancerRow}>
                <Skeleton height={26} width={26} radius={99} />
                <Skeleton height={13} width={80} radius={4} />
              </div>
            ))}
            <Skeleton height={30} radius={8} />
          </div>
          <div className={styles.sidePanelSection}>
            <Skeleton height={11} width={45} radius={3} />
            <div className={styles.dancerRow}>
              <Skeleton height={36} width={36} radius={8} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <Skeleton height={13} width="80%" radius={4} />
                <Skeleton height={11} width="60%" radius={3} />
              </div>
            </div>
            <Skeleton height={32} radius={4} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className={styles.timeline}>
        <div className={styles.transport}>
          <Skeleton height={30} width={30} radius={99} />
          <Skeleton height={14} width={80} radius={4} />
          <Skeleton height={22} width={60} radius={6} />
          <Skeleton height={14} width={90} radius={4} />
        </div>
        <div className={styles.tlRow}>
          <div className={styles.tlLabel}>
            <Skeleton height={9} width={36} radius={2} />
          </div>
          <div className={styles.tlContent}>
            {Array.from({ length: 60 }).map((_, i) => (
              <Skeleton
                key={i}
                height={`${20 + (((i * 17) % 60))}%`}
                width={4}
                radius={1}
              />
            ))}
          </div>
        </div>
        <div className={styles.tlRow}>
          <div className={styles.tlLabel}>
            <Skeleton height={9} width={36} radius={2} />
          </div>
          <div className={styles.movesTrack}>
            {[22, 15, 18, 25].map((w, i) => (
              <Skeleton key={i} height="100%" width={`${w}%`} radius={4} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
