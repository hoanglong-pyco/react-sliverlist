import { FlagsChanged } from "./Notifier";

export class SliverTreeNode<T> extends FlagsChanged {
  level = 0;
  expanded = true;
  visible = true;
  constructor(public value: T, public children: SliverTreeNode<T>[] = []) {
    super();

    this.makeFlags("value", "expanded", "visible");
  }

  get flat(): SliverTreeNode<T>[] {
    const leafs = this.children.flatMap((child) => child.flat);
    return [this, ...leafs];
  }

  static fromFlat<I, T extends SliverTreeNode<I>>(
    data: I[],
    creator: (item: I) => T,
    getPaths: (item: I) => number[]
  ) {
    const indexed: Record<number, T> = {};
    const nodes = Array<T>();
    data.forEach((item, index) => {
      const node = creator(item);
      indexed[index] = node;
      const { last } = getPaths(item);
      if (last !== undefined) {
        indexed[last].children.push(node);
      } else {
        nodes.push(node);
      }
    });

    return { nodes, indexed };
  }
}
