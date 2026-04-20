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

      <div className={styles.search}>
        <IconSearch size={14} className={styles.searchIcon} />
        <input className={styles.searchInput} placeholder="Search choreographies, moves, songs…" />
        <span className={styles.shortcut}>⌘K</span>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.newBtn} onClick={onNew}>
          <IconPlus size={14} />
          New
        </button>
      </div>
    </div>
  );
}
