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
import { Typography } from "@rmwc/typography";
import Chartist from "chartist";
import type { ILineChartOptions } from "chartist";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import classNames from "classnames";
import ChartistGraph from "react-chartist";
import { is } from "typescript-is";
import { withTooltip } from "@c/util/hocs";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import type {
  Categories,
  DurationDataObject,
  VendorDataObject,
} from "@s/statistics/types";
import { alphabeticalSortPropCurried, pluralise } from "@s/util/functions";
import "./table-card.scss";

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
  category?: Categories;
  defaultType?: "bar" | "line";
  breakdownData?: DurationDataObject[] | VendorDataObject[];
  overline?: ReactNode;
  note?: ReactNode;
  summary?: boolean;
};

export const TableCard = ({
  breakdownData,
  category,
  data,
  defaultType,
  note,
  overline,
  summary,
  unit,
}: TableCardProps) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [category]);
  const chartData =
    selectedIndex >= 0 && summary && breakdownData
      ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[
          selectedIndex
        ]
      : data;
  const [graphType, setGraphType] = useState<"bar" | "line">(
    defaultType || "line"
  );
  const chartOptions: ILineChartOptions = {
    showArea: true,
    chartPadding: {
      top: 16,
      right: 0,
      bottom: 16,
      left: 16,
    },
    axisX: {
      labelInterpolationFnc: (value: number, index: number) =>
        is<any[]>(chartData.chartData.series[0]) &&
        chartData.chartData.series[0].length >= 16
          ? index %
              (chartData.chartData.series[0].length >= 24 && !summary
                ? 3
                : 2) ===
            0
            ? value
            : null
          : value,
    },
    axisY: {
      onlyInteger: true,
    },
    plugins: [
      chartistPluginAxisTitle({
        axisX: {
          axisTitle: unit.split(" ")[0],
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
        className="ct-double-octave"
        data={{ ...chartData.chartData }}
        listener={listener}
        options={chartOptions}
        type="Bar"
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ChartistGraph
        className="ct-double-octave"
        data={{ ...chartData.chartData }}
        listener={listener}
        options={chartOptions}
        type="Line"
      />
    ) : null;
  const selectChips =
    summary && breakdownData ? (
      <div className="table-chips-container">
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
    <Card className={classNames("table-card", { "full-span": summary })}>
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
                icon="bar_chart"
                onClick={() => {
                  setGraphType("bar");
                }}
                selected={graphType === "bar"}
              />,
              "Bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon="show_chart"
                onClick={() => {
                  setGraphType("line");
                }}
                selected={graphType === "line"}
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
                  <DataTableHeadCell alignEnd>{unit}</DataTableHeadCell>
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                <DataTableRow>
                  <DataTableCell>Mean</DataTableCell>
                  <DataTableCell alignEnd>{chartData.mean}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Median</DataTableCell>
                  <DataTableCell alignEnd>{chartData.median}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Mode</DataTableCell>
                  <DataTableCell alignEnd>
                    {chartData.mode.length === chartData.total
                      ? "None"
                      : chartData.mode.join(", ")}
                  </DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Range</DataTableCell>
                  <DataTableCell alignEnd>{chartData.range}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Standard deviation</DataTableCell>
                  <DataTableCell alignEnd>
                    {chartData.standardDev}
                  </DataTableCell>
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

export default TableCard;
