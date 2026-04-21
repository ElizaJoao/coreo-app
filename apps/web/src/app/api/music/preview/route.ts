import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || !url.startsWith("https://audio-ssl.itunes.apple.com/")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const upstream = await fetch(url);
  if (!upstream.ok) {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }

  const body = await upstream.arrayBuffer();
  return new Response(body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "audio/mpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
