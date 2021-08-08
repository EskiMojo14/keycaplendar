import React, { useState } from "react";
import Chartist, { ILineChartOptions } from "chartist";
import ChartistGraph from "react-chartist";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import classNames from "classnames";
import { is } from "typescript-is";
import { pluralise } from "@s/common/functions";
import { DurationDataObject, VendorDataObject } from "@s/statistics/types";
import { Card } from "@rmwc/card";
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
import "./TableCard.scss";

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

type TableCardProps = {
  data: DurationDataObject | VendorDataObject;
  unit: string;
  defaultType?: "bar" | "line";
  overline?: React.ReactNode;
  note?: React.ReactNode;
  summary?: boolean;
};

export const TableCard = (props: TableCardProps) => {
  const [graphType, setGraphType] = useState<"bar" | "line">(props.defaultType || "line");
  const chartOptions: ILineChartOptions = {
    showArea: true,
    chartPadding: {
      top: 16,
      right: 0,
      bottom: 16,
      left: 16,
    },
    axisX: {
      labelInterpolationFnc: (value: number, index: number) => {
        return is<Array<any>>(props.data.chartData.series[0]) && props.data.chartData.series[0].length >= 16
          ? index % (props.data.chartData.series[0].length >= 24 && !props.summary ? 3 : 2) === 0
            ? value
            : null
          : value;
      },
    },
    axisY: {
      onlyInteger: true,
    },
    plugins: [
      chartistPluginAxisTitle({
        axisX: {
          axisTitle: props.unit.split(" ")[0],
          axisClass: "ct-axis-title",
          offset: {
            x: 0,
            y: 40,
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
  const barChart =
    graphType === "bar" ? (
      <ChartistGraph
        type="Bar"
        className={classNames("ct-double-octave", {
          "min-width": props.summary,
        })}
        data={{ ...props.data.chartData }}
        options={chartOptions}
        listener={listener}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ChartistGraph
        type="Line"
        className={classNames("ct-double-octave", {
          "min-width": props.summary,
        })}
        data={{ ...props.data.chartData }}
        options={chartOptions}
        listener={listener}
      />
    ) : null;
  return (
    <Card className={classNames("table-card", { "full-span": props.summary })}>
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
            {pluralise`${props.data.total} ${[props.data.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon="bar_chart"
                selected={graphType === "bar"}
                onClick={() => {
                  setGraphType("bar");
                }}
              />,
              "Bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon="show_chart"
                selected={graphType === "line"}
                onClick={() => {
                  setGraphType("line");
                }}
              />,
              "Line chart"
            )}
          </SegmentedButton>
        </div>
      </div>
      <div className="content-container">
        <div className="chart-container">
          {barChart}
          {lineChart}
        </div>
        <div className="table-container">
          <DataTable className="rounded">
            <DataTableContent>
              <DataTableHead>
                <DataTableRow>
                  <DataTableHeadCell>Average</DataTableHeadCell>
                  <DataTableHeadCell alignEnd>{props.unit}</DataTableHeadCell>
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                <DataTableRow>
                  <DataTableCell>Mean</DataTableCell>
                  <DataTableCell alignEnd>{props.data.mean}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Median</DataTableCell>
                  <DataTableCell alignEnd>{props.data.median}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Mode</DataTableCell>
                  <DataTableCell alignEnd>
                    {props.data.mode.length === props.data.total ? "None" : props.data.mode.join(", ")}
                  </DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Range</DataTableCell>
                  <DataTableCell alignEnd>{props.data.range}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Standard deviation</DataTableCell>
                  <DataTableCell alignEnd>{props.data.standardDev}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
        {props.note ? (
          <Typography use="caption" tag="p" className="note">
            {props.note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

export default TableCard;
