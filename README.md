# CrossPath

An interactive portfolio: a Crossy-Road-style crossing where every safe zone
unlocks a district of the journey — About, Education, Skills, AI Projects,
Robotics, Cybersecurity (Nexus-0x), Astronomy (Celesta), Achievements, Contact.

## Stack

Next.js 14 (App Router) · TypeScript · Phaser 3 · Tailwind CSS · Framer Motion · GSAP · Zustand

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. This was authored and typed in a sandbox with no
package registry access, so it has **not** been through `npm install` /
`npm run build` here — do that first locally and fix up anything your exact
dependency versions flag (see "If something doesn't compile" below).

## Where things live

```
src/
  app/                 Next.js App Router shell (layout, page, globals.css)
  components/          React UI: LoadingScreen, GameRoot (ssr:false boundary), PhaserGame, HUD, DistrictModal
  game/
    config.ts          Tunable constants (tile size, board width, difficulty)
    entities/          Player.ts, Vehicle.ts — Phaser game objects
    scenes/GameScene.ts  All gameplay: movement, traffic, collisions, districts
    systems/
      LaneGenerator.ts   Deterministic lane layout (safe / road / district rows)
      AudioManager.ts    Procedural Web Audio SFX + ambient pad (no asset files)
  data/districts.ts    Single source of truth for the 9 districts' content
  store/useGameStore.ts  Zustand store bridging Phaser <-> React (phase, score, unlocks)
```

### SSR boundary (why this avoids "window is not defined")

Phaser's package touches `window`/`navigator` the moment it's evaluated, not
lazily — so any file that's part of a server-rendered path must never
statically `import` it, not even as a TypeScript type. All Phaser-touching
code sits behind exactly one boundary: `page.tsx` loads `GameRoot.tsx` via
`next/dynamic(() => import(...), { ssr: false })`, which tells Next.js to
skip that component (and everything it pulls in — `PhaserGame.tsx`, and
`phaser`/`GameScene.ts` beneath that) during server rendering entirely.
`PhaserGame.tsx` also only ever loads Phaser with a runtime
`await import("phaser")` inside a `useEffect`, and uses small hand-written
local interfaces instead of Phaser's own types, so there's nothing for a
bundler to accidentally hoist into a server chunk.

If you extend the game, keep new Phaser-touching code inside
`GameRoot.tsx`'s subtree, or behind another `dynamic(..., { ssr: false })`
boundary of its own.

### How the game and React talk to each other

`GameScene` imports `useGameStore` directly and calls `getState()` /
`setState()` — there's no event bus needed since both run in the same
browser context. When the player lands on a district building, the scene
locks input and calls `store.openDistrict(id)`; React's `DistrictModal`
renders, and closing it flips `phase` back to `"playing"`, which
`PhaserGame.tsx` observes and calls `scene.resumeAfterDistrict()`.

Mobile touch input has two paths: swipe gestures on the canvas itself, and a
D-pad rendered by `HUD.tsx` that calls `window.crossPathMove(dir)`,
which `GameScene` exposes on `setupInput()`.

### Content is data-driven

Everything shown in a district's modal — title, summary, bullet points,
stats, CTA — comes from `src/data/districts.ts`. Two sections
(`nexus0x`, `celesta`) and a few bullets elsewhere are placeholders marked
`EDIT ME:` — swap in your real project write-ups there; nothing else needs
to change for new copy to show up in the game.

### Audio

Every sound (footstep hop, coin chime, crash noise, district-unlock
fanfare, ambient drone) is synthesized at runtime with the Web Audio API in
`AudioManager.ts` — so the game has **zero binary asset dependencies** out
of the box. If you'd rather use authored music/SFX, drop files into
`public/audio/` and swap the relevant methods for
`this.sound.add(...)` calls inside `GameScene`.

### Visual style

Low-poly/pixel-inspired: every sprite (player, vehicles, buildings, coins)
is built from Phaser `Rectangle`/`Ellipse` primitives rather than image
assets — flat color blocks, hard strokes, and glow via layered semi-
transparent rectangles. The palette and type scale live in
`tailwind.config.ts` (`void`/`dusk`/`neon`/`amber`/`magenta`/`mist`) and are
reused inside the Phaser scene via `game/config.ts#COLORS` so the DOM UI and
the canvas game stay visually consistent.

## Extending it

- **More districts / reorder them**: edit `DISTRICTS` in `data/districts.ts`
  and adjust the `row` values (keep them spaced apart — 6 lanes is a good
  default so traffic has room to breathe). `TOTAL_ROWS` in `game/config.ts`
  should be ≥ the highest district row.
- **Difficulty curve**: `DIFFICULTY` in `game/config.ts`.
- **Checkpoints**: any non-road row becomes a checkpoint automatically
  (`GameScene.onLanded`); dying respawns at `store.checkpointRow`.
- **Collectibles**: `LaneGenerator` seeds coins on ~50% of safe rows and on
  every district row; extend `LaneDef`/`ActiveLane` if you want collectible
  types beyond coins (e.g. a hidden "easter egg" building).

## If something doesn't compile

This was hand-written without a live TypeScript/webpack toolchain in front
of it. The most likely friction points when you first `npm install`:

- **Phaser types**: if `phaser`'s bundled types shift between versions,
  `Phaser.Types.Core.GameConfig` field names (`scale.mode`, etc.) are the
  first place to check.
- **Tailwind content globs**: if custom classes aren't applying, confirm
  `tailwind.config.ts#content` matches your actual `src/` layout.
- **Font loading**: layout.tsx pulls Press Start 2P + Space Grotesk from
  Google Fonts via a `<link>` tag (kept deliberately simple rather than
  `next/font`, which needs network access at *build* time). Swap to
  `next/font/google` once you're building somewhere with registry access if
  you want it self-hosted/optimized.

None of these should require rethinking the architecture — they're the kind
of small version-drift issues any generated codebase has until it's been
run once.
