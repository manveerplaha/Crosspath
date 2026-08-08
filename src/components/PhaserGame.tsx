"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import { COLS, LANE_ROWS_VISIBLE, TILE } from "@/game/config";

// Deliberately NOT importing anything from "phaser" here, even as a type —
// see the note in GameRoot.tsx. This is the minimal shape we actually use
// off the game instance and the scene, so we never need Phaser's own types
// in a file that (transitively) gets analyzed for SSR.
interface MinimalPhaserGame {
  destroy: (removeCanvas: boolean) => void;
  events: { once: (event: "ready", cb: () => void) => void };
  scene: { getScene: (key: string) => unknown };
}
interface MinimalGameScene {
  resumeAfterDistrict: () => void;
}

export default function PhaserGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<MinimalPhaserGame | null>(null);
  const sceneRef = useRef<MinimalGameScene | null>(null);
  const phase = useGameStore((s) => s.phase);
  const muted = useGameStore((s) => s.muted);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    let disposed = false;

    async function boot() {
      const [{ default: Phaser }, { GameScene }] = await Promise.all([
        import("phaser"),
        import("@/game/scenes/GameScene"),
      ]);
      if (disposed || !containerRef.current) return;

      const game = new Phaser.Game({
        type: Phaser.AUTO, // WebGL when available, falls back to Canvas automatically
        parent: containerRef.current,
        width: COLS * TILE,
        height: LANE_ROWS_VISIBLE * TILE,
        backgroundColor: "#0b1020",
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [GameScene],
      }) as unknown as MinimalPhaserGame;

      gameRef.current = game;
      game.events.once("ready", () => {
        sceneRef.current = game.scene.getScene("GameScene") as unknown as MinimalGameScene;
      });
    }

    void boot();
    return () => {
      disposed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the district modal closes (phase leaves "district"), hand control back.
  useEffect(() => {
    if (phase === "playing") {
      sceneRef.current?.resumeAfterDistrict();
    }
  }, [phase]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    import("@/game/systems/AudioManager").then(({ audioManager }) => audioManager.setMuted(muted));
  }, [muted]);

  return (
    <div
      ref={containerRef}
      id="phaser-root"
      className="mx-auto aspect-[9/9] w-full max-w-[576px] overflow-hidden rounded-2xl border border-duskLight shadow-neon [&>canvas]:h-full [&>canvas]:w-full"
    />
  );
}
