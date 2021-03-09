/// <reference types="react-scripts" />
declare module "react-lazy-load" {
  import { FC, ReactNode } from "react";

  interface Props {
    className?: string;
    height?: number | string;
    width?: number | string;
    debounce?: boolean;
    elementType?: string;
    offset?: number;
    offsetBottom?: number;
    offsetHorizontal?: number;
    offsetLeft?: number;
    offsetRight?: number;
    offsetTop?: number;
    offsetVertical?: number;
    threshold?: number;
    children?: ReactNode;
    throttle?: number | boolean;
    onContentVisible?: () => void;
  }

  const LazyLoad: FC<Props> = (props) => {};

  export default LazyLoad;
}

declare module "react-twemoji" {
  import { FC, ReactNode } from "react";

  type Props = {
    children?: ReactNode;
    noWrapper?: boolean;
    options?: {};
    tag?: string;
  };

  const Twemoji: FC<Props> = (props) => {};

  export default Twemoji;
}
