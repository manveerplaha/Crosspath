"use client";

/**
 * GameRoot is the ONE place in this app that touches Phaser, directly or
 * transitively. It is always loaded via next/dynamic with { ssr: false }
 * (see page.tsx) — Next.js then skips rendering this component (and
 * everything it imports) on the server entirely, so nothing here can ever
 * throw "window is not defined" during SSR.
 *
 * Do not add a static top-level `import "phaser"` (or a type import from
 * it) to ANY file that is reachable from a server-rendered path. Phaser's
 * package touches `window`/`navigator` at module-evaluation time, not
 * lazily, so even a type-only import can be enough for some bundlers to
 * pull the real module into a server chunk. Inside this file and its
 * children, Phaser is only ever loaded with a runtime `await import("phaser")`.
 */
import PhaserGame from "@/components/PhaserGame";
import HUD from "@/components/HUD";

export default function GameRoot() {
  return (
    <div className="relative w-full">
      <PhaserGame />
      <HUD />
    </div>
  );
}
