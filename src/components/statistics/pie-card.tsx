import { useState } from "react";
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
import type { IPieChartOptions } from "chartist";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import classNames from "classnames";
import ChartistGraph from "react-chartist";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import type { StatusDataObject } from "@s/statistics/types";
import { alphabeticalSortPropCurried, pluralise } from "@s/util/functions";
import "./pie-card.scss";

type StatusCardProps = {
  data: StatusDataObject;
  breakdownData?: StatusDataObject[];
  summary?: boolean;
  overline?: ReactNode;
  note?: ReactNode;
};

export const StatusCard = ({ data, breakdownData, summary, overline, note }: StatusCardProps) => {
  const device = useAppSelector(selectDevice);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const chartData =
    selectedIndex >= 0 && summary && breakdownData
      ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : data;
  const chartOptions: IPieChartOptions = {
    donut: true,
    donutWidth: "50%",
    showLabel: false,
    plugins: [chartistTooltip()],
  };
  const sideways = summary && device === "desktop";
  const selectChips =
    summary && breakdownData ? (
      <div className="pie-chips-container">
        <ChipSet choice>
          {[...breakdownData].sort(alphabeticalSortPropCurried("name")).map((obj, index) => (
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
    <Card
      className={classNames("pie-card", {
        "full-span": summary,
        sideways,
      })}
    >
      <div className="title-container">
        {overline ? (
          <Typography use="overline" tag="h3">
            {overline}
          </Typography>
        ) : null}
        <Typography use="headline5" tag="h1">
          {data.name}
        </Typography>
        <Typography use="subtitle2" tag="p">
          {pluralise`${chartData.total} ${[chartData.total, "set"]}`}
        </Typography>
      </div>
      <div className={classNames("pie-container", { "ct-double-octave": sideways })}>
        <div className="pie-chart-container status">
          <ChartistGraph
            className={sideways ? "ct-square" : "ct-octave"}
            data={{
              series: [
                { meta: "IC", value: chartData.ic },
                { meta: "Pre GB", value: chartData.preGb },
                { meta: "Live GB", value: chartData.liveGb },
                { meta: "Post GB", value: chartData.postGb },
              ],
              labels: [chartData.ic, chartData.preGb, chartData.liveGb, chartData.postGb],
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
                  <DataTableCell isNumeric>{chartData.ic}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator pre-gb"></div>Pre GB
                  </DataTableCell>
                  <DataTableCell isNumeric>{chartData.preGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator live-gb"></div>Live GB
                  </DataTableCell>
                  <DataTableCell isNumeric>{chartData.liveGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator post-gb"></div>Post GB
                  </DataTableCell>
                  <DataTableCell isNumeric>{chartData.postGb}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
      </div>
      {selectChips}
      {note ? (
        <Typography use="caption" tag="p" className="note">
          {note}
        </Typography>
      ) : null}
    </Card>
  );
};
