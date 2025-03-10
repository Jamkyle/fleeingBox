import { RefObject } from "react";
import Perso from "../entities/perso";
import Block from "../entities/block";
import Bonus from "../entities/bonus";
import { useGameStore } from "../store/gameStore";
import { randomColorHexa } from "./color-utils";
import { playerCMD } from "./constants";

export type sizeScren = {
  SCX: number;
  SCY: number;
};

export const gameLoop = (
  context: RefObject<CanvasRenderingContext2D>,
  perso: RefObject<Perso[]>,
  blocks: RefObject<Block[]>,
  bonus: RefObject<Bonus>,
  freeze: boolean,
) => {
  if (!context.current) return;

  context.current.clearRect(
    0,
    0,
    context.current.canvas.width,
    context.current.canvas.height,
  );

  //   updateObjects(blocks.current, freeze);
  //   updateObjects(bonus.current);
  //   updateObjects(perso.current);

  //   checkCollisions(perso.current, blocks.current);
  //   checkCollisions(perso.current, bonus.current);

  requestAnimationFrame(() => gameLoop(context, perso, blocks, bonus, freeze));
};

// const updateObjects = (items, freeze = false) => {
//   for (let i = items.length - 1; i >= 0; i--) {
//     const item = items[i];
//     if (freeze && item instanceof Block) continue; // Stop blocks if frozen

//     item.update();
//     if (!item.delete) {
//       item.render({ context: context.current });
//     } else {
//       items.splice(i, 1);
//     }
//   }
// };

export const clearCanvas = (
  ctx: CanvasRenderingContext2D | null,
  size: sizeScren,
) => {
  if (ctx) {
    ctx.clearRect(0, 0, size.SCX, size.SCY);
  }
};

export const generatePlayers = (
  n: number,
  canvas: HTMLCanvasElement | null,
  ctx: CanvasRenderingContext2D | null,
) => {
  const screenWidth = canvas?.width || window.innerWidth;
  const screenHeight = canvas?.height || window.innerHeight;
  const newPlayers = [];
  for (let i = 0; i < n; i++) {
    const player = new Perso({
      position: {
        x: screenWidth / 2 + i * 10,
        y: screenHeight - 50,
      },
      speed: 3,
      die: (playerId) => {
        handleGameOver(playerId, canvas, ctx);
      },
      size: 50,
      name: "player" + i,
      playerColor: randomColorHexa(),
      screenWidth: screenWidth,
      cmd: playerCMD[i],
    });
    newPlayers.push(player);
  }
  return newPlayers;
};

export function handleGameOver(
  playerId: string,
  canvas: HTMLCanvasElement | null,
  ctx: CanvasRenderingContext2D | null,
) {
  const screenWidth = canvas?.width || window.innerWidth;
  const screenHeight = canvas?.height || window.innerHeight;
  useGameStore.setState((state) => {
    const remainingPlayers = state.players.filter((p) => p.name !== playerId);
    if (remainingPlayers.length === 0) {
      clearCanvas(ctx, { SCX: screenWidth, SCY: screenHeight });
      return { players: [], gameOver: true, inGame: false };
    }
    return { players: remainingPlayers };
  });
}
