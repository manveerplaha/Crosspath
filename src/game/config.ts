export const TILE = 64; // px per grid cell
export const LANE_ROWS_VISIBLE = 9; // rows visible at once (viewport height in tiles)
export const COLS = 9; // playable width in tiles (odd, so there's a center column)
export const TOTAL_ROWS = 60; // full crossing length; districts sit within this range

export const COLORS = {
  bgTop: 0x070b18,
  bgBottom: 0x151c36,

  safe: 0x17223d,
  safeAlt: 0x1d2a4a,
  safeGrid: 0x31456f,

  road: 0x0b1020,
  roadEdge: 0x263455,
  roadStripe: 0x52678f,

  building: 0x202d4b,
  buildingDark: 0x111a30,
  buildingWindow: 0x6d8fc7,

  buildingGlowNeon: 0x4cf3d6,
  buildingGlowAmber: 0xffb13c,
  buildingGlowMagenta: 0xff5c8a,

  player: 0x4cf3d6,
  playerShadow: 0x05070f,

  coin: 0xffd166,
  coinGlow: 0xffd166,

  vehicleBody: [
    0xff5c8a,
    0xffb13c,
    0x8a7dff,
    0x4cf3d6,
    0xff8552,
  ],
} as const;

// A guaranteed-defined fallback, since noUncheckedIndexedAccess makes
// `COLORS.vehicleBody[i]` read as `number | undefined`.
export const DEFAULT_VEHICLE_COLOR: number = COLORS.vehicleBody[0];

export const PLAYER = {
  hopDuration: 130,
  hitRadius: 0.25,
};

export const DIFFICULTY = {
  baseVehicleSpeed: 84,
  speedRampPerRow: 0.72,
  speedBoostPerDistrict: 0.085,
  maxSpeed: 215,

  minGapPx: TILE * 3.4,
  maxGapPx: TILE * 5.4,
};