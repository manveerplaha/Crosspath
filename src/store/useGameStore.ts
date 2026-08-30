import { create } from "zustand";
import type { DistrictId } from "@/data/districts";

export type GamePhase = "loading" | "menu" | "playing" | "district" | "complete";
export type VehicleColorId = "cyan" | "orange" | "pink" | "purple" | "lime" | "gold" | "crimson";

interface GameState {
  phase: GamePhase;
  score: number;
  coins: number;
  checkpointRow: number;
  unlockedDistricts: DistrictId[];
  activeDistrict: DistrictId | null;
  muted: boolean;
  selectedVehicleColor: VehicleColorId;
  ownedVehicleColors: VehicleColorId[];

  setPhase: (phase: GamePhase) => void;
  addScore: (amount: number) => void;
  collectCoin: () => void;
  setCheckpoint: (row: number) => void;
  unlockDistrict: (id: DistrictId) => void;
  openDistrict: (id: DistrictId) => void;
  closeDistrict: () => void;
  toggleMuted: () => void;
  selectVehicleColor: (color: VehicleColorId) => void;
  buyVehicleColor: (color: VehicleColorId, cost: number) => boolean;
  resetRun: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "loading",
  score: 0,
  coins: 0,
  checkpointRow: 0,
  unlockedDistricts: [],
  activeDistrict: null,
  muted: false,
  selectedVehicleColor: "cyan",

  ownedVehicleColors: [
    "cyan",
    "orange",
    "pink",
  ],

  setPhase: (phase) => set({ phase }),
  addScore: (amount) => set({ score: get().score + amount }),
  collectCoin: () => set({ coins: get().coins + 1 }),
  setCheckpoint: (row) => set({ checkpointRow: Math.max(row, get().checkpointRow) }),
  unlockDistrict: (id) =>
    set((s) => (s.unlockedDistricts.includes(id) ? s : { unlockedDistricts: [...s.unlockedDistricts, id] })),
  openDistrict: (id) => set({ activeDistrict: id, phase: "district" }),
  closeDistrict: () =>
    set((s) => ({
      activeDistrict: null,
      // Closing the final (contact) district is the "you finished the journey"
      // moment — everything else just returns to normal play.
      phase: s.activeDistrict === "contact" ? "complete" : "playing",
    })),
  toggleMuted: () => set({ muted: !get().muted }),
  selectVehicleColor: (color) =>
  set((s) =>
    s.ownedVehicleColors.includes(color)
      ? { selectedVehicleColor: color }
      : s
  ),

buyVehicleColor: (color, cost) => {
  const state = get();

  if (
    state.ownedVehicleColors.includes(color) ||
    state.coins < cost
  ) {
    return false;
  }

  set({
    coins: state.coins - cost,
    ownedVehicleColors: [
      ...state.ownedVehicleColors,
      color,
    ],
    selectedVehicleColor: color,
  });

  return true;
},
  resetRun: () =>
    set({
      score: 0,
      coins: 0,
      checkpointRow: 0,
      unlockedDistricts: [],
      activeDistrict: null,
      phase: "menu",
    }),
}));
