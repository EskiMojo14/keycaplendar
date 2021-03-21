import React, { useContext, useState } from "react";
import ChartistGraph from "react-chartist";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import classNames from "classnames";
import { DeviceContext } from "../../util/contexts";
import { iconObject } from "../../util/functions";
import { Card } from "@rmwc/card";
import { ChipSet, Chip } from "@rmwc/chip";
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
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./TimelineCard.scss";

const letters = "abcdefghijklmnopqrstuvwxyz".split("");

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
  const device = useContext(DeviceContext);
  return (
    <Card className="timeline-card half-span">
      <Typography use="headline5" tag="h1">
        {props.data.name}
      </Typography>
      <Typography use="subtitle2" tag="p">
        {`${props.data.total} set${props.data.total > 1 ? "s" : ""}`}
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
  profileGroups: boolean;
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
  const [focused, setFocused] = useState("");
  const [graphType, setGraphType] = useState("bar");
  const setFocus = (letter: string) => {
    setFocused(letter !== focused ? letter : "");
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
        options={chartOptions("Month (GB start)")}
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
        options={chartOptions("Month (GB start)")}
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
            {`${props.data.total} set${props.data.total > 1 ? "s" : ""}`}
          </Typography>
        </div>
        <div className="button-container">
          <ToggleGroup>
            <ToggleGroupButton
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
            <ToggleGroupButton
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
          </ToggleGroup>
        </div>
      </div>
      <div className="timeline-container">
        <div
          className={classNames("timeline-chart-container timelines", {
            single: props.profileGroups,
            focused: focused,
            ["series-" + focused]: focused,
          })}
        >
          {barChart}
          {lineChart}
        </div>
        {!props.profileGroups ? (
          <div className="timeline-chips-container focus-chips">
            <ChipSet choice>
              {props.data.timeline.profiles.map((profile, index) => {
                return (
                  <Chip
                    key={profile}
                    icon="fiber_manual_record"
                    label={profile}
                    selected={focused === letters[index]}
                    onInteraction={() => {
                      setFocus(letters[index]);
                    }}
                    className={"focus-chip-" + letters[index]}
                  />
                );
              })}
            </ChipSet>
          </div>
        ) : null}
      </div>
    </Card>
  );
};
