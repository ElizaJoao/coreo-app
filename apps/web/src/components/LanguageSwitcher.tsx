"use client";

import { useLocale } from "next-intl";
import styles from "./LanguageSwitcher.module.css";

const LOCALES = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "pt", flag: "🇵🇹", label: "Português" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "de", flag: "🇩🇪", label: "Deutsch" },
];

export function LanguageSwitcher() {
  const locale = useLocale();

  function switchLocale(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    window.location.reload();
  }

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div className={styles.wrapper}>
      <span className={styles.currentFlag}>{current.flag}</span>
      <select
        className={styles.select}
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
      <span className={styles.chevron}>▾</span>
    </div>
  );
}
