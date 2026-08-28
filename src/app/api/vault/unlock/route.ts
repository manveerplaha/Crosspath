import { NextRequest, NextResponse } from "next/server";

/**
 * This is the one place the typed passphrase reaches the server as
 * plaintext — necessary to determine which room it unlocks. It is never
 * logged or stored; it's compared in memory against the three secrets set
 * in Vercel's environment variables (VAULT_ROOM_1/2/3_PASSPHRASE) and then
 * discarded. The content of every room stays encrypted client-side using
 * that same passphrase, independent of this check.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const passphrase = body?.passphrase;
  if (!passphrase || typeof passphrase !== "string") {
    return NextResponse.json({ error: "Missing passphrase" }, { status: 400 });
  }

  if (passphrase === process.env.VAULT_ROOM_1_PASSPHRASE) {
    return NextResponse.json({ room: 1 });
  }
  if (passphrase === process.env.VAULT_ROOM_2_PASSPHRASE) {
    return NextResponse.json({ room: 2 });
  }
  if (passphrase === process.env.VAULT_ROOM_3_PASSPHRASE) {
    return NextResponse.json({ room: 3 });
  }

  return NextResponse.json({ error: "Incorrect passphrase." }, { status: 401 });
}
