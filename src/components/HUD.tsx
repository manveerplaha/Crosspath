"use client";

import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { DISTRICTS } from "@/data/districts";
import type { Direction } from "@/game/entities/Player";

function pressDPad(dir: Direction) {
  const fn = (window as unknown as { crossPathMove?: (d: Direction) => void }).crossPathMove;
  fn?.(dir);
}

export default function HUD() {
  const score = useGameStore((s) => s.score);
  const coins = useGameStore((s) => s.coins);
  const unlocked = useGameStore((s) => s.unlockedDistricts);
  const muted = useGameStore((s) => s.muted);
  const toggleMuted = useGameStore((s) => s.toggleMuted);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-5">
      <div className="pointer-events-auto flex items-center justify-between font-display text-[10px] text-mist sm:text-xs">
        <div className="flex gap-3">
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
          className="rounded-lg border border-duskLight bg-dusk/80 px-3 py-2 text-mist transition hover:border-neon hover:text-neon"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>

      <div className="pointer-events-auto flex items-end justify-center gap-2 sm:hidden">
        <DPad />
      </div>
    </div>
  );
}

function DPad() {
  const btn =
    "h-12 w-12 rounded-xl border border-duskLight bg-dusk/90 text-mist active:bg-neon/20 active:border-neon flex items-center justify-center text-lg select-none";
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 grid-rows-3 gap-1">
      <div />
      <button className={btn} onClick={() => pressDPad("up")} aria-label="Move up">
        ↑
      </button>
      <div />
      <button className={btn} onClick={() => pressDPad("left")} aria-label="Move left">
        ←
      </button>
      <button className={btn} onClick={() => pressDPad("down")} aria-label="Move down">
        ↓
      </button>
      <button className={btn} onClick={() => pressDPad("right")} aria-label="Move right">
        →
      </button>
    </motion.div>
  );
}
