"use client";

import { useState } from "react";

import { PLAN_META, type Plan } from "../../../constants/plans";
import styles from "./page.module.css";

const PLANS: ("pro" | "max")[] = ["pro", "max"];

export function UpgradeClient({ currentPlan }: { currentPlan: Plan }) {
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
      setLoading("portal");
    } finally {
      setLoading(null);
    }
  }

  const isPaid = currentPlan !== "free";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isPaid ? "Your subscription" : "Upgrade your plan"}
        </h1>
        <p className={styles.subtitle}>
          {isPaid
            ? "Manage your current subscription or change plans."
            : "Unlock unlimited choreographies, music search, and more."}
        </p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isPaid ? (
        <div className={styles.activeCard}>
          <div className={styles.activePlanName}>
            {PLAN_META[currentPlan].name} plan
          </div>
          <p className={styles.activePlanDesc}>
            You have access to all {PLAN_META[currentPlan].name} features.
          </p>
          <button
            type="button"
            className={styles.portalBtn}
            onClick={handleManageBilling}
            disabled={loading === "portal"}
          >
            {loading === "portal" ? "Opening…" : "Manage billing & invoices →"}
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {PLANS.map((planId) => {
            const plan = PLAN_META[planId];
            return (
              <div key={planId} className={`${styles.card} ${planId === "pro" ? styles.cardHighlight : ""}`}>
                {plan.badge && <span className={styles.badge}>{plan.badge}</span>}
                <div className={styles.planName}>{plan.name}</div>
                <div className={styles.price}>
                  <span className={styles.priceCurrency}>€</span>
                  <span className={styles.priceAmount}>{plan.price}</span>
                  <span className={styles.pricePeriod}>/mo</span>
                </div>
                <ul className={styles.features}>
                  {plan.features.map((f) => (
                    <li key={f} className={styles.feature}>
                      <span className={styles.check}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <div className={styles.paymentMethods}>
                  <span className={styles.paymentLabel}>Pay with</span>
                  <span className={styles.paymentChip}>💳 Card</span>
                  <span className={styles.paymentChip}>📱 MB WAY</span>
                  <span className={styles.paymentChip}>🏦 Multibanco</span>
                </div>
                <button
                  type="button"
                  className={planId === "pro" ? styles.btnPrimary : styles.btnSecondary}
                  onClick={() => handleUpgrade(planId)}
                  disabled={!!loading}
                >
                  {loading === planId ? "Redirecting…" : `Start ${plan.name} — €${plan.price}/mo`}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className={styles.fine}>
        Payments processed securely by Stripe. Cancel anytime from the billing portal.
        MB WAY and Multibanco available for Portugal. All prices in EUR.
      </p>
    </div>
  );
}
