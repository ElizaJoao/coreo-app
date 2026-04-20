import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "../../../auth";
import { ChoreographyResult } from "../../../components/ChoreographyResult";
import { ROUTES } from "../../../constants/routes";
import { getChoreographyById } from "../../../lib/choreography-service";
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

  return (
    <main className={styles.main}>
      <Link href={ROUTES.DASHBOARD} className={styles.backLink}>
        ← Back to dashboard
      </Link>
      <ChoreographyResult choreography={choreography} />
    </main>
  );
}
