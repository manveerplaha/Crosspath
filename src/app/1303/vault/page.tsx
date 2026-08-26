"use client";

import { useEffect, useState, type FormEvent } from "react";
import { decryptNotes, encryptNotes, type EncryptedPayload } from "@/lib/vaultCrypto";

type ViewState = "checking" | "locked" | "unlocked";

export default function VaultPage() {
  const [view, setView] = useState<ViewState>("checking");
  const [existingPayload, setExistingPayload] = useState<EncryptedPayload | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/vault")
      .then((r) => r.json())
      .then((json) => {
        setExistingPayload(json?.data ?? null);
        setView("locked");
      })
      .catch(() => {
        setError("Couldn't reach the vault storage. Check your connection and reload.");
        setView("locked");
      });
  }, []);

  async function handleUnlock(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!passphrase) return;
    setBusy(true);
    try {
      if (!existingPayload) {
        // First time setting up the vault — any passphrase entered now
        // becomes the one that matters going forward.
        setNotes("");
        setView("unlocked");
      } else {
        const decrypted = await decryptNotes(passphrase, existingPayload);
        setNotes(decrypted);
        setView("unlocked");
      }
    } catch {
      setError("Incorrect passphrase.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    setBusy(true);
    setStatus(null);
    setError(null);
    try {
      const payload = await encryptNotes(passphrase, notes);
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("save failed");
      setExistingPayload(payload);
      setStatus("Saved.");
      setTimeout(() => setStatus(null), 2000);
    } catch {
      setError("Couldn't save — check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleLock() {
    setPassphrase("");
    setNotes("");
    setView("locked");
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-[#070a14] px-5 py-6 text-mist sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(76,243,214,0.12),transparent_46%),linear-gradient(rgba(124,135,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(124,135,184,0.05)_1px,transparent_1px)] [background-size:auto,32px_32px,32px_32px]" />

      <section className="relative mx-auto flex min-h-[calc(100dvh-3rem)] max-w-2xl flex-col justify-center rounded-[2rem] border border-duskLight/80 bg-void/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-10">
        <p className="font-display text-[9px] tracking-[0.28em] text-neon">PRIVATE FREQUENCY</p>
        <h1 className="mt-3 font-display text-2xl leading-relaxed text-mist sm:text-3xl">THE VAULT</h1>

        {view === "checking" && <p className="mt-8 font-body text-sm text-mistDim">Connecting…</p>}

        {view === "locked" && (
          <form onSubmit={handleUnlock} className="mt-8 flex flex-col gap-4">
            <p className="font-body text-sm leading-relaxed text-mistDim">
              {existingPayload
                ? "Enter your passphrase to unlock your notes."
                : "No vault yet — the passphrase you set now is the one that matters from here on. There's no recovery if it's forgotten, by design."}
            </p>
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
              disabled={busy || !passphrase}
              className="rounded-full border border-neon bg-neon/10 px-6 py-3 font-display text-xs text-neon shadow-neon transition hover:bg-neon/20 disabled:opacity-40"
            >
              {existingPayload ? "UNLOCK" : "CREATE VAULT"}
            </button>
          </form>
        )}

        {view === "unlocked" && (
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
                onClick={handleLock}
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
        )}
      </section>
    </main>
  );
}
