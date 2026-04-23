import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { supabase } from "../../../../lib/supabase";

const BUCKET = "avatars";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const path = `${userId}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

  // Add cache-busting timestamp so browsers reload the image after re-upload
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  await supabase.from("users").update({ avatar_url: avatarUrl }).eq("id", userId);

  return NextResponse.json({ avatarUrl });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  await supabase.storage.from(BUCKET).remove([`${userId}`]);
  await supabase.from("users").update({ avatar_url: null }).eq("id", userId);

  return NextResponse.json({ ok: true });
}
