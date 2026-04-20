import styles from "./DayCell.module.css";

export type DayCellProps = {
  day: string;
  num: number;
  classes: string[];
  isToday?: boolean;
};

export function DayCell({ day, num, classes, isToday }: DayCellProps) {
  return (
    <div className={isToday ? styles.cellToday : styles.cell}>
      <div className={styles.name}>{day}</div>
      <div className={styles.number}>{num}</div>
      <div className={styles.classes}>
        {classes.length === 0 ? (
          <span className={styles.rest}>Rest</span>
        ) : (
          <>
            {classes.map((_, i) => <span key={i} className={styles.dot} />)}
            {classes.length} class{classes.length > 1 ? "es" : ""}
          </>
        )}
      </div>
    </div>
  );
}
