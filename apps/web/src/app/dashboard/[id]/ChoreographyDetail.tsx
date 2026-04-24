"use client";

import { useState } from "react";
import { TimelineEditor } from "./TimelineEditor";
import { ChoreographyPlayback } from "./ChoreographyPlayback";
import type { Choreography } from "../../../types/choreography";
import type { Plan } from "../../../constants/plans";
import styles from "./ChoreographyDetail.module.css";

export type DetailView = "edit" | "cinematic" | "classic" | "rehearsal";

const VIEW_LABELS: Record<DetailView, string> = {
  edit:      "Edit",
  cinematic: "Cinematic",
  classic:   "Classic",
  rehearsal: "Rehearsal",
};

type Props = { choreography: Choreography; plan: Plan };

export function ChoreographyDetail({ choreography, plan }: Props) {
  const [view, setView] = useState<DetailView>("edit");

  return (
    <div className={styles.root}>
      <div className={styles.viewBar}>
        {(Object.keys(VIEW_LABELS) as DetailView[]).map((v) => (
          <button
            key={v}
            type="button"
            className={view === v ? styles.viewTabActive : styles.viewTab}
            onClick={() => setView(v)}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      <div className={styles.viewContent}>
        {view === "edit" ? (
          <TimelineEditor choreography={choreography} plan={plan} />
        ) : (
          <ChoreographyPlayback choreography={choreography} mode={view} />
        )}
      </div>
    </div>
  );
}
