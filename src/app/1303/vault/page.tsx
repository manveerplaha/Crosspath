"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  bytesToBase64,
  decryptBytes,
  decryptNotes,
  encryptBytes,
  encryptNotes,
  type EncryptedPayload,
} from "@/lib/vaultCrypto";

type LockState = "locked" | "unlocking" | "unlocked";

interface MediaEntry {
  id: string;
  url: string;
  salt: string;
  iv: string;
  contentType: string;
  createdAt: number;
}

export default function VaultPage() {
  const [lockState, setLockState] = useState<LockState>("locked");
  const [passphrase, setPassphrase] = useState("");
  const [room, setRoom] = useState<1 | 2 | 3 | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!passphrase) return;
    setLockState("unlocking");
    try {
      const res = await fetch("/api/vault/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      if (!res.ok) {
        setError("Incorrect passphrase.");
        setLockState("locked");
        return;
      }
      const json = await res.json();
      setRoom(json.room);
      setLockState("unlocked");
    } catch {
      setError("Couldn't reach the vault. Check your connection and try again.");
      setLockState("locked");
    }
  }

  function handleLock() {
    setPassphrase("");
    setRoom(null);
    setError(null);
    setLockState("locked");
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-[#070a14] px-5 py-6 text-mist sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(76,243,214,0.12),transparent_46%),linear-gradient(rgba(124,135,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(124,135,184,0.05)_1px,transparent_1px)] [background-size:auto,32px_32px,32px_32px]" />

      <section className="relative mx-auto flex min-h-[calc(100dvh-3rem)] max-w-3xl flex-col justify-center rounded-[2rem] border border-duskLight/80 bg-void/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-10">
        <p className="font-display text-[9px] tracking-[0.28em] text-neon">PRIVATE FREQUENCY</p>
        <h1 className="mt-3 font-display text-2xl leading-relaxed text-mist sm:text-3xl">THE VAULT</h1>

        {lockState !== "unlocked" && (
          <form onSubmit={handleUnlock} className="mt-8 flex flex-col gap-4">
            <p className="font-body text-sm leading-relaxed text-mistDim">Enter your passphrase.</p>
            <input
              type="password"
              autoFocus
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Passphrase"
              className="rounded-xl border border-duskLight bg-dusk/50 px-4 py-3 font-body text-mist outline-none transition focus:border-neon"
            />
            {error && <p className="font-body text-sm text-magenta">{error}</p>}
            <button
              type="submit"
              disabled={lockState === "unlocking" || !passphrase}
              className="rounded-full border border-neon bg-neon/10 px-6 py-3 font-display text-xs text-neon shadow-neon transition hover:bg-neon/20 disabled:opacity-40"
            >
              UNLOCK
            </button>
          </form>
        )}

        {lockState === "unlocked" && room === 1 && (
          <NotesRoom apiPath="/api/vault" passphrase={passphrase} onLock={handleLock} />
        )}
        {lockState === "unlocked" && room === 3 && (
          <NotesRoom apiPath="/api/vault/room3" passphrase={passphrase} onLock={handleLock} />
        )}
        {lockState === "unlocked" && room === 2 && <MediaRoom passphrase={passphrase} onLock={handleLock} />}
      </section>
    </main>
  );
}

function NotesRoom({ apiPath, passphrase, onLock }: { apiPath: string; passphrase: string; onLock: () => void }) {
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiPath);
        const json = await res.json();
        const payload: EncryptedPayload | null = json?.data ?? null;
        if (payload) {
          const decrypted = await decryptNotes(passphrase, payload);
          if (!cancelled) setNotes(decrypted);
        }
      } catch {
        if (!cancelled) setError("Couldn't load notes.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath]);

  async function handleSave() {
    setBusy(true);
    setStatus(null);
    setError(null);
    try {
      const payload = await encryptNotes(passphrase, notes);
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
      setStatus("Saved.");
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setError("Couldn't save — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={14}
        placeholder="Your private notes…"
        className="w-full resize-none rounded-xl border border-duskLight bg-dusk/50 px-4 py-3 font-body text-sm leading-relaxed text-mist outline-none transition focus:border-neon"
      />
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onLock}
          className="rounded-full border border-duskLight px-5 py-2.5 font-display text-xs text-mistDim transition hover:border-mist hover:text-mist"
        >
          LOCK
        </button>
        <div className="flex items-center gap-3">
          {status && <span className="font-body text-xs text-neon">{status}</span>}
          {error && <span className="font-body text-xs text-magenta">{error}</span>}
          <button
            onClick={handleSave}
            disabled={busy}
            className="rounded-full border border-neon bg-neon/10 px-6 py-2.5 font-display text-xs text-neon shadow-neon transition hover:bg-neon/20 disabled:opacity-40"
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaRoom({ passphrase, onLock }: { passphrase: string; onLock: () => void }) {
  const [items, setItems] = useState<(MediaEntry & { objectUrl?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vault/media");
      const json = await res.json();
      const manifest: MediaEntry[] = json?.items ?? [];
      const decrypted = await Promise.all(
        manifest.map(async (entry) => {
          try {
            const fileRes = await fetch(`/api/vault/media?id=${encodeURIComponent(entry.id)}`);
            if (!fileRes.ok) throw new Error("Failed to load media");
            const cipherBuf = await fileRes.arrayBuffer();
            const plainBuf = await decryptBytes(passphrase, entry.salt, entry.iv, cipherBuf);
            const blob = new Blob([plainBuf], { type: entry.contentType });
            return { ...entry, objectUrl: URL.createObjectURL(blob) };
          } catch {
            return { ...entry };
          }
        })
      );
      setItems(decrypted);
    } catch {
      setError("Couldn't load media.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const buf = await file.arrayBuffer();
        const { salt, iv, ciphertext } = await encryptBytes(passphrase, buf);
        const ciphertextBase64 = bytesToBase64(new Uint8Array(ciphertext));
        const res = await fetch("/api/vault/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salt,
            iv,
            ciphertextBase64,
            contentType: file.type || "application/octet-stream",
          }),
        });
        if (!res.ok) throw new Error("upload failed");
      }
      await loadItems();
    } catch {
      setError("Upload failed — check your connection and try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch("/api/vault/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setError("Couldn't delete — try again.");
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onLock}
          className="rounded-full border border-duskLight px-5 py-2.5 font-display text-xs text-mistDim transition hover:border-mist hover:text-mist"
        >
          LOCK
        </button>
        <label className="cursor-pointer rounded-full border border-neon bg-neon/10 px-6 py-2.5 font-display text-xs text-neon shadow-neon transition hover:bg-neon/20">
          {uploading ? "UPLOADING…" : "ADD MEDIA"}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="font-body text-sm text-magenta">{error}</p>}
      {loading && <p className="font-body text-sm text-mistDim">Loading…</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-xl border border-duskLight bg-dusk/40">
            {item.objectUrl ? (
              item.contentType.startsWith("video") ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={item.objectUrl} controls className="h-32 w-full object-cover sm:h-40" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.objectUrl} alt="" className="h-32 w-full object-cover sm:h-40" />
              )
            ) : (
              <div className="flex h-32 items-center justify-center text-xs text-magenta sm:h-40">
                Failed to decrypt
              </div>
            )}
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute right-2 top-2 rounded-full border border-duskLight bg-void/80 px-2 py-1 text-[10px] text-mistDim opacity-0 transition group-hover:opacity-100 hover:border-mist hover:text-mist"
            >
              DELETE
            </button>
          </div>
        ))}
      </div>
      {!loading && items.length === 0 && <p className="font-body text-sm text-mistDim">No media yet.</p>}
    </div>
  );
}
