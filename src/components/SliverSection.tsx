import { createSliverRender, RenderProps, SliverAbstract } from "./Sliver";
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

  calcSize() {
    this.$size = this.section.calcSize();
    if (this.expanded) {
      this.$size += this.content.calcSize();
    }
    return this.$size;
  }

  private $expanded = true;
  get expanded() {
    return this.$expanded;
  }
  set expanded(value) {
    if (value !== this.$expanded) {
      this.$expanded = value;
      this.notify(true);
    }
  }

  toggle = (value?: boolean) => (this.expanded = value ?? !this.expanded);

  render = createSliverRender(
    "SliverSection",
    ({ viewport, position = 0 }: RenderProps) => {
      const { section, content, expanded } = this;
      const localViewport = {
        position: viewport.position - position,
        size: viewport.size,
      };
      return (
        <>
          {section.render({
            className: "SliverSection-header",
            viewport: localViewport,
          })}
          {expanded &&
            content.render({
              className: "SliverSection-content",
              viewport: localViewport,
            })}
        </>
      );
    }
  );
}
