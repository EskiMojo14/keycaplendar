import React from "react";
import ChartistGraph from "react-chartist";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
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
import "./TimelineCard.scss";

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

const chartOptions = {
  showArea: true,
  stackBars: true,
  low: 0,
  axisY: {
    onlyInteger: true,
  },
  chartPadding: {
    top: 16,
    right: 0,
    bottom: 16,
    left: 16,
  },
  plugins: [
    chartistPluginAxisTitle({
      axisX: {
        axisTitle: "Month (GB End)",
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
    chartistTooltip({ metaIsHTML: true, pointClass: "ct-stroked-point" }),
  ],
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
            className="ct-double-octave"
            data={{
              series: [
                props.data.timeline.series.map((item) => item.shipped),
                props.data.timeline.series.map((item) => item.unshipped),
              ],
              labels: props.data.timeline.months,
            }}
            type={"Bar"}
            options={chartOptions}
            responsiveOptions={responsiveOptions}
          />
        </div>
      </div>
    </Card>
  );
};
