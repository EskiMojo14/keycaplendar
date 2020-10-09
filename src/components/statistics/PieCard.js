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
import "./PieCard.scss";

export const StatusCard = (props) => {
  return (
    <Card className="pie-card">
      <Typography use="headline5" tag="h1">
        {props.data[5]}
      </Typography>
      <Typography use="subtitle2" tag="p">
        {props.data[4] + " set" + (props.data[4] > 1 ? "s" : "")}
      </Typography>
      <div className="pie-container">
        <div className="table-container">
          <DataTable>
            <DataTableContent>
              <DataTableHead>
                <DataTableRow>
                  <DataTableHeadCell>Status</DataTableHeadCell>
                  <DataTableHeadCell alignEnd>Sets</DataTableHeadCell> 
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator ic"></div>IC
                  </DataTableCell>
                  <DataTableCell alignEnd>{props.data[0]}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator pre-gb"></div>Pre GB
                  </DataTableCell>
                  <DataTableCell alignEnd>{props.data[1]}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator live-gb"></div>Live GB
                  </DataTableCell>
                  <DataTableCell alignEnd>{props.data[2]}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator post-gb"></div>Post GB
                  </DataTableCell>
                  <DataTableCell alignEnd>{props.data[3]}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
        <div className="pie-chart-container status">
          <ChartistGraph
            className="ct-octave"
            data={{
              series: [props.data[0], props.data[1], props.data[2], props.data[3]],
              labels: [" ", " ", " ", " "],
            }}
            type={"Pie"}
          />
        </div>
      </div>
    </Card>
  );
};

export const ShippedCard = (props) => {
  return (
    <Card className="pie-card">
      <Typography use="headline5" tag="h1">
        {props.data[3]}
      </Typography>
      <Typography use="subtitle2" tag="p">
        {props.data[2] + " set" + (props.data[2] > 1 ? "s" : "")}
      </Typography>
      <div className="pie-container">
        <div className="table-container">
          <DataTable>
            <DataTableContent>
              <DataTableHead>
                <DataTableRow>
                  <DataTableHeadCell>Status</DataTableHeadCell>
                  <DataTableHeadCell alignEnd>Sets</DataTableHeadCell>
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator shipped"></div>Shipped
                  </DataTableCell>
                  <DataTableCell alignEnd>{props.data[0]}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator not-shipped"></div>Not shipped
                  </DataTableCell>
                  <DataTableCell alignEnd>{props.data[1]}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
        <div className="pie-chart-container shipped">
          <ChartistGraph
            className="ct-octave"
            data={{
              series: [props.data[1], props.data[0]],
              labels: [" ", " "],
            }}
            type={"Pie"}
          />
        </div>
      </div>
    </Card>
  );
};
