import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { supabase } from "../../../../lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: me } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", session.user.id)
    .single();

  if (!(me as { is_admin?: boolean } | null)?.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [usersRes, logsRes, choreosRes] = await Promise.all([
    supabase
      .from("users")
      .select("id, email, name, plan, created_at, last_sign_in_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("payment_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("choreographies")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  const users = (usersRes.data ?? []) as {
    id: string; email: string; name: string; plan: string; created_at: string; last_sign_in_at: string | null;
  }[];

  const planCounts = users.reduce<Record<string, number>>((acc, u) => {
    const p = u.plan ?? "free";
    acc[p] = (acc[p] ?? 0) + 1;
    return acc;
  }, {});

  const PLAN_PRICES: Record<string, number> = { free: 0, pro: 12, max: 29 };
  const mrr = Object.entries(planCounts).reduce((sum, [plan, count]) => {
    return sum + (PLAN_PRICES[plan] ?? 0) * count;
  }, 0);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const newThisWeek = users.filter((u) => u.created_at >= sevenDaysAgo).length;

  const totalChoreos = choreosRes.data?.length ?? 0;
  const choreosThisWeek = (choreosRes.data ?? []).filter((c: { created_at: string }) => c.created_at >= sevenDaysAgo).length;

  return NextResponse.json({
    summary: {
      totalUsers: users.length,
      planCounts,
      mrr,
      newThisWeek,
      totalChoreos,
      choreosThisWeek,
    },
    recentUsers: users.slice(0, 20),
    paymentLogs: logsRes.data ?? [],
  });
}
