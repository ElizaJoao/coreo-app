import Link from "next/link";
import { auth } from "../../../auth";
import { ChoreographyCard } from "../../../components/ChoreographyCard";
import { CreateCard } from "../../../components/CreateCard";
import { DIFFICULTIES, ALL_STYLES } from "../../../constants/choreography";
import { ROUTES } from "../../../constants/routes";
import { getChoreographiesByUser } from "../../../lib/choreography-service";
import styles from "./page.module.css";

type Props = {
  searchParams: Promise<{ style?: string; diff?: string; sort?: string }>;
};

export default async function LibraryPage({ searchParams }: Props) {
  const session = await auth();
  const userId = session?.user?.id;
  const all = userId ? await getChoreographiesByUser(userId) : [];

  const params = await searchParams;
  const style = params.style ?? "All";
  const diff = params.diff ?? "All";
  const sort = params.sort ?? "newest";

  function href(overrides: Record<string, string>) {
    const sp = new URLSearchParams();
    const merged = { style, diff, sort, ...overrides };
    if (merged.style !== "All") sp.set("style", merged.style);
    if (merged.diff !== "All") sp.set("diff", merged.diff);
    if (merged.sort !== "newest") sp.set("sort", merged.sort);
    const qs = sp.toString();
    return qs ? `/dashboard/library?${qs}` : "/dashboard/library";
  }

  let filtered = all.filter((c) => {
    if (style !== "All" && c.style !== style) return false;
    if (diff !== "All" && c.difficulty !== diff) return false;
    return true;
  });

  if (sort === "oldest") filtered = [...filtered].reverse();
  if (sort === "longest") filtered = [...filtered].sort((a, b) => b.duration - a.duration);
  if (sort === "shortest") filtered = [...filtered].sort((a, b) => a.duration - b.duration);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Library</h1>
          <p className={styles.pageSub}>{all.length} choreograph{all.length === 1 ? "y" : "ies"} saved</p>
        </div>
        <Link href={ROUTES.DASHBOARD_NEW} className={styles.btnPrimary}>+ Generate new</Link>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Style</span>
          <div className={styles.chips}>
            {(["All", ...ALL_STYLES] as string[]).map((s) => (
              <Link key={s} href={href({ style: s })} className={style === s ? styles.chipActive : styles.chip}>{s}</Link>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Difficulty</span>
          <div className={styles.chips}>
            {(["All", ...DIFFICULTIES] as string[]).map((d) => (
              <Link key={d} href={href({ diff: d })} className={diff === d ? styles.chipActive : styles.chip}>{d}</Link>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Sort</span>
          <div className={styles.chips}>
            {([["newest", "Newest"], ["oldest", "Oldest"], ["longest", "Longest"], ["shortest", "Shortest"]] as [string, string][]).map(([val, label]) => (
              <Link key={val} href={href({ sort: val })} className={sort === val ? styles.chipActive : styles.chip}>{label}</Link>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 && all.length > 0 ? (
        <div className={styles.empty}>No choreographies match those filters.</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((c) => (
            <ChoreographyCard key={c.id} choreography={c} href={ROUTES.DASHBOARD_ITEM(c.id)} />
          ))}
          <CreateCard />
        </div>
      )}
    </div>
  );
}
