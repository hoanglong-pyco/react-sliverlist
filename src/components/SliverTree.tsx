import { SliverAbstract } from "./Sliver";
import { SliverList } from "./SliverList";
import { Viewport } from "./Values";
import { ValueChanged } from "./Notifier";
import { ReactNode } from "react";

interface SliverTreeProps<T> {
  itemSize: number;
  node: SliverTreeNode<T>;
  renderLabel: (node: SliverTreeNode<T>) => ReactNode;
}

export class SliverTreeNode<T> extends ValueChanged<T> {
  public level = 0;
  constructor(value: T, public children: SliverTreeNode<T>[] = []) {
    super(value);
  }

  private $expanded = true;
  get expanded() {
    return this.$expanded;
  }
  set expanded(value) {
    if (value !== this.$expanded) {
      this.$expanded = value;
      this.notify();
    }
  }
}

export class SliverTree<T> extends SliverAbstract {
  protected children: SliverList;
  constructor(protected props: SliverTreeProps<T>) {
    super();
    this.children = new SliverList(
      props.node.children.map((node) => {
        node.level = props.node.level + 1;
        return new SliverTree<T>({ ...props, node });
      })
    );
    props.node.addListen(this.notify);
    this.children.addListen(this.notify);
  }

  notify = () => super.notify();

  attack(position: number) {
    super.attack(position);
    const { itemSize, node } = this.props;
    this.size = itemSize;
    if (node.children.length && node.expanded) {
      this.children.attack(itemSize);
      this.size += this.children.size;
    }
  }

  toggleExpand = () => {
    const { node } = this.props;
    node.expanded = !node.expanded;
  };

  dispose() {
    this.children.dispose();
    this.props.node.removeListen(this.notify);
    super.dispose();
  }

  render(viewport: Viewport, className: string) {
    const { position, size, children } = this;
    const { node, itemSize, renderLabel } = this.props;
    const localViewport = {
      position: viewport.position - this.position,
      size: viewport.size,
    };
    const hasChild = !!node.children.length;

    className += hasChild
      ? " SliverTree-haschild" + (node.expanded ? " expanded" : "")
      : " SliverTree-singgle";

    const itemStyle = {
      "--size": size + "px",
      "--position": position + "px",
      "--level": node.level,
    };
    return (
      <div
        key={this.key}
        className={`SliverTree ${className}`}
        style={itemStyle as any}
      >
        <div
          key={this.key}
          className="SliverTree-label"
          style={{ "--size": itemSize + "px" } as any}
        >
          {hasChild && (
            <button
              type="button"
              className={`SliverTree-expand${node.expanded ? " expanded" : ""}`}
              onClick={this.toggleExpand}
            />
          )}
          {renderLabel(node)}
        </div>
        {hasChild &&
          node.expanded &&
          children.render(localViewport, "SliverTree-children")}
      </div>
    );
  }
}
