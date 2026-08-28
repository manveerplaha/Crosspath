import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

const MANIFEST_KEY = "vault:1303:media-manifest";

interface MediaEntry {
  id: string;
  url: string;
  salt: string;
  iv: string;
  contentType: string;
  createdAt: number;
}

export async function GET() {
  const manifest = (await kv.get<MediaEntry[]>(MANIFEST_KEY)) ?? [];
  return NextResponse.json({ items: manifest });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.salt || !body?.iv || !body?.ciphertextBase64 || !body?.contentType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const bytes = Buffer.from(String(body.ciphertextBase64), "base64");
  const id = randomUUID();

  // Uploaded with public access, but the object name is an unguessable
  // UUID and the bytes themselves are AES-GCM ciphertext — the file is
  // useless without the passphrase that encrypted it, same trust model as
  // the notes rooms.
  const blob = await put(`vault-media/${id}`, bytes, {
    access: "public",
    contentType: "application/octet-stream",
  });

  const manifest = (await kv.get<MediaEntry[]>(MANIFEST_KEY)) ?? [];
  const entry: MediaEntry = {
    id,
    url: blob.url,
    salt: String(body.salt),
    iv: String(body.iv),
    contentType: String(body.contentType),
    createdAt: Date.now(),
  };
  manifest.push(entry);
  await kv.set(MANIFEST_KEY, manifest);

  return NextResponse.json({ ok: true, item: entry });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const manifest = (await kv.get<MediaEntry[]>(MANIFEST_KEY)) ?? [];
  const next = manifest.filter((m) => m.id !== id);
  await kv.set(MANIFEST_KEY, next);
  return NextResponse.json({ ok: true });
}
