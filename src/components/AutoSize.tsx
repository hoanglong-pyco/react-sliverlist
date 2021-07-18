import { HTMLAttributes, ReactNode, useEffect, useRef, useState } from "react";
import { ValueChanged } from "./Notifier";
import { Size } from "./Values";

interface AutoSizeProps extends HTMLAttributes<HTMLDivElement> {
  defaultSize?: Size;
  width?: boolean;
  heigth?: boolean;
  children: (size: Size) => ReactNode;
}

const zeroSize = new Size(0, 0);

export class ResizeSensor extends ValueChanged<Size> {
  constructor(private $element: HTMLElement) {
    super({ width: $element.offsetWidth, height: $element.offsetHeight });
    this.check();
  }

  frameID = 0;

  private check = () => {
    const { value, $element } = this;
    if (
      value.width !== $element.offsetWidth ||
      value.height !== $element.offsetHeight
    ) {
      this.value = {
        width: $element.offsetWidth,
        height: $element.offsetHeight,
      };
    }
    this.frameID = requestAnimationFrame(this.check);
  };

  dispose() {
    cancelAnimationFrame(this.frameID);
  }
}

export const AutoSize = ({
  defaultSize = zeroSize,
  width = false,
  heigth = true,
  className = "",
  children,
  ...props
}: AutoSizeProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState(defaultSize);

  useEffect(() => {
    const sensor = new ResizeSensor(ref.current!);
    sensor.addListen(() => setSize(sensor.value));
    setSize(sensor.value);
    return () => sensor.dispose();
  }, [width, heigth]);

  return (
    <div ref={ref} {...props} className={`Sliver-autoSize ${className}`}>
      {Boolean(size.width && size.height) && children(size)}
    </div>
  );
};
