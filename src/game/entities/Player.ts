import Phaser from "phaser";
import { PLAYER, TILE } from "@/game/config";
import { useGameStore, VehicleColorId } from "@/store/useGameStore";

export type Direction = "up" | "down" | "left" | "right";
const PLAYER_COLORS: Record<
  VehicleColorId,
  { body: number; stroke: number; visorStroke: number }
> = {
  cyan: {
    body: 0x4cf3d6,
    stroke: 0xa7fff1,
    visorStroke: 0x7cf7e5,
  },
  orange: {
    body: 0xff8a4c,
    stroke: 0xffc29b,
    visorStroke: 0xffb47c,
  },
  pink: {
    body: 0xff4f7b,
    stroke: 0xffa0b8,
    visorStroke: 0xff7fa0,
  },
  purple: {
    body: 0x8b7cff,
    stroke: 0xc0b8ff,
    visorStroke: 0xa99cff,
  },
  lime: {
    body: 0x9eea5a,
    stroke: 0xd5ff9c,
    visorStroke: 0xbff57c,
  },
  gold: {
    body: 0xf5c451,
    stroke: 0xffe29a,
    visorStroke: 0xffd36b,
  },
};

/**
 * Builds a small pixel-avatar texture once (a body block + visor + shadow)
 * and exposes grid-based hop movement with a squash/stretch tween.
 */
export class Player {
  readonly sprite: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Rectangle;
  private visor: Phaser.GameObjects.Rectangle;
  private shadow: Phaser.GameObjects.Ellipse;
  private tweening = false;

  gridCol: number;
  gridRow = 0;
  facing: Direction = "up";

  constructor(private scene: Phaser.Scene, startCol: number) {
    this.gridCol = startCol;
    const selectedColor = useGameStore.getState().selectedVehicleColor;
    const colors = PLAYER_COLORS[selectedColor];

    // Soft shadow beneath the player
this.shadow = scene.add.ellipse(
  0,
  TILE * 0.28,
  TILE * 0.52,
  TILE * 0.16,
  0x020617,
  0.35
);

// Main player body
this.body = scene.add.rectangle(
  0,
  0,
  TILE * 0.5,
  TILE * 0.62,
  colors.body
);

this.body.setStrokeStyle(2, colors.stroke, 0.9);

// Dark visor
this.visor = scene.add.rectangle(
  0,
  -TILE * 0.13,
  TILE * 0.34,
  TILE * 0.16,
  0x061a23,
  0.95
);

this.visor.setStrokeStyle(1, colors.visorStroke, 0.7);

// Build the complete player sprite
this.sprite = scene.add.container(
  0,
  0,
  [this.shadow, this.body, this.visor]
);
    this.sprite.setSize(TILE, TILE);
    this.sprite.setDepth(50);
  }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
  }

  get isMoving() {
    return this.tweening;
  }

  hop(dir: Direction, targetX: number, targetY: number, onComplete: () => void) {
    if (this.tweening) return;
    this.tweening = true;
    this.facing = dir;

    const rotation = dir === "left" ? -0.12 : dir === "right" ? 0.12 : 0;

    this.scene.tweens.add({
  targets: [this.body, this.visor],
  scaleX: 0.86,
  scaleY: 1.14,
  duration: PLAYER.hopDuration * 0.35,
  yoyo: true,
  ease: "Quad.easeOut",
  });

    this.scene.tweens.add({
      targets: this.sprite,
      x: targetX,
      y: targetY,
      rotation,
      duration: PLAYER.hopDuration,
      ease: "Quad.easeInOut",
      onComplete: () => {
        this.sprite.rotation = 0;
        this.tweening = false;
        onComplete();
      },
    });

    // A tiny vertical arc for the "hop" feel.
    this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: PLAYER.hopDuration,
      onUpdate: (tw) => {
        const t = tw.getValue() ?? 0;
        const arc = Math.sin(Math.PI * t) * -10;
        this.body.y = arc;
        this.visor.y = -TILE * 0.12 + arc;
      },
    });
  }

  die() {
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.3,
      scaleY: 0.4,
      alpha: 0.3,
      duration: 220,
      ease: "Quad.easeIn",
    });
  }

  revive() {
    this.sprite.setScale(1);
    this.sprite.setAlpha(1);
  }
}
