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
  note?: ReactNode;
  overline?: ReactNode;
  summary?: boolean;
};

export const StatusCard = ({
  breakdownData,
  data,
  note,
  overline,
  summary,
}: StatusCardProps) => {
  const device = useAppSelector(selectDevice);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const chartData =
    selectedIndex >= 0 && summary && breakdownData
      ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[
          selectedIndex
        ]
      : data;
  const chartOptions: IPieChartOptions = {
    donut: true,
    donutWidth: "50%",
    plugins: [chartistTooltip()],
    showLabel: false,
  };
  const sideways = summary && device === "desktop";
  const selectChips =
    summary && breakdownData ? (
      <div className="pie-chips-container">
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
    <Card
      className={classNames("pie-card", {
        "full-span": summary,
        sideways,
      })}
    >
      <div className="title-container">
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
      <div
        className={classNames("pie-container", {
          "ct-double-octave": sideways,
        })}
      >
        <div className="pie-chart-container status">
          <ChartistGraph
            className={sideways ? "ct-square" : "ct-octave"}
            data={{
              labels: [
                chartData.ic,
                chartData.preGb,
                chartData.liveGb,
                chartData.postGb,
              ],
              series: [
                { meta: "IC", value: chartData.ic },
                { meta: "Pre GB", value: chartData.preGb },
                { meta: "Live GB", value: chartData.liveGb },
                { meta: "Post GB", value: chartData.postGb },
              ],
            }}
            options={chartOptions}
            type="Pie"
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
        <Typography className="note" tag="p" use="caption">
          {note}
        </Typography>
      ) : null}
    </Card>
  );
};
