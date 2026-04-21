import type { Choreography, ChoreographyMove, ChoreographyMusic } from "../types/choreography";
import { supabase } from "./supabase";

type ChoreographyRow = {
  id: string;
  user_id: string;
  name: string;
  style: string;
  duration: number;
  difficulty: string;
  target_audience: string;
  description: string | null;
  moves: ChoreographyMove[];
  music: ChoreographyMusic | null;
  created_at: string;
  updated_at: string;
};

function rowToChoreography(row: ChoreographyRow): Choreography {
  return {
    id: row.id,
    name: row.name,
    style: row.style as Choreography["style"],
    duration: row.duration as Choreography["duration"],
    difficulty: row.difficulty as Choreography["difficulty"],
    targetAudience: row.target_audience,
    description: row.description ?? "",
    moves: row.moves,
    music: row.music ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type CreateChoreographyInput = Omit<Choreography, "id" | "createdAt" | "updatedAt"> & {
  userId: string;
};

export async function createChoreography(input: CreateChoreographyInput): Promise<Choreography> {
  const { data, error } = await supabase
    .from("choreographies")
    .insert({
      user_id: input.userId,
      name: input.name,
      style: input.style,
      duration: input.duration,
      difficulty: input.difficulty,
      target_audience: input.targetAudience,
      description: input.description ?? null,
      moves: input.moves,
      music: input.music ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToChoreography(data as ChoreographyRow);
}

export async function getChoreographiesByUser(userId: string): Promise<Choreography[]> {
  const { data, error } = await supabase
    .from("choreographies")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as ChoreographyRow[]).map(rowToChoreography);
}

export type UpdateChoreographyInput = {
  name?: string;
  moves?: ChoreographyMove[];
  music?: ChoreographyMusic | null;
  description?: string;
};

export async function updateChoreography(
  id: string,
  userId: string,
  input: UpdateChoreographyInput,
): Promise<Choreography> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) patch.name = input.name;
  if (input.moves !== undefined) patch.moves = input.moves;
  if (input.music !== undefined) patch.music = input.music;
  if (input.description !== undefined) patch.description = input.description;

  const { data, error } = await supabase
    .from("choreographies")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToChoreography(data as ChoreographyRow);
}

export async function getChoreographyById(
  id: string,
  userId: string,
): Promise<Choreography | null> {
  const { data, error } = await supabase
    .from("choreographies")
    .select()
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return rowToChoreography(data as ChoreographyRow);
}
