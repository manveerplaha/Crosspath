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

  for (let row = 1; row <= TOTAL_ROWS; row++) {
    const district = districtByRow.get(row);
    if (district) {
      lanes.push({ row, type: "district", district, coinCol: 4 });
      continue;
    }

    // Strict alternation: even rows are always safe, odd rows are always
    // road. That means a player never has to cross two road lanes back to
    // back — one lane of traffic, then a guaranteed breather, every time.
    if (row % 2 === 0) {
      lanes.push({
        row,
        type: "safe",
        coinCol: seeded(row, 1) > 0.5 ? Math.floor(seeded(row, 2) * 9) : undefined,
      });
      continue;
    }

    const direction: 1 | -1 = row % 4 === 1 ? 1 : -1;
    const rampedSpeed = DIFFICULTY.baseVehicleSpeed + row * DIFFICULTY.speedRampPerRow;
    const speed = Math.min(rampedSpeed, DIFFICULTY.maxSpeed);
    const colorIdx = Math.floor(seeded(row, 3) * COLORS.vehicleBody.length);

    lanes.push({
      row,
      type: "road",
      direction,
      speed,
      vehicleColor: COLORS.vehicleBody[colorIdx] ?? DEFAULT_VEHICLE_COLOR,
      vehicleLength: 1, // single-tile cars only — easier to judge gaps
      gapPx: DIFFICULTY.minGapPx + seeded(row, 5) * (DIFFICULTY.maxGapPx - DIFFICULTY.minGapPx),
    });
  }

  return lanes;
}
