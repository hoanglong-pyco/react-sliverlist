import {
  createRef,
  CSSProperties,
  HTMLAttributes,
  PureComponent,
  ReactNode,
} from "react";
import { ResizeSensor } from "./AutoSize";
import { RenderProps, SliverAbstract } from "./Sliver";
import { Size, Viewport } from "./Values";

type AutoSizeProps = {
  style?: CSSProperties;
  onChange: (size: Size) => any;
  className?: string;
};

class AutoSize extends PureComponent<AutoSizeProps> {
  ref = createRef<HTMLDivElement>();
  sensor?: ResizeSensor;

  componentDidMount() {
    this.sensor = new ResizeSensor(this.ref.current!);
    this.sensor.addListen(this.onSizeChange);
    this.onSizeChange();
  }

  onSizeChange = () => this.props.onChange(this.sensor!.value);

  componentWillUnmount() {
    this.sensor!.dispose();
    delete this.sensor;
  }

  render() {
    const { className, children, style } = this.props;
    return (
      <div ref={this.ref} className={`SliverAuto ${className}`} style={style}>
        {children}
      </div>
    );
  }
}

export class SliverAutoSize extends SliverAbstract {
  protected $size = 100;
  constructor(private $render: (this: SliverAutoSize) => ReactNode) {
    super();
  }

  onSizeChange = (size: Size) => {
    if (this.$size !== size.height) {
      this.$size = size.height;
      this.notify(true);
    }
  };

  render({ className, style }: RenderProps) {
    return (
      <AutoSize
        key={this.key}
        className={className}
        style={style}
        onChange={this.onSizeChange}
      >
        {this.$render.call(this)}
      </AutoSize>
    );
  }
}
