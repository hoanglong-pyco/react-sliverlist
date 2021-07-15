import { CSSProperties, Fragment, ReactElement } from "react";
import { SliverAbstract } from "./Sliver";
import { SliverSingle } from "./SliverSingle";
import { Viewport } from "./Values";

export class SliverFlatItem extends SliverSingle {
  constructor(
    public extent: { min: number; max: number },
    render: (this: SliverSingle) => ReactElement
  ) {
    super(extent.max - extent.min, render);
  }

  attack(pos: number) {
    super.attack(this.extent.min);
  }
}

export class SliverFlatList extends SliverAbstract {
  constructor(public slivers: SliverFlatItem[]) {
    super();
  }
  attack(position: number) {
    super.attack(position);
    this.slivers.forEach((sliver) => {
      sliver.attack(position);
    });
  }

  render(viewport: Viewport, className: string) {
    return (
      <Fragment key={`SliverList-${this.position}`}>
        {this.slivers.map((sliver) => {
          if (
            viewport.position < sliver.extent.min ||
            viewport.position > sliver.extent.max
          )
            return false;
          return sliver.render(viewport, className);
        })}
      </Fragment>
    );
  }
}
