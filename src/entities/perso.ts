import ScreenElement, { IScreenElement } from "./screenElement";

export type KeysParams = {
  left: number;
  right: number;
};

interface PersoProps extends IScreenElement {
  playerColor: string;
  die: (id: string) => void;
  name: string;
  screenWidth: number;
  cmd: KeysParams;
}
export default class Perso extends ScreenElement {
  playerColor = "#f22";
  defaultColor = "#f22";
  delete: boolean;
  velocity: number;
  name: string;
  screenWidth: number = 800;
  invincible: boolean = false;
  die;
  cmd: KeysParams;
  id: string = crypto.randomUUID();

  constructor({
    position,
    speed,
    size,
    playerColor,
    die,
    name,
    screenWidth,
    cmd,
  }: PersoProps) {
    super({ position, speed, size });
    this.playerColor = playerColor;
    this.defaultColor = playerColor;
    this.delete = false;
    this.die = die;
    this.velocity = 0;
    this.name = name;
    this.screenWidth = screenWidth;
    this.cmd = cmd;
  }

  move(direction: "left" | "right") {
    const acceleration = 0.3 * this.speed; // How quickly it accelerates
    const maxSpeed = this.speed * 3; // Limit max speed

    if (direction === "left") {
      this.velocity = Math.max(this.velocity - acceleration, -maxSpeed);
    }
    if (direction === "right") {
      this.velocity = Math.min(this.velocity + acceleration, maxSpeed);
    }
  }

  render({ context }: { context: CanvasRenderingContext2D | null }) {
    if (!context) return;
    context.fillStyle = this.playerColor;
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

  update() {
    // Apply friction when no key is pressed
    this.velocity *= 0.9; // Adjust friction value to control smoothness
    this.position.x += this.velocity;
    // Prevent going out of bounds
    this.position.x = Math.max(
      0,
      Math.min(this.screenWidth - this.size, this.position.x),
    );
  }

  setScreenWidth(width: number) {
    this.screenWidth = width;
  }

  destroy() {
    if (!this.invincible) {
      this.die(this.id);
      this.delete = true;
    }
  }
}
