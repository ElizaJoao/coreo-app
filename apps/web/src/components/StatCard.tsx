import { StatWave } from "./StatWave";
import styles from "./StatCard.module.css";

export type StatCardProps = {
  label: string;
  value: string | number;
  suffix?: string;
  trend: string;
  waveSeed: number;
  up?: boolean;
};

export function StatCard({ label, value, suffix, trend, waveSeed, up }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>
        {value}
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      <div className={styles.trend}>
        {up && <span className={styles.up}>↑ </span>}
        {trend}
      </div>
      <StatWave seed={waveSeed} />
    </div>
  );
}
