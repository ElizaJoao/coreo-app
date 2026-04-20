import Link from "next/link";

import { SignOutButton } from "./SignOutButton";
import styles from "./DashboardHeader.module.css";

export type DashboardHeaderProps = {
  userName: string;
  newHref: string;
};

export function DashboardHeader({ userName, newHref }: DashboardHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headingGroup}>
        <h1 className={styles.title}>My choreographies</h1>
        <p className={styles.greeting}>Welcome, {userName}.</p>
      </div>
      <div className={styles.actions}>
        <Link href={newHref} className={styles.newBtn}>
          + New
        </Link>
        <SignOutButton />
      </div>
    </header>
  );
}
