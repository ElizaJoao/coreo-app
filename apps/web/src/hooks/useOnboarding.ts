"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "offbeat_onboarding_v1";

type OnboardingStore = {
  welcomeDone?: boolean;
  editorTourDone?: boolean;
};

function readStore(): OnboardingStore {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as OnboardingStore;
  } catch {
    return {};
  }
}

function writeStore(patch: Partial<OnboardingStore>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readStore(), ...patch }));
}

export function useWelcomeOnboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!readStore().welcomeDone) setShow(true);
  }, []);

  const dismiss = useCallback(() => {
    writeStore({ welcomeDone: true });
    setShow(false);
  }, []);

  return { show, dismiss };
}

const EDITOR_TOUR_TOTAL = 4;

export function useEditorTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!readStore().editorTourDone) {
      // Small delay so editor is fully mounted
      const id = setTimeout(() => setActive(true), 600);
      return () => clearTimeout(id);
    }
  }, []);

  const next = useCallback(() => {
    setStep((s) => {
      const next = s + 1;
      if (next >= EDITOR_TOUR_TOTAL) {
        writeStore({ editorTourDone: true });
        setActive(false);
        return s;
      }
      return next;
    });
  }, []);

  const skip = useCallback(() => {
    writeStore({ editorTourDone: true });
    setActive(false);
  }, []);

  return { active, step, total: EDITOR_TOUR_TOTAL, next, skip };
}
