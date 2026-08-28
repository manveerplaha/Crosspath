import { NextRequest, NextResponse } from "next/server";
import { get, put } from "@vercel/blob";

const VAULT_PATH = "vault-data/notes-room-1.json";

export async function GET() {
  const blob = await get(VAULT_PATH, { access: "public" });

  if (!blob) {
    return NextResponse.json({ data: null });
  }

  const data = await new Response(blob.stream).json();

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body?.salt || !body?.iv || !body?.ciphertext) {
    return NextResponse.json(
      { error: "Missing salt, iv, or ciphertext" },
      { status: 400 }
    );
  }

  await put(
    VAULT_PATH,
    JSON.stringify({
      salt: String(body.salt),
      iv: String(body.iv),
      ciphertext: String(body.ciphertext),
    }),
    {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  );

  return NextResponse.json({ ok: true });
}
