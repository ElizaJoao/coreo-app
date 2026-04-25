import { Skeleton } from "../../../components/Skeleton";
import styles from "../skeleton.module.css";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default function ScheduleLoading() {
  return (
    <div className={styles.scheduleRoot}>
      {/* Header */}
      <div className={styles.scheduleHeader}>
        <div className={styles.scheduleHeaderLeft}>
          <Skeleton height={18} width={80} radius={5} />
          <Skeleton height={26} width={220} radius={7} />
        </div>
        <Skeleton height={34} width={110} radius={8} />
      </div>

      <div className={styles.scheduleBody}>
        {/* Week grid */}
        <div className={styles.scheduleWeekGrid}>
          {DAY_NAMES.map((day, i) => (
            <div key={i} className={styles.scheduleDay}>
              <div className={styles.scheduleDayHead}>
                <Skeleton height={11} width={28} radius={3} />
                <Skeleton height={22} width={22} radius={4} />
              </div>
              <div className={styles.scheduleDaySlots}>
                {/* 1–2 slot skeletons per day, vary by column */}
                {Array.from({ length: i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 0 }).map((_, j) => (
                  <div key={j} className={styles.scheduleSlot}>
                    <Skeleton height={10} width={60} radius={3} />
                    <Skeleton height={13} width="80%" radius={4} />
                    <Skeleton height={9} width="60%" radius={3} />
                    <Skeleton height={24} width="100%" radius={5} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Checklist sidebar */}
        <div className={styles.scheduleChecklist}>
          <div className={styles.scheduleChecklistHead}>
            <Skeleton height={11} width={70} radius={3} />
            <Skeleton height={20} width={36} radius={6} />
          </div>
          <div className={styles.scheduleChecklistBody}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={40} radius={7} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
