"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import { districtById } from "@/data/districts";

const accentText: Record<string, string> = {
  neon: "text-neon",
  amber: "text-amber",
  magenta: "text-magenta",
};
const accentBorder: Record<string, string> = {
  neon: "border-neon shadow-neon",
  amber: "border-amber shadow-amber",
  magenta: "border-magenta",
};

export default function DistrictModal() {
  const activeId = useGameStore((s) => s.activeDistrict);
  const closeDistrict = useGameStore((s) => s.closeDistrict);
  const district = activeId ? districtById(activeId) : null;

  return (
    <AnimatePresence>
      {district && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end justify-center bg-void/80 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDistrict}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={district.title}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className={`relative w-full max-w-lg rounded-t-3xl border-t sm:rounded-3xl sm:border bg-dusk p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:p-8 ${accentBorder[district.accent]}`}
          >
            <button
              onClick={closeDistrict}
              className="absolute right-4 top-4 rounded-full border border-duskLight px-2.5 py-1 text-xs text-mistDim transition hover:border-mist hover:text-mist"
              aria-label="Close"
            >
              ✕
            </button>

            <p className={`font-display text-[10px] tracking-[0.25em] ${accentText[district.accent]}`}>{district.eyebrow}</p>
            <h2 className="mt-2 font-display text-xl text-mist sm:text-2xl">{district.title}</h2>
            <p className="mt-4 font-body text-sm leading-relaxed text-mistDim sm:text-base">{district.summary}</p>

            {district.stats && (
              <div className="mt-5 grid grid-cols-3 gap-2">
                {district.stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-duskLight bg-void/60 p-3 text-center">
                    <p className={`font-display text-sm ${accentText[district.accent]}`}>{s.value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-mistDim">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            <ul className="mt-5 space-y-2.5">
              {district.bullets.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i }}
                  className="flex gap-2.5 font-body text-sm text-mist"
                >
                  <span className={accentText[district.accent]}>▹</span>
                  <span>{b}</span>
                </motion.li>
              ))}
            </ul>

            {district.links && (
              <div className="mt-5 space-y-2">
                {district.links.map((link, i) => {
                  const row = (
                    <>
                      <span className={`font-display text-xs ${accentText[district.accent]}`}>▷ {link.label}</span>
                      <span className="mt-0.5 block font-body text-xs text-mistDim">{link.detail}</span>
                    </>
                  );
                  const rowClass =
                    "block rounded-xl border border-duskLight bg-void/60 px-4 py-3 transition hover:border-mist";
                  return link.href ? (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      download={link.download}
                      target={!link.download && !link.href.startsWith("mailto:") ? "_blank" : undefined}
                      rel={!link.download && !link.href.startsWith("mailto:") ? "noopener noreferrer" : undefined}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 * i }}
                      className={`${rowClass} hover:bg-white/5`}
                    >
                      {row}
                    </motion.a>
                  ) : (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 * i }}
                      className={`${rowClass} opacity-60`}
                    >
                      {row}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {district.cta && (
              
                href={district.cta.href}
                className={`mt-6 inline-block rounded-full border px-6 py-2.5 font-display text-xs transition hover:bg-white/5 ${accentBorder[district.accent]} ${accentText[district.accent]}`}
              >
                {district.cta.label}
              </a>
            )}

            <button
              onClick={closeDistrict}
              className={`mt-6 block w-full rounded-full border py-3 font-display text-xs font-bold tracking-wide transition active:scale-[0.98] sm:hidden ${accentBorder[district.accent]} ${accentText[district.accent]} bg-white/5`}
            >
              ← BACK TO THE CROSSING
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
