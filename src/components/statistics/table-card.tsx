import { useContext, useEffect, useMemo, useState } from "react";
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import type { BarTooltipProps } from "@nivo/bar";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { BasicTooltip } from "@nivo/tooltip";
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
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { withTooltip } from "@c/util/hocs";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import { NivoThemeContext } from "@c/util/theme-provider";
import { getTextColour } from "@s/common/functions";
import type { ThemeColorName } from "@s/common/types";
import {
  selectChartSettings,
  setStatisticsBarLineChartSetting,
} from "@s/statistics";
import { filterLabels } from "@s/statistics/functions";
import type { Categories, CountDataObject } from "@s/statistics/types";
import { alphabeticalSortPropCurried, pluralise } from "@s/util/functions";
import "./table-card.scss";

type TableCardProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  data: CountDataObject;
  tab: "duration" | "vendors";
  unit: string;
  note?: ReactNode;
  overline?: ReactNode;
  theme?: ThemeColorName;
};

export const TableCard = ({
  data,
  note,
  overline,
  tab,
  theme = "primary",
  unit,
  ...props
}: TableCardProps) => {
  const dispatch = useAppDispatch();

  const settings = useAppSelector(selectChartSettings);
  const {
    barLine: {
      [tab]: { type: graphType /*, stacked: stackedGraph */ },
    },
  } = settings;
  /*const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsBarLineChartSetting({ tab: tab, key: "stacked", value }));*/
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsBarLineChartSetting({ key: "type", tab, value }));

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
        axisBottom={{
          legend: unit,
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        colors={`var(--theme-${theme})`}
        data={data.data}
        keys={["count"]}
        labelSkipHeight={16}
        labelSkipWidth={16}
        labelTextColor={({ color }) => getTextColour(color)}
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        padding={0.33}
        theme={nivoTheme}
        tooltip={<RawDatum,>({
          color,
          label,
          ...data
        }: BarTooltipProps<RawDatum>) => (
          <BasicTooltip
            color={color}
            enableChip
            id={`${unit} - ${label.split(" - ")[1]}`}
            value={data.formattedValue}
          />
        )}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ResponsiveLine
        axisBottom={{
          legend: unit,
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        colors={`var(--theme-${theme})`}
        curve="cardinal"
        data={data.dataLine}
        enableArea
        isInteractive
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        theme={nivoTheme}
        tooltip={({
          point: {
            color,
            data: { xFormatted, yFormatted },
          },
        }) => (
          <BasicTooltip
            color={color}
            enableChip
            id={`${unit} - ${xFormatted}`}
            value={yFormatted}
          />
        )}
        useMesh
        yScale={{ min: 0, type: "linear" }}
      />
    ) : null;
  return (
    <Card {...props} className={classNames("table-card", props.className)}>
      <div className="title-container">
        <div className="text-container">
          {overline ? (
            <Typography tag="h3" use="overline">
              {overline}
            </Typography>
          ) : null}
          <Typography tag="h1" use="headline5">
            {data.name}
          </Typography>
          <Typography tag="p" use="subtitle2">
            {pluralise`${data.total} ${[data.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon="bar_chart"
                onClick={() => {
                  setGraphType("bar");
                }}
                selected={graphType === "bar"}
              />,
              "Bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon="show_chart"
                onClick={() => {
                  setGraphType("line");
                }}
                selected={graphType === "line"}
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
                    {data.mode.length === data.total
                      ? "None"
                      : data.mode.join(", ")}
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
          <Typography className="note" tag="p" use="caption">
            {note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

interface TableSummaryCardProps extends TableCardProps {
  breakdownData: CountDataObject[];
  category: Categories;
}

export const TableSummaryCard = ({
  breakdownData,
  category,
  data,
  note,
  overline,
  tab,
  theme = "primary",
  unit,
  ...props
}: TableSummaryCardProps) => {
  const dispatch = useAppDispatch();

  const settings = useAppSelector(selectChartSettings);
  const {
    barLine: {
      [tab]: { type: graphType /*, stacked: stackedGraph */ },
    },
  } = settings;
  /*const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsBarLineChartSetting({ tab: tab, key: "stacked", value }));*/
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsBarLineChartSetting({ key: "type", tab, value }));

  const nivoTheme = useContext(NivoThemeContext);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [category]);
  const chartData =
    selectedIndex >= 0 && breakdownData
      ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[
          selectedIndex
        ]
      : data;
  const selectChips = breakdownData ? (
    <div className="table-chips-container">
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
  const labels = useMemo(
    () =>
      chartData.data.map((datum) => datum.id).filter(filterLabels([[16, 2]])),
    [chartData.data]
  );
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        axisBottom={{
          legend: unit,
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        colors={`var(--theme-${theme})`}
        data={chartData.data}
        keys={["count"]}
        labelSkipHeight={16}
        labelSkipWidth={16}
        labelTextColor={({ color }) => getTextColour(color)}
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        padding={0.33}
        theme={nivoTheme}
        tooltip={<RawDatum,>({
          color,
          label,
          ...data
        }: BarTooltipProps<RawDatum>) => (
          <BasicTooltip
            color={color}
            enableChip
            id={`${unit} - ${label.split(" - ")[1]}`}
            value={data.formattedValue}
          />
        )}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ResponsiveLine
        axisBottom={{
          legend: unit,
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        colors={`var(--theme-${theme})`}
        curve="cardinal"
        data={chartData.dataLine}
        enableArea
        isInteractive
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        theme={nivoTheme}
        tooltip={({
          point: {
            color,
            data: { xFormatted, yFormatted },
          },
        }) => (
          <BasicTooltip
            color={color}
            enableChip
            id={`${unit} - ${xFormatted}`}
            value={yFormatted}
          />
        )}
        useMesh
        yScale={{ min: 0, type: "linear" }}
      />
    ) : null;
  return (
    <Card
      {...props}
      className={classNames("table-card full-span", props.className)}
    >
      <div className="title-container">
        <div className="text-container">
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
        <div className="button-container">
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon="bar_chart"
                onClick={() => {
                  setGraphType("bar");
                }}
                selected={graphType === "bar"}
              />,
              "Bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon="show_chart"
                onClick={() => {
                  setGraphType("line");
                }}
                selected={graphType === "line"}
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
                    {chartData.mode.length === chartData.total
                      ? "None"
                      : chartData.mode.join(", ")}
                  </DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Range</DataTableCell>
                  <DataTableCell alignEnd>{chartData.range}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>Standard deviation</DataTableCell>
                  <DataTableCell alignEnd>
                    {chartData.standardDev}
                  </DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
        {selectChips}
        {note ? (
          <Typography className="note" tag="p" use="caption">
            {note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

export default TableCard;
