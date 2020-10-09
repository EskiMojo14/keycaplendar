import React from "react";
import ChartistGraph from "react-chartist";
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
  return (
    <Card className={"duration-card" + (props.data[0] === "All" ? " full-span" : "")}>
      <Typography use="headline5" tag="h1">
        {props.data[0]}
      </Typography>
      <Typography use="subtitle2" tag="p">
        {props.data[1] + " set" + (props.data[1] > 1 ? "s" : "")}
      </Typography>
      <div className="duration-container">
        <div className="table-container">
          <DataTable>
            <DataTableContent>
              <DataTableHead>
                <DataTableRow>
                  <DataTableHeadCell>Average</DataTableHeadCell>
                  <DataTableHeadCell alignEnd>Time (days)</DataTableHeadCell>
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
        {/*<div className="pie-chart-container status">
          <ChartistGraph
            className="ct-octave"
            data={{
              series: [props.data[0], props.data[1], props.data[2], props.data[3]],
              labels: [" ", " ", " ", " "],
            }}
            type={"Pie"}
          />
          </div>*/}
      </div>
    </Card>
  );
};

export default DurationCard;
