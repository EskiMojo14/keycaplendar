import { useState, useEffect, useContext, useMemo } from "react";
import type { ReactNode, DetailedHTMLProps, HTMLAttributes } from "react";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { getTextColour } from "@s/common/functions";
import { ThemeColorName } from "@s/common/types";
import { selectChartSettings, setStatisticsBarLineChartSetting } from "@s/statistics";
import { filterLabels } from "@s/statistics/functions";
import type { Categories, CountDataObject } from "@s/statistics/types";
import { alphabeticalSortPropCurried, pluralise } from "@s/util/functions";
import { NivoThemeContext } from "@c/util/theme-provider";
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
import { BarTooltipProps, ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { BasicTooltip } from "@nivo/tooltip";
import { withTooltip } from "@c/util/hocs";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import "./table-card.scss";

type TableCardProps = {
  data: CountDataObject;
  unit: string;
  tab: "duration" | "vendors";
  theme?: ThemeColorName;
  overline?: ReactNode;
  note?: ReactNode;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const TableCard = ({ data, unit, tab, theme = "primary", overline, note, ...props }: TableCardProps) => {
  const dispatch = useAppDispatch();

  const settings = useAppSelector(selectChartSettings);
  const { type: graphType /*, stacked: stackedGraph */ } = settings.barLine[tab];
  /*const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsBarLineChartSetting({ tab: tab, key: "stacked", value }));*/
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsBarLineChartSetting({ tab: tab, key: "type", value }));

  const nivoTheme = useContext(NivoThemeContext);
  const labels = useMemo(
    () =>
      data.data
        .map((datum) => datum.id)
        .filter(
          filterLabels([
            [24, 3],
            [16, 2],
          ])
        ),
    [data.data]
  );
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        data={data.data}
        keys={["count"]}
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        theme={nivoTheme}
        colors={`var(--theme-${theme})`}
        padding={0.33}
        labelSkipWidth={16}
        labelSkipHeight={16}
        labelTextColor={({ color }) => getTextColour(color)}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: unit,
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        tooltip={<RawDatum,>({ color, label, ...data }: BarTooltipProps<RawDatum>) => (
          <BasicTooltip
            id={`${unit} - ${label.split(" - ")[1]}`}
            value={data.formattedValue}
            enableChip
            color={color}
          />
        )}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ResponsiveLine
        data={data.dataLine}
        yScale={{ type: "linear", min: 0 }}
        curve="cardinal"
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        enableArea
        theme={nivoTheme}
        colors={`var(--theme-${theme})`}
        tooltip={({
          point: {
            data: { xFormatted, yFormatted },
            color,
          },
        }) => <BasicTooltip id={`${unit} - ${xFormatted}`} value={yFormatted} enableChip color={color} />}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: unit,
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        useMesh
        isInteractive
      />
    ) : null;
  return (
    <Card {...props} className={classNames("table-card", props.className)}>
      <div className="title-container">
        <div className="text-container">
          {overline ? (
            <Typography use="overline" tag="h3">
              {overline}
            </Typography>
          ) : null}
          <Typography use="headline5" tag="h1">
            {data.name}
          </Typography>
          <Typography use="subtitle2" tag="p">
            {pluralise`${data.total} ${[data.total, "set"]}`}
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
                  <DataTableHeadCell alignEnd>{unit}</DataTableHeadCell>
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                <DataTableRow>
                  <DataTableCell>Mean</DataTableCell>
                  <DataTableCell alignEnd>{data.mean}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Median</DataTableCell>
                  <DataTableCell alignEnd>{data.median}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Mode</DataTableCell>
                  <DataTableCell alignEnd>
                    {data.mode.length === data.total ? "None" : data.mode.join(", ")}
                  </DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Range</DataTableCell>
                  <DataTableCell alignEnd>{data.range}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Standard deviation</DataTableCell>
                  <DataTableCell alignEnd>{data.standardDev}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
        {note ? (
          <Typography use="caption" tag="p" className="note">
            {note}
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

export const TableSummaryCard = ({
  data,
  category,
  breakdownData,
  unit,
  tab,
  theme = "primary",
  overline,
  note,
  ...props
}: TableSummaryCardProps) => {
  const dispatch = useAppDispatch();

  const settings = useAppSelector(selectChartSettings);
  const { type: graphType /*, stacked: stackedGraph */ } = settings.barLine[tab];
  /*const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsBarLineChartSetting({ tab: tab, key: "stacked", value }));*/
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsBarLineChartSetting({ tab: tab, key: "type", value }));

  const nivoTheme = useContext(NivoThemeContext);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [category]);
  const chartData =
    selectedIndex >= 0 && breakdownData
      ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : data;
  const selectChips = breakdownData ? (
    <div className="table-chips-container">
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
        colors={`var(--theme-${theme})`}
        padding={0.33}
        labelSkipWidth={16}
        labelSkipHeight={16}
        labelTextColor={({ color }) => getTextColour(color)}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: unit,
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        tooltip={<RawDatum,>({ color, label, ...data }: BarTooltipProps<RawDatum>) => (
          <BasicTooltip
            id={`${unit} - ${label.split(" - ")[1]}`}
            value={data.formattedValue}
            enableChip
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
        colors={`var(--theme-${theme})`}
        tooltip={({
          point: {
            data: { xFormatted, yFormatted },
            color,
          },
        }) => <BasicTooltip id={`${unit} - ${xFormatted}`} value={yFormatted} enableChip color={color} />}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: unit,
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        useMesh
        isInteractive
      />
    ) : null;
  return (
    <Card {...props} className={classNames("table-card full-span", props.className)}>
      <div className="title-container">
        <div className="text-container">
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
                  <DataTableHeadCell alignEnd>{unit}</DataTableHeadCell>
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
        {note ? (
          <Typography use="caption" tag="p" className="note">
            {note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

export default TableCard;
