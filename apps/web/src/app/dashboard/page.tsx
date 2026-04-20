import { auth } from "../../auth";
import { ChoreographyCard } from "../../components/ChoreographyCard";
import { DashboardEmpty } from "../../components/DashboardEmpty";
import { DashboardHeader } from "../../components/DashboardHeader";
import { ROUTES } from "../../constants/routes";
import { getChoreographiesByUser } from "../../lib/choreography-service";
import styles from "./page.module.css";

export default async function DashboardPage() {
  const session = await auth();
  const choreographies = session?.user?.id
    ? await getChoreographiesByUser(session.user.id)
    : [];

  const userName = session?.user?.name ?? session?.user?.email ?? "there";

  return (
    <main className={styles.main}>
      <DashboardHeader userName={userName} newHref={ROUTES.DASHBOARD_NEW} />

      {choreographies.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <DashboardEmpty newHref={ROUTES.DASHBOARD_NEW} />
        </div>
      ) : (
        <div className={styles.grid}>
          {choreographies.map((c) => (
            <ChoreographyCard key={c.id} choreography={c} href={ROUTES.DASHBOARD_ITEM(c.id)} />
          ))}
        </div>
      )}
    </main>
  );
}
