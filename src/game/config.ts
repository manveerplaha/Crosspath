export const TILE = 64; // px per grid cell
export const LANE_ROWS_VISIBLE = 9; // rows visible at once (viewport height in tiles)
export const COLS = 9; // playable width in tiles (odd, so there's a center column)
export const TOTAL_ROWS = 60; // full crossing length; districts sit within this range

export const COLORS = {
  bgTop: 0x0b1020,
  bgBottom: 0x141b34,
  safe: 0x1e2748,
  safeAlt: 0x232d54,
  road: 0x11172c,
  roadStripe: 0x2a355f,
  building: 0x2a355f,
  buildingGlowNeon: 0x4cf3d6,
  buildingGlowAmber: 0xffb13c,
  buildingGlowMagenta: 0xff5c8a,
  player: 0x4cf3d6,
  playerShadow: 0x05070f,
  coin: 0xffd166,
  vehicleBody: [0xff5c8a, 0xffb13c, 0x8a7dff, 0x4cf3d6, 0xff8552],
} as const;

// A guaranteed-defined fallback, since noUncheckedIndexedAccess makes
// `COLORS.vehicleBody[i]` read as `number | undefined`.
export const DEFAULT_VEHICLE_COLOR: number = COLORS.vehicleBody[0];

export const PLAYER = {
  hopDuration: 130, // ms per grid hop
  hitRadius: 0.26, // fraction of a tile — smaller = more forgiving collisions
};

export const DIFFICULTY = {
  baseVehicleSpeed: 78, // px/sec — noticeably faster
  speedRampPerRow: 0.7, // px/sec added per row of progress
  maxSpeed: 190, // hard ceiling so late rows never become unfair
  minGapPx: TILE * 3.0, // gaps unchanged — speed is the only lever here
  maxGapPx: TILE * 5.5,
};
