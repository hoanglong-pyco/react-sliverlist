import { ReactNode } from "react";
import { Notifier } from "./Notifier";
import { Viewport } from "./Values";

export abstract class SliverAbstract extends Notifier {
  key = Math.random();

  size = 0;
  private $position = 0;
  get position() {
    return this.$position;
  }
  attack(position: number) {
    this.$position = position;
  }

  abstract render(viewport: Viewport, className?: string): ReactNode;
}
