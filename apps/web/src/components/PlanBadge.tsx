import type { Plan } from "../constants/plans";
import styles from "./PlanBadge.module.css";

export type PlanBadgeProps = {
  plan: Plan;
};

export function PlanBadge({ plan }: PlanBadgeProps) {
  if (plan === "free") return null;
  return (
    <span className={`${styles.badge} ${styles[plan]}`}>
      {plan === "pro" ? "Pro" : "Max"}
    </span>
  );
}
