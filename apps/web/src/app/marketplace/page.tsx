import Link from "next/link";
import { PackCard } from "../../components/PackCard";
import { listPacks } from "../../lib/marketplace-service";
import { ALL_STYLES, DIFFICULTIES } from "../../constants/choreography";
import styles from "./page.module.css";

type Props = {
  searchParams: Promise<{ style?: string; diff?: string; sort?: string; price?: string }>;
};

export default async function MarketplacePage({ searchParams }: Props) {
  const params = await searchParams;
  const style = params.style ?? "";
  const diff = params.diff ?? "";
  const sort = (params.sort as "newest" | "bestseller" | "top_rated") ?? "newest";
  const priceFilter = params.price ?? "any";

  const packs = await listPacks({
    style: style || undefined,
    difficulty: diff || undefined,
    sort,
    maxPriceCents: priceFilter === "free" ? 0 : undefined,
    minPriceCents: priceFilter === "paid" ? 1 : undefined,
  });

  function href(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = { style, diff, sort, price: priceFilter, ...overrides };
    if (merged.style) sp.set("style", merged.style);
    if (merged.diff) sp.set("diff", merged.diff);
    if (merged.sort && merged.sort !== "newest") sp.set("sort", merged.sort);
    if (merged.price && merged.price !== "any") sp.set("price", merged.price);
    const qs = sp.toString();
    return qs ? `/marketplace?${qs}` : "/marketplace";
  }

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Find your next routine</h1>
        <p className={styles.heroSub}>Choreography packs curated by professional instructors. Download, adapt, and teach.</p>
        <Link href="/dashboard/new" className={styles.heroCreate}>Or create your own with AI →</Link>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.filterSection}>
            <div className={styles.filterTitle}>Sort by</div>
            {([["newest", "Newest"], ["bestseller", "Bestseller"], ["top_rated", "Top rated"]] as [string, string][]).map(([val, label]) => (
              <Link key={val} href={href({ sort: val })} className={sort === val ? styles.filterItemActive : styles.filterItem}>{label}</Link>
            ))}
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterTitle}>Price</div>
            {([["any", "All"], ["free", "Free only"], ["paid", "Paid"]] as [string, string][]).map(([val, label]) => (
              <Link key={val} href={href({ price: val })} className={priceFilter === val ? styles.filterItemActive : styles.filterItem}>{label}</Link>
            ))}
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterTitle}>Difficulty</div>
            <Link href={href({ diff: "" })} className={!diff ? styles.filterItemActive : styles.filterItem}>All</Link>
            {(DIFFICULTIES as readonly string[]).map((d) => (
              <Link key={d} href={href({ diff: d })} className={diff === d ? styles.filterItemActive : styles.filterItem}>{d}</Link>
            ))}
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterTitle}>Style</div>
            <Link href={href({ style: "" })} className={!style ? styles.filterItemActive : styles.filterItem}>All</Link>
            {(ALL_STYLES as readonly string[]).map((s) => (
              <Link key={s} href={href({ style: s })} className={style === s ? styles.filterItemActive : styles.filterItem}>{s}</Link>
            ))}
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultCount}>{packs.length} pack{packs.length !== 1 ? "s" : ""}</span>
          </div>
          {packs.length === 0 ? (
            <div className={styles.empty}>No packs match those filters yet. Be the first to publish!</div>
          ) : (
            <div className={styles.grid}>
              {packs.map((pack) => (
                <PackCard key={pack.id} pack={pack} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
