"use client";

import { useCallback, useMemo, useState } from "react";

import {
  ALL_STYLES,
  DIFFICULTIES,
  DURATIONS,
} from "../constants/choreography";
import type {
  ChoreographyDifficulty,
  ChoreographyDurationMinutes,
  ChoreographyStyle,
} from "../types/choreography";

export type ChoreographyFormValues = {
  style: ChoreographyStyle;
  duration: ChoreographyDurationMinutes;
  targetAudience: string;
  difficulty: ChoreographyDifficulty;
  description: string;
};

export type ChoreographyFormErrors = Partial<
  Record<keyof ChoreographyFormValues, string>
>;

function validate(values: ChoreographyFormValues): ChoreographyFormErrors {
  const errors: ChoreographyFormErrors = {};

  if (!ALL_STYLES.includes(values.style)) {
    errors.style = "Select a valid style.";
  }

  if (!DURATIONS.includes(values.duration)) {
    errors.duration = "Select a valid duration.";
  }

  if (!DIFFICULTIES.includes(values.difficulty)) {
    errors.difficulty = "Select a valid difficulty.";
  }

  const target = values.targetAudience.trim();
  if (target.length === 0) {
    errors.targetAudience = "Target audience is required.";
  } else if (target.length < 2) {
    errors.targetAudience = "Target audience is too short.";
  } else if (target.length > 80) {
    errors.targetAudience = "Target audience is too long.";
  }

  const desc = values.description.trim();
  if (desc.length > 600) {
    errors.description = "Description is too long (max 600 chars).";
  }

  return errors;
}

export function useChoreographyForm(options?: {
  initialValues?: Partial<ChoreographyFormValues>;
  onValidSubmit?: (values: ChoreographyFormValues) => void;
}) {
  const [values, setValues] = useState<ChoreographyFormValues>(() => ({
    style: options?.initialValues?.style ?? ALL_STYLES[0],
    duration: options?.initialValues?.duration ?? DURATIONS[1],
    targetAudience: options?.initialValues?.targetAudience ?? "",
    difficulty: options?.initialValues?.difficulty ?? DIFFICULTIES[0],
    description: options?.initialValues?.description ?? "",
  }));

  const durationIndex = useMemo(() => {
    const idx = DURATIONS.indexOf(values.duration);
    return idx === -1 ? 0 : idx;
  }, [values.duration]);

  const errors = useMemo(() => validate(values), [values]);
  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const setStyle = useCallback((style: ChoreographyStyle) => {
    setValues((prev) => ({ ...prev, style }));
  }, []);

  const setDurationIndex = useCallback((index: number) => {
    const safeIndex = Math.max(0, Math.min(DURATIONS.length - 1, index));
    const duration = DURATIONS[safeIndex];
    setValues((prev) => ({ ...prev, duration }));
  }, []);

  const setTargetAudience = useCallback((targetAudience: string) => {
    setValues((prev) => ({ ...prev, targetAudience }));
  }, []);

  const setDifficulty = useCallback((difficulty: ChoreographyDifficulty) => {
    setValues((prev) => ({ ...prev, difficulty }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setValues((prev) => ({ ...prev, description }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const nextErrors = validate(values);
      if (Object.keys(nextErrors).length > 0) return;

      options?.onValidSubmit?.(values);
    },
    [options, values],
  );

  return {
    values,
    errors,
    isValid,
    durationIndex,
    durationIndexMin: 0,
    durationIndexMax: DURATIONS.length - 1,
    setStyle,
    setDurationIndex,
    setTargetAudience,
    setDifficulty,
    setDescription,
    handleSubmit,
  };
}

