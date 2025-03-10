type position = {
  x: number;
  y: number;
};
type speed = number;
type size = number;

export interface IScreenElement {
  position: position;
  speed?: speed;
  size: size;
}

export default class ScreenElement implements IScreenElement {
  constructor(props: IScreenElement) {
    this.position = props.position;
    this.speed = props.speed || 0;
    this.size = props.size || 50;
  }
  position: position = { x: 0, y: 0 };
  size: size = 50;
  speed: number = 0;
}
