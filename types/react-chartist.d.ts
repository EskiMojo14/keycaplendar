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
