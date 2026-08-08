"use client";

import PhaserGame from "@/components/PhaserGame";
import HUD from "@/components/HUD";
import MobileControls from "@/components/MobileControls";

export default function GameRoot() {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative w-full">
        <PhaserGame />
        <HUD />
      </div>
      <MobileControls />
    </div>
  );
}
