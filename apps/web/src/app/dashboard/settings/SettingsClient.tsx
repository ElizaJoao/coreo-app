"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
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
  marketplaceEnabled: boolean;
  creatorBio: string;
  creatorModalities: string[];
  hasPublishedPacks: boolean;
  totalEarningsCents: number;
  recentSales: { packTitle: string; priceCents: number; createdAt: string }[];
};

export function SettingsClient({ name, email, plan, avatarUrl: initialAvatarUrl, marketplaceEnabled: initialMarketplaceEnabled, creatorBio: initialCreatorBio, creatorModalities: initialCreatorModalities, hasPublishedPacks, totalEarningsCents, recentSales }: Props) {
  const t = useTranslations("settings");
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
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(initialMarketplaceEnabled);
  const [creatorBio, setCreatorBio] = useState(initialCreatorBio);
  const [creatorModalities, setCreatorModalities] = useState(initialCreatorModalities);
  const [marketplaceSaving, setMarketplaceSaving] = useState(false);
  const [marketplaceMsg, setMarketplaceMsg] = useState("");
  const [enablingMarketplace, setEnablingMarketplace] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    if (langOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langOpen]);

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
        setSaveMsg("✓");
        router.refresh();
      } else {
        setSaveMsg("✗");
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
      setAvatarError("Upload failed.");
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

  async function handleEnableMarketplace() {
    setEnablingMarketplace(true);
    try {
      const res = await fetch("/api/marketplace/creator/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketplace_enabled: true }),
      });
      if (res.ok) {
        setMarketplaceEnabled(true);
        router.refresh();
      }
    } finally {
      setEnablingMarketplace(false);
    }
  }

  async function handleSaveCreatorProfile(e: React.FormEvent) {
    e.preventDefault();
    setMarketplaceSaving(true);
    setMarketplaceMsg("");
    try {
      const res = await fetch("/api/marketplace/creator/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator_bio: creatorBio, creator_modalities: creatorModalities }),
      });
      if (res.ok) {
        setMarketplaceMsg("✓");
        router.refresh();
      } else {
        setMarketplaceMsg("✗");
      }
    } finally {
      setMarketplaceSaving(false);
      setTimeout(() => setMarketplaceMsg(""), 3000);
    }
  }

  const planMeta = PLAN_META[plan];
  const currentLocale = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];
  const showMarketplaceSection = marketplaceEnabled || hasPublishedPacks || plan !== "free";

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t("profileSection")}</h1>
      </div>

      <div className={styles.sections}>
        {/* Photo */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>{t("profilePhoto")}</div>
          <div className={styles.card}>
            <div className={styles.avatarRow}>
              <div className={styles.avatarPreview}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={t("profilePhoto")} className={styles.avatarImg} />
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
                  {avatarUploading ? t("uploading") : avatarUrl ? t("changePhoto") : t("uploadPhoto")}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={handleAvatarDelete}
                    disabled={avatarUploading}
                  >
                    {t("removePhoto")}
                  </button>
                )}
                <span className={styles.hint}>{t("photoHint")}</span>
              </div>
            </div>
            {avatarError && <p className={styles.errorMsg}>{avatarError}</p>}
          </div>
        </section>

        {/* Profile */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>{t("profileSection")}</div>
          <div className={styles.card}>
            <form onSubmit={handleSaveName} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>{t("displayName")}</label>
                <input
                  className={styles.input}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  maxLength={80}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t("email")}</label>
                <input
                  className={styles.input}
                  value={email}
                  disabled
                  readOnly
                />
                <span className={styles.hint}>{t("emailHint")}</span>
              </div>
              <div className={styles.formFooter}>
                {saveMsg && <span className={styles.successMsg}>{saveMsg}</span>}
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? t("saving") : t("saveChanges")}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Plan & billing */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>{t("planSection")}</div>
          <div className={styles.card}>
            <div className={styles.planRow}>
              <div>
                <div className={styles.planName}>{planMeta.name}</div>
                <div className={styles.planDesc}>
                  {plan === "free"
                    ? t("freeDesc") ?? "5 choreographies / month · No credit card required"
                    : `€${planMeta.price}/month · Billed monthly`}
                </div>
              </div>
              <span className={`${styles.planBadge} ${styles[`plan_${plan}`]}`}>{planMeta.name}</span>
            </div>
            <div className={styles.planActions}>
              {plan === "free" ? (
                <a href="/dashboard/upgrade" className={styles.btnPrimary}>{t("upgradePlan")}</a>
              ) : (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={handleBillingPortal}
                  disabled={portalLoading}
                >
                  {portalLoading ? t("opening") : t("manageBilling")}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Security */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>{t("securitySection")}</div>
          <div className={styles.card}>
            <div className={styles.securityRow}>
              <div>
                <div className={styles.securityLabel}>{t("password")}</div>
                <div className={styles.securityDesc}>{t("passwordDesc")}</div>
              </div>
              <a href="/forgot-password" className={styles.btnSecondary}>{t("changePassword")}</a>
            </div>
          </div>
        </section>

        {/* Language */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>{t("languageSection")}</div>
          <div className={styles.card}>
            <div className={styles.securityRow}>
              <div>
                <div className={styles.securityLabel}>{t("displayLanguage")}</div>
                <div className={styles.securityDesc}>{t("languageDesc")}</div>
              </div>
              <div className={styles.langDropdownWrap} ref={langRef}>
                <button
                  type="button"
                  className={styles.langTrigger}
                  onClick={() => setLangOpen((o) => !o)}
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                >
                  <span className={styles.langFlag}>{currentLocale.flag}</span>
                  <span className={styles.langLabel}>{currentLocale.label}</span>
                  <span className={styles.langChevron}>{langOpen ? "▴" : "▾"}</span>
                </button>
                {langOpen && (
                  <ul className={styles.langMenu} role="listbox">
                    {LOCALES.map((l) => (
                      <li key={l.code} role="option" aria-selected={l.code === locale}>
                        <button
                          type="button"
                          className={`${styles.langOption} ${l.code === locale ? styles.langOptionActive : ""}`}
                          onClick={() => { switchLocale(l.code); setLangOpen(false); }}
                        >
                          <span>{l.flag}</span>
                          <span>{l.label}</span>
                          {l.code === locale && <span className={styles.langCheck}>✓</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace */}
        {showMarketplaceSection && (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t("marketplaceSection")}</div>
            <div className={styles.card}>
              {!marketplaceEnabled ? (
                <div className={styles.securityRow}>
                  <div>
                    <div className={styles.securityLabel}>{t("sellTitle")}</div>
                    <div className={styles.securityDesc}>{t("sellDesc")}</div>
                  </div>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={handleEnableMarketplace}
                    disabled={enablingMarketplace}
                  >
                    {enablingMarketplace ? t("enabling") : t("enableSelling")}
                  </button>
                </div>
              ) : (
                <>
                  {(totalEarningsCents > 0 || recentSales.length > 0) && (
                    <div className={styles.earningsBlock}>
                      <div className={styles.earningsStat}>
                        <span className={styles.earningsValue}>€{(totalEarningsCents / 100).toFixed(2)}</span>
                        <span className={styles.earningsLabel}>{t("totalEarnings")}</span>
                      </div>
                      {recentSales.length > 0 && (
                        <div className={styles.recentSales}>
                          <div className={styles.recentSalesTitle}>{t("recentSales")}</div>
                          {recentSales.map((sale, i) => (
                            <div key={i} className={styles.saleRow}>
                              <span className={styles.saleTitle}>{sale.packTitle}</span>
                              <span className={styles.saleAmount}>+€{(sale.priceCents / 100).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <form onSubmit={handleSaveCreatorProfile} className={styles.form}>
                    <div className={styles.field}>
                      <label className={styles.label}>{t("creatorBio")}</label>
                      <textarea
                        className={styles.textarea}
                        value={creatorBio}
                        onChange={(e) => setCreatorBio(e.target.value)}
                        placeholder={t("bioPlaceholder")}
                        rows={3}
                        maxLength={400}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>{t("modalities")}</label>
                      <input
                        className={styles.input}
                        value={creatorModalities.join(", ")}
                        onChange={(e) => setCreatorModalities(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                        placeholder={t("modalitiesPlaceholder")}
                      />
                      <span className={styles.hint}>{t("modalitiesHint")}</span>
                    </div>
                    <div className={styles.formFooter}>
                      {marketplaceMsg && <span className={styles.successMsg}>{marketplaceMsg}</span>}
                      <button type="submit" className={styles.btnPrimary} disabled={marketplaceSaving}>
                        {marketplaceSaving ? t("saving") : t("saveProfile")}
                      </button>
                    </div>
                  </form>
                  <div className={styles.stripeNote}>
                    <span>{t("stripeNote")}</span>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Sign out */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>{t("sessionSection")}</div>
          <div className={styles.card}>
            <div className={styles.securityRow}>
              <div>
                <div className={styles.securityLabel}>{t("signOutTitle")}</div>
                <div className={styles.securityDesc}>{t("signOutDesc")}</div>
              </div>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={handleSignOut}
                disabled={signingOut}
              >
                {signingOut ? t("signingOut") : t("signOutTitle")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
