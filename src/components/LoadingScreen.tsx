"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGameStore } from "@/store/useGameStore";

const BOOT_LINES = [
  "INITIALIZING CROSSWALK GRID…",
  "CALIBRATING TRAFFIC AI…",
  "LOADING DISTRICT MANIFEST (9)…",
  "SYNCING AMBIENT AUDIO…",
  "READY.",
];

const TITLE_TEXT = "I am Manveer";

export default function LoadingScreen() {
  const phase = useGameStore((s) => s.phase);
  const setPhase = useGameStore((s) => s.setPhase);
  const [progress, setProgress] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const [typedTitle, setTypedTitle] = useState("");
  const barRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== "loading") return;
    const tl = gsap.timeline({
      onUpdate: () => setProgress(Math.round(tl.progress() * 100)),
      onComplete: () => setPhase("menu"),
    });
    tl.to({}, { duration: 0.35 })
      .call(() => setLineIdx(1))
      .to({}, { duration: 0.35 })
      .call(() => setLineIdx(2))
      .to({}, { duration: 0.4 })
      .call(() => setLineIdx(3))
      .to({}, { duration: 0.3 })
      .call(() => setLineIdx(4))
      .to({}, { duration: 0.3 });

    if (barRef.current) {
      gsap.fromTo(barRef.current, { scaleX: 0 }, { scaleX: 1, duration: 2, ease: "power2.inOut", transformOrigin: "left" });
    }
    return () => {
      tl.kill();
    };
  }, [phase, setPhase]);

  useEffect(() => {
    if (phase !== "menu") return;
    setTypedTitle("");
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTypedTitle(TITLE_TEXT.slice(0, i));
      if (i >= TITLE_TEXT.length) clearInterval(interval);
    }, 85);
    return () => clearInterval(interval);
  }, [phase]);

  if (phase !== "loading" && phase !== "menu") return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-void">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_0,transparent_38px,rgba(76,243,214,0.04)_39px)] bg-[length:100%_40px] animate-scan" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(76,243,214,0.12),transparent_60%)]" />

      <AnimatePresence mode="wait">
        {phase === "loading" && (
          <motion.div
            key="loading"
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex w-[min(90vw,420px)] flex-col items-center gap-6 text-center"
          >
            <div className="space-y-1">
              <p className="font-display text-xs tracking-[0.3em] text-neon">HELLO</p>
              <p className="font-display text-xs tracking-[0.3em] text-neon">I AM MANVEER</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full border border-duskLight bg-dusk">
              <div ref={barRef} className="h-full w-full bg-gradient-to-r from-neon via-amber to-magenta" />
            </div>
            <p className="font-body text-[11px] text-mistDim">{progress}%</p>
            <p className="h-4 font-mono text-[11px] text-mistDim">{BOOT_LINES[lineIdx]}</p>
          </motion.div>
        )}

        {phase === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center gap-8 px-6 text-center"
          >
            <div ref={titleRef}>
              <h1 className="font-display text-2xl leading-relaxed text-mist sm:text-4xl">
                {typedTitle}
                <span className="ml-1 inline-block h-[1em] w-[3px] translate-y-1 animate-pulse bg-neon align-middle" />
              </h1>
              <p className="mx-auto mt-4 max-w-md font-body text-sm text-mistDim sm:text-base">
                An interactive portfolio — cross nine districts to explore the work.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPhase("playing")}
              className="rounded-full border border-neon bg-neon/10 px-10 py-3 font-display text-sm text-neon shadow-neon transition hover:bg-neon/20"
            >
              PLAY
            </motion.button>

            <p className="font-body text-[11px] text-mistDim">
              Arrows / WASD to move &middot; swipe or D-pad on mobile
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
