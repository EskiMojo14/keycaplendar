import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Card } from "@rmwc/card";
import { Chip, ChipSet } from "@rmwc/chip";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableContent,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
} from "@rmwc/data-table";
import { IconButton } from "@rmwc/icon-button";
import { Typography } from "@rmwc/typography";
import Chartist from "chartist";
import type { IBarChartOptions, IChartistData, ILineChartOptions, IResponsiveOptionTuple } from "chartist";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import classNames from "classnames";
import ChartistGraph from "react-chartist";
import { useAppSelector } from "~/app/hooks";
import { withTooltip } from "@c/util/hocs";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import { selectDevice } from "@s/common";
import type { ShippedDataObject, TimelineDataObject } from "@s/statistics/types";
import {
  addOrRemove,
  alphabeticalSortPropCurried,
  arrayEveryType,
  hasKey,
  iconObject,
  pluralise,
} from "@s/util/functions";
import { Circle, EyeCheck, EyeRemove, FilterAlt, FilterAltOff } from "@i";
import "./timeline-card.scss";

const customPoint = (data: any) => {
  if (data.type === "point") {
    const circle = new Chartist.Svg(
      "circle",
      {
        cx: [data.x],
        cy: [data.y],
        r: [6],
        "ct:value": data.value.y,
        "ct:meta": data.meta,
      },
      "ct-stroked-point"
    );
    data.element.replace(circle);
  }
};

const listener = { draw: (e: any) => customPoint(e) };

const chartOptions = (monthLabel: string): IBarChartOptions & ILineChartOptions => {
  return {
    showArea: true,
    stackBars: true,
    low: 0,
    axisY: {
      onlyInteger: true,
    },
    chartPadding: {
      top: 16,
      right: 0,
      bottom: 32,
      left: 16,
    },
    plugins: [
      chartistPluginAxisTitle({
        axisX: {
          axisTitle: monthLabel,
          axisClass: "ct-axis-title",
          offset: {
            x: 0,
            y: 48,
          },
          textAnchor: "middle",
        },
        axisY: {
          axisTitle: "Count",
          axisClass: "ct-axis-title",
          offset: {
            x: 0,
            y: 24,
          },
          flipTitle: true,
        },
      }),
      chartistTooltip({ pointClass: "ct-stroked-point" }),
    ],
  };
};

const responsiveOptions: IResponsiveOptionTuple<ILineChartOptions>[] = [
  [
    "(min-width: 1240px) and (max-width: 1600px)",
    {
      axisX: {
        labelInterpolationFnc: (value: any, index: number) => {
          return index % 2 === 0 ? value : null;
        },
      },
    },
  ],
  [
    "(max-width: 1239px)",
    {
      axisX: {
        labelInterpolationFnc: (value: any, index: number) => {
          return index % 3 === 0 ? value : null;
        },
      },
    },
  ],
];

type ShippedCardProps = {
  data: ShippedDataObject;
  breakdownData?: ShippedDataObject[];
  months: string[];
  summary?: boolean;
  defaultType?: "bar" | "line";
  overline?: ReactNode;
  note?: ReactNode;
};

export const ShippedCard = (props: ShippedCardProps) => {
  const device = useAppSelector(selectDevice);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [graphType, setGraphType] = useState<"bar" | "line">(props.defaultType || "bar");
  const chartData =
    selectedIndex >= 0 && props.summary && props.breakdownData
      ? [...props.breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : props.data;
  const barChart =
    graphType === "bar" ? (
      <ChartistGraph
        className={device === "desktop" || props.summary ? "ct-double-octave" : "ct-major-twelfth"}
        data={{
          series: [chartData.timeline.shipped, chartData.timeline.unshipped] as IChartistData["series"],
          labels: props.months.map((label) => label.split(" ").join("\n")),
        }}
        type={"Bar"}
        options={chartOptions("Month (GB end)")}
        responsiveOptions={responsiveOptions}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ChartistGraph
        className={device === "desktop" || props.summary ? "ct-double-octave" : "ct-major-twelfth"}
        data={{
          series: [chartData.timeline.shipped, chartData.timeline.unshipped] as IChartistData["series"],
          labels: props.months.map((label) => label.split(" ").join("\n")),
        }}
        type={"Line"}
        listener={listener}
        options={chartOptions("Month (GB end)")}
        responsiveOptions={responsiveOptions}
      />
    ) : null;
  const selectChips =
    props.summary && props.breakdownData ? (
      <div className="timeline-chips-container">
        <ChipSet choice>
          {[...props.breakdownData].sort(alphabeticalSortPropCurried("name")).map((obj, index) => (
            <Chip
              key={obj.name}
              label={obj.name}
              selected={index === selectedIndex}
              onInteraction={() => {
                setSelectedIndex(index === selectedIndex ? -1 : index);
              }}
            />
          ))}
        </ChipSet>
      </div>
    ) : null;
  return (
    <Card className="timeline-card full-span">
      <div className="title-container">
        <div className="text-container">
          {props.overline ? (
            <Typography use="overline" tag="h3">
              {props.overline}
            </Typography>
          ) : null}
          <Typography use="headline5" tag="h1">
            {props.data.name}
          </Typography>
          <Typography use="subtitle2" tag="p">
            {pluralise`${chartData.total} ${[chartData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon="stacked_bar_chart"
                selected={graphType === "bar"}
                onClick={() => {
                  setGraphType("bar");
                }}
              />,
              "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon="multiline_chart"
                selected={graphType === "line"}
                onClick={() => {
                  setGraphType("line");
                }}
              />,
              "Multiline chart"
            )}
          </SegmentedButton>
        </div>
      </div>
      <div className="timeline-container">
        <div className="timeline-chart-container shipped">
          {barChart}
          {lineChart}
        </div>
        <div className="table-container">
          <DataTable className="rounded">
            <DataTableContent>
              <DataTableHead>
                <DataTableRow>
                  <DataTableHeadCell>Status</DataTableHeadCell>
                  <DataTableHeadCell isNumeric>Sets</DataTableHeadCell>
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator shipped"></div>Shipped
                  </DataTableCell>
                  <DataTableCell isNumeric>{chartData.shipped}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator not-shipped"></div>Not shipped
                  </DataTableCell>
                  <DataTableCell isNumeric>{chartData.unshipped}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
        {selectChips}
        {props.note ? (
          <Typography use="caption" tag="p" className="note">
            {props.note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

type TimelinesCardProps = {
  data: TimelineDataObject;
  months: string[];
  singleTheme?: "primary" | "secondary";
  defaultType?: "bar" | "line";
  summary?: boolean;
  category?: string;
  focusable?: boolean;
  allProfiles?: string[];
  breakdownData?: TimelineDataObject[];
  overline?: ReactNode;
  note?: ReactNode;
};

export const TimelinesCard = (props: TimelinesCardProps) => {
  const [onlyFocused, setOnlyFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [props.category]);
  const chartData =
    selectedIndex >= 0 && props.summary && props.breakdownData
      ? [...props.breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : props.data;
  const [focused, setFocused] = useState<number[]>([]);
  const [graphType, setGraphType] = useState<"bar" | "line">(props.defaultType || "bar");
  const setFocus = (index: number) => {
    const newFocused = addOrRemove([...focused], index);
    setFocused(newFocused);
  };
  const focusAll = () => {
    let allIndexes: number[] = [];
    if (
      arrayEveryType(
        chartData.timeline.series,
        (series): series is { index: number } => typeof series === "object" && hasKey(series, "index")
      ) &&
      chartData.timeline.series.length !== props.allProfiles?.length
    ) {
      allIndexes = chartData.timeline.series.map((series) => series.index);
    } else {
      allIndexes = Array(chartData.timeline.series.length)
        .fill("")
        .map((v, i) => i);
    }
    setFocused(allIndexes);
  };
  const clearFocus = () => {
    setFocused([]);
  };
  useEffect(clearFocus, [props.category]);
  const chartSeries =
    onlyFocused &&
    props.focusable &&
    props.allProfiles &&
    arrayEveryType(
      chartData.timeline.series,
      (series): series is { data: any; index: number } => hasKey(series, "data") && hasKey(series, "index")
    ) &&
    focused.length > 0 &&
    focused.length !== chartData.timeline.series.length
      ? chartData.timeline.series.filter((series) => focused.includes(series.index))
      : chartData.timeline.series;
  const barChart =
    graphType === "bar" ? (
      <ChartistGraph
        className="ct-double-octave"
        data={{
          labels: props.months.map((label) => label.split(" ").join("\n")),
          series: chartSeries,
        }}
        type={"Bar"}
        options={chartOptions("Month")}
        responsiveOptions={responsiveOptions}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ChartistGraph
        className="ct-double-octave"
        data={{
          labels: props.months.map((label) => label.split(" ").join("\n")),
          series: chartSeries,
        }}
        type={"Line"}
        listener={listener}
        options={chartOptions("Month")}
        responsiveOptions={responsiveOptions}
      />
    ) : null;
  const selectChips =
    props.summary && props.breakdownData ? (
      <div className="timeline-chips-container">
        <ChipSet choice>
          {[...props.breakdownData].sort(alphabeticalSortPropCurried("name")).map((obj, index) => (
            <Chip
              key={obj.name}
              label={obj.name}
              selected={index === selectedIndex}
              onInteraction={() => {
                setSelectedIndex(index === selectedIndex ? -1 : index);
              }}
            />
          ))}
        </ChipSet>
      </div>
    ) : null;
  const focusButtons =
    props.focusable && props.allProfiles ? (
      <>
        {withTooltip(
          <IconButton
            icon={iconObject(<EyeCheck />)}
            disabled={focused.length === chartData.timeline.series.length}
            onClick={focusAll}
          />,
          "Focus all series"
        )}
        {withTooltip(
          <IconButton icon={iconObject(<EyeRemove />)} disabled={focused.length === 0} onClick={clearFocus} />,
          "Clear focus"
        )}
        {withTooltip(
          <IconButton
            className="primary-on"
            icon={iconObject(<FilterAltOff />)}
            onIcon={iconObject(<FilterAlt />)}
            checked={onlyFocused}
            onClick={() => setOnlyFocused((prev) => !prev)}
          />,
          "Filter to focused items"
        )}
      </>
    ) : null;
  const focusChips =
    props.focusable && props.allProfiles ? (
      <div className="timeline-chips-container focus-chips">
        <ChipSet choice>
          {props.allProfiles.map((profile, index) => {
            if (chartData.timeline.profiles.includes(profile) || chartData.timeline.profiles.length === 0) {
              return (
                <Chip
                  key={profile}
                  icon={focused.length && !focused.includes(index) ? iconObject(<Circle />) : "circle"}
                  label={profile}
                  selected={focused.includes(index)}
                  onInteraction={() => {
                    setFocus(index);
                  }}
                  className={`focus-chip focus-chip-index-${index}`}
                />
              );
            }
            return null;
          })}
        </ChipSet>
      </div>
    ) : null;
  return (
    <Card className="timeline-card full-span">
      <div className="title-container">
        <div className="text-container">
          {props.overline ? (
            <Typography use="overline" tag="h3">
              {props.overline}
            </Typography>
          ) : null}
          <Typography use="headline5" tag="h1">
            {props.data.name}
          </Typography>
          <Typography use="subtitle2" tag="p">
            {pluralise`${chartData.total} ${[chartData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          {focusButtons}
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon={props.singleTheme ? "bar_chart" : "stacked_bar_chart"}
                selected={graphType === "bar"}
                onClick={() => {
                  setGraphType("bar");
                }}
              />,
              props.singleTheme ? "Bar chart" : "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={props.singleTheme ? "show_chart" : "multiline_chart"}
                selected={graphType === "line"}
                onClick={() => {
                  setGraphType("line");
                }}
              />,
              props.singleTheme ? "Line chart" : "Multiline chart"
            )}
          </SegmentedButton>
        </div>
      </div>
      <div className="timeline-container">
        <div
          className={classNames(
            "timeline-chart-container timelines",
            {
              single: props.singleTheme,
              focused: focused.length > 0,
            },
            typeof props.singleTheme === "string" ? props.singleTheme : "",
            focused.map((index) => `series-index-${index}`)
          )}
        >
          {barChart}
          {lineChart}
        </div>
        {selectChips}
        {focusChips}
        {props.note ? (
          <Typography use="caption" tag="p" className="note">
            {props.note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};
