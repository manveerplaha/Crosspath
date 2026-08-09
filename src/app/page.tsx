"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import LoadingScreen from "@/components/LoadingScreen";
import DistrictModal from "@/components/DistrictModal";
import { DISTRICTS } from "@/data/districts";

// GameRoot (and everything it pulls in, including Phaser) is only ever
// mounted client-side. See the comment at the top of GameRoot.tsx for why
// this boundary matters.
const GameRoot = dynamic(() => import("@/components/GameRoot"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto flex aspect-[9/9] w-full max-w-[576px] items-center justify-center rounded-2xl border border-duskLight text-xs text-mistDim">
      Loading the crossing…
    </div>
  ),
});

export default function Home() {
  const phase = useGameStore((s) => s.phase);
  const resetRun = useGameStore((s) => s.resetRun);
  const setPhase = useGameStore((s) => s.setPhase);
  const showGame = phase === "playing" || phase === "district" || phase === "complete";

  return (
    <main className="relative min-h-dvh overflow-hidden bg-void">
      <LoadingScreen />

      {showGame && (
        <div className="relative mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-start pt-6 px-3 pb-6 sm:justify-center sm:pt-6">
          <GameRoot />
        </div>
      )}

      <DistrictModal />

      {phase === "complete" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-void/95 px-6 text-center"
        >
          <p className="font-display text-[10px] tracking-[0.3em] text-neon">JOURNEY COMPLETED</p>
          <h2 className="font-display text-2xl text-mist sm:text-3xl">All {DISTRICTS.length} districts unlocked</h2>
          <p className="max-w-md font-body text-sm text-mistDim">
            That&apos;s the whole journey, one intersection at a time. Thanks for crossing.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setPhase("playing")}
              className="rounded-full border border-neon bg-neon/10 px-8 py-2.5 font-display text-xs text-neon shadow-neon transition hover:bg-neon/20"
            >
              CONTINUE
            </button>
            <button
              onClick={resetRun}
              className="rounded-full border border-duskLight px-8 py-2.5 font-display text-xs text-mistDim transition hover:border-mist hover:text-mist"
            >
              RUN IT BACK
            </button>
          </div>
        </motion.div>
      )}
    </main>
  );
}
