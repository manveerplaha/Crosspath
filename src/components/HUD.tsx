"use client";

import { useGameStore } from "@/store/useGameStore";
import { DISTRICTS } from "@/data/districts";

export default function HUD() {
  const score = useGameStore((s) => s.score);
  const coins = useGameStore((s) => s.coins);
  const unlocked = useGameStore((s) => s.unlockedDistricts);
  const muted = useGameStore((s) => s.muted);
  const toggleMuted = useGameStore((s) => s.toggleMuted);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-3 sm:p-5">
      <div className="pointer-events-auto flex items-center gap-3 font-display text-[10px] text-mist sm:text-xs">
        <div className="rounded-lg border border-duskLight bg-dusk/80 px-3 py-2 shadow-neon">
          <span className="text-neon">DIST</span> {score}
        </div>
        <div className="rounded-lg border border-duskLight bg-dusk/80 px-3 py-2 shadow-amber">
          <span className="text-amber">COINS</span> {coins}
        </div>
        <div className="rounded-lg border border-duskLight bg-dusk/80 px-3 py-2">
          <span className="text-magenta">UNLOCKED</span> {unlocked.length}/{DISTRICTS.length}
        </div>
      </div>
      <button
        onClick={toggleMuted}
        className="pointer-events-auto rounded-lg border border-duskLight bg-dusk/80 px-3 py-2 text-mist transition hover:border-neon hover:text-neon"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}
