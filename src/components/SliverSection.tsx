import { SliverAbstract } from "./Sliver";
import { Viewport } from "./Values";
interface SliverSectionProps {
  section: (toggle: (value?: boolean) => any) => SliverAbstract;
  content: (toggle: (value?: boolean) => any) => SliverAbstract;
}
export class SliverSection extends SliverAbstract {
  protected section!: SliverAbstract;
  protected content!: SliverAbstract;
  constructor({ section, content }: SliverSectionProps) {
    super();
    this.section = section(this.toggle);
    this.content = content(this.toggle);
    const itemChanged = this.notify.bind(this);
    this.section.addListen(itemChanged);
    this.content.addListen(itemChanged);
  }

  attack(position: number) {
    super.attack(position);
    this.section.attack(0);
    this.size = this.section.size;
    if (this.expanded) {
      this.content.attack(this.section.size);
      this.size += this.content.size;
    }
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

  toggle = (value?: boolean) => (this.expanded = value ?? !this.expanded);

  render(viewport: Viewport, className: string) {
    const { position, size, section, content, expanded } = this;
    const localViewport = {
      position: viewport.position - this.position,
      size: viewport.size,
    };
    return (
      <div
        key={this.key}
        className={`SliverSection ${className}`}
        style={{ "--size": size + "px", "--position": position + "px" } as any}
      >
        {section.render(localViewport, "SliverSection-header")}
        {expanded && content.render(localViewport, "SliverSection-content")}
      </div>
    );
  }
}
