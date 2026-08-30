import { COLORS, DEFAULT_VEHICLE_COLOR, DIFFICULTY, TOTAL_ROWS } from "@/game/config";
import { DISTRICTS, DistrictContent } from "@/data/districts";

export type LaneType = "safe" | "road" | "district";

export interface LaneDef {
  row: number;
  type: LaneType;
  /** For road lanes: direction (1 = right, -1 = left) and base speed */
  direction?: 1 | -1;
  speed?: number;
  vehicleColor?: number;
  vehicleLength?: 1 | 2;
  gapPx?: number;
  /** For district lanes: the district this building represents */
  district?: DistrictContent;
  /** Column (0-based) coins may appear on for safe/district rows */
  coinCol?: number;
}

const districtByRow = new Map(DISTRICTS.map((d) => [d.row, d]));

/** Simple deterministic pseudo-random so every playthrough's layout is stable. */
function seeded(row: number, salt: number) {
  const x = Math.sin(row * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function generateLanes(): LaneDef[] {
  const lanes: LaneDef[] = [{ row: 0, type: "safe" }];

  let consecutiveRoads = 0;

  for (let row = 1; row <= TOTAL_ROWS; row++) {
    const district = districtByRow.get(row);

    // District rows always take priority and act as a natural checkpoint.
    if (district) {
      lanes.push({
        row,
        type: "district",
        district,
        coinCol: 4,
      });

      consecutiveRoads = 0;
      continue;
    }

    // ------------------------------------------------------------
    // Progressive road difficulty
    //
    // Early:  1 road → safe
    // Mid:    2 roads → safe
    // Late:   3 roads → safe
    // End:    up to 4 roads → safe
    // ------------------------------------------------------------

    let maxRoadsBeforeSafe: number;

    if (row < 12) {
  // Tutorial / easy start
  maxRoadsBeforeSafe = 1;
} else if (row < 28) {
  // First real difficulty increase
  maxRoadsBeforeSafe = 2;
} else if (row < 46) {
  // Challenging middle game
  maxRoadsBeforeSafe = 2;
} else {
  // Late game: challenging, but still fair
  maxRoadsBeforeSafe = 3;
}

    // Force a safe/rest lane after the allowed road streak.
    if (consecutiveRoads >= maxRoadsBeforeSafe) {
      lanes.push({
        row,
        type: "safe",
        coinCol:
          seeded(row, 1) > 0.5
            ? Math.floor(seeded(row, 2) * 9)
            : undefined,
      });

      consecutiveRoads = 0;
      continue;
    }

    // ---------------- ROAD ----------------

    const direction: 1 | -1 =
      seeded(row, 10) > 0.5 ? 1 : -1;

    const rampedSpeed =
      DIFFICULTY.baseVehicleSpeed +
      row * DIFFICULTY.speedRampPerRow;

    const districtsPassed = DISTRICTS.filter(
      (d) => d.row < row
    ).length;

    const districtMultiplier =
      1 +
      districtsPassed *
        DIFFICULTY.speedBoostPerDistrict;

    const speed = Math.min(
      rampedSpeed * districtMultiplier,
      DIFFICULTY.maxSpeed
    );

    const colorIdx = Math.floor(
      seeded(row, 3) * COLORS.vehicleBody.length
    );

    lanes.push({
      row,
      type: "road",
      direction,
      speed,
      vehicleColor:
        COLORS.vehicleBody[colorIdx] ??
        DEFAULT_VEHICLE_COLOR,
      vehicleLength:
  row > 32 && seeded(row, 7) > 0.72
    ? 2
    : 1,
      gapPx:
        DIFFICULTY.minGapPx +
        seeded(row, 5) *
          (DIFFICULTY.maxGapPx -
            DIFFICULTY.minGapPx),
    });

    consecutiveRoads++;
  }

  return lanes;
}