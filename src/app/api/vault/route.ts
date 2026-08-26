import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

// Single personal vault — one fixed key. The value stored here is already
// fully encrypted client-side before it ever reaches this route, so this
// endpoint being reachable by URL doesn't expose the notes themselves.
const VAULT_KEY = "vault:1303:data";

export async function GET() {
  const data = await kv.get(VAULT_KEY);
  return NextResponse.json({ data: data ?? null });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.salt || !body?.iv || !body?.ciphertext) {
    return NextResponse.json({ error: "Missing salt, iv, or ciphertext" }, { status: 400 });
  }
  await kv.set(VAULT_KEY, {
    salt: String(body.salt),
    iv: String(body.iv),
    ciphertext: String(body.ciphertext),
  });
  return NextResponse.json({ ok: true });
}
