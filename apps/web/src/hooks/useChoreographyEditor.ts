"use client";

import { useCallback, useState } from "react";

import type { Choreography, ChoreographyMove, ChoreographyMusic } from "../types/choreography";

function reorder(moves: ChoreographyMove[], from: number, to: number): ChoreographyMove[] {
  const next = [...moves];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next.map((m, i) => ({ ...m, order: i + 1 }));
}

function newMove(order: number): ChoreographyMove {
  return { id: `move-${Date.now()}`, name: "New move", duration: 30, description: "", order };
}

export type EditorStatus = "idle" | "saving" | "saved" | "error";

export function useChoreographyEditor(initial: Choreography) {
  const [name, setName] = useState(initial.name);
  const [moves, setMoves] = useState<ChoreographyMove[]>(initial.moves);
  const [music, setMusic] = useState<ChoreographyMusic | undefined>(initial.music);
  const [description, setDescription] = useState(initial.description);
  const [status, setStatus] = useState<EditorStatus>("idle");

  const updateMove = useCallback((id: string, patch: Partial<ChoreographyMove>) => {
    setMoves((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    setMoves((prev) => reorder(prev, index, index - 1));
  }, []);

  const moveDown = useCallback((index: number) => {
    setMoves((prev) => {
      if (index >= prev.length - 1) return prev;
      return reorder(prev, index, index + 1);
    });
  }, []);

  const deleteMove = useCallback((id: string) => {
    setMoves((prev) => prev.filter((m) => m.id !== id).map((m, i) => ({ ...m, order: i + 1 })));
  }, []);

  const addMove = useCallback(() => {
    setMoves((prev) => [...prev, newMove(prev.length + 1)]);
  }, []);

  const updateMusic = useCallback((patch: Partial<ChoreographyMusic>) => {
    setMusic((prev) => ({ title: "", artist: "", bpm: 120, ...prev, ...patch }));
  }, []);

  const clearMusic = useCallback(() => setMusic(undefined), []);

  const save = useCallback(async () => {
    setStatus("saving");
    try {
      const res = await fetch(`/api/choreography/${initial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, moves, music: music ?? null, description }),
      });
      if (!res.ok) throw new Error("save failed");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  }, [initial.id, name, moves, music, description]);

  return {
    name, setName,
    moves,
    music, updateMusic, clearMusic,
    description, setDescription,
    status,
    updateMove, moveUp, moveDown, deleteMove, addMove,
    save,
  };
}
