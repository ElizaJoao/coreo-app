import Link from "next/link";

import type { Choreography } from "../types/choreography";
import styles from "./ChoreographyCard.module.css";

export type ChoreographyCardProps = {
  choreography: Choreography;
  href: string;
};

export function ChoreographyCard({ choreography, href }: ChoreographyCardProps) {
  const date = new Date(choreography.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={href} className={styles.card}>
      <p className={styles.name}>{choreography.name}</p>
      <div className={styles.meta}>
        <span className={styles.badgeAccent}>{choreography.style}</span>
        <span className={styles.badge}>{choreography.duration} min</span>
        <span className={styles.badge}>{choreography.difficulty}</span>
      </div>
      <p className={styles.date}>{date}</p>
    </Link>
  );
}
