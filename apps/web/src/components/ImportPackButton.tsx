"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "./ImportPackButton.module.css";

export type ImportPackButtonProps = {
  packId: string;
};

export function ImportPackButton({ packId }: ImportPackButtonProps) {
  const t = useTranslations("card");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleImport() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/marketplace/packs/${packId}/import`, { method: "POST" });
      const data = await res.json() as { choreographyId?: string; error?: string };
      if (!res.ok || !data.choreographyId) {
        setError(data.error ?? t("importError"));
        return;
      }
      router.push(`/dashboard/${data.choreographyId}`);
    } catch {
      setError(t("importError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.btn}
        onClick={handleImport}
        disabled={loading}
      >
        {loading ? t("importing") : t("import")}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
