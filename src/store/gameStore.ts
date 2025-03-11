import { create } from "zustand";
import Bonus, { effect } from "../entities/bonus";
import Block from "../entities/block";
import Perso from "../entities/perso";

interface GameState {
  gameOver: boolean;
  score: number;
  bestScore: number;
  freeze: boolean;
  invincible: boolean;
  players: Perso[];
  blocks: Block[];
  bonus: Bonus[];
  stagEffect: effect[];
  inGame: boolean;

  setGameOver: (state: boolean) => void;
  setScore: (score: number) => void;
  addScore: (points: number) => void;
  setFreeze: (state: boolean) => void;
  setInvincible: (state: boolean) => void;
  setPlayers: (players: Perso[]) => void;
  setBlocks: (blocks: Block[]) => void;
  setBonus: (bonus: Bonus[]) => void;
  setStagEffect: (stagEffect: effect) => void;
  removeStagEffect: (stagEffect: effect) => void;
  setInGame: (state: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  gameOver: false,
  score: 0,
  bestScore:
    typeof window !== "undefined"
      ? Number(localStorage.getItem("bestScore")) || 0
      : 0,
  freeze: false,
  invincible: false,
  players: [],
  blocks: [],
  bonus: [],
  stagEffect: [],
  inGame: false,

  setGameOver: (state) => set({ gameOver: state }),
  setScore: (score) => set({ score }),
  addScore: (points) =>
    set((state) => {
      const newScore = state.score + points;
      const newBest = Math.max(state.bestScore, newScore);

      if (typeof window !== "undefined") {
        localStorage.setItem("bestScore", String(newBest));
      }

      return { score: newScore, bestScore: newBest };
    }),
  setFreeze: (state) => set({ freeze: state }),
  setInvincible: (state) => set({ invincible: state }),
  setPlayers: (players) => set({ players }),
  setBlocks: (blocks) => set({ blocks }),
  setBonus: (bonus) => set({ bonus }),
  setStagEffect: (effect) =>
    set((state) => ({
      stagEffect: [...new Set([...state.stagEffect, effect])],
    })),
  removeStagEffect: (effect) =>
    set((state) => ({
      stagEffect: state.stagEffect.filter((e) => e !== effect),
    })),
  setInGame: (state) => set({ inGame: state }),
}));
