import { RefObject } from "react";
import Perso from "../entities/perso";
import Block from "../entities/block";
import Bonus from "../entities/bonus";

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
