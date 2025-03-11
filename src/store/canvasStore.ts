import { create } from "zustand";

interface CanvasState {
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  setCanvas: (canvas: HTMLCanvasElement | null) => void;
  setContext: (context: CanvasRenderingContext2D | null) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  canvas: null,
  context: null,
  setCanvas: (canvas) => set({ canvas }),
  setContext: (context) => set({ context }),
}));
