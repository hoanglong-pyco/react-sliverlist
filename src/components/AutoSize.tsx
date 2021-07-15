import { HTMLAttributes, ReactNode, useEffect, useRef, useState } from "react";
import { Size } from "./Values";

interface AutoSizeProps extends HTMLAttributes<HTMLDivElement> {
  defaultSize?: Size;
  width?: boolean;
  heigth?: boolean;
  children: (size: Size) => ReactNode;
}

const zeroSize = new Size(0, 0);

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
    let oldSize = new Size(0, 0),
      frameID: number;
    (function loop() {
      frameID = requestAnimationFrame(loop);
      if (!ref.current) return;
      const { offsetWidth, offsetHeight } = ref.current;
      if (
        (width && oldSize.width !== offsetWidth) ||
        (heigth && oldSize.height !== offsetHeight)
      ) {
        oldSize = new Size(offsetWidth, offsetHeight);
        setSize(oldSize);
      }
    })();

    return () => cancelAnimationFrame(frameID);
  }, [width, heigth]);

  return (
    <div ref={ref} {...props} className={`Sliver-autoSize ${className}`}>
      {Boolean(size.width && size.height) && children(size)}
    </div>
  );
};
