import { NextRequest, NextResponse } from "next/server";
import { del, get, list, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

interface MediaEntry {
  id: string;
  url: string;
  salt: string;
  iv: string;
  contentType: string;
  createdAt: number;
}

const MEDIA_PREFIX = "vault-media/";

async function getManifest(): Promise<MediaEntry[]> {
  const { blobs } = await list({
    prefix: MEDIA_PREFIX,
    limit: 100,
  });

  const manifestBlobs = blobs.filter((blob) =>
    blob.pathname.endsWith(".json")
  );

  const items: MediaEntry[] = [];

  for (const blob of manifestBlobs) {
    try {
      const result = await get(blob.pathname, {
        access: "private",
      });

      if (!result || result.statusCode !== 200 || !result.stream) {
        continue;
      }

      const text = await new Response(result.stream).text();
      const entry = JSON.parse(text) as MediaEntry;
      items.push(entry);
    } catch {
      // Ignore malformed metadata files.
    }
  }

  return items.sort((a, b) => b.createdAt - a.createdAt);
}

export async function GET() {
  const items = await getManifest();

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (
    !body?.salt ||
    !body?.iv ||
    !body?.ciphertextBase64 ||
    !body?.contentType
  ) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  const id = randomUUID();
  const bytes = Buffer.from(
    String(body.ciphertextBase64),
    "base64"
  );

  const mediaBlob = await put(
    `${MEDIA_PREFIX}${id}.bin`,
    bytes,
    {
      access: "private",
      contentType: "application/octet-stream",
      addRandomSuffix: false,
    }
  );

  const entry: MediaEntry = {
    id,
    url: mediaBlob.url,
    salt: String(body.salt),
    iv: String(body.iv),
    contentType: String(body.contentType),
    createdAt: Date.now(),
  };

  await put(
    `${MEDIA_PREFIX}${id}.json`,
    JSON.stringify(entry),
    {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
    }
  );

  return NextResponse.json({
    ok: true,
    item: entry,
  });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const id = body?.id;

  if (!id || typeof id !== "string") {
    return NextResponse.json(
      { error: "Missing id" },
      { status: 400 }
    );
  }

  await del([
    `${MEDIA_PREFIX}${id}.bin`,
    `${MEDIA_PREFIX}${id}.json`,
  ]);

  return NextResponse.json({ ok: true });
}
