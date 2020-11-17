import React from "react";
import PropTypes from "prop-types";
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
        {props.data.name}
      </Typography>
      <Typography use="subtitle2" tag="p">
        {`${props.data.total} set${(props.data.total > 1 ? "s" : "")}`}
      </Typography>
      <div className="pie-container">
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
        <div className="pie-chart-container status">
          <ChartistGraph
            className="ct-octave"
            data={{
              series: [props.data.ic, props.data.preGb, props.data.liveGb, props.data.postGb],
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
        {props.data.name}
      </Typography>
      <Typography use="subtitle2" tag="p">
        {`${props.data.total} set${(props.data.total > 1 ? "s" : "")}`}
      </Typography>
      <div className="pie-container">
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
        <div className="pie-chart-container shipped">
          <ChartistGraph
            className="ct-octave"
            data={{
              series: [props.data.unshipped, props.data.shipped],
              labels: [" ", " "],
            }}
            type={"Pie"}
          />
        </div>
      </div>
    </Card>
  );
};

StatusCard.propTypes = {
  data: PropTypes.shape({
    ic: PropTypes.number,
    liveGb: PropTypes.number,
    name: PropTypes.string,
    postGb: PropTypes.number,
    preGb: PropTypes.number,
    total: PropTypes.number,
  }),
};

ShippedCard.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    shipped: PropTypes.number,
    total: PropTypes.number,
    unshipped: PropTypes.number,
  }),
};
