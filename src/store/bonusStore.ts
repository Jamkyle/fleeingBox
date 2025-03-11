import { create } from "zustand";
import Perso from "../entities/perso";
import { shouldPlayerColorReset } from "./utils";

export type Effect = "freeze" | "speed" | "invincible";

interface PlayerState {
  speed: number;
  id: string;
  defaultSpeed: number;
  invincible: boolean;
  effectTimers: Partial<
    Record<
      Effect,
      { timeout: NodeJS.Timeout | null; interval: NodeJS.Timeout | null }
    >
  >;
  effectDurations: Partial<Record<Effect, number>>;
}

interface GameState {
  playersState: PlayerState[];
  addEffectToPlayer: (player: Perso, effect: Effect, duration?: number) => void;
  removeEffectFromPlayer: (player: Perso, effect: Effect) => void;
  initStateEffect: (players: Perso[]) => void;
}

export const useBonusStore = create<GameState>((set, get) => ({
  playersState: [],

  initStateEffect: (players: Perso[]) => {
    set(() => ({
      playersState: players.map((p) => ({
        id: p.id,
        speed: p.speed,
        defaultSpeed: p.speed,
        invincible: p.invincible,
        effectTimers: {},
        effectDurations: {},
      })),
    }));
  },

  addEffectToPlayer: (player, effect, duration = 5000) => {
    set((state) => ({
      playersState: state.playersState.map((p) => {
        if (p.id !== player.id) return p;

        // ✅ Clear existing timeout & interval before setting a new one
        const existingTimer = p.effectTimers[effect];
        if (existingTimer) {
          if (existingTimer.timeout) clearTimeout(existingTimer.timeout);
          if (existingTimer.interval) clearInterval(existingTimer.interval);
        }

        // ✅ Set new timeout and interval
        const newInterval = setInterval(() => {
          set((state) => ({
            playersState: state.playersState.map((p) =>
              p.id === player.id
                ? {
                    ...p,
                    effectDurations: {
                      ...p.effectDurations,
                      [effect]: Math.max(
                        (p.effectDurations[effect] || 0) - 1,
                        0,
                      ),
                    },
                  }
                : p,
            ),
          }));
        }, 1000);

        const newTimeout = setTimeout(() => {
          clearInterval(newInterval);
          get().removeEffectFromPlayer(player, effect);
        }, duration);

        return {
          ...p,
          speed: effect === "speed" ? 3 * 2 : p.speed,
          invincible: effect === "invincible" ? true : p.invincible,
          effectDurations: { ...p.effectDurations, [effect]: duration / 1000 },
          effectTimers: {
            ...p.effectTimers,
            [effect]: { timeout: newTimeout, interval: newInterval },
          },
        };
      }),
    }));
  },

  removeEffectFromPlayer: (player, effect) => {
    set((state) => ({
      playersState: state.playersState.map((p) => {
        if (p.id !== player.id) return p;

        // ✅ Clear timeout & interval
        const existingTimer = p.effectTimers[effect];
        if (existingTimer) {
          if (existingTimer.timeout) clearTimeout(existingTimer.timeout);
          if (existingTimer.interval) clearInterval(existingTimer.interval);
        }
        player.speed = effect === "speed" ? p.defaultSpeed : p.speed;
        player.invincible = effect === "invincible" ? false : p.invincible;
        shouldPlayerColorReset(player);

        return {
          ...p,
          speed: effect === "speed" ? p.defaultSpeed : p.speed,
          invincible: effect === "invincible" ? false : p.invincible,
          effectTimers: {
            ...p.effectTimers,
            [effect]: { timeout: null, interval: null },
          },
          effectDurations: {
            ...p.effectDurations,
            [effect]: 0,
          },
        };
      }),
    }));
  },
}));
