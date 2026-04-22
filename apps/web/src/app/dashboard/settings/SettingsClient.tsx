"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "../../../constants/plans";
import { PLAN_META } from "../../../constants/plans";
import styles from "./page.module.css";

type Props = {
  name: string;
  email: string;
  plan: Plan;
};

export function SettingsClient({ name, email, plan }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(name);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: displayName }),
      });
      if (res.ok) {
        setSaveMsg("Saved!");
        router.refresh();
      } else {
        setSaveMsg("Failed to save.");
      }
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  }

  async function handleBillingPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  const planMeta = PLAN_META[plan];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
      </div>

      <div className={styles.sections}>
        {/* Profile */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Profile</div>
          <div className={styles.card}>
            <form onSubmit={handleSaveName} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Display name</label>
                <input
                  className={styles.input}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={80}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  value={email}
                  disabled
                  readOnly
                />
                <span className={styles.hint}>Email cannot be changed.</span>
              </div>
              <div className={styles.formFooter}>
                {saveMsg && <span className={saveMsg === "Saved!" ? styles.successMsg : styles.errorMsg}>{saveMsg}</span>}
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Plan & billing */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Plan & billing</div>
          <div className={styles.card}>
            <div className={styles.planRow}>
              <div>
                <div className={styles.planName}>{planMeta.name} plan</div>
                <div className={styles.planDesc}>
                  {plan === "free"
                    ? "5 choreographies / month · No credit card required"
                    : `$${planMeta.price}/month · Billed monthly`}
                </div>
              </div>
              <span className={`${styles.planBadge} ${styles[`plan_${plan}`]}`}>{planMeta.name}</span>
            </div>
            <div className={styles.planActions}>
              {plan === "free" ? (
                <a href="/dashboard/upgrade" className={styles.btnPrimary}>Upgrade plan</a>
              ) : (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleBillingPortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? "Opening…" : "Manage billing →"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Password */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Security</div>
          <div className={styles.card}>
            <div className={styles.securityRow}>
              <div>
                <div className={styles.securityLabel}>Password</div>
                <div className={styles.securityDesc}>Send yourself a reset link to change your password.</div>
              </div>
              <a href="/forgot-password" className={styles.btnSecondary}>Change password</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
