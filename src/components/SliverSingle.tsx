import { ReactNode } from "react";
import { createSliverRender, SliverAbstract } from "./Sliver";

export class SliverSingle extends SliverAbstract {
  constructor(
    protected $size: number,
    private $render: (this: SliverSingle) => ReactNode
  ) {
    super();
  }
  render = createSliverRender("SliverSingle", this.$render.bind(this));
}
