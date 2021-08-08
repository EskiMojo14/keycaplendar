import React from "react";
import classNames from "classnames";
import ChartistGraph from "react-chartist";
import { IPieChartOptions } from "chartist";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { pluralise } from "@s/common/functions";
import { StatusDataObject } from "@s/statistics/types";
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
import "./PieCard.scss";

const hideZero = (num: number) => num || " ";

type StatusCardProps = {
  data: StatusDataObject;
  summary?: boolean;
  overline?: React.ReactNode;
  note?: React.ReactNode;
};

export const StatusCard = (props: StatusCardProps) => {
  const device = useAppSelector(selectDevice);
  const chartOptions: IPieChartOptions = {
    showLabel: false,
    plugins: [chartistTooltip({ metaIsHTML: true })],
  };
  const sideways = props.summary && device === "desktop";
  return (
    <Card
      className={classNames("pie-card", {
        "full-span": props.summary,
        sideways,
      })}
    >
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
      <div className={classNames("pie-container", { "ct-double-octave": sideways })}>
        <div className="pie-chart-container status">
          <ChartistGraph
            className={sideways ? "ct-square" : "ct-octave"}
            data={{
              series: [
                { meta: "IC", value: props.data.ic },
                { meta: "Pre GB", value: props.data.preGb },
                { meta: "Live GB", value: props.data.liveGb },
                { meta: "Post GB", value: props.data.postGb },
              ],
              labels: [props.data.ic, props.data.preGb, props.data.liveGb, props.data.postGb].map(hideZero),
            }}
            type="Pie"
            options={chartOptions}
          />
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
                    <div className="indicator ic"></div>IC
                  </DataTableCell>
                  <DataTableCell isNumeric>{props.data.ic}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator pre-gb"></div>Pre GB
                  </DataTableCell>
                  <DataTableCell isNumeric>{props.data.preGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator live-gb"></div>Live GB
                  </DataTableCell>
                  <DataTableCell isNumeric>{props.data.liveGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator post-gb"></div>Post GB
                  </DataTableCell>
                  <DataTableCell isNumeric>{props.data.postGb}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
      </div>
      {props.note ? (
        <Typography use="caption" tag="p" className="note">
          {props.note}
        </Typography>
      ) : null}
    </Card>
  );
};
