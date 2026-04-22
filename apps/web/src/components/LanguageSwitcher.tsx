"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import styles from "./LanguageSwitcher.module.css";

const LOCALES = [
  { code: "en", flag: "🇬🇧", label: "EN" },
  { code: "pt", flag: "🇵🇹", label: "PT" },
  { code: "es", flag: "🇪🇸", label: "ES" },
  { code: "fr", flag: "🇫🇷", label: "FR" },
  { code: "de", flag: "🇩🇪", label: "DE" },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <div className={styles.switcher}>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          className={locale === l.code ? styles.btnActive : styles.btn}
          onClick={() => switchLocale(l.code)}
          title={l.code.toUpperCase()}
        >
          <span className={styles.flag}>{l.flag}</span>
          <span className={styles.label}>{l.label}</span>
        </button>
      ))}
    </div>
  );
}
