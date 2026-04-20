import Link from "next/link";

import styles from "./DashboardEmpty.module.css";

export type DashboardEmptyProps = {
  newHref: string;
};

export function DashboardEmpty({ newHref }: DashboardEmptyProps) {
  return (
    <div className={styles.container}>
      <p className={styles.message}>No choreographies yet.</p>
      <Link href={newHref} className={styles.btn}>
        Create your first one
      </Link>
    </div>
  );
}
