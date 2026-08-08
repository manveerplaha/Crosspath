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

    const body = scene.add.rectangle(0, 0, this.width, height, color).setStrokeStyle(2, 0x0b1020);
    const glassW = this.width * 0.32;
    const cabin = scene.add.rectangle(speed >= 0 ? this.width * 0.12 : -this.width * 0.12, -2, glassW, height * 0.6, 0x0b1020, 0.55);
    const wheelY = height / 2 - 2;
    const wheelOffsets = lengthTiles === 2 ? [-this.width * 0.32, this.width * 0.32] : [-this.width * 0.28, this.width * 0.28];
    const wheels = wheelOffsets.map((wx) => scene.add.rectangle(wx, wheelY, TILE * 0.14, 6, 0x05070f));

    this.sprite = scene.add.container(0, 0, [body, cabin, ...wheels]);
    if (speed < 0) this.sprite.setScale(-1, 1);
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
