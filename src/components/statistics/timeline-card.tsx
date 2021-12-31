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
import type {
  IBarChartOptions,
  IChartistData,
  ILineChartOptions,
  IResponsiveOptionTuple,
} from "chartist";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import classNames from "classnames";
import ChartistGraph from "react-chartist";
import { useAppSelector } from "~/app/hooks";
import { withTooltip } from "@c/util/hocs";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import { selectDevice } from "@s/common";
import type {
  ShippedDataObject,
  TimelineDataObject,
} from "@s/statistics/types";
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

const chartOptions = (
  monthLabel: string
): IBarChartOptions & ILineChartOptions => ({
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
});

const responsiveOptions: IResponsiveOptionTuple<ILineChartOptions>[] = [
  [
    "(min-width: 1240px) and (max-width: 1600px)",
    {
      axisX: {
        labelInterpolationFnc: (value: any, index: number) =>
          index % 2 === 0 ? value : null,
      },
    },
  ],
  [
    "(max-width: 1239px)",
    {
      axisX: {
        labelInterpolationFnc: (value: any, index: number) =>
          index % 3 === 0 ? value : null,
      },
    },
  ],
];

type ShippedCardProps = {
  data: ShippedDataObject;
  months: string[];
  breakdownData?: ShippedDataObject[];
  defaultType?: "bar" | "line";
  note?: ReactNode;
  overline?: ReactNode;
  summary?: boolean;
};

export const ShippedCard = ({
  breakdownData,
  data,
  defaultType = "bar",
  months,
  note,
  overline,
  summary,
}: ShippedCardProps) => {
  const device = useAppSelector(selectDevice);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [graphType, setGraphType] = useState<"bar" | "line">(defaultType);
  const chartData =
    selectedIndex >= 0 && summary && breakdownData
      ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[
          selectedIndex
        ]
      : data;
  const barChart =
    graphType === "bar" ? (
      <ChartistGraph
        className={
          device === "desktop" || summary
            ? "ct-double-octave"
            : "ct-major-twelfth"
        }
        data={{
          series: [
            chartData.timeline.shipped,
            chartData.timeline.unshipped,
          ] as IChartistData["series"],
          labels: months.map((label) => label.split(" ").join("\n")),
        }}
        options={chartOptions("Month (GB end)")}
        responsiveOptions={responsiveOptions}
        type={"Bar"}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ChartistGraph
        className={
          device === "desktop" || summary
            ? "ct-double-octave"
            : "ct-major-twelfth"
        }
        data={{
          series: [
            chartData.timeline.shipped,
            chartData.timeline.unshipped,
          ] as IChartistData["series"],
          labels: months.map((label) => label.split(" ").join("\n")),
        }}
        listener={listener}
        options={chartOptions("Month (GB end)")}
        responsiveOptions={responsiveOptions}
        type={"Line"}
      />
    ) : null;
  const selectChips =
    summary && breakdownData ? (
      <div className="timeline-chips-container">
        <ChipSet choice>
          {[...breakdownData]
            .sort(alphabeticalSortPropCurried("name"))
            .map((obj, index) => (
              <Chip
                key={obj.name}
                label={obj.name}
                onInteraction={() => {
                  setSelectedIndex(index === selectedIndex ? -1 : index);
                }}
                selected={index === selectedIndex}
              />
            ))}
        </ChipSet>
      </div>
    ) : null;
  return (
    <Card className="timeline-card full-span">
      <div className="title-container">
        <div className="text-container">
          {overline ? (
            <Typography tag="h3" use="overline">
              {overline}
            </Typography>
          ) : null}
          <Typography tag="h1" use="headline5">
            {data.name}
          </Typography>
          <Typography tag="p" use="subtitle2">
            {pluralise`${chartData.total} ${[chartData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon="stacked_bar_chart"
                onClick={() => {
                  setGraphType("bar");
                }}
                selected={graphType === "bar"}
              />,
              "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon="multiline_chart"
                onClick={() => {
                  setGraphType("line");
                }}
                selected={graphType === "line"}
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
        {note ? (
          <Typography className="note" tag="p" use="caption">
            {note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

type TimelinesCardProps = {
  data: TimelineDataObject;
  months: string[];
  allProfiles?: string[];
  breakdownData?: TimelineDataObject[];
  category?: string;
  defaultType?: "bar" | "line";
  focusable?: boolean;
  note?: ReactNode;
  overline?: ReactNode;
  singleTheme?: "primary" | "secondary";
  summary?: boolean;
};

export const TimelinesCard = ({
  allProfiles,
  breakdownData,
  category,
  data,
  defaultType = "bar",
  focusable,
  months,
  note,
  overline,
  singleTheme,
  summary,
}: TimelinesCardProps) => {
  const [onlyFocused, setOnlyFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [category]);
  const chartData =
    selectedIndex >= 0 && summary && breakdownData
      ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[
          selectedIndex
        ]
      : data;
  const [focused, setFocused] = useState<number[]>([]);
  const [graphType, setGraphType] = useState<"bar" | "line">(defaultType);
  const setFocus = (index: number) => {
    const newFocused = addOrRemove([...focused], index);
    setFocused(newFocused);
  };
  const focusAll = () => {
    let allIndexes: number[] = [];
    if (
      arrayEveryType(
        chartData.timeline.series,
        (series): series is { index: number } =>
          typeof series === "object" && hasKey(series, "index")
      ) &&
      chartData.timeline.series.length !== allProfiles?.length
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
  useEffect(clearFocus, [category]);
  const chartSeries =
    onlyFocused &&
    focusable &&
    allProfiles &&
    arrayEveryType(
      chartData.timeline.series,
      (series): series is { data: any; index: number } =>
        hasKey(series, "data") && hasKey(series, "index")
    ) &&
    focused.length > 0 &&
    focused.length !== chartData.timeline.series.length
      ? chartData.timeline.series.filter((series) =>
          focused.includes(series.index)
        )
      : chartData.timeline.series;
  const barChart =
    graphType === "bar" ? (
      <ChartistGraph
        className="ct-double-octave"
        data={{
          labels: months.map((label) => label.split(" ").join("\n")),
          series: chartSeries,
        }}
        options={chartOptions("Month")}
        responsiveOptions={responsiveOptions}
        type={"Bar"}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ChartistGraph
        className="ct-double-octave"
        data={{
          labels: months.map((label) => label.split(" ").join("\n")),
          series: chartSeries,
        }}
        listener={listener}
        options={chartOptions("Month")}
        responsiveOptions={responsiveOptions}
        type={"Line"}
      />
    ) : null;
  const selectChips =
    summary && breakdownData ? (
      <div className="timeline-chips-container">
        <ChipSet choice>
          {[...breakdownData]
            .sort(alphabeticalSortPropCurried("name"))
            .map((obj, index) => (
              <Chip
                key={obj.name}
                label={obj.name}
                onInteraction={() => {
                  setSelectedIndex(index === selectedIndex ? -1 : index);
                }}
                selected={index === selectedIndex}
              />
            ))}
        </ChipSet>
      </div>
    ) : null;
  const focusButtons =
    focusable && allProfiles ? (
      <>
        {withTooltip(
          <IconButton
            disabled={focused.length === chartData.timeline.series.length}
            icon={iconObject(<EyeCheck />)}
            onClick={focusAll}
          />,
          "Focus all series"
        )}
        {withTooltip(
          <IconButton
            disabled={focused.length === 0}
            icon={iconObject(<EyeRemove />)}
            onClick={clearFocus}
          />,
          "Clear focus"
        )}
        {withTooltip(
          <IconButton
            checked={onlyFocused}
            className="primary-on"
            icon={iconObject(<FilterAltOff />)}
            onClick={() => setOnlyFocused((prev) => !prev)}
            onIcon={iconObject(<FilterAlt />)}
          />,
          "Filter to focused items"
        )}
      </>
    ) : null;
  const focusChips =
    focusable && allProfiles ? (
      <div className="timeline-chips-container focus-chips">
        <ChipSet choice>
          {allProfiles.map((profile, index) => {
            if (
              chartData.timeline.profiles.includes(profile) ||
              chartData.timeline.profiles.length === 0
            ) {
              return (
                <Chip
                  key={profile}
                  className={`focus-chip focus-chip-index-${index}`}
                  icon={
                    focused.length && !focused.includes(index)
                      ? iconObject(<Circle />)
                      : "circle"
                  }
                  label={profile}
                  onInteraction={() => {
                    setFocus(index);
                  }}
                  selected={focused.includes(index)}
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
          {overline ? (
            <Typography tag="h3" use="overline">
              {overline}
            </Typography>
          ) : null}
          <Typography tag="h1" use="headline5">
            {data.name}
          </Typography>
          <Typography tag="p" use="subtitle2">
            {pluralise`${chartData.total} ${[chartData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          {focusButtons}
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon={singleTheme ? "bar_chart" : "stacked_bar_chart"}
                onClick={() => {
                  setGraphType("bar");
                }}
                selected={graphType === "bar"}
              />,
              singleTheme ? "Bar chart" : "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={singleTheme ? "show_chart" : "multiline_chart"}
                onClick={() => {
                  setGraphType("line");
                }}
                selected={graphType === "line"}
              />,
              singleTheme ? "Line chart" : "Multiline chart"
            )}
          </SegmentedButton>
        </div>
      </div>
      <div className="timeline-container">
        <div
          className={classNames(
            "timeline-chart-container timelines",
            {
              single: singleTheme,
              focused: focused.length > 0,
            },
            typeof singleTheme === "string" ? singleTheme : "",
            focused.map((index) => `series-index-${index}`)
          )}
        >
          {barChart}
          {lineChart}
        </div>
        {selectChips}
        {focusChips}
        {note ? (
          <Typography className="note" tag="p" use="caption">
            {note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};
