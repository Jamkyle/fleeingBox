import Perso from "../entities/perso";
import { useBonusStore } from "../store/bonusStore";
import { useCanvasStore } from "../store/canvasStore";
import { useGameStore } from "../store/gameStore";
import { randomColorHexa } from "./color-utils";
import { playerCMD } from "./constants";

export const clearCanvas = () => {
  const { context, canvas } = useCanvasStore.getState();
  if (context && canvas) {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
};

export const generatePlayers = (n: number) => {
  const { canvas } = useCanvasStore.getState();
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
        handleGameOver(playerId);
      },
      size: 50,
      name: "player" + i,
      playerColor: randomColorHexa(),
      screenWidth: screenWidth,
      cmd: playerCMD[i],
    });
    newPlayers.push(player);
  }
  useBonusStore.getState().initStateEffect(newPlayers);
  return newPlayers;
};

export function handleGameOver(playerId: string) {
  useGameStore.setState((state) => {
    const remainingPlayers = state.players.filter((p) => p.name !== playerId);
    if (remainingPlayers.length === 0) {
      clearCanvas();
      return { players: [], gameOver: true, inGame: false };
    }
    return { players: remainingPlayers };
  });
}
