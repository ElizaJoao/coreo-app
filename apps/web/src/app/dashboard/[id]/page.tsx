import { notFound } from "next/navigation";

import { auth } from "../../../auth";
import { getChoreographyById } from "../../../lib/choreography-service";
import { supabase } from "../../../lib/supabase";
import type { Plan } from "../../../constants/plans";
import { ChoreographyPlayback } from "./ChoreographyPlayback";
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
    <div className={styles.detailPage}>
      {/* Playback / track view */}
      <ChoreographyPlayback choreography={choreography} />

      {/* Sequence editor — edit moves, music, formations */}
      <div className={styles.editorSection}>
        <div className={styles.editorDivider}>
          <span className={styles.editorDividerLabel}>Edit sequence</span>
        </div>
        <ChoreographyEditor choreography={choreography} plan={plan} />
      </div>
    </div>
  );
}
