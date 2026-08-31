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

  const viewingPortfolio = useGameStore((s) => s.viewingPortfolio);
  const setViewingPortfolio = useGameStore(
    (s) => s.setViewingPortfolio
  );

  const showGame =
    phase === "playing" ||
    phase === "district" ||
    phase === "complete";

  return (
    <main className="relative min-h-dvh overflow-hidden bg-void">
      <LoadingScreen />

      {/* ============================================================
          VIEW ALL DISTRICTS / PORTFOLIO
          ============================================================ */}
      {viewingPortfolio && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-void px-4 py-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="font-display text-[10px] tracking-[0.3em] text-neon">
                  CROSSPATH / PORTFOLIO
                </p>

                <h1 className="mt-2 font-display text-2xl text-mist sm:text-3xl">
                  ALL DISTRICTS
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setViewingPortfolio(false)}
                className="rounded-full border border-duskLight px-4 py-2 font-display text-[10px] text-mistDim transition hover:border-neon hover:text-neon"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DISTRICTS.map((district, index) => (
                <button
                  key={district.id}
                  type="button"
                  onClick={() => {
                    /*
                     * IMPORTANT:
                     * Use openDistrictFromPortfolio instead of
                     * openDistrict.
                     *
                     * This sets startRow to the selected district's
                     * actual row, so if someone chooses District 3,
                     * the game starts at District 3 instead of Row 0.
                     */
                    setViewingPortfolio(false);

                    useGameStore
                      .getState()
                      .openDistrictFromPortfolio(district.id);
                  }}
                  className="group rounded-2xl border border-duskLight bg-dusk/50 p-5 text-left transition hover:-translate-y-1 hover:border-neon hover:shadow-neon"
                >
                  <p
                    className={`font-display text-[9px] tracking-[0.2em] ${
                      district.accent === "neon"
                        ? "text-neon"
                        : district.accent === "amber"
                          ? "text-amber"
                          : "text-magenta"
                    }`}
                  >
                    DISTRICT {String(index + 1).padStart(2, "0")}
                  </p>

                  <h2 className="mt-3 font-display text-lg text-mist">
                    {district.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-mistDim">
                    {district.summary}
                  </p>

                  <p className="mt-5 font-display text-[9px] tracking-wider text-mistDim transition group-hover:text-neon">
                    OPEN DISTRICT →
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          GAME
          ============================================================ */}
      {showGame && (
        <div className="relative mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-start px-3 pb-6 pt-[calc(2rem+env(safe-area-inset-top))] sm:justify-center sm:pt-6">
          <GameRoot />
        </div>
      )}

      {/* ============================================================
          DISTRICT MODAL
          ============================================================ */}
      <DistrictModal />

      {/* ============================================================
          JOURNEY COMPLETE
          ============================================================ */}
      {phase === "complete" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-void/95 px-6 text-center"
        >
          <p className="font-display text-[10px] tracking-[0.3em] text-neon">
            JOURNEY COMPLETED
          </p>

          <h2 className="font-display text-2xl text-mist sm:text-3xl">
            All {DISTRICTS.length} districts unlocked
          </h2>

          <p className="max-w-md font-body text-sm text-mistDim">
            That&apos;s the whole journey, one intersection at a time.
            Thanks for crossing.
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