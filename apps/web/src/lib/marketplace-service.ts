import type { ChoreographyMove, ChoreographyMusic } from "../types/choreography";
import { supabase } from "./supabase";

export type PackStatus = "draft" | "published" | "removed";

export type Pack = {
  id: string;
  userId: string;
  title: string;
  description: string;
  style: string;
  difficulty: string;
  duration: number;
  targetAudience: string;
  priceCents: number;
  status: PackStatus;
  coverColor: string;
  moves: ChoreographyMove[];
  music?: ChoreographyMusic;
  previewMoves: ChoreographyMove[];
  ratingCount: number;
  ratingSum: number;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
  // joined
  creatorName?: string;
  creatorAvatarUrl?: string;
};

export type PackRating = {
  id: string;
  userId: string;
  packId: string;
  rating: number;
  review?: string;
  createdAt: string;
  reviewerName?: string;
};

type PackRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  style: string;
  difficulty: string;
  duration: number;
  target_audience: string;
  price_cents: number;
  status: string;
  cover_color: string;
  moves: ChoreographyMove[];
  music: ChoreographyMusic | null;
  preview_moves: ChoreographyMove[];
  rating_count: number;
  rating_sum: number;
  purchase_count: number;
  created_at: string;
  updated_at: string;
  users?: { name: string; avatar_url: string | null } | null;
};

function rowToPack(row: PackRow): Pack {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    style: row.style,
    difficulty: row.difficulty,
    duration: row.duration,
    targetAudience: row.target_audience,
    priceCents: row.price_cents,
    status: row.status as PackStatus,
    coverColor: row.cover_color,
    moves: row.moves ?? [],
    music: row.music ?? undefined,
    previewMoves: row.preview_moves ?? [],
    ratingCount: row.rating_count,
    ratingSum: row.rating_sum,
    purchaseCount: row.purchase_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    creatorName: row.users?.name,
    creatorAvatarUrl: row.users?.avatar_url ?? undefined,
  };
}

export type ListPacksFilter = {
  style?: string;
  difficulty?: string;
  maxPriceCents?: number;
  minPriceCents?: number;
  sort?: "newest" | "bestseller" | "top_rated";
  search?: string;
};

export async function listPacks(filter: ListPacksFilter = {}): Promise<Pack[]> {
  let query = supabase
    .from("packs")
    .select("*, users(name, avatar_url)")
    .eq("status", "published");

  if (filter.style) query = query.eq("style", filter.style);
  if (filter.difficulty) query = query.eq("difficulty", filter.difficulty);
  if (filter.maxPriceCents !== undefined) query = query.lte("price_cents", filter.maxPriceCents);
  if (filter.minPriceCents !== undefined) query = query.gte("price_cents", filter.minPriceCents);

  if (filter.sort === "bestseller") {
    query = query.order("purchase_count", { ascending: false });
  } else if (filter.sort === "top_rated") {
    query = query.order("rating_sum", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as PackRow[]).map(rowToPack);
}

export async function getPackById(id: string, viewerUserId?: string): Promise<Pack | null> {
  const { data, error } = await supabase
    .from("packs")
    .select("*, users(name, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  const pack = rowToPack(data as PackRow);

  // Hide full moves unless: own pack, free pack, or purchased
  const isFree = pack.priceCents === 0;
  const isOwn = viewerUserId === pack.userId;
  if (!isFree && !isOwn && viewerUserId) {
    const { data: purchase } = await supabase
      .from("pack_purchases")
      .select("id")
      .eq("pack_id", id)
      .eq("user_id", viewerUserId)
      .maybeSingle();
    if (!purchase) {
      pack.moves = []; // hide full moves
    }
  } else if (!isFree && !isOwn && !viewerUserId) {
    pack.moves = [];
  }

  return pack;
}

export type CreatePackInput = {
  userId: string;
  title: string;
  description: string;
  style: string;
  difficulty: string;
  duration: number;
  targetAudience: string;
  priceCents: number;
  coverColor: string;
  moves: ChoreographyMove[];
  music?: ChoreographyMusic;
  previewMoves: ChoreographyMove[];
};

export async function createPack(input: CreatePackInput): Promise<Pack> {
  const { data, error } = await supabase
    .from("packs")
    .insert({
      user_id: input.userId,
      title: input.title,
      description: input.description,
      style: input.style,
      difficulty: input.difficulty,
      duration: input.duration,
      target_audience: input.targetAudience,
      price_cents: input.priceCents,
      cover_color: input.coverColor,
      moves: input.moves,
      music: input.music ?? null,
      preview_moves: input.previewMoves,
      status: "published",
    })
    .select("*, users(name, avatar_url)")
    .single();

  if (error) throw new Error(error.message);
  return rowToPack(data as PackRow);
}

export async function getMyPacks(userId: string): Promise<Pack[]> {
  const { data, error } = await supabase
    .from("packs")
    .select("*, users(name, avatar_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as PackRow[]).map(rowToPack);
}

export async function getMyPurchasedPacks(userId: string): Promise<Pack[]> {
  const { data: purchases, error: purchErr } = await supabase
    .from("pack_purchases")
    .select("pack_id")
    .eq("user_id", userId);

  if (purchErr || !purchases || purchases.length === 0) return [];

  const ids = (purchases as { pack_id: string }[]).map((r) => r.pack_id);
  const { data, error } = await supabase
    .from("packs")
    .select("*, users(name, avatar_url)")
    .in("id", ids)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as PackRow[]).map(rowToPack);
}

export async function getMyPurchasedPackIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("pack_purchases")
    .select("pack_id")
    .eq("user_id", userId);

  if (error) return [];
  return (data as { pack_id: string }[]).map((r) => r.pack_id);
}

export async function purchaseFreePack(userId: string, packId: string): Promise<void> {
  await supabase.from("pack_purchases").upsert(
    { user_id: userId, pack_id: packId, amount_cents: 0 },
    { onConflict: "user_id,pack_id" },
  );
  await supabase.rpc("increment_pack_purchases", { row_id: packId });
}

export async function ratepack(
  userId: string,
  packId: string,
  rating: number,
  review?: string,
): Promise<void> {
  await supabase.from("pack_ratings").upsert(
    { user_id: userId, pack_id: packId, rating, review: review ?? null },
    { onConflict: "user_id,pack_id" },
  );

  // Recalculate rating_count and rating_sum from the full ratings set
  const { data: allRatings } = await supabase
    .from("pack_ratings")
    .select("rating")
    .eq("pack_id", packId);

  if (allRatings) {
    const count = allRatings.length;
    const sum = (allRatings as { rating: number }[]).reduce((s, r) => s + r.rating, 0);
    await supabase.from("packs").update({ rating_count: count, rating_sum: sum }).eq("id", packId);
  }
}

export async function getPackRatings(packId: string): Promise<PackRating[]> {
  const { data, error } = await supabase
    .from("pack_ratings")
    .select("*, users(name)")
    .eq("pack_id", packId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return (data as (PackRating & { users?: { name: string } })[]).map((r) => ({
    ...r,
    reviewerName: r.users?.name,
  }));
}

export type CreatorProfile = {
  userId: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  modalities: string[];
  packs: Pack[];
  totalSales: number;
  avgRating: number;
};

export async function getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
  const { data: user } = await supabase
    .from("users")
    .select("name, avatar_url, creator_bio, creator_modalities")
    .eq("id", userId)
    .single();

  if (!user) return null;

  const packs = await getMyPacks(userId);
  const publishedPacks = packs.filter((p) => p.status === "published");
  const totalSales = publishedPacks.reduce((s, p) => s + p.purchaseCount, 0);
  const totalRatingSum = publishedPacks.reduce((s, p) => s + p.ratingSum, 0);
  const totalRatingCount = publishedPacks.reduce((s, p) => s + p.ratingCount, 0);

  return {
    userId,
    name: (user as { name: string }).name,
    avatarUrl: (user as { avatar_url?: string | null }).avatar_url ?? undefined,
    bio: (user as { creator_bio?: string | null }).creator_bio ?? undefined,
    modalities: (user as { creator_modalities?: string[] }).creator_modalities ?? [],
    packs: publishedPacks,
    totalSales,
    avgRating: totalRatingCount > 0 ? totalRatingSum / totalRatingCount : 0,
  };
}

export async function getCreatorEarnings(userId: string): Promise<{
  totalCents: number;
  recentSales: { packTitle: string; priceCents: number; createdAt: string }[];
}> {
  const { data } = await supabase
    .from("pack_purchases")
    .select("amount_cents, created_at, packs(title)")
    .eq("packs.user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!data) return { totalCents: 0, recentSales: [] };

  type SaleRow = { amount_cents: number; created_at: string; packs: { title: string }[] | null };
  const rows = data as unknown as SaleRow[];
  const total = rows.reduce((s, r) => s + r.amount_cents, 0);
  return {
    totalCents: total,
    recentSales: rows.slice(0, 5).map((r) => ({
      packTitle: r.packs?.[0]?.title ?? "Unknown",
      priceCents: r.amount_cents,
      createdAt: r.created_at,
    })),
  };
}
