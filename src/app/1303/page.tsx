"use client";

import { useState } from "react";

type Signal = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  copy: string;
  position: string;
  color: "neon" | "amber" | "magenta";
};

const signals: Signal[] = [
  {
    id: "now",
    label: "01",
    eyebrow: "NOW",
    title: "Make the next thing real.",
    copy: "A reminder to stay close to the work: build, learn, try again, and leave room for surprise.",
    position: "left-[13%] top-[24%]",
    color: "neon",
  },
  {
    id: "archive",
    label: "02",
    eyebrow: "ARCHIVE",
    title: "Keep the small evidence.",
    copy: "The first draft, the strange sketch, the note that made sense later. None of it is wasted.",
    position: "left-[35%] top-[13%]",
    color: "amber",
  },
  {
    id: "signals",
    label: "03",
    eyebrow: "SIGNALS",
    title: "Follow what keeps returning.",
    copy: "Ideas worth carrying tend to come back. Notice them. Give them somewhere to grow.",
    position: "right-[22%] top-[29%]",
    color: "magenta",
  },
  {
    id: "future",
    label: "04",
    eyebrow: "FUTURE",
    title: "Keep a horizon.",
    copy: "Not a deadline. A direction - something bright enough to walk toward when the path is unclear.",
    position: "left-[43%] bottom-[14%]",
    color: "neon",
  },
];

const colorClasses = {
  neon: "border-neon bg-neon shadow-neon text-neon",
  amber: "border-amber bg-amber shadow-amber text-amber",
  magenta: "border-magenta bg-magenta shadow-[0_0_12px_rgba(255,92,138,0.55),0_0_40px_rgba(255,92,138,0.2)] text-magenta",
} as const;

const favourites = [
  { label: "FILMS", value: "Interstellar · Iron Man · Spider-Verse · The Dark Knight · Oppenheimer · The Odyssey" },
  { label: "DIRECTOR", value: "Christopher Nolan" },
  { label: "BOOKS", value: "Julius Caesar · The Psychology of Money · Homer’s Odyssey" },
  { label: "ON REPEAT", value: "Stellar Fission · Oppenheimer X · Never Gonna Give You Up · traditional songs" },
  { label: "THE COLOUR", value: "Blue, always finding its way in." },
  { label: "COMFORT", value: "Whatever is made at home." },
  { label: "NEXT HORIZON", value: "A big trek through the mountains of Switzerland." },
  { label: "A PLACE KEPT", value: "Himachal - mountains that already feel familiar." },
  { label: "CURRENT OBSESSION", value: "My guitalele. It is usually in my hands, even while studying." },
] as const;

export default function SignalRoomPage() {
  const [activeId, setActiveId] = useState("now");
  const activeSignal = signals.find((signal) => signal.id === activeId) ?? signals[0]!;

  return (
    <main className="min-h-dvh overflow-hidden bg-[#070a14] px-5 py-6 text-mist sm:px-8 sm:py-8">
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:radial-gradient(circle_at_center,rgba(76,243,214,0.12),transparent_46%),linear-gradient(rgba(124,135,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(124,135,184,0.05)_1px,transparent_1px)] [background-size:auto,32px_32px,32px_32px]" />

      <section className="relative mx-auto flex min-h-[calc(100dvh-3rem)] max-w-6xl flex-col rounded-[2rem] border border-duskLight/80 bg-void/80 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-10">
        <header className="flex items-start justify-between gap-6 border-b border-duskLight/70 pb-6">
          <div>
            <p className="font-display text-[9px] tracking-[0.28em] text-neon">PRIVATE FREQUENCY</p>
            <h1 className="mt-3 font-display text-2xl leading-relaxed text-mist sm:text-3xl">THE SIGNAL ROOM</h1>
          </div>
          <p className="pt-1 font-display text-xs tracking-[0.2em] text-mistDim">13.03</p>
        </header>

        <div className="grid flex-1 gap-8 py-8 lg:grid-cols-[1.5fr_0.8fr] lg:items-center">
          <div className="relative min-h-[430px] overflow-hidden rounded-3xl border border-duskLight bg-[#090e1e] sm:min-h-[520px]">
            <div className="absolute inset-x-[13%] top-[29%] h-px rotate-[-21deg] bg-gradient-to-r from-transparent via-neon/50 to-amber/50" />
            <div className="absolute left-[33%] top-[18%] h-px w-[39%] rotate-[17deg] bg-gradient-to-r from-amber/50 via-magenta/50 to-transparent" />
            <div className="absolute left-[18%] top-[53%] h-px w-[53%] rotate-[25deg] bg-gradient-to-r from-transparent via-magenta/45 to-neon/45" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,243,214,0.08),transparent_48%)]" />

            <p className="absolute left-6 top-6 font-display text-[8px] tracking-[0.22em] text-mistDim">SELECT A SIGNAL</p>
            <p className="absolute bottom-6 left-6 right-6 font-body text-sm text-mistDim sm:max-w-xs">A small place for the things that make you, you.</p>

            {signals.map((signal) => {
              const isActive = signal.id === activeSignal.id;
              return (
                <button
                  key={signal.id}
                  type="button"
                  aria-label={`Open ${signal.eyebrow.toLowerCase()} signal`}
                  aria-pressed={isActive}
                  onClick={() => setActiveId(signal.id)}
                  className={`absolute ${signal.position} group z-10 grid h-12 w-12 place-items-center rounded-full border transition duration-300 hover:scale-110 focus-visible:scale-110 sm:h-16 sm:w-16 ${
                    isActive ? colorClasses[signal.color] : "border-mistDim/60 bg-void text-mistDim hover:border-mist hover:text-mist"
                  }`}
                >
                  <span className="font-display text-[9px]">{signal.label}</span>
                  <span className="absolute -bottom-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap font-display text-[7px] tracking-[0.16em] text-mistDim sm:block">{signal.eyebrow}</span>
                </button>
              );
            })}
          </div>

          <aside className="flex h-full flex-col justify-between rounded-3xl border border-duskLight bg-dusk/35 p-6 sm:p-8">
            <div>
              <p className={`font-display text-[9px] tracking-[0.25em] ${colorClasses[activeSignal.color].split(" ").at(-1)}`}>{activeSignal.eyebrow}</p>
              <h2 className="mt-5 font-body text-3xl font-medium leading-tight text-mist sm:text-4xl">{activeSignal.title}</h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-mistDim">{activeSignal.copy}</p>
            </div>

            <div className="mt-10 border-t border-duskLight pt-5">
              <p className="font-display text-[8px] tracking-[0.18em] text-mistDim">A NOTE TO SELF</p>
              <p className="mt-3 font-body text-lg text-mist">Keep going.</p>
            </div>
          </aside>
        </div>

        <section className="border-t border-duskLight/70 py-8 sm:py-10" aria-labelledby="favourites-heading">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-display text-[9px] tracking-[0.28em] text-amber">05 / FAVOURITES CABINET</p>
              <h2 id="favourites-heading" className="mt-3 font-body text-3xl font-medium text-mist sm:text-4xl">Small things worth keeping.</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-mistDim">Not a list of best answers. Just a few coordinates.</p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favourites.map((favourite, index) => (
              <article key={favourite.label} className="group rounded-2xl border border-duskLight bg-dusk/30 p-5 transition hover:-translate-y-1 hover:border-mistDim hover:bg-dusk/55">
                <p className="font-display text-[8px] tracking-[0.18em] text-neon">0{index + 1} / {favourite.label}</p>
                <p className="mt-4 text-base leading-relaxed text-mist">{favourite.value}</p>
              </article>
            ))}

            <article className="rounded-2xl border border-magenta/40 bg-magenta/5 p-5 sm:col-span-2 lg:col-span-1">
              <p className="font-display text-[8px] tracking-[0.18em] text-magenta">A LINE TO KEEP</p>
              <blockquote className="mt-4 text-base leading-relaxed text-mist">“More than strangers, less than lovers, just two hearts taking care for each other.”</blockquote>
            </article>
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-duskLight/70 pt-5 font-display text-[8px] tracking-[0.16em] text-mistDim">
          <span>YOU FOUND IT.</span>
          <span>NO MAP REQUIRED.</span>
        </footer>
      </section>
    </main>
  );
}
