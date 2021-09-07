import React, { useState, useEffect, useContext, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectCurrentThemeMap } from "@s/common";
import { getTextColour } from "@s/common/functions";
import { ThemeMap } from "@s/common/types";
import { selectChartSettings, setStatisticsChartSetting } from "@s/statistics";
import { filterLabels } from "@s/statistics/functions";
import { Categories, CountDataObject } from "@s/statistics/types";
import { alphabeticalSortPropCurried, pluralise } from "@s/util/functions";
import { NivoThemeContext } from "@c/util/theme-provider";
import { KeysMatching } from "@s/util/types";
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
import { ResponsiveLine } from "@nivo/line";
import { BasicTooltip } from "@nivo/tooltip";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import { withTooltip } from "@c/util/hocs";
import "./table-card.scss";

type TableCardProps = {
  data: CountDataObject;
  unit: string;
  tab: "duration" | "vendors";
  defaultType?: "bar" | "line";
  theme?: KeysMatching<ThemeMap, string>;
  overline?: React.ReactNode;
  note?: React.ReactNode;
};

export const TableCard = (props: TableCardProps) => {
  const dispatch = useAppDispatch();

  const settings = useAppSelector(selectChartSettings);
  const { type: graphType /*, stacked: stackedGraph */ } = settings[props.tab];
  /*const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsChartSetting({ tab: props.tab, key: "stacked", value }));*/
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsChartSetting({ tab: props.tab, key: "type", value }));

  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);
  const labels = useMemo(
    () =>
      props.data.data
        .map((datum) => datum.id)
        .filter(
          filterLabels([
            [24, 3],
            [16, 2],
          ])
        ),
    [props.data.data]
  );
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        data={props.data.data}
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
  const lineChart =
    graphType === "line" ? (
      <ResponsiveLine
        data={props.data.dataLine}
        yScale={{ type: "linear", min: 0 }}
        curve="cardinal"
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        enableArea
        theme={nivoTheme}
        colors={currentTheme ? [currentTheme[props.theme || "primary"]] : undefined}
        tooltip={({
          point: {
            data: { xFormatted, yFormatted },
            color,
          },
        }) => <BasicTooltip id={`${props.unit} - ${xFormatted}`} value={yFormatted} enableChip={true} color={color} />}
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
        useMesh
        isInteractive
      />
    ) : null;
  return (
    <Card className="table-card full-span">
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
            {pluralise`${props.data.total} ${[props.data.total, "set"]}`}
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
        <div className="chart-container-container">
          <div className="chart-container">
            {barChart}
            {lineChart}
          </div>
        </div>
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
        {props.note ? (
          <Typography use="caption" tag="p" className="note">
            {props.note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

interface TableSummaryCardProps extends TableCardProps {
  category: Categories;
  breakdownData: CountDataObject[];
}

export const TableSummaryCard = (props: TableSummaryCardProps) => {
  const dispatch = useAppDispatch();

  const settings = useAppSelector(selectChartSettings);
  const { type: graphType /*, stacked: stackedGraph */ } = settings[props.tab];
  /*const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsChartSetting({ tab: props.tab, key: "stacked", value }));*/
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsChartSetting({ tab: props.tab, key: "type", value }));

  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [props.category]);
  const chartData =
    selectedIndex >= 0 && props.breakdownData
      ? [...props.breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : props.data;
  const selectChips = props.breakdownData ? (
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
  const labels = useMemo(() => chartData.data.map((datum) => datum.id).filter(filterLabels([[16, 2]])), [
    chartData.data,
  ]);
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
  const lineChart =
    graphType === "line" ? (
      <ResponsiveLine
        data={chartData.dataLine}
        yScale={{ type: "linear", min: 0 }}
        curve="cardinal"
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        enableArea
        theme={nivoTheme}
        colors={currentTheme ? [currentTheme[props.theme || "primary"]] : undefined}
        tooltip={({
          point: {
            data: { xFormatted, yFormatted },
            color,
          },
        }) => <BasicTooltip id={`${props.unit} - ${xFormatted}`} value={yFormatted} enableChip={true} color={color} />}
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
        useMesh
        isInteractive
      />
    ) : null;
  return (
    <Card className="table-card full-span">
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
        <div className="chart-container-container">
          <div className="chart-container">
            {barChart}
            {lineChart}
          </div>
        </div>
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
