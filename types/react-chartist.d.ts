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

declare module "chartist-plugin-axistitle" {
  export type AxisTitleOptions = {
    /** The title to be displayed on the axis. If at least one axis title is not supplied then an error is thrown.
     * This can also be passed a function to enable simple updating of the title if your chart data changes.
     */
    axisTitle: string | ((...args: any[]) => string);

    /**  One or more class names to be added to the axis title.
     * Multiple class names should be separated by a space.
     * This can also be passed a function to enable simple updating of the classes if your chart data changes.
     */
    axisClass?: string | ((...args: any[]) => string);

    /** How much to offset the title by.
     *
     * Please note, `x` and `y` offset values for axisY are flipped due to the rotation of the axisY title by 90 degrees.
     * Therefore changing the `x` value moves up/down the chart, while changing `y` moves left/right.
     */
    offset?: { x: number; y: number };

    /** Defines the anchoring of the title text. */
    textAnchor?: "start" | "middle" | "end";

    /**  Whether to flip the direction of the text.
     *
     * **Note** - This can only be used on axis Y.
     */
    flipTitle?: boolean;
  };

  export type AxisTitleOptionsParam =
    | {
        axisX: Omit<AxisTitleOptions, "flipTitle">;
        axisY?: AxisTitleOptions;
      }
    | {
        axisX?: Omit<AxisTitleOptions, "flipTitle">;
        axisY: AxisTitleOptions;
      };
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  const chartistPluginAxisTitle = (opts: AxisTitleOptionsParam) => {};
  export default chartistPluginAxisTitle;
}
declare module "chartist-plugin-tooltips-updated";
