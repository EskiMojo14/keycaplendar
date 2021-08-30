import React, { useState, useEffect, useContext, useMemo } from "react";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { selectCurrentThemeMap } from "@s/common";
import { getTextColour } from "@s/common/functions";
import { ThemeMap } from "@s/common/types";
import { filterLabels } from "@s/statistics/functions";
import { Categories, CountDataObject } from "@s/statistics/types";
import { alphabeticalSortPropCurried, pluralise } from "@s/util/functions";
import { Chip, ChipSet } from "@rmwc/chip";
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
import { BarTooltipProps, ResponsiveBar } from "@nivo/bar";
import { BasicTooltip } from "@nivo/tooltip";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/SegmentedButton";
import { withTooltip } from "@c/util/HOCs";
import { NivoThemeContext } from "@c/util/ThemeProvider";
import "./TableCard.scss";

type TableCardProps = {
  data: CountDataObject;
  unit: string;
  category?: Categories;
  defaultType?: "bar" | "line";
  theme?: Exclude<keyof ThemeMap, "dark">;
  breakdownData?: CountDataObject[];
  overline?: React.ReactNode;
  note?: React.ReactNode;
  summary?: boolean;
};

export const TableCard = (props: TableCardProps) => {
  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [props.category]);
  const chartData =
    selectedIndex >= 0 && props.summary && props.breakdownData
      ? [...props.breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : props.data;
  const [graphType, setGraphType] = useState<"bar" | "line">(props.defaultType || "bar");
  const selectChips =
    props.summary && props.breakdownData ? (
      <div className="table-chips-container">
        <ChipSet choice>
          {[...props.breakdownData].sort(alphabeticalSortPropCurried("name")).map((obj, index) => (
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
  const labels = useMemo(
    () =>
      chartData.data
        .map((datum) => datum.id)
        .filter(
          filterLabels([
            [24, 3, !props.summary],
            [16, 2],
          ])
        ),
    [chartData.data]
  );
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        data={chartData.data}
        keys={["count"]}
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        theme={nivoTheme}
        colors={currentTheme ? [currentTheme[props.theme || "primary"]] : undefined}
        padding={0.33}
        labelSkipWidth={16}
        labelSkipHeight={16}
        labelTextColor={currentTheme ? ({ color }) => getTextColour(color, currentTheme) : undefined}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: props.unit,
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        tooltip={<RawDatum,>({ color, label, ...data }: BarTooltipProps<RawDatum>) => (
          <BasicTooltip
            id={`${props.unit} - ${label.split(" - ")[1]}`}
            value={data.formattedValue}
            enableChip={true}
            color={color}
          />
        )}
      />
    ) : null;
  return (
    <Card className={classNames("table-card", { "full-span": props.summary })}>
      <div className="title-container">
        <div className="text-container">
          {props.overline ? (
            <Typography use="overline" tag="h3">
              {props.overline}
            </Typography>
          ) : null}
          <Typography use="headline5" tag="h1">
            {props.data.name}
          </Typography>
          <Typography use="subtitle2" tag="p">
            {pluralise`${chartData.total} ${[chartData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon="bar_chart"
                selected={graphType === "bar"}
                onClick={() => {
                  setGraphType("bar");
                }}
              />,
              "Bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon="show_chart"
                selected={graphType === "line"}
                onClick={() => {
                  setGraphType("line");
                }}
              />,
              "Line chart"
            )}
          </SegmentedButton>
        </div>
      </div>
      <div className="content-container">
        <div className="chart-container">{barChart}</div>
        <div className="table-container">
          <DataTable className="rounded">
            <DataTableContent>
              <DataTableHead>
                <DataTableRow>
                  <DataTableHeadCell>Average</DataTableHeadCell>
                  <DataTableHeadCell alignEnd>{props.unit}</DataTableHeadCell>
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
                    {chartData.mode.length === chartData.total ? "None" : chartData.mode.join(", ")}
                  </DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Range</DataTableCell>
                  <DataTableCell alignEnd>{chartData.range}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Standard deviation</DataTableCell>
                  <DataTableCell alignEnd>{chartData.standardDev}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
        {selectChips}
        {props.note ? (
          <Typography use="caption" tag="p" className="note">
            {props.note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

export default TableCard;
