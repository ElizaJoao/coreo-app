import { Skeleton } from "../../../components/Skeleton";
import styles from "../skeleton.module.css";

export default function NewChoreographyLoading() {
  return (
    <div className={styles.twoCol}>
      {/* Left panel — AI brief */}
      <div className={styles.twoColPanel}>
        <Skeleton height={14} width={100} radius={4} />
        <Skeleton height={26} width="70%" radius={7} />
        <Skeleton height={120} radius={10} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Skeleton height={11} width={80} radius={3} />
              <Skeleton height={40} radius={8} />
            </div>
          ))}
        </div>
        <Skeleton height={48} radius={10} />
      </div>

      <div className={styles.twoColDivider} />

      {/* Right panel — guided wizard */}
      <div className={styles.twoColPanel}>
        <Skeleton height={14} width={90} radius={4} />
        <Skeleton height={26} width="65%" radius={7} />
        {/* Step tabs */}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={28} width={70} radius={6} />
          ))}
        </div>
        {/* Step content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={52} radius={8} />
          ))}
        </div>
        <Skeleton height={140} radius={10} />
      </div>
    </div>
  );
}
