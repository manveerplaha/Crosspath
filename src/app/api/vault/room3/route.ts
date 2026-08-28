import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const ROOM3_KEY = "vault:1303:room3";

export async function GET() {
  const data = await kv.get(ROOM3_KEY);
  return NextResponse.json({ data: data ?? null });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.salt || !body?.iv || !body?.ciphertext) {
    return NextResponse.json({ error: "Missing salt, iv, or ciphertext" }, { status: 400 });
  }
  await kv.set(ROOM3_KEY, {
    salt: String(body.salt),
    iv: String(body.iv),
    ciphertext: String(body.ciphertext),
  });
  return NextResponse.json({ ok: true });
}
