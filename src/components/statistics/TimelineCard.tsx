import React, { useState } from "react";
import Chartist from "chartist";
import ChartistGraph from "react-chartist";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { addOrRemove, hasKey, iconObject } from "@s/common/functions";
import { ChartData, ChartSeriesItem, ShippedDataObject, TimelineDataObject } from "@s/statistics/types";
import { Card } from "@rmwc/card";
import { ChipSet, Chip } from "@rmwc/chip";
import { IconButton } from "@rmwc/icon-button";
import { Typography } from "@rmwc/typography";
import {
  DataTable,
  DataTableContent,
  DataTableHead,
  DataTableRow,
  DataTableHeadCell,
  DataTableBody,
  DataTableCell,
} from "@rmwc/data-table";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/SegmentedButton";
import "./TimelineCard.scss";
import { withTooltip } from "@c/util/HOCs";

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

type ShippedCardProps = {
  data: ShippedDataObject;
};

const chartOptions = (monthLabel: string) => {
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
      chartistTooltip({ metaIsHTML: true, pointClass: "ct-stroked-point" }),
    ],
  };
};

const responsiveOptions = [
  [
    "(min-width: 960px) and (max-width: 1600px)",
    {
      axisX: {
        labelInterpolationFnc: (value: any, index: number) => {
          return index % 2 === 0 ? value : null;
        },
      },
    },
  ],
  [
    "(min-width: 840px) and (max-width: 959px)",
    {
      axisX: {
        labelInterpolationFnc: (value: any, index: number) => {
          return index % 3 === 0 ? value : null;
        },
      },
    },
  ],
  [
    "(max-width: 849px)",
    {
      axisX: {
        labelInterpolationFnc: (value: any, index: number) => {
          return index % 3 === 0 ? value : null;
        },
      },
    },
  ],
];

export const ShippedCard = (props: ShippedCardProps) => {
  const device = useAppSelector(selectDevice);
  return (
    <Card className="timeline-card half-span">
      <Typography use="headline5" tag="h1">
        {props.data.name}
      </Typography>
      <Typography use="subtitle2" tag="p">
        {`${props.data.total} set${props.data.total === 1 ? "" : "s"}`}
      </Typography>
      <div className="timeline-container">
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
                  <DataTableCell isNumeric>{props.data.shipped}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator not-shipped"></div>Not shipped
                  </DataTableCell>
                  <DataTableCell isNumeric>{props.data.unshipped}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
        <div className="timeline-chart-container shipped">
          <ChartistGraph
            className={device === "desktop" ? "ct-double-octave" : "ct-major-twelfth"}
            data={{
              series: [
                props.data.timeline.series.map((item) => item.shipped),
                props.data.timeline.series.map((item) => item.unshipped),
              ],
              labels: props.data.timeline.months.map((label) => label.split(" ").join("\n")),
            }}
            type={"Bar"}
            options={chartOptions("Month (GB end)")}
            responsiveOptions={responsiveOptions}
          />
        </div>
      </div>
    </Card>
  );
};

type TimelinesCardProps = {
  allProfiles: string[];
  profileGroups?: boolean;
  category?: string;
  data: TimelineDataObject;
};

const isDataObjects = (series: ChartData): series is { data: ChartSeriesItem[]; className?: string }[] =>
  hasKey(series[0], "data");

export const TimelinesCard = (props: TimelinesCardProps) => {
  const [onlyFocused, setOnlyFocused] = useState(false);
  const [focused, setFocused] = useState<number[]>([]);
  const [graphType, setGraphType] = useState("bar");
  const setFocus = (index: number) => {
    const newFocused = addOrRemove(focused, index);
    setFocused(newFocused);
  };
  const clearFocus = () => {
    setFocused([]);
  };
  const chartSeries =
    onlyFocused &&
    !props.profileGroups &&
    isDataObjects(props.data.timeline.series) &&
    focused.length > 0 &&
    focused.length !== props.data.timeline.series.length
      ? props.data.timeline.series.filter((_series, index) => focused.includes(index))
      : props.data.timeline.series;
  const barChart =
    graphType === "bar" ? (
      <ChartistGraph
        className="ct-double-octave"
        data={{
          labels: props.data.timeline.months.map((label) => label.split(" ").join("\n")),
          series: chartSeries,
        }}
        type={"Bar"}
        options={chartOptions(`Month${props.category ? ` (${props.category})` : ""}`)}
        responsiveOptions={responsiveOptions}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ChartistGraph
        className="ct-double-octave"
        data={{
          labels: props.data.timeline.months.map((label) => label.split(" ").join("\n")),
          series: chartSeries,
        }}
        type={"Line"}
        listener={listener}
        options={chartOptions(`Month${props.category ? ` (${props.category})` : ""}`)}
        responsiveOptions={responsiveOptions}
      />
    ) : null;
  const onlyFocusedButton = !props.profileGroups
    ? withTooltip(
        <IconButton
          className="primary-on"
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px" width="24px">
              <g>
                <path d="M0,0H24m0,24H0" fill="none" />
                <path d="M9.28418,6,7.30438,4H18.95a.99777.99777,0,0,1,.79,1.61c-1.37195,1.75909-3.52557,4.53436-4.76782,6.1361l-1.40943-1.42382L17,6ZM22,21.5l-8-8.08167v-.04107l-1.58966-1.6059-.01813.02283L8.37476,7.73572,8.212,7.53027,4.75763,4.04059c-.01019.00293-.01849.009-.02857.01227L2.4,1.7,1.1,3,6.34009,8.29358C8.14319,10.6106,10,13,10,13v6a1.003,1.003,0,0,0,1,1h2a1.003,1.003,0,0,0,1-1V16.03162L20.7,22.8Z" />
                <path d="M0,0H24V24H0Z" fill="none" />
              </g>
              <polygon points="13.563 10.322 17 6 9.284 6 13.563 10.322" opacity="0.3" />
            </svg>
          )}
          onIcon={iconObject(
            <svg
              xmlns="http://www.w3.org/2000/svg"
              enableBackground="new 0 0 24 24"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
            >
              <g>
                <path d="M0,0h24 M24,24H0" fill="none" />
                <path d="M7,6h10l-5.01,6.3L7,6z M4.25,5.61C6.27,8.2,10,13,10,13v6c0,0.55,0.45,1,1,1h2c0.55,0,1-0.45,1-1v-6 c0,0,3.72-4.8,5.74-7.39C20.25,4.95,19.78,4,18.95,4H5.04C4.21,4,3.74,4.95,4.25,5.61z" />
                <path d="M0,0h24v24H0V0z" fill="none" />
              </g>
              <polygon opacity=".3" points="7,6 17,6 11.99,12.3" />
            </svg>
          )}
          checked={onlyFocused}
          onClick={() => setOnlyFocused((prev) => !prev)}
        />,
        "Filter to focused items"
      )
    : null;
  return (
    <Card className="timeline-card full-span">
      <div className="title-container">
        <div className="text-container">
          <Typography use="headline5" tag="h1">
            {props.data.name}
          </Typography>
          <Typography use="subtitle2" tag="p">
            {`${props.data.total} set${props.data.total === 1 ? "" : "s"}`}
          </Typography>
        </div>
        <div className="button-container">
          {onlyFocusedButton}
          <SegmentedButton toggle>
            <SegmentedButtonSegment
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21M18,14H22V16H18V14M12,6H16V9H12V6M16,15H12V10H16V15M6,10H10V12H6V10M10,16H6V13H10V16Z" />
                </svg>
              )}
              selected={graphType === "bar"}
              onClick={() => {
                setGraphType("bar");
              }}
            />
            <SegmentedButtonSegment
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
                </svg>
              )}
              selected={graphType === "line"}
              onClick={() => {
                setGraphType("line");
              }}
            />
          </SegmentedButton>
        </div>
      </div>
      <div className="timeline-container">
        <div
          className={classNames(
            "timeline-chart-container timelines",
            {
              single: props.profileGroups,
              focused: focused.length > 0,
            },
            focused.map((index) => `series-index-${index}`)
          )}
        >
          {barChart}
          {lineChart}
        </div>
        {!props.profileGroups ? (
          <div className="timeline-chips-container focus-chips">
            <IconButton icon="clear" disabled={focused.length === 0} onClick={clearFocus} />
            <ChipSet choice>
              {props.allProfiles.map((profile, index) => {
                if (props.data.timeline.profiles.includes(profile)) {
                  return (
                    <Chip
                      key={profile}
                      icon="fiber_manual_record"
                      label={profile}
                      selected={focused.includes(index)}
                      onInteraction={() => {
                        setFocus(index);
                      }}
                      className={`focus-chip-index-${index}`}
                    />
                  );
                }
                return null;
              })}
            </ChipSet>
          </div>
        ) : null}
      </div>
    </Card>
  );
};

type CountCardProps = {
  title: string;
  category?: string;
  disclaimer?: boolean;
  data: {
    total: number;
    months: string[];
    series: ChartData;
  };
};

export const CountCard = (props: CountCardProps) => {
  const [graphType, setGraphType] = useState("line");
  const barChart =
    graphType === "bar" ? (
      <ChartistGraph
        className="ct-double-octave"
        data={{
          series: props.data.series,
          labels: props.data.months.map((label) => label.split(" ").join("\n")),
        }}
        type={"Bar"}
        options={chartOptions(`Month${props.category ? ` (${props.category})` : ""}`)}
        responsiveOptions={responsiveOptions}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ChartistGraph
        className="ct-double-octave"
        data={{
          series: props.data.series,
          labels: props.data.months.map((label) => label.split(" ").join("\n")),
        }}
        type={"Line"}
        listener={listener}
        options={chartOptions(`Month${props.category ? ` (${props.category})` : ""}`)}
        responsiveOptions={responsiveOptions}
      />
    ) : null;
  return (
    <Card className="timeline-card full-span">
      <div className="title-container">
        <div className="text-container">
          <Typography use="headline5" tag="h1">
            {props.title}
          </Typography>
          <Typography use="subtitle2" tag="p">
            {`${props.data.total} set${props.data.total === 1 ? "" : "s"}`}
          </Typography>
        </div>
        <div className="button-container">
          <SegmentedButton toggle>
            <SegmentedButtonSegment
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21M18,14H22V16H18V14M12,6H16V9H12V6M16,15H12V10H16V15M6,10H10V12H6V10M10,16H6V13H10V16Z" />
                </svg>
              )}
              selected={graphType === "bar"}
              onClick={() => {
                setGraphType("bar");
              }}
            />
            <SegmentedButtonSegment
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
                </svg>
              )}
              selected={graphType === "line"}
              onClick={() => {
                setGraphType("line");
              }}
            />
          </SegmentedButton>
        </div>
      </div>
      <div className="timeline-container">
        <div className="timeline-chart-container timelines count-graph">
          {barChart}
          {lineChart}
        </div>
        {props.disclaimer ? (
          <Typography use="caption" tag="p">
            Based on the data included in KeycapLendar. Earlier data will be less representative, as not all sets are
            included. KeycapLendar began tracking GBs in June 2019, and began tracking ICs in December 2019.
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};
