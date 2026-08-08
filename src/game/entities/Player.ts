import Phaser from "phaser";
import { PLAYER, TILE } from "@/game/config";

export type Direction = "up" | "down" | "left" | "right";

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

    this.shadow = scene.add.ellipse(0, TILE * 0.28, TILE * 0.5, TILE * 0.18, 0x05070f, 0.45);
    this.body = scene.add.rectangle(0, 0, TILE * 0.46, TILE * 0.58, 0x4cf3d6).setStrokeStyle(2, 0x0b1020);
    this.visor = scene.add.rectangle(0, -TILE * 0.12, TILE * 0.3, TILE * 0.12, 0x0b1020, 0.85);

    this.sprite = scene.add.container(0, 0, [this.shadow, this.body, this.visor]);
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
      targets: this.body,
      scaleX: 0.82,
      scaleY: 1.18,
      duration: PLAYER.hopDuration * 0.4,
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
