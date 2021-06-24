import React, { useState } from "react";
import Chartist from "chartist";
import ChartistGraph from "react-chartist";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common/commonSlice";
import { addOrRemove, iconObject } from "@s/common/functions";
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

const letters = "abcdefghijklmnopqrstuvwxyz".split("");

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
  data: {
    name: string;
    shipped: number;
    total: number;
    unshipped: number;
    timeline: {
      months: string[];
      series: {
        [key: string]: {
          meta: string;
          value: number;
        };
      }[];
    };
  };
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
  data: {
    name: string;
    total: number;
    timeline: {
      months: string[];
      profiles: string[];
      series:
        | {
            meta: string;
            value: number;
          }[][]
        | number[][];
    };
  };
};

export const TimelinesCard = (props: TimelinesCardProps) => {
  const [focused, setFocused] = useState<string[]>([]);
  const [graphType, setGraphType] = useState("bar");
  const setFocus = (letter: string) => {
    const newFocused = addOrRemove(focused, letter);
    setFocused(newFocused);
  };
  const clearFocus = () => {
    setFocused([]);
  };
  const barChart =
    graphType === "bar" ? (
      <ChartistGraph
        className="ct-double-octave"
        data={{
          series: props.data.timeline.series,
          labels: props.data.timeline.months.map((label) => label.split(" ").join("\n")),
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
          series: props.data.timeline.series,
          labels: props.data.timeline.months.map((label) => label.split(" ").join("\n")),
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
            {props.data.name}
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
        <div
          className={classNames(
            "timeline-chart-container timelines",
            {
              single: props.profileGroups,
              focused: focused.length > 0,
            },
            focused.map((letter) => "series-" + letter)
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
                      selected={focused.includes(letters[index])}
                      onInteraction={() => {
                        setFocus(letters[index]);
                      }}
                      className={"focus-chip-" + letters[index]}
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
    series: number[][];
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
