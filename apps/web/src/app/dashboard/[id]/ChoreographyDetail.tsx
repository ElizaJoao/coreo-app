"use client";

import { useState } from "react";
import { TimelineEditor } from "./TimelineEditor";
import { ChoreographyPlayback } from "./ChoreographyPlayback";
import { OnboardingSpotlight } from "../../../components/OnboardingSpotlight";
import { useEditorTour } from "../../../hooks/useOnboarding";
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

const TOUR_STEPS = [
  {
    selector: '[data-tour="view-bar"]',
    title: "Switch views",
    body: "Edit is your main workspace. Classic and Cinematic give a visual preview. Rehearsal shows cue cards for your students.",
    position: "bottom" as const,
  },
  {
    selector: '[data-tour="stage"]',
    title: "Set dancer positions",
    body: "Drag each dancer to their spot on the stage. Positions are saved per move — every move can have a different formation.",
    position: "right" as const,
  },
  {
    selector: '[data-tour="music-row"]',
    title: "Add your music",
    body: "Click '+ Track' to search for a song and place it on the timeline. Drag the block to set when it plays. Click a block to edit or remove it.",
    position: "top" as const,
  },
  {
    selector: '[data-tour="moves-row"]',
    title: "Adjust move timing",
    body: "Each block is one move. Edit the number to change its duration in seconds. Click a block to jump to that move during playback.",
    position: "top" as const,
  },
];

type Props = { choreography: Choreography; plan: Plan };

export function ChoreographyDetail({ choreography, plan }: Props) {
  const [view, setView] = useState<DetailView>("edit");
  const tour = useEditorTour();

  return (
    <div className={styles.root}>
      <div className={styles.viewBar} data-tour="view-bar">
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

      {tour.active && (
        <OnboardingSpotlight
          steps={TOUR_STEPS}
          step={tour.step}
          total={tour.total}
          onNext={tour.next}
          onSkip={tour.skip}
        />
      )}
    </div>
  );
}
