import Perso from "../entities/perso";
import { useGameStore } from "./gameStore";

const initPlayerColor = "#FFF";

export function shouldPlayerColorReset(player: Perso) {
  const stagEffect = useGameStore.getState().stagEffect;
  if (!stagEffect.length) {
    player.playerColor = initPlayerColor;
  }
}
