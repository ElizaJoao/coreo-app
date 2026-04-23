import Link from "next/link";
import { auth } from "../../../auth";
import { supabase } from "../../../lib/supabase";
import { ChoreographyCard } from "../../../components/ChoreographyCard";
import { CreateCard } from "../../../components/CreateCard";
import { PackCard } from "../../../components/PackCard";
import { DIFFICULTIES, ALL_STYLES } from "../../../constants/choreography";
import { ROUTES } from "../../../constants/routes";
import { getChoreographiesByUser } from "../../../lib/choreography-service";
import { getMyPurchasedPacks } from "../../../lib/marketplace-service";
import styles from "./page.module.css";

type Props = {
  searchParams: Promise<{ style?: string; diff?: string; sort?: string; fav?: string; tag?: string }>;
};

export default async function LibraryPage({ searchParams }: Props) {
  const session = await auth();
  const userId = session?.user?.id;
  const [all, purchasedPacks] = await Promise.all([
    userId ? getChoreographiesByUser(userId) : Promise.resolve([]),
    userId ? getMyPurchasedPacks(userId) : Promise.resolve([]),
  ]);

  const params = await searchParams;
  const style = params.style ?? "All";
  const diff = params.diff ?? "All";
  const sort = params.sort ?? "newest";
  const showFav = params.fav === "1";
  const activeTag = params.tag ?? "";

  // Monthly count for upgrade banner
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thisMonthCount = all.filter((c) => c.createdAt >= monthStart).length;

  // Plan for upgrade banner
  let plan = "free";
  if (userId) {
    const { data } = await supabase.from("users").select("plan").eq("id", userId).single();
    plan = (data as { plan?: string } | null)?.plan ?? "free";
  }

  // All distinct tags for the filter row
  const allTags = Array.from(new Set(all.flatMap((c) => c.tags))).sort();

  function href(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged: Record<string, string | undefined> = { style, diff, sort, fav: showFav ? "1" : undefined, tag: activeTag || undefined, ...overrides };
    if (merged.style && merged.style !== "All") sp.set("style", merged.style);
    if (merged.diff && merged.diff !== "All") sp.set("diff", merged.diff);
    if (merged.sort && merged.sort !== "newest") sp.set("sort", merged.sort);
    if (merged.fav === "1") sp.set("fav", "1");
    if (merged.tag) sp.set("tag", merged.tag);
    const qs = sp.toString();
    return qs ? `/dashboard/library?${qs}` : "/dashboard/library";
  }

  let filtered = all.filter((c) => {
    if (style !== "All" && c.style !== style) return false;
    if (diff !== "All" && c.difficulty !== diff) return false;
    if (showFav && !c.isFavorite) return false;
    if (activeTag && !c.tags.includes(activeTag)) return false;
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

      {plan === "free" && thisMonthCount >= 5 && (
        <div className={styles.upgradeBanner}>
          <span>You&apos;ve used all 5 free choreographies this month.</span>
          <Link href="/dashboard/upgrade" className={styles.upgradeBannerLink}>Upgrade to Pro for unlimited →</Link>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Show</span>
          <div className={styles.chips}>
            <Link href={href({ fav: undefined })} className={!showFav ? styles.chipActive : styles.chip}>All</Link>
            <Link href={href({ fav: "1" })} className={showFav ? styles.chipActive : styles.chip}>♥ Favorites</Link>
          </div>
        </div>

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

        {allTags.length > 0 && (
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Tags</span>
            <div className={styles.chips}>
              <Link href={href({ tag: undefined })} className={!activeTag ? styles.chipActive : styles.chip}>All</Link>
              {allTags.map((t) => (
                <Link key={t} href={href({ tag: t })} className={activeTag === t ? styles.chipActive : styles.chip}>{t}</Link>
              ))}
            </div>
          </div>
        )}

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

      {purchasedPacks.length > 0 && (
        <div className={styles.purchasedSection}>
          <h2 className={styles.sectionTitle}>Purchased packs ({purchasedPacks.length})</h2>
          <div className={styles.grid}>
            {purchasedPacks.map((pack) => (
              <PackCard key={pack.id} pack={pack} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
