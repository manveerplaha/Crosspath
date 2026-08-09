"use client";

import { motion } from "framer-motion";
import type { Direction } from "@/game/entities/Player";

function pressDPad(dir: Direction) {
  const fn = (window as unknown as { crossPathMove?: (d: Direction) => void }).crossPathMove;
  fn?.(dir);
}

export default function MobileControls() {
  const btn =
    "h-14 w-14 rounded-xl border border-duskLight bg-dusk/90 text-mist active:bg-neon/20 active:border-neon flex items-center justify-center text-xl select-none";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto grid grid-cols-3 grid-rows-3 justify-center gap-1.5 sm:hidden"
      style={{ justifySelf: "center" }}
    >
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
