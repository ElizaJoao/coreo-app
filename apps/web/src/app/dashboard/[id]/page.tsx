import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "../../../auth";
import { ROUTES } from "../../../constants/routes";
import { getChoreographyById } from "../../../lib/choreography-service";
import { supabase } from "../../../lib/supabase";
import type { Plan } from "../../../constants/plans";
import { ChoreographyEditor } from "./ChoreographyEditor";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ChoreographyPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) notFound();

  const choreography = await getChoreographyById(id, session.user.id);
  if (!choreography) notFound();

  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("id", session.user.id)
    .single();
  const plan = ((userData as { plan?: string } | null)?.plan ?? "free") as Plan;

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <Link href={ROUTES.DASHBOARD} className={styles.backLink}>← Back</Link>
        <div className={styles.badges}>
          <span className={styles.badge}>{choreography.style}</span>
          <span className={styles.badge}>{choreography.difficulty}</span>
          <span className={styles.badge}>{choreography.duration} min</span>
        </div>
      </div>
      <ChoreographyEditor choreography={choreography} plan={plan} />
    </main>
  );
}
