export class Size {
  constructor(public width: number, public height: number) {}
}

export class Position {
  constructor(public top: number, public left: number) {}
}

export interface Viewport {
  size: number;
  position: number;
}
