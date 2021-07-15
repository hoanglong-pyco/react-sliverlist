import { ReactNode } from "react";
import { SliverAbstract } from "./Sliver";
import { Viewport } from "./Values";

export class SliverSingle extends SliverAbstract {
  constructor(
    public size: number,
    private $render: (this: SliverSingle) => ReactNode
  ) {
    super();
  }
  render(viewport: Viewport, className: string) {
    const { size, position } = this;
    return (
      <div
        key={this.key}
        className={`SliverSingle ${className}`}
        style={{ "--size": size + "px", "--position": position + "px" } as any}
      >
        {this.$render.call(this)}
      </div>
    );
  }
}
