import { notFound } from "next/navigation";
import { auth } from "../../../auth";
import { supabase } from "../../../lib/supabase";
import type { Plan } from "../../../constants/plans";
import { getMyPacks, getCreatorEarnings } from "../../../lib/marketplace-service";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();
  const userId = session.user.id;

  const [{ data }, myPacks, earnings] = await Promise.all([
    supabase
      .from("users")
      .select("name, email, plan, avatar_url, marketplace_enabled, creator_bio, creator_modalities")
      .eq("id", userId)
      .single(),
    getMyPacks(userId),
    getCreatorEarnings(userId),
  ]);

  const row = data as {
    name?: string;
    email?: string;
    plan?: string;
    avatar_url?: string | null;
    marketplace_enabled?: boolean;
    creator_bio?: string | null;
    creator_modalities?: string[] | null;
  } | null;

  const hasPublishedPacks = myPacks.some((p) => p.status === "published");

  return (
    <SettingsClient
      name={row?.name ?? session.user.name ?? ""}
      email={row?.email ?? session.user.email ?? ""}
      plan={(row?.plan ?? "free") as Plan}
      avatarUrl={row?.avatar_url ?? undefined}
      marketplaceEnabled={row?.marketplace_enabled ?? false}
      creatorBio={row?.creator_bio ?? ""}
      creatorModalities={row?.creator_modalities ?? []}
      hasPublishedPacks={hasPublishedPacks}
      totalEarningsCents={earnings.totalCents}
      recentSales={earnings.recentSales}
    />
  );
}
