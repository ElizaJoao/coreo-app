"use client";

import { useState } from "react";

import { PLAN_META, PLANS, type Plan } from "../../../constants/plans";
import styles from "./page.module.css";

export function UpgradeClient({
  currentPlan,
  success,
}: {
  currentPlan: Plan;
  success?: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  async function handleUpgrade(plan: "pro" | "max") {
    setLoading(plan);
    setError(undefined);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    setLoading("portal");
    setError(undefined);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Plans & billing</h1>
        <p className={styles.subtitle}>
          Choose the plan that fits your needs. Cancel anytime.
        </p>
      </div>

      {success && (
        <div className={styles.successBanner}>
          Payment successful — your plan has been activated!
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.grid}>
        {PLANS.map((planId) => {
          const plan = PLAN_META[planId];
          const isCurrent = planId === currentPlan;
          const isUpgradeable = planId !== "free" && !isCurrent;

          return (
            <div
              key={planId}
              className={`${styles.card} ${plan.highlight && !isCurrent ? styles.cardHighlight : ""} ${isCurrent ? styles.cardCurrent : ""}`}
            >
              {isCurrent && (
                <span className={styles.badgeCurrent}>Current plan</span>
              )}
              {!isCurrent && plan.badge && (
                <span className={styles.badge}>{plan.badge}</span>
              )}

              <div className={styles.planName}>{plan.name}</div>

              <div className={styles.price}>
                {plan.price === 0 ? (
                  <span className={styles.priceAmount}>Free</span>
                ) : (
                  <>
                    <span className={styles.priceCurrency}>€</span>
                    <span className={styles.priceAmount}>{plan.price}</span>
                    <span className={styles.pricePeriod}>/mo</span>
                  </>
                )}
              </div>

              <ul className={styles.features}>
                {plan.features.map((f) => (
                  <li key={f} className={styles.feature}>
                    <span className={styles.check}>✓</span>{f}
                  </li>
                ))}
              </ul>

              {planId !== "free" && (
                <div className={styles.paymentMethods}>
                  <span className={styles.paymentLabel}>Pay with</span>
                  <span className={styles.paymentChip}>💳 Card</span>
                  <span className={styles.paymentChip}>🏦 Multibanco</span>
                </div>
              )}

              {isCurrent ? (
                <button type="button" className={styles.btnCurrent} disabled>
                  Current plan
                </button>
              ) : isUpgradeable ? (
                <button
                  type="button"
                  className={plan.highlight ? styles.btnPrimary : styles.btnSecondary}
                  onClick={() => handleUpgrade(planId as "pro" | "max")}
                  disabled={!!loading}
                >
                  {loading === planId
                    ? "Redirecting…"
                    : `Start ${plan.name} — €${plan.price}/mo`}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {currentPlan !== "free" && (
        <button
          type="button"
          className={styles.portalBtn}
          onClick={handleManageBilling}
          disabled={loading === "portal"}
        >
          {loading === "portal" ? "Opening…" : "Manage billing & invoices →"}
        </button>
      )}

      <p className={styles.fine}>
        Payments processed securely by Stripe. Cancel anytime from the billing portal.
        Multibanco available for Portugal. All prices in EUR.
      </p>
    </div>
  );
}
