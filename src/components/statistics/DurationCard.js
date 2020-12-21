import React from "react";
import PropTypes from "prop-types";
import Chartist from "chartist";
import ChartistGraph from "react-chartist";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import classNames from "classnames";
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

const customPoint = (data) => {
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

const listener = { draw: (e) => customPoint(e) };

export const DurationCard = (props) => {
  const chart =
    props.data.name === "All" ? (
      <div className="duration-chart-container">
        <ChartistGraph
          className={props.data.name === "All" ? "ct-double-octave" : "ct-octave"}
          data={{
            series: [props.data.chartData[1]],
            labels: props.data.chartData[0],
          }}
          options={{
            showArea: true,
            chartPadding: {
              top: 16,
              right: 0,
              bottom: 16,
              left: 16,
            },
            axisY: {
              onlyInteger: true,
            },
            plugins: [
              chartistPluginAxisTitle({
                axisX: {
                  axisTitle: "Time",
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
          }}
          listener={listener}
          type={"Line"}
        />
      </div>
    ) : null;
  return (
    <Card className={classNames("duration-card", { "full-span": props.data.name === "All" })}>
      <Typography use="headline5" tag="h1">
        {props.data.name}
      </Typography>
      <Typography use="subtitle2" tag="p">
        {`${props.data.total} set${props.data.total > 1 ? "s" : ""}`}
      </Typography>
      <div className="duration-container">
        {chart}
        <div className="table-container">
          <DataTable className="rounded">
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
      </div>
    </Card>
  );
};

export default DurationCard;

DurationCard.propTypes = {
  data: PropTypes.shape({
    chartData: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    mean: PropTypes.number,
    median: PropTypes.number,
    mode: PropTypes.arrayOf(PropTypes.number),
    name: PropTypes.string,
    range: PropTypes.string,
    standardDev: PropTypes.number,
    total: PropTypes.number,
  }),
  durationCat: PropTypes.string,
};
