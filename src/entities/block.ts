import Perso from "./perso";
import ScreenElement, { IScreenElement } from "./screenElement";
interface BlockProps extends IScreenElement {
  addPoint: (points: number, die: boolean) => void;
  color: string;
}

export default class Block extends ScreenElement {
  addPoint: (points: number, die: boolean) => void;
  delete: boolean;
  freezed: boolean = false;
  blockColor: string = "#FAF";

  constructor({ position, speed = 0, size, addPoint, color }: BlockProps) {
    super({ position, speed, size });
    this.addPoint = addPoint;
    this.delete = false;
    this.action = this.action.bind(this);
    this.freezed = false;
    this.blockColor = color;
  }

  update() {
    if (!this.freezed) {
      this.position.y += this.speed;
    }
    if (this.position.y + this.size - 3 > window.innerHeight && !this.delete) {
      this.addPoint(1, false);
      this.delete = true;
    }
  }

  render({ context }: { context: CanvasRenderingContext2D | null }) {
    if (!context) return;
    context.fillStyle = this.blockColor;
    context.fillRect(this.position.x, this.position.y, this.size, this.size);
  }

  action(player: Perso) {
    player.die();
    this.destroy();
  }

  destroy() {
    this.delete = true;
  }
}
