import { SliverSelection } from "./Selection";
import { createSliverRender, SliverAbstract } from "./Sliver";

type ItemView = { position: number; index: number; sliver: SliverAbstract };

const maxExtent = Math.max(window.innerHeight, window.innerWidth);

type SliverListProps = {
  slivers?: SliverAbstract[];
  selection?: SliverSelection;
};

export class SliverList extends SliverAbstract {
  private $slivers: SliverAbstract[] = [];
  constructor({ slivers, selection }: SliverListProps = {}) {
    super();
    slivers?.forEach((item) => this.addSliver(item));
    this.notify = this.notify.bind(this);
    selection?.addListen(this.notify);
    this.selection = selection;
  }

  selection?: SliverSelection;

  forceRefresh = (() => {
    let frame: number;
    return () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => this.notify(true));
    };
  })();

  addSliver(sliver: SliverAbstract, index?: number) {
    index = index ?? this.$slivers.length;
    this.$slivers.splice(index, 0, sliver);
    this.selection?.add(sliver.key);
    sliver.addListen(this.notify);
  }

  removeSliver(sliver: SliverAbstract) {
    if (this.$slivers.remove(sliver)) {
      this.selection?.remove(sliver.key);
      sliver.removeListen(this.notify);
    }
  }

  clearSliver = () => {
    this.selection?.empty();
    this.$slivers.forEach((sliver) => sliver.removeListen(this.notify));
    this.$slivers = [];
    this.$views = [];
  };

  dispose() {
    this.clearSliver();
    this.selection?.removeListen(this.notify);
    super.dispose();
  }

  private $views: ItemView[] = [];
  private $extend = 0;
  private $animate(value: number) {
    this.forceRefresh();
    this.$extend = value;
  }

  calcSize() {
    const { $views, $slivers } = this;
    let total = 0;
    let skipAnimate = !$views.length || this.$extend;

    const changed = !!$slivers.find((sliver, index) => {
      const size = sliver.visible ? sliver.calcSize() : 0;
      const old = $views[index];
      if (!old || skipAnimate) {
        $views[index] = { position: total, index, sliver };
      } else if (old.position !== total) {
        const extent = Math.abs(old.position - total);
        if (extent < maxExtent) {
          this.$animate(extent);
          return true;
        } else {
          skipAnimate = true;
          old.position = total;
        }
      }
      total += size;
      return false;
    });

    if (changed && !skipAnimate) return this.$size;
    return (this.$size = total);
  }

  private findVisibles(position: number, max: number) {
    const visibles = Array<ItemView>();
    const { $views } = this;
    const { length } = $views;

    let index = $views.findBinary((view, index) => {
      if (position < view.position) return 1;
      if (position > view.position + view.sliver.size) return -1;
      return 0;
    });
    if (index < 0) return [];
    for (; index < length; index++) {
      const view = $views[index];
      if (view.sliver.visible) {
        if (view.position > max) break;
        visibles.push(view);
      }
    }
    return visibles;
  }

  render = createSliverRender(
    "SliverList",
    ({ viewport, position = 0 }) => {
      const viewSize = viewport.size + this.$extend;
      const localViewport = {
        position: viewport.position - position,
        size: viewSize,
      };
      return this.findVisibles(
        Math.max(localViewport.position, 0),
        viewport.position + viewSize
      ).map(({ sliver, position, index }) => {
        return sliver.render({
          position,
          className: "SliverList-item " + (index % 2 ? "even" : "odd"),
          viewport: localViewport,
          style: { "--size": sliver.size } as any,
          tabIndex: 0,
          "aria-selected": this.selection?.isSelected(sliver.key) || undefined,
          onClick: this.selection?.handler(sliver.key),
        });
      });
    },
    (props) => {
      if (this.$extend) {
        props.onTransitionEnd = () => {
          this.$extend = 0;
          this.notify(false);
        };
      }
      return props;
    }
  );
}
