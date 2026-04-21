import Link from "next/link";

import { PLAN_META, type Plan } from "../constants/plans";
import styles from "./PricingSection.module.css";

export type PricingSectionProps = {
  signupHref: string;
};

const PLAN_ORDER: Plan[] = ["free", "pro", "max"];

export function PricingSection({ signupHref }: PricingSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.eyebrow}>Pricing</div>
      <h2 className={styles.title}>Start free, grow with your classes</h2>
      <p className={styles.subtitle}>No credit card required to get started.</p>

      <div className={styles.grid}>
        {PLAN_ORDER.map((planId) => {
          const plan = PLAN_META[planId];
          const isFree = planId === "free";
          return (
            <div
              key={planId}
              className={`${styles.card} ${plan.highlight ? styles.cardHighlight : ""} ${isFree ? styles.cardSelected : ""}`}
            >
              {plan.badge && (
                <span className={styles.badge}>{plan.badge}</span>
              )}
              {isFree && (
                <span className={styles.selectedBadge}>Current plan</span>
              )}

              <div className={styles.planName}>{plan.name}</div>
              <div className={styles.price}>
                {plan.price === 0 ? (
                  <span className={styles.priceAmount}>Free</span>
                ) : (
                  <>
                    <span className={styles.priceCurrency}>$</span>
                    <span className={styles.priceAmount}>{plan.price}</span>
                    <span className={styles.pricePeriod}>/mo</span>
                  </>
                )}
              </div>
              <p className={styles.planDesc}>{plan.description}</p>

              <ul className={styles.features}>
                {plan.features.map((f) => (
                  <li key={f} className={styles.feature}>
                    <span className={styles.check}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={signupHref}
                className={plan.highlight ? styles.btnPrimary : styles.btnSecondary}
              >
                {isFree ? "Get started free" : `Start ${plan.name}`}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
