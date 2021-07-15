import { SliverAbstract } from "./Sliver";
import { Viewport } from "./Values";

export class SliverList extends SliverAbstract {
  private $slivers: SliverAbstract[] = [];
  constructor(slivers: SliverAbstract[]) {
    super();
    slivers.forEach(this.addSliver.bind(this));
  }

  private $itemChanged = this.notify.bind(this);
  addSliver(sliver: SliverAbstract, index?: number) {
    this.$slivers.splice(index ?? this.$slivers.length, 0, sliver);
    sliver.addListen(this.$itemChanged);
  }

  removeSliver(sliver: SliverAbstract) {
    if (this.$slivers.remove(sliver)) {
      sliver.removeListen(this.$itemChanged);
    }
  }

  attack(position: number) {
    super.attack(position);
    this.size = 0;
    this.$slivers.forEach((sliver) => {
      sliver.attack(this.size);
      this.size += sliver.size;
    });
  }

  dispose() {
    this.$slivers.forEach((sliver) => sliver.dispose());
    this.$slivers = [];
    super.dispose();
  }

  private findVisibles(position: number, max: number) {
    const visibles = Array<SliverAbstract>();
    const { $slivers: slivers } = this;
    const { length } = slivers;

    // position -= 200;
    // max += 200;

    let index = slivers.findBinary((sliver) => {
      if (position < sliver.position) return 1;
      if (position > sliver.position + sliver.size) return -1;
      return 0;
    });
    index = Math.max(index, 0);

    for (; index < length; index++) {
      const sliver = slivers[index];
      if (sliver.position > max) break;
      visibles.push(sliver);
    }
    return visibles;
  }

  render(viewport: Viewport, className: string) {
    const { position, size } = this;
    const localViewport = {
      position: viewport.position - position,
      size: viewport.size,
    };
    return (
      <div
        key={this.key}
        className={`SliverList ${className}`}
        style={{ "--size": size + "px", "--position": position + "px" } as any}
      >
        {this.findVisibles(
          localViewport.position,
          viewport.position + viewport.size
        ).map((sliver) => {
          return sliver.render(localViewport, "SliverList-item");
        })}
      </div>
    );
  }
}
