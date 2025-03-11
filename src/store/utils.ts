import Perso from "../entities/perso";
import { useBonusStore } from "./bonusStore";

export function shouldPlayerColorReset(player: Perso) {
  const playerState = useBonusStore
    .getState()
    .playersState.find((p) => player.id === p.id);

  console.log("player state", playerState);
  if (
    !playerState?.invincible &&
    !((playerState?.speed || 3) > (playerState?.defaultSpeed || 3))
  ) {
    player.playerColor = player.defaultColor;
  }
}
