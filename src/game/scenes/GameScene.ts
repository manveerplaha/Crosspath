import Phaser from "phaser";
import { COLORS, COLS, DEFAULT_VEHICLE_COLOR, DIFFICULTY, PLAYER, TILE, TOTAL_ROWS } from "@/game/config";
import { generateLanes, LaneDef } from "@/game/systems/LaneGenerator";
import { Player, Direction } from "@/game/entities/Player";
import { Vehicle } from "@/game/entities/Vehicle";
import { useGameStore } from "@/store/useGameStore";
import { audioManager } from "@/game/systems/AudioManager";
import type { DistrictContent } from "@/data/districts";

interface ActiveLane {
  def: LaneDef;
  vehicles: Vehicle[];
  spawnTimer: number;
  /** Every non-vehicle GameObject this lane created, so despawnLane can fully clean up. */
  staticObjects: Phaser.GameObjects.GameObject[];
  coinSprite?: Phaser.GameObjects.Arc;
  coinTaken?: boolean;
  buildingGlow?: Phaser.GameObjects.Rectangle;
}

const rowToY = (row: number) => -row * TILE;
const colToX = (col: number) => (col - (COLS - 1) / 2) * TILE;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private lanes: LaneDef[] = [];
  private activeLanes = new Map<number, ActiveLane>();
  private cameraTargetY = 0;
  private inputLocked = false;
  private touchStart: { x: number; y: number } | null = null;
  private worldContainer!: Phaser.GameObjects.Container;
  private bg!: Phaser.GameObjects.Rectangle;

  constructor() {
    super("GameScene");
  }

  create() {
    this.lanes = generateLanes();
    this.cameras.main.setBackgroundColor(COLORS.bgTop);

    this.bg = this.add
      .rectangle(0, 0, this.scale.width * 4, TOTAL_ROWS * TILE + this.scale.height * 2, COLORS.bgTop)
      .setOrigin(0.5, 1);

    this.worldContainer = this.add.container(this.scale.width / 2, this.scale.height - TILE * 1.5);
    this.bg.setPosition(0, TILE * 2);
    this.worldContainer.add(this.bg);

    // Pre-render a window of lanes around the start.
    for (let r = 0; r <= 12; r++) this.spawnLane(r);

    this.player = new Player(this, Math.floor(COLS / 2));
    this.player.setPosition(colToX(this.player.gridCol), rowToY(0));
    this.worldContainer.add(this.player.sprite);

    this.cameraTargetY = 0;
    this.setupInput();

    const store = useGameStore.getState();
    store.setPhase("playing");
    store.setCheckpoint(0);
    audioManager.startAmbient();

    this.events.on("shutdown", () => audioManager.stopAmbient());
  }

  // ---------------------------------------------------------------- input

  private setupInput() {
    const kb = this.input.keyboard!;
    kb.on("keydown-UP", () => this.tryMove("up"));
    kb.on("keydown-W", () => this.tryMove("up"));
    kb.on("keydown-DOWN", () => this.tryMove("down"));
    kb.on("keydown-S", () => this.tryMove("down"));
    kb.on("keydown-LEFT", () => this.tryMove("left"));
    kb.on("keydown-A", () => this.tryMove("left"));
    kb.on("keydown-RIGHT", () => this.tryMove("right"));
    kb.on("keydown-D", () => this.tryMove("right"));

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.touchStart = { x: p.x, y: p.y };
    });
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      if (!this.touchStart) return;
      const dx = p.x - this.touchStart.x;
      const dy = p.y - this.touchStart.y;
      const threshold = 24;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) {
        this.touchStart = null;
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) this.tryMove(dx > 0 ? "right" : "left");
      else this.tryMove(dy > 0 ? "down" : "up");
      this.touchStart = null;
    });

    // Exposed for on-screen D-pad buttons rendered in React.
    (window as unknown as { crossPathMove?: (d: Direction) => void }).crossPathMove = (d) => this.tryMove(d);
  }

  private tryMove(dir: Direction) {
    if (this.inputLocked || this.player.isMoving) return;
    const { phase } = useGameStore.getState();
    if (phase !== "playing") return;

    let { gridRow, gridCol } = this.player;
    if (dir === "up") gridRow += 1;
    else if (dir === "down") gridRow = Math.max(0, gridRow - 1);
    else if (dir === "left") gridCol = Math.max(0, gridCol - 1);
    else if (dir === "right") gridCol = Math.min(COLS - 1, gridCol + 1);

    if (gridRow === this.player.gridRow && gridCol === this.player.gridCol) return;

    this.ensureLanesAround(gridRow);
    audioManager.hop();

    this.player.hop(dir, colToX(gridCol), rowToY(gridRow), () => {
      this.player.gridRow = gridRow;
      this.player.gridCol = gridCol;
      this.onLanded(gridRow);
    });

    this.cameraTargetY = Math.max(this.cameraTargetY, rowToY(gridRow));
  }

  private onLanded(row: number) {
    const lane = this.activeLanes.get(row)?.def;
    useGameStore.getState().addScore(1);

    if (lane?.type !== "road") {
      useGameStore.getState().setCheckpoint(row);
    }

    this.tryCollectCoin(row);

    if (lane?.type === "district" && lane.district) {
      this.triggerDistrict(lane.district);
    }

    if (row >= TOTAL_ROWS) {
      useGameStore.getState().setPhase("complete");
    }
  }

  private tryCollectCoin(row: number) {
    const active = this.activeLanes.get(row);
    if (!active?.coinSprite || active.coinTaken) return;
    const dx = Math.abs(active.coinSprite.x - colToX(this.player.gridCol));
    if (dx < TILE * 0.4) {
      active.coinTaken = true;
      audioManager.coin();
      useGameStore.getState().collectCoin();
      this.tweens.add({
        targets: active.coinSprite,
        y: active.coinSprite.y - 20,
        alpha: 0,
        duration: 220,
        onComplete: () => active.coinSprite?.destroy(),
      });
    }
  }

  private triggerDistrict(district: DistrictContent) {
    this.inputLocked = true;
    audioManager.unlock();
    const store = useGameStore.getState();
    store.unlockDistrict(district.id);
    store.openDistrict(district.id);
  }

  /** Called by PhaserGame.tsx when the React modal closes, to hand control back. */
  resumeAfterDistrict() {
    this.inputLocked = false;
    // Defensive refresh: while a district modal is open, no moves happen, so
    // nothing re-runs ensureLanesAround or re-syncs the camera target. Force
    // both back in line with the player's actual position the moment control
    // returns, so there's no chance of a stale window making it look like the
    // map won't continue until something else (like a crash) forces a refresh.
    this.ensureLanesAround(this.player.gridRow);
    this.cameraTargetY = rowToY(this.player.gridRow);
  }

  // ------------------------------------------------------------ lane mgmt

  private ensureLanesAround(row: number) {
    for (let r = Math.max(0, row - 2); r <= row + 12; r++) {
      if (!this.activeLanes.has(r)) this.spawnLane(r);
    }
    for (const [r] of this.activeLanes) {
      if (r < row - 10) this.despawnLane(r);
    }
  }

  private laneDef(row: number): LaneDef {
    return this.lanes[row] ?? { row, type: row % 3 === 0 ? "safe" : "road", direction: 1, speed: DIFFICULTY.baseVehicleSpeed };
  }

  private spawnLane(row: number) {
    if (this.activeLanes.has(row)) return;
    const def = this.laneDef(row);
    const y = rowToY(row);
    const width = COLS * TILE;

    const base =
      def.type === "road"
        ? this.add.rectangle(0, y, width, TILE, COLORS.road)
        : this.add.rectangle(0, y, width, TILE, row % 6 === 0 ? COLORS.safeAlt : COLORS.safe);
    base.setStrokeStyle(1, 0x05070f, 0.4);
    this.worldContainer.add(base);

    const active: ActiveLane = { def, vehicles: [], spawnTimer: 0, staticObjects: [base] };

    if (def.type === "road") {
      // Draw the lane-divider dashes BEFORE spawning vehicles — Phaser
      // containers render children in insertion order, not by depth, so
      // whatever gets added later draws on top. Cars must be added after
      // the dashes so they visually pass over the road markings, not under them.
      for (let cx = -width / 2 + TILE / 2; cx < width / 2; cx += TILE) {
        const dash = this.add.rectangle(cx, y, TILE * 0.4, 3, COLORS.roadStripe, 0.6);
        this.worldContainer.add(dash);
        active.staticObjects.push(dash);
      }
      for (let i = -1; i < 5; i++) {
        this.spawnVehicleInLane(active, y, i * (def.gapPx ?? 200));
      }
    }

    if (def.type === "district" && def.district) {
      const glowColor =
        def.district.accent === "neon" ? COLORS.buildingGlowNeon : def.district.accent === "amber" ? COLORS.buildingGlowAmber : COLORS.buildingGlowMagenta;
      const bx = colToX(4);
      const glow = this.add.rectangle(bx, y - TILE * 0.1, TILE * 1.6, TILE * 2.4, glowColor, 0.18);
      const building = this.add.rectangle(bx, y - TILE * 0.6, TILE * 1.2, TILE * 1.8, COLORS.building).setStrokeStyle(2, glowColor);
      const label = this.add
        .text(bx, y - TILE * 1.55, def.district.title.toUpperCase(), {
          fontFamily: "monospace",
          fontSize: "11px",
          color: "#0b1020",
          backgroundColor: Phaser.Display.Color.IntegerToColor(glowColor).rgba,
          padding: { x: 6, y: 3 },
        })
        .setOrigin(0.5);
      this.tweens.add({ targets: glow, alpha: 0.35, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.worldContainer.add([glow, building, label]);
      active.staticObjects.push(glow, building, label);
      active.buildingGlow = glow;
    }

    if (def.coinCol !== undefined) {
      const coin = this.add.circle(colToX(def.coinCol), y - 4, TILE * 0.14, COLORS.coin).setStrokeStyle(2, 0x8a6a12);
      this.tweens.add({ targets: coin, y: coin.y - 6, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.worldContainer.add(coin);
      active.staticObjects.push(coin);
      active.coinSprite = coin;
    }

    this.activeLanes.set(row, active);

    // Containers in Phaser render children in insertion order, not by
    // `.depth` — new lane objects get added to worldContainer as the
    // player keeps moving, which would otherwise stack them visually on
    // top of the (long since added) player sprite. Re-assert the player
    // on top every time a new lane is spawned. (Guarded because the very
    // first batch of spawnLane calls in create() runs before the player
    // sprite exists yet.)
    if (this.player?.sprite) {
      this.worldContainer.bringToTop(this.player.sprite);
    }
  }

  private spawnVehicleInLane(active: ActiveLane, y: number, offsetX: number) {
    const def = active.def;
    if (!def.speed || !def.direction) return;
    const v = new Vehicle(this, def.vehicleColor ?? DEFAULT_VEHICLE_COLOR, def.speed * def.direction, def.vehicleLength ?? 1);
    v.sprite.y = y;
    v.sprite.x = offsetX;
    this.worldContainer.add(v.sprite);
    active.vehicles.push(v);
  }

  private despawnLane(row: number) {
    const active = this.activeLanes.get(row);
    if (!active) return;
    active.vehicles.forEach((v) => v.destroy());
    // Kill any looping tweens targeting these objects before destroying them,
    // so Phaser doesn't keep ticking a tween against a dead GameObject.
    this.tweens.killTweensOf(active.staticObjects);
    active.staticObjects.forEach((obj) => obj.destroy());
    this.activeLanes.delete(row);
  }

  // -------------------------------------------------------------- update

  update(_time: number, delta: number) {
    const width = COLS * TILE;
    const half = width / 2 + TILE;

    this.activeLanes.forEach((active) => {
      if (active.def.type !== "road") return;
      active.vehicles.forEach((v) => {
        v.update(delta);
        if (v.sprite.x > half && v.speed > 0) v.sprite.x = -half;
        if (v.sprite.x < -half && v.speed < 0) v.sprite.x = half;
      });
    });

    // Smooth camera follow toward the player's furthest row reached.
    const desiredContainerY = this.scale.height - TILE * 1.5 - this.cameraTargetY;
    this.worldContainer.y = Phaser.Math.Linear(this.worldContainer.y, desiredContainerY, Math.min(1, delta / 180));

    this.checkCollision();
  }

  private checkCollision() {
    if (this.inputLocked) return;
    const { phase } = useGameStore.getState();
    if (phase !== "playing") return;

    const row = this.player.gridRow;
    const active = this.activeLanes.get(row);
    if (!active || active.def.type !== "road") return;

    const playerX = colToX(this.player.gridCol);
    const hitHalf = TILE * PLAYER.hitRadius;

    for (const v of active.vehicles) {
      const halfW = v.width / 2;
      if (Math.abs(v.sprite.x - playerX) < halfW + hitHalf) {
        this.onHit();
        return;
      }
    }
  }

  private onHit() {
    this.inputLocked = true;
    audioManager.crash();
    this.player.die();
    this.cameras.main.shake(180, 0.01);

    this.time.delayedCall(500, () => {
      const store = useGameStore.getState();
      const row = store.checkpointRow;
      this.player.revive();
      this.player.gridRow = row;
      this.player.gridCol = Math.floor(COLS / 2);
      this.player.setPosition(colToX(this.player.gridCol), rowToY(row));
      this.cameraTargetY = rowToY(row);
      this.ensureLanesAround(row);
      this.inputLocked = false;
    });
  }
}
