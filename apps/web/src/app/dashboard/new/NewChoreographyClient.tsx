"use client";

import { ChoreographyForm } from "../../../components/ChoreographyForm";
import { GeneratingOverlay } from "../../../components/GeneratingOverlay";
import { DANCE_STYLES, DIFFICULTIES, FITNESS_STYLES } from "../../../constants/choreography";
import { useChoreographyForm } from "../../../hooks/useChoreographyForm";
import { useChoreographyGenerator } from "../../../hooks/useChoreographyGenerator";
import type { Plan } from "../../../constants/plans";
import styles from "./page.module.css";

export function NewChoreographyClient({ plan }: { plan: Plan }) {
  const generator = useChoreographyGenerator();
  const form = useChoreographyForm({
    onValidSubmit: generator.generate,
  });

  return (
    <main className={styles.main}>
      {generator.isGenerating ? <GeneratingOverlay plan={plan} /> : null}
      <h1 className={styles.title}>New choreography</h1>
      <p className={styles.subtitle}>Fill in the details and let AI build your plan.</p>

      {generator.error ? (
        <p className={styles.errorBanner}>{generator.error}</p>
      ) : null}

      <ChoreographyForm
        style={form.values.style}
        onStyleChange={form.setStyle}
        danceStyles={DANCE_STYLES}
        fitnessStyles={FITNESS_STYLES}
        styleError={form.errors.style}
        duration={form.values.duration}
        durationIndex={form.durationIndex}
        durationIndexMin={form.durationIndexMin}
        durationIndexMax={form.durationIndexMax}
        onDurationIndexChange={form.setDurationIndex}
        durationError={form.errors.duration}
        targetAudience={form.values.targetAudience}
        onTargetAudienceChange={form.setTargetAudience}
        targetAudienceError={form.errors.targetAudience}
        difficulty={form.values.difficulty}
        onDifficultyChange={form.setDifficulty}
        difficulties={DIFFICULTIES}
        difficultyError={form.errors.difficulty}
        description={form.values.description}
        onDescriptionChange={form.setDescription}
        descriptionError={form.errors.description}
        isValid={form.isValid}
        isSubmitting={generator.isGenerating}
        onSubmit={form.handleSubmit}
      />
    </main>
  );
}
