import { createSliverRender, SliverAbstract } from "./Sliver";
import { SliverList } from "./SliverList";
import { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { SliverSelection } from "./Selection";
import { SliverTreeNode } from "./SliverTreeNode";

interface SliverTreeProps<T extends SliverTreeNode<any>> {
  itemSize: number;
  node: T;
  renderNode: (node: T) => ReactNode;
  renderProps?: (node: T) => HTMLAttributes<HTMLElement>;
  selection?: SliverSelection;
}

export class SliverTree<
  T extends SliverTreeNode<D>,
  D = any
> extends SliverAbstract {
  protected children: SliverList;

  get node() {
    return this.props.node;
  }

  constructor(protected props: SliverTreeProps<T>) {
    super();

    this.notify = this.notify.bind(this);

    const { selection, node } = props;
    selection?.add(this.key);
    if (!node.level) {
      selection?.addListen(this.notify);
    }

    this.children = new SliverList();
    node.addListen(this.onNodeChanged);
    this.children.addListen(this.notify);
    this.toggleChildren();
  }

  get visible() {
    return this.node.visible;
  }
  set visible(value) {
    this.node.visible = value;
  }

  private toggleChildren = () => {
    const { props, children } = this;
    // if (props.node.expanded) {
    props.node.children.forEach((node) => {
      node.level = props.node.level + 1;
      const sliver = new SliverTree<T>({ ...props, node: node as T });

      children.addSliver(sliver);
    });
    // } else {
    //   children.clearSliver();
    // }
  };

  private $animate = false;

  calcSize() {
    const { itemSize, node } = this.props;
    this.$size = itemSize;
    if (node.children.length && node.expanded) {
      this.$size += this.children.calcSize();
    }
    return this.$size;
  }

  dispose() {
    this.children.dispose();
    this.node.removeListen(this.onNodeChanged);
    this.props.selection?.removeListen(this.notify);
    super.dispose();
  }

  private onNodeChanged = (key: keyof T) => {
    const changedKeys: (keyof T)[] = ["expanded", "visible"];
    if (!changedKeys.includes(key)) return;
    // if (!this.$animate && node.expanded) this.toggleChildren();
    this.notify(true);
    this.$animate = true;
  };

  private onTransitionEnd = () => {
    // const { node } = this.props;
    this.$animate = false;
    // if (!node.expanded) this.toggleChildren();
  };

  private toggleExpand = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    const { node } = this.props;
    node.expanded = !node.expanded;
  };

  render = (() => {
    const { node, itemSize, renderNode: renderLabel } = this.props;
    const hasChild = !!node.children.length;
    let className = "SliverTree";
    className += hasChild ? " haschild" : " single";

    return createSliverRender(
      className,
      ({ viewport, position = 0 }) => {
        const localViewport = {
          position: viewport.position - position,
          size: viewport.size,
        };
        const renderChild = hasChild && (node.expanded || this.$animate);
        const isSelected = this.props.selection?.isSelected(this.key);
        return (
          <>
            <div
              key={this.key}
              className="SliverTree-label"
              style={{ "--size": itemSize } as any}
              aria-selected={isSelected || undefined}
              onClick={this.props.selection?.handler(this.key)}
              tabIndex={0}
            >
              {hasChild && (
                <div
                  className={`SliverTree-toggle${
                    node.expanded ? " expanded" : ""
                  }`}
                  onClick={this.toggleExpand}
                />
              )}
              {renderLabel(node)}
            </div>
            <div
              style={{ position: "absolute", top: 0, left: 0 }}
              onClick={() => {
                this.visible = false;
              }}
            >
              Click
            </div>
            {renderChild &&
              this.children.render({
                className: "SliverTree-children",
                viewport: localViewport,
                position: itemSize,
              })}
          </>
        );
      },
      (props) => {
        const { node } = this.props;
        const style = {
          ...props.style,
          "--level": node.level,
        };
        if (this.$animate) {
          style.overflow = "hidden";
          props.onTransitionEnd = this.onTransitionEnd;
        }
        delete props.tabIndex;
        return Object.assign(props, {
          className: props.className + (node.expanded ? " expanded" : ""),
          style,
          "data-level": node.level,
        });
      }
    );
  })();
}
