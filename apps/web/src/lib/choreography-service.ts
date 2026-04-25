import type { Choreography, ChoreographyMove, ChoreographyMusic, Dancer, MoveFormation } from "../types/choreography";
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
  dancers: Dancer[];
  formations: MoveFormation[];
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  tags: string[];
  plays: number;
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
    dancers: row.dancers ?? [],
    formations: row.formations ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFavorite: row.is_favorite ?? false,
    tags: row.tags ?? [],
    plays: row.plays ?? 0,
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
      dancers: input.dancers ?? [],
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
  dancers?: Dancer[];
  formations?: MoveFormation[];
  tags?: string[];
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
  if (input.dancers !== undefined) patch.dancers = input.dancers;
  if (input.formations !== undefined) patch.formations = input.formations;
  if (input.tags !== undefined) patch.tags = input.tags;

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

export async function toggleFavorite(id: string, userId: string): Promise<boolean> {
  const { data: current } = await supabase
    .from("choreographies")
    .select("is_favorite")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  const next = !(current?.is_favorite ?? false);
  await supabase
    .from("choreographies")
    .update({ is_favorite: next })
    .eq("id", id)
    .eq("user_id", userId);
  return next;
}

export async function incrementPlays(id: string): Promise<void> {
  await supabase.rpc("increment_plays", { row_id: id });
}

export async function getChoreographyPublic(id: string): Promise<Choreography | null> {
  const { data, error } = await supabase
    .from("choreographies")
    .select()
    .eq("id", id)
    .single();

  if (error) return null;
  return rowToChoreography(data as ChoreographyRow);
}
