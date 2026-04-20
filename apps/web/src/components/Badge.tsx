import type { ReactNode } from "react";

import styles from "./Badge.module.css";

export type BadgeProps = {
  children: ReactNode;
  accent?: boolean;
};

export function Badge({ children, accent = false }: BadgeProps) {
  return (
    <span className={accent ? styles.badgeAccent : styles.badge}>
      {children}
    </span>
  );
}
