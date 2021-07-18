import { createRef, CSSProperties, PureComponent } from "react";
import { debounce } from "./Notifier";
import { SliverSelection } from "./Selection";

import { SliverAbstract } from "./Sliver";
import { SliverList } from "./SliverList";

type ScrollWindow = Window | Document | HTMLElement;

export interface ScrollViewProps {
  window?: () => ScrollWindow;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
  dir?: "horizontal" | "verticle";
  slivers: SliverAbstract[];
  selection?: SliverSelection;
}

interface State {
  viewport: (root: HTMLDivElement) => { size: number; position: number };
  sliver: SliverList;
  slivers: SliverAbstract[];
  dir?: string;
}

const viewportFrom = (scroller: ScrollWindow) => {
  if (scroller instanceof Window || scroller instanceof Document) {
    return () => {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        left: window.scrollX,
        top: window.scrollY,
      };
    };
  } else {
    return () => {
      return {
        width: scroller.offsetWidth,
        height: scroller.offsetHeight,
        left: scroller.scrollLeft,
        top: scroller.scrollTop,
      };
    };
  }
};

export class ScrollView extends PureComponent<ScrollViewProps, State> {
  static getDerivedStateFromProps(
    props: ScrollViewProps,
    prevState: State
  ): Partial<State> | null {
    let state: Partial<State> = {};

    const dir = props.dir ?? "horizontal";
    if (dir !== prevState.dir) {
      const window = props.window && viewportFrom(props.window());

      if (dir === "horizontal") {
        const viewport = window
          ? (el: HTMLElement) => {
              const values = window();
              return {
                size: values.height,
                position: values.top - el.offsetTop,
              };
            }
          : (el: HTMLElement) => {
              return { size: el.offsetHeight, position: el.scrollTop };
            };
        state = { viewport, dir };
      } else {
        const viewport = (el: HTMLElement) => ({
          size: el.offsetWidth,
          position: el.scrollLeft,
        });
        state = { viewport, dir };
      }
    }

    if (props.slivers !== prevState.slivers) {
      const { sliver } = prevState;
      state.slivers = props.slivers;

      sliver.clearSliver();
      props.slivers.forEach((item) => sliver.addSliver(item));
      sliver.calcSize();
    }

    return state;
  }

  state: State = {
    viewport: (el) => ({ size: el.offsetHeight, position: el.scrollTop }),
    slivers: this.props.slivers,
    sliver: new SliverList({ slivers: this.props.slivers }),
  };

  private scrollRef = createRef<HTMLDivElement>();

  private onScroll = () => this.forceUpdate();

  componentDidMount() {
    const { sliver } = this.state;
    const scroller = this.props.window?.() ?? this.scrollRef.current;
    scroller?.addEventListener("scroll", this.onScroll);
    const unlisten = sliver.addListen(
      debounce(0, (resized: boolean) => {
        resized && sliver.calcSize();
        this.forceUpdate();
      })
    );
    this.componentWillUnmount = () => {
      unlisten();
      scroller?.removeEventListener("scroll", this.onScroll);
      sliver.dispose();
    };

    sliver.calcSize();
    this.forceUpdate();
  }

  render() {
    const { width, height, window } = this.props;
    const { dir, viewport, sliver } = this.state;
    const { current } = this.scrollRef;
    const values = current && viewport(current);
    return (
      <div
        className={`Sliver${window ? "" : " Sliver-scroller"} ${dir}`}
        style={{ width, height }}
        ref={this.scrollRef}
      >
        {values &&
          sliver.render({ className: "Sliver-root", viewport: values })}
      </div>
    );
  }
}
