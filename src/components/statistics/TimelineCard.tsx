import React, { useState } from "react";
import Chartist from "chartist";
import ChartistGraph from "react-chartist";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { addOrRemove, arrayEveryType, hasKey, iconObject } from "@s/common/functions";
import { ChartSeriesItem, ShippedDataObject, TimelineDataObject } from "@s/statistics/types";
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
import { withTooltip } from "@c/util/HOCs";
import "./TimelineCard.scss";
import { useEffect } from "react";

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
  allProfiles?: string[];
  months: string[];
  singleTheme?: "primary" | "secondary";
  defaultType?: "bar" | "line";
  category?: string;
  data: TimelineDataObject;
  focusable?: boolean;
  overline?: React.ReactNode;
  note?: React.ReactNode;
};

export const TimelinesCard = (props: TimelinesCardProps) => {
  const [onlyFocused, setOnlyFocused] = useState(false);
  const [focused, setFocused] = useState<number[]>([]);
  const [graphType, setGraphType] = useState<"bar" | "line">(props.defaultType || "bar");
  const setFocus = (index: number) => {
    const newFocused = addOrRemove(focused, index);
    setFocused(newFocused);
  };
  const focusAll = () => {
    const allIndexes = Array(props.data.timeline.series.length)
      .fill("")
      .map((v, i) => i);
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
    arrayEveryType<{ data: ChartSeriesItem[]; className?: string }>(props.data.timeline.series, (series) =>
      hasKey(series, "data")
    ) &&
    focused.length > 0 &&
    focused.length !== props.data.timeline.series.length
      ? props.data.timeline.series.filter((series) => focused.includes(series.index || -1))
      : props.data.timeline.series;
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
  const focusButtons =
    props.focusable && props.allProfiles ? (
      <>
        {withTooltip(
          <IconButton
            icon={iconObject(
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px" width="24px">
                  <path d="M0,0H24V24H0Z" fill="none" />
                  <path
                    d="M13.71655,16.15582a4.5119,4.5119,0,1,1,2.43927-2.43927,5.9945,5.9945,0,0,1,4.01758-.60016A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.96389,5.96389,0,0,1,13.71655,16.15582Z"
                    opacity="0.3"
                  />
                  <path d="M12,7.5a4.5,4.5,0,1,0,1.71655,8.65582,6.02548,6.02548,0,0,1,2.43927-2.43927A4.49209,4.49209,0,0,0,12,7.5Zm0,7A2.5,2.5,0,1,1,14.5,12,2.50091,2.50091,0,0,1,12,14.5Zm1.02289,4.95294C12.68549,19.48193,12.345,19.5,12,19.5A11.82679,11.82679,0,0,1,1,12a11.81667,11.81667,0,0,1,22,0,11.81143,11.81143,0,0,1-.93243,1.85028,5.952,5.952,0,0,0-1.89417-.73389A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.99107,5.99107,0,0,0,13,19C13,19.15289,13.01166,19.30292,13.02289,19.45294ZM23.5,17l-5,5L15,18.5,16.5,17l2,2L22,15.5,23.5,17" />
                </svg>
              </div>
            )}
            disabled={focused.length === props.data.timeline.series.length}
            onClick={focusAll}
          />,
          "Focus all series"
        )}
        {withTooltip(
          <IconButton
            icon={iconObject(
              <div>
                <svg viewBox="0 0 24 24" height="24px" width="24px">
                  <path d="M0,0H24V24H0Z" fill="none" />
                  <path
                    d="M13.71655,16.15582a4.5119,4.5119,0,1,1,2.43927-2.43927,5.9945,5.9945,0,0,1,4.01758-.60016A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.96389,5.96389,0,0,1,13.71655,16.15582Z"
                    opacity="0.3"
                  />
                  <path d="M12,7.5a4.5,4.5,0,1,0,1.71655,8.65582,6.02548,6.02548,0,0,1,2.43927-2.43927A4.49209,4.49209,0,0,0,12,7.5Zm0,7A2.5,2.5,0,1,1,14.5,12,2.50091,2.50091,0,0,1,12,14.5Zm1.02289,4.95294C12.68549,19.48193,12.345,19.5,12,19.5A11.82679,11.82679,0,0,1,1,12a11.81667,11.81667,0,0,1,22,0,11.81143,11.81143,0,0,1-.93243,1.85028,5.952,5.952,0,0,0-1.89417-.73389A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.99107,5.99107,0,0,0,13,19C13,19.15289,13.01166,19.30292,13.02289,19.45294ZM22.54,16.88,20.41,19l2.13,2.12-1.42,1.42L19,20.41l-2.12,2.13-1.41-1.42L17.59,19l-2.12-2.12,1.41-1.41L19,17.59l2.12-2.12,1.42,1.41" />
                </svg>
              </div>
            )}
            disabled={focused.length === 0}
            onClick={clearFocus}
          />,
          "Clear focus"
        )}
        {withTooltip(
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
        )}
      </>
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
            {`${props.data.total} set${props.data.total === 1 ? "" : "s"}`}
          </Typography>
        </div>
        <div className="button-container">
          {focusButtons}
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
              single: props.singleTheme,
              focused: focused.length > 0,
            },
            props.singleTheme,
            focused.map((index) => `series-index-${index}`)
          )}
        >
          {barChart}
          {lineChart}
        </div>
        {props.focusable && props.allProfiles ? (
          <div className="timeline-chips-container focus-chips">
            <ChipSet choice>
              {props.allProfiles.map((profile, index) => {
                if (props.data.timeline.profiles.includes(profile) || props.data.timeline.profiles.length === 0) {
                  return (
                    <Chip
                      key={profile}
                      icon={
                        focused.length && !focused.includes(index)
                          ? iconObject(
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                                <g>
                                  <rect fill="none" height="24" width="24" />
                                </g>
                                <g>
                                  <g>
                                    <circle cx="12" cy="12" opacity=".3" r="8" />
                                    <path d="M12,2C6.47,2,2,6.47,2,12c0,5.53,4.47,10,10,10s10-4.47,10-10C22,6.47,17.53,2,12,2z M12,20c-4.42,0-8-3.58-8-8 c0-4.42,3.58-8,8-8s8,3.58,8,8C20,16.42,16.42,20,12,20z" />
                                  </g>
                                </g>
                              </svg>
                            )
                          : "circle"
                      }
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
        ) : null}
        {props.note ? (
          <Typography use="caption" tag="p" className="note">
            {props.note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};
