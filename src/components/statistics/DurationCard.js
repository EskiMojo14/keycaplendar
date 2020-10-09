import React from "react";
import ChartistGraph from "react-chartist";
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
import "./DurationCard.scss";

export const DurationCard = (props) => {
  const chart =
    props.data[0] === "All" ? (
      <div className="duration-chart-container">
        <ChartistGraph
          className={props.data[0] === "All" ? "ct-double-octave" : "ct-octave"}
          data={{
            series: [props.data[7][1]],
            labels: props.data[7][0],
          }}
          options={{
            onlyInteger: true,
            chartPadding: {
              top: 0,
              right: 0,
              bottom: 16,
              left: 16,
            },
            plugins: [
              chartistPluginAxisTitle({
                axisX: {
                  axisTitle: "Time",
                  axisClass: "ct-axis-title",
                  offset: {
                    x: 0,
                    y: 32,
                  },
                  textAnchor: "middle",
                },
                axisY: {
                  axisTitle: "Count",
                  axisClass: "ct-axis-title",
                  offset: {
                    x: 0,
                    y: 16,
                  },
                  flipTitle: true,
                },
              }),
            ],
          }}
          type={"Line"}
        />
      </div>
    ) : null;
  return (
    <Card className={"duration-card" + (props.data[0] === "All" ? " full-span" : "")}>
      <Typography use="headline5" tag="h1">
        {props.data[0]}
      </Typography>
      <Typography use="subtitle2" tag="p">
        {props.data[1] + " set" + (props.data[1] > 1 ? "s" : "")}
      </Typography>
      <div className="duration-container">
        {chart}
        <div className="table-container">
          <DataTable>
            <DataTableContent>
              <DataTableHead>
                <DataTableRow>
                  <DataTableHeadCell>Average</DataTableHeadCell>
                  <DataTableHeadCell alignEnd>
                    Time {props.durationCat === "icDate" ? "(months)" : "(days)"}
                  </DataTableHeadCell>
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                <DataTableRow>
                  <DataTableCell>Mean</DataTableCell>
                  <DataTableCell alignEnd>{props.data[2]}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Median</DataTableCell>
                  <DataTableCell alignEnd>{props.data[3]}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Mode</DataTableCell>
                  <DataTableCell alignEnd>
                    {props.data[4].length === props.data[1] ? "None" : props.data[4].join(", ")}
                  </DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Range</DataTableCell>
                  <DataTableCell alignEnd>{props.data[5]}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Standard deviation</DataTableCell>
                  <DataTableCell alignEnd>{props.data[6]}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
      </div>
    </Card>
  );
};

export default DurationCard;
