"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { ROUTES } from "../constants/routes";
import type { ChoreographyFormValues } from "./useChoreographyForm";
import type { Choreography, Dancer } from "../types/choreography";

type State =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "error"; message: string };

export function useChoreographyGenerator() {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "idle" });

  const generate = useCallback(
    async (values: ChoreographyFormValues, dancers?: Dancer[]) => {
      setState({ status: "generating" });
      try {
        const response = await fetch("/api/choreography/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, dancers: dancers ?? [] }),
        });

        if (!response.ok) {
          const body = (await response.json()) as { error?: string };
          setState({ status: "error", message: body.error ?? "Generation failed." });
          return;
        }

        const choreography = (await response.json()) as Choreography;
        router.push(ROUTES.DASHBOARD_ITEM(choreography.id));
      } catch {
        setState({ status: "error", message: "Unexpected error. Please try again." });
      }
    },
    [router],
  );

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return {
    generate,
    isGenerating: state.status === "generating",
    error: state.status === "error" ? state.message : undefined,
    reset,
  };
}
