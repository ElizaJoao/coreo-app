import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PackCard } from "../../components/PackCard";
import { listPacks } from "../../lib/marketplace-service";
import { ALL_STYLES, DIFFICULTIES } from "../../constants/choreography";
import styles from "./page.module.css";

type Props = {
  searchParams: Promise<{ style?: string; diff?: string; sort?: string; price?: string }>;
};

export default async function MarketplacePage({ searchParams }: Props) {
  const t = await getTranslations("marketplace");
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
        <h1 className={styles.heroTitle}>{t("findRoutine")}</h1>
        <p className={styles.heroSub}>{t("subtitle")}</p>
        <Link href="/dashboard/new" className={styles.heroCreate}>{t("createOwn")}</Link>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.filterSection}>
            <div className={styles.filterTitle}>{t("sortBy")}</div>
            {([["newest", t("newest")], ["bestseller", t("bestseller")], ["top_rated", t("topRated")]] as [string, string][]).map(([val, label]) => (
              <Link key={val} href={href({ sort: val })} className={sort === val ? styles.filterItemActive : styles.filterItem}>{label}</Link>
            ))}
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterTitle}>{t("price")}</div>
            {([["any", t("all")], ["free", t("freeOnly")], ["paid", t("paid")]] as [string, string][]).map(([val, label]) => (
              <Link key={val} href={href({ price: val })} className={priceFilter === val ? styles.filterItemActive : styles.filterItem}>{label}</Link>
            ))}
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterTitle}>{t("difficulty")}</div>
            <Link href={href({ diff: "" })} className={!diff ? styles.filterItemActive : styles.filterItem}>{t("all")}</Link>
            {(DIFFICULTIES as readonly string[]).map((d) => (
              <Link key={d} href={href({ diff: d })} className={diff === d ? styles.filterItemActive : styles.filterItem}>{d}</Link>
            ))}
          </div>

          <div className={styles.filterSection}>
            <div className={styles.filterTitle}>{t("style")}</div>
            <Link href={href({ style: "" })} className={!style ? styles.filterItemActive : styles.filterItem}>{t("all")}</Link>
            {(ALL_STYLES as readonly string[]).map((s) => (
              <Link key={s} href={href({ style: s })} className={style === s ? styles.filterItemActive : styles.filterItem}>{s}</Link>
            ))}
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultCount}>{packs.length} {packs.length !== 1 ? t("packs") : t("pack")}</span>
          </div>
          {packs.length === 0 ? (
            <div className={styles.empty}>{t("noMatches")}</div>
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
