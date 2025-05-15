import { create } from "zustand";
import { persist } from "zustand/middleware";

type SpeedMultiplier = 1 | 2 | 3 | 4;

interface BattleSpeedState {
  speedMultiplier: SpeedMultiplier;
  setSpeedMultiplier: (speed: SpeedMultiplier) => void;
}

export const useBattleSpeedStore = create<BattleSpeedState>()(
  persist(
    (set) => ({
      speedMultiplier: 1, // Default speed is 1x
      setSpeedMultiplier: (speed) => set({ speedMultiplier: speed }),
    }),
    {
      name: "battle-speed-settings",
    }
  )
);
