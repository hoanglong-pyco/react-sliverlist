import { createRef, CSSProperties, PureComponent } from "react";

import { SliverAbstract } from "./Sliver";
import { SliverList } from "./SliverList";

export interface ScrollViewProps {
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  dir?: "horizontal" | "verticle";
  slivers: SliverAbstract[];
}

interface State {
  viewport: (root: HTMLDivElement) => { size: number; position: number };
  dir?: string;
}

export class ScrollView extends PureComponent<ScrollViewProps, State> {
  static getDerivedStateFromProps(
    props: ScrollViewProps,
    state: State
  ): Partial<State> | null {
    if (props.dir !== state.dir) {
      const dir = props.dir ?? "horizontal";
      if (dir === "horizontal") {
        return {
          viewport: (el) => ({ size: el.offsetHeight, position: el.scrollTop }),
          dir,
        };
      } else {
        return {
          viewport: (el) => ({ size: el.offsetWidth, position: el.scrollLeft }),
          dir,
        };
      }
    }

    return null;
  }

  state: State = {
    viewport: () => ({ size: 0, position: 0 }),
  };

  private scrollRef = createRef<HTMLDivElement>();

  sliver = new SliverList(this.props.slivers);

  constructor(props: ScrollViewProps) {
    super(props);
    this.sliver.attack(0);
  }

  private onScroll = () => this.forceUpdate();

  componentDidMount() {
    this.forceUpdate();
    this.componentWillUnmount = this.sliver.addListen(() => {
      this.sliver.attack(0);
      this.forceUpdate();
    });
  }

  componentWillUnmount() {
    this.sliver.dispose();
  }

  render() {
    const { width, height } = this.props;
    const { dir, viewport } = this.state;
    const { current } = this.scrollRef;
    const values = current && viewport(current);
    return (
      <div
        className={`Sliver-scroller ${dir}`}
        style={{ width, height }}
        onScroll={this.onScroll}
        ref={this.scrollRef}
      >
        {values && this.sliver.render(values, "Sliver-root")}
      </div>
    );
  }
}
