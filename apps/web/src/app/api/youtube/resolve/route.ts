import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { supabase } from "../../../../lib/supabase";

const INVIDIOUS_INSTANCES = [
  "https://invidious.io.lol",
  "https://vid.puffyan.us",
  "https://invidious.nerdvpn.de",
  "https://invidious.privacydev.net",
];

async function resolveVideoId(query: string): Promise<string | null> {
  for (const base of INVIDIOUS_INSTANCES) {
    try {
      const url = `${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video&fields=videoId,title&page=1`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) continue;
      const data = await res.json() as Array<{ videoId?: string }>;
      const first = data?.[0]?.videoId;
      if (first) return first;
    } catch {
      // try next instance
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("plan")
    .eq("id", session.user.id)
    .single();

  const plan = (profile as { plan?: string } | null)?.plan ?? "free";
  if (plan === "free") {
    return NextResponse.json({ error: "Pro or Max plan required" }, { status: 403 });
  }

  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ videoId: null });

  const videoId = await resolveVideoId(q);
  return NextResponse.json({ videoId });
}
