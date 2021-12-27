declare module "react-chartist" {
  import { ComponentType } from "react";
  import {
    IBarChartOptions,
    IChartistData,
    IChartOptions,
    ILineChartOptions,
    IPieChartOptions,
    IResponsiveOptionTuple,
  } from "chartist";

  type ChartProps<ChartType extends string, Options extends IChartOptions> = {
    type: ChartType;
    data: IChartistData;

    options?: Options;
    responsiveOptions?: IResponsiveOptionTuple<Options>[];
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
declare module "chartist-plugin-tooltips-updated" {
  export type TooltipOptions<Meta = string | number, Value = string | number> = {
    /** Accepts '£', '$', '€', etc.
     *
     * e.g. 4000 => €4,000
     */
    currency?: string;

    currencyFormatCallback?: (value: Value, options: TooltipOptions) => string;

    /** Build custom tooltip from meta and value */
    tooltipFnc?: (meta: Meta, value: Value) => string;

    /** Transform tooltip text */
    transformTooltipTextFnc?: (value: Value) => string;

    /** Add class(es) to tooltip wrapper */
    class?: string;

    /** Tooltips do not follow mouse movement -- they are anchored to the point / bar. */
    anchorToPoint?: boolean;

    /** Append tooltips to body instead of chart container */
    appendToBody?: boolean;

    /** Parse the meta value as HTML instead of plain text */
    metaIsHTML?: boolean;

    /** Class to use as selector if custom points drawn */
    pointClass?: string;
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  const chartistTooltip = (opts?: TooltipOptions) => {};
  export default chartistTooltip;
}
