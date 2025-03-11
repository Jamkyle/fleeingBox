"use client";

import { useBonusStore } from "../store/bonusStore";
import { useGameStore } from "../store/gameStore";

export default function Status() {
  const playersState = useBonusStore(state => state.playersState)
  const players = useGameStore(state => state.players)
  return (
    playersState.map(function (player, i) {
      const playerData = players.find((p) => p.id === player.id);
      return (
        <ul className="cadre" key={i}>
          <li>{playerData?.name}</li>
          {playerData?.delete ? (
            <li>
              <span className="player-status">dead</span>
            </li>
          ) : Object.entries(player.effectDurations).map(([effect, time]) =>
            time > 0 ? (
              <div key={effect} className="effect-item">
                <span className="effect-name">{effect.toUpperCase()}</span>
                <span className="effect-timer">{time}s</span>
              </div>
            ) : null
          )}
        </ul>
      );
    })
  );
}
