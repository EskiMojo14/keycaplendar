declare module "*.svg" {
  import { ComponentType, SVGProps } from "react";
  export const ReactComponent: ComponentType<SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "csstype" {
  interface Properties {
    "--animation-delay": number;
  }
}

declare module "react-lazy-load" {
  import { ComponentType, PropsWithChildren } from "react";

  interface LazyLoadProps {
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
    throttle?: number | boolean;
    onContentVisible?: () => void;
  }

  export const LazyLoad: ComponentType<PropsWithChildren<LazyLoadProps>>;

  export default LazyLoad;
}

declare module "react-twemoji" {
  import { ComponentType, PropsWithChildren } from "react";
  import { ParseObject } from "twemoji";

  type TwemojiProps = {
    noWrapper?: boolean;
    options?: Partial<ParseObject>;
    tag?: string;
  };

  export const Twemoji: ComponentType<PropsWithChildren<TwemojiProps>>;

  export default Twemoji;
}

declare module "react-chartist" {
  import { ComponentType } from "react";
  import {
    IChartOptions,
    IBarChartOptions,
    ILineChartOptions,
    IPieChartOptions,
    IResponsiveOptionTuple,
    IChartistData,
  } from "chartist";

  type ChartProps<ChartType extends string, Options extends IChartOptions> = {
    type: ChartType;
    data: IChartistData;

    options?: Options;
    responsiveOptions?: Array<IResponsiveOptionTuple<Options>>;
    listener?: Record<string, (...args: any[]) => any>;

    className?: string;
    style?: React.CSSProperties;
  };

  type PieChartProps = ChartProps<"Pie", IPieChartOptions>;
  type BarChartProps = ChartProps<"Bar", IBarChartOptions>;
  type LineChartProps = ChartProps<"Line", ILineChartOptions>;

  type GraphProps = PieChartProps | BarChartProps | LineChartProps;
  export const ChartistGraph: ComponentType<GraphProps>;
  export default ChartistGraph;
}

declare module "chartist-plugin-axistitle";
declare module "chartist-plugin-tooltips-updated";
