import Phaser from "phaser";
import { TILE } from "@/game/config";

export class Vehicle {
  readonly sprite: Phaser.GameObjects.Container;
  width: number;
  speed: number; // px/sec, signed for direction

  constructor(scene: Phaser.Scene, color: number, speed: number, lengthTiles: 1 | 2 = 1) {
    this.speed = speed;
    this.width = TILE * lengthTiles * 0.86;
    const height = TILE * 0.5;

    // Soft shadow beneath the vehicle
const shadow = scene.add.ellipse(
  0,
  height * 0.48,
  this.width * 0.9,
  TILE * 0.16,
  0x05070f,
  0.35
);

// Main vehicle body
const body = scene.add
  .rectangle(0, 0, this.width, height, color)
  .setStrokeStyle(2, 0xa7ff1f, 0.75);

// Slight highlight along the top of the body
const highlight = scene.add.rectangle(
  0,
  -height * 0.28,
  this.width * 0.78,
  TILE * 0.06,
  0xffffff,
  0.22
);

// Dark glass cabin
const glassWidth = this.width * 0.32;
const cabin = scene.add
  .rectangle(
    speed >= 0 ? this.width * 0.12 : -this.width * 0.12,
    -height * 0.2,
    glassWidth,
    height * 0.52,
    0x061a23,
    0.95
  )
  .setStrokeStyle(1, 0x7cf7e5, 0.7);

// Wheel positions
const wheelOffsets =
  lengthTiles === 2
    ? [-this.width * 0.32, this.width * 0.32]
    : [-this.width * 0.25, this.width * 0.25];

const wheels = wheelOffsets.map((wx) =>
  scene.add
    .rectangle(
      wx,
      height * 0.48,
      TILE * 0.15,
      TILE * 0.13,
      0x05070f
    )
    .setStrokeStyle(1, 0x7c7e85, 0.7)
);

// Front and rear lights
const frontX = speed >= 0 ? this.width / 2 - TILE * 0.08 : -this.width / 2 + TILE * 0.08;
const rearX = -frontX;

const headlight = scene.add.rectangle(
  frontX,
  -height * 0.12,
  TILE * 0.08,
  TILE * 0.12,
  0xf5f1a6,
  0.95
);

const taillight = scene.add.rectangle(
  rearX,
  -height * 0.12,
  TILE * 0.08,
  TILE * 0.12,
  0xff4d5d,
  0.9
);

// Build the complete vehicle
this.sprite = scene.add.container(0, 0, [
  shadow,
  body,
  highlight,
  cabin,
  ...wheels,
  headlight,
  taillight,
]);

this.sprite.setDepth(20);
  }

  update(dt: number) {
    this.sprite.x += this.speed * (dt / 1000);
  }

  get x() {
    return this.sprite.x;
  }

  set x(v: number) {
    this.sprite.x = v;
  }

  destroy() {
    this.sprite.destroy();
  }
}
