import { HTMLAttributes, ReactNode } from "react";
import { Notifier } from "./Notifier";
import { Viewport } from "./Values";

export type RenderProps = HTMLAttributes<HTMLElement> & {
  position?: number;
  viewport: Viewport;
};

export const createSliverRender = (
  rootClass: string,
  children: (props: RenderProps) => ReactNode,
  override: (props: RenderProps) => RenderProps = (props) => props
) => {
  return function render(this: SliverAbstract, renderer: RenderProps) {
    const { position, viewport, ...props } = override(renderer);
    props.style = {
      "--size": this.size,
      "--pos": position,
      ...props.style,
    } as any;
    return (
      <div
        key={this.key}
        {...props}
        className={rootClass + " " + props.className}
        children={children(renderer)}
      />
    );
  };
};
export abstract class SliverAbstract extends Notifier<[boolean]> {
  key = Math.random();
  protected $visible = true;
  get visible() {
    return this.$visible;
  }

  protected $size = 0;
  get size() {
    return this.$size;
  }
  calcSize() {
    return this.$size;
  }

  abstract render(props: RenderProps): ReactNode;
}
