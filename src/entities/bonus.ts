import { useBonusStore } from "../store/bonusStore";
import Perso from "./perso";
import ScreenElement, { IScreenElement } from "./screenElement";
export type effect = "freeze" | "speed" | "invincible";
interface BonusProps extends IScreenElement {
  effect: effect;
}
const BonusColor = {
  speed: "#Fa0",
  invincible: "#F0F",
  freeze: "#22F",
  default: "#FFF",
};

export default class Bonus extends ScreenElement {
  effect: effect;
  delete: boolean;
  collected: boolean;
  color: string;

  constructor({ position, speed = 0, size, effect }: BonusProps) {
    super({ position, speed, size });
    this.effect = effect;
    this.color = BonusColor[effect];
    this.delete = false;
    this.collected = false;
  }

  update() {
    this.position.y += this.speed;
    if (this.position.y > window.innerHeight) {
      this.delete = true;
      this.collected = true;
    }
  }

  render({ context }: { context: CanvasRenderingContext2D | null }) {
    if (!context) return;
    if (!this.collected) {
      context.fillStyle = this.color;
      context.beginPath();
      context.arc(
        this.position.x,
        this.position.y,
        this.size / 2,
        0,
        Math.PI * 2,
      );
      context.fill();
    }
  }

  action(player: Perso) {
    if (this.collected) return; // Prevent double activation
    this.collected = true;
    this.delete = true;
    switch (this.effect) {
      case "speed":
        player.speed *= 2;
        player.playerColor = this.color;
        break;
      case "invincible":
        player.invincible = true;
        player.playerColor = this.color;
        break;
      case "freeze":
        break;
    }

    // ✅ Apply effect ONLY to the player who touches the bonus
    const { addEffectToPlayer } = useBonusStore.getState();
    addEffectToPlayer(player, this.effect, 5000);
  }

  destroy() {
    this.delete = true;
  }
}
