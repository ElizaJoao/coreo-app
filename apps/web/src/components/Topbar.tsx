"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { IconSearch, IconPlus } from "./Icons";
import styles from "./Topbar.module.css";

export type TopbarCrumb = {
  label: string;
  href?: string;
};

export type TopbarProps = {
  crumbs: TopbarCrumb[];
  onNew: () => void;
};

export function Topbar({ crumbs, onNew }: TopbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/dashboard/library?q=${encodeURIComponent(q)}`);
    setQuery("");
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setQuery("");
      inputRef.current?.blur();
    }
  }

  return (
    <div className={styles.topbar}>
      <div className={styles.title}>
        {crumbs.map((c, i) => (
          <span key={i}>
            {i > 0 && <span className={styles.sep}>/</span>}
            <span className={i === crumbs.length - 1 ? styles.crumbActive : styles.crumb}>
              {c.label}
            </span>
          </span>
        ))}
      </div>

      <form className={styles.search} onSubmit={handleSearch}>
        <IconSearch size={14} className={styles.searchIcon} />
        <input
          ref={inputRef}
          className={styles.searchInput}
          placeholder="Search choreographies, moves, songs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <span className={styles.shortcut}>⌘K</span>
      </form>

      <div className={styles.actions}>
        <button type="button" className={styles.newBtn} onClick={onNew}>
          <IconPlus size={14} />
          New
        </button>
      </div>
    </div>
  );
}
