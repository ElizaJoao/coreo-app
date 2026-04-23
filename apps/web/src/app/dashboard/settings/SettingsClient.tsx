"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useLocale } from "next-intl";
import type { Plan } from "../../../constants/plans";
import { PLAN_META } from "../../../constants/plans";
import styles from "./page.module.css";

const LOCALES = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "pt", flag: "🇵🇹", label: "Português" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
];

type Props = {
  name: string;
  email: string;
  plan: Plan;
  avatarUrl?: string;
};

export function SettingsClient({ name, email, plan, avatarUrl: initialAvatarUrl }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const [displayName, setDisplayName] = useState(name);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/user/avatar", { method: "POST", body: form });
      const data = await res.json() as { avatarUrl?: string; error?: string };
      if (!res.ok) { setAvatarError(data.error ?? "Upload failed."); return; }
      setAvatarUrl(data.avatarUrl);
      router.refresh();
    } catch {
      setAvatarError("Upload failed. Please try again.");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAvatarDelete() {
    setAvatarUploading(true);
    setAvatarError("");
    try {
      await fetch("/api/user/avatar", { method: "DELETE" });
      setAvatarUrl(undefined);
      router.refresh();
    } catch {
      setAvatarError("Failed to remove photo.");
    } finally {
      setAvatarUploading(false);
    }
  }

  function switchLocale(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    window.location.reload();
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
  }

  const planMeta = PLAN_META[plan];
  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
      </div>

      <div className={styles.sections}>
        {/* Photo */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Profile photo</div>
          <div className={styles.card}>
            <div className={styles.avatarRow}>
              <div className={styles.avatarPreview}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile photo" className={styles.avatarImg} />
                ) : (
                  <div className={styles.avatarInitials}>
                    {name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                )}
              </div>
              <div className={styles.avatarActions}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className={styles.fileInput}
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                >
                  {avatarUploading ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={handleAvatarDelete}
                    disabled={avatarUploading}
                  >
                    Remove photo
                  </button>
                )}
                <span className={styles.hint}>JPG, PNG, WebP or GIF · Max 5 MB</span>
              </div>
            </div>
            {avatarError && <p className={styles.errorMsg}>{avatarError}</p>}
          </div>
        </section>

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

        {/* Security */}
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

        {/* Language */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Language</div>
          <div className={styles.card}>
            <div className={styles.securityRow}>
              <div>
                <div className={styles.securityLabel}>Display language</div>
                <div className={styles.securityDesc}>Choose the language used throughout the app.</div>
              </div>
              <div className={styles.langSelectWrap}>
                <span className={styles.langFlag}>{currentLocale.flag}</span>
                <select
                  className={styles.langSelect}
                  value={locale}
                  onChange={(e) => switchLocale(e.target.value)}
                  aria-label="Select language"
                >
                  {LOCALES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.label}
                    </option>
                  ))}
                </select>
                <span className={styles.langChevron}>▾</span>
              </div>
            </div>
          </div>
        </section>

        {/* Sign out */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Session</div>
          <div className={styles.card}>
            <div className={styles.securityRow}>
              <div>
                <div className={styles.securityLabel}>Sign out</div>
                <div className={styles.securityDesc}>Sign out of your account on this device.</div>
              </div>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
