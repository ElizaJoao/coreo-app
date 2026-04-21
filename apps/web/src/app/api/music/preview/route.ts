import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || !url.startsWith("https://audio-ssl.itunes.apple.com/")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const range = request.headers.get("range");
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0",
  };
  if (range) headers["Range"] = range;

  const upstream = await fetch(url, { headers });

  const responseHeaders: Record<string, string> = {
    "Content-Type": upstream.headers.get("Content-Type") ?? "audio/mpeg",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
  };
  const contentRange = upstream.headers.get("Content-Range");
  const contentLength = upstream.headers.get("Content-Length");
  if (contentRange) responseHeaders["Content-Range"] = contentRange;
  if (contentLength) responseHeaders["Content-Length"] = contentLength;

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
