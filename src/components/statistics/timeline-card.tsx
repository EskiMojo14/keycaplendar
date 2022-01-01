import type {
  CSSProperties,
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
} from "react";
import { memo, useContext, useEffect, useMemo, useState } from "react";
import { alpha } from "@material-ui/core";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
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
import { IconButton } from "@rmwc/icon-button";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { PointTooltip, SliceTooltip } from "@c/statistics/nivo-tooltip";
import { withTooltip } from "@c/util/hocs";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import { NivoThemeContext } from "@c/util/theme-provider";
import { graphColors } from "@s/common/constants";
import { getTextColour } from "@s/common/functions";
import type { ThemeColorName } from "@s/common/types";
import {
  selectChartSettings,
  setStatisticsBarLineChartSetting,
} from "@s/statistics";
import { filterLabels, getMaxYValFromLineData } from "@s/statistics/functions";
import type {
  ShippedDataObject,
  TimelinesDataObject,
} from "@s/statistics/types";
import { alphabeticalSortPropCurried, pluralise } from "@s/util/functions";
import type { Overwrite } from "@s/util/types";
import "./timeline-card.scss";

type ShippedCardProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  data: ShippedDataObject;
  months: string[];
  note?: ReactNode;
  overline?: ReactNode;
};

export const ShippedCard = ({
  data,
  months,
  note,
  overline,
  ...props
}: ShippedCardProps) => {
  const dispatch = useAppDispatch();

  const nivoTheme = useContext(NivoThemeContext);

  const {
    barLine: {
      shipped: { stacked: stackedGraph, type: graphType },
    },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(
      setStatisticsBarLineChartSetting({
        key: "stacked",
        tab: "shipped",
        value,
      })
    );
  const setGraphType = (value: "bar" | "line") =>
    dispatch(
      setStatisticsBarLineChartSetting({ key: "type", tab: "shipped", value })
    );

  const labels = useMemo(
    () => months.filter(filterLabels([[36, 2]])),
    [months]
  );
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        axisBottom={{
          legend: "Month",
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
        colors={["var(--theme-primary-dark)", "var(--theme-primary)"]}
        data={data.months}
        groupMode={stackedGraph ? "stacked" : "grouped"}
        indexBy="month"
        keys={["shipped", "unshipped"]}
        labelSkipHeight={16}
        labelTextColor={({ color }) => getTextColour(color)}
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        padding={0.33}
        theme={nivoTheme}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ResponsiveLine
        axisBottom={{
          legend: "Month",
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
        colors={["var(--theme-primary-dark)", "var(--theme-primary)"]}
        curve="cardinal"
        data={data.monthsLine}
        enableArea
        enableSlices={
          stackedGraph && data.monthsLine.length > 1 ? "x" : undefined
        }
        isInteractive
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        sliceTooltip={SliceTooltip}
        theme={nivoTheme}
        tooltip={PointTooltip}
        useMesh={!stackedGraph || data.monthsLine.length <= 1}
        yScale={{ min: 0, stacked: stackedGraph, type: "linear" }}
      />
    ) : null;
  return (
    <Card {...props} className={classNames("timeline-card", props.className)}>
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
          {withTooltip(
            <IconButton
              checked={stackedGraph}
              icon={graphType === "line" ? "show_chart" : "bar_chart"}
              onClick={() => setStackedGraph(!stackedGraph)}
              onIcon={
                graphType === "line"
                  ? "stacked_line_chart"
                  : "stacked_bar_chart"
              }
            />,
            "Toggle stacked"
          )}
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon={stackedGraph ? "stacked_bar_chart" : "bar_chart"}
                onClick={() => {
                  setGraphType("bar");
                }}
                selected={graphType === "bar"}
              />,
              "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={stackedGraph ? "stacked_line_chart" : "show_chart"}
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
      <div className="timeline-container">
        <div className="timeline-chart-container-container">
          <div className="timeline-chart-container timelines">
            {barChart}
            {lineChart}
          </div>
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
                    <div className="indicator shipped"></div>Shipped
                  </DataTableCell>
                  <DataTableCell isNumeric>{data.shipped}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator not-shipped"></div>Not shipped
                  </DataTableCell>
                  <DataTableCell isNumeric>{data.unshipped}</DataTableCell>
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

interface ShippedSummaryCardProps extends ShippedCardProps {
  breakdownData: ShippedDataObject[];
  category: string;
}

export const ShippedSummaryCard = ({
  breakdownData,
  category,
  data,
  months,
  note,
  overline,
  ...props
}: ShippedSummaryCardProps) => {
  const dispatch = useAppDispatch();

  const nivoTheme = useContext(NivoThemeContext);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [category]);

  const {
    barLine: {
      shipped: { stacked: stackedGraph, type: graphType },
    },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(
      setStatisticsBarLineChartSetting({
        key: "stacked",
        tab: "shipped",
        value,
      })
    );
  const setGraphType = (value: "bar" | "line") =>
    dispatch(
      setStatisticsBarLineChartSetting({ key: "type", tab: "shipped", value })
    );

  const selectedData =
    selectedIndex >= 0
      ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[
          selectedIndex
        ]
      : data;
  const labels = useMemo(
    () => months.filter(filterLabels([[36, 2]])),
    [months]
  );
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        axisBottom={{
          legend: "Month",
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
        colors={["var(--theme-primary-dark)", "var(--theme-primary)"]}
        data={selectedData.months}
        groupMode={stackedGraph ? "stacked" : "grouped"}
        indexBy="month"
        keys={["shipped", "unshipped"]}
        labelSkipHeight={16}
        labelTextColor={({ color }) => getTextColour(color)}
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        padding={0.33}
        theme={nivoTheme}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ResponsiveLine
        axisBottom={{
          legend: "Month",
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
        colors={["var(--theme-primary-dark)", "var(--theme-primary)"]}
        curve="cardinal"
        data={selectedData.monthsLine}
        enableArea
        enableSlices={
          stackedGraph && selectedData.monthsLine.length > 1 ? "x" : undefined
        }
        isInteractive
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        sliceTooltip={SliceTooltip}
        theme={nivoTheme}
        tooltip={PointTooltip}
        useMesh={!stackedGraph || selectedData.monthsLine.length <= 1}
        yScale={{ min: 0, stacked: stackedGraph, type: "linear" }}
      />
    ) : null;
  return (
    <Card {...props} className={classNames("timeline-card", props.className)}>
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
            {pluralise`${selectedData.total} ${[selectedData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          {withTooltip(
            <IconButton
              checked={stackedGraph}
              icon={graphType === "line" ? "show_chart" : "bar_chart"}
              onClick={() => setStackedGraph(!stackedGraph)}
              onIcon={
                graphType === "line"
                  ? "stacked_line_chart"
                  : "stacked_bar_chart"
              }
            />,
            "Toggle stacked"
          )}
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon={stackedGraph ? "stacked_bar_chart" : "bar_chart"}
                onClick={() => {
                  setGraphType("bar");
                }}
                selected={graphType === "bar"}
              />,
              "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={stackedGraph ? "stacked_line_chart" : "show_chart"}
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
      <div className="timeline-container">
        <div className="timeline-chart-container-container">
          <div className="timeline-chart-container timelines">
            {barChart}
            {lineChart}
          </div>
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
                    <div className="indicator shipped"></div>Shipped
                  </DataTableCell>
                  <DataTableCell isNumeric>
                    {selectedData.shipped}
                  </DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator not-shipped"></div>Not shipped
                  </DataTableCell>
                  <DataTableCell isNumeric>
                    {selectedData.unshipped}
                  </DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
        <div className="timeline-chips-container">
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
        {note ? (
          <Typography className="note" tag="p" use="caption">
            {note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

export type TimelinesCardProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  data: TimelinesDataObject[];
  months: string[];
  allProfiles?: string[];
  singleTheme?: ThemeColorName;
};

const blankTimelinesDataObject: TimelinesDataObject = {
  months: [],
  monthsLine: [],
  name: "",
  profiles: [],
  total: 0,
};

export const TimelinesCard = ({
  allProfiles,
  data,
  months,
  singleTheme,
  ...props
}: TimelinesCardProps) => {
  const dispatch = useAppDispatch();
  const nivoTheme = useContext(NivoThemeContext);

  const [selectedA, setSelectedA] = useState(data[0]?.name || "");
  const selectedAData: TimelinesDataObject = useMemo(
    () =>
      data.find((series) => series.name === selectedA) ||
      blankTimelinesDataObject,
    [selectedA, data]
  );

  const [selectedB, setSelectedB] = useState(data[1]?.name || "");
  const selectedBData: TimelinesDataObject = useMemo(
    () =>
      data.find((series) => series.name === selectedB) ||
      blankTimelinesDataObject,
    [selectedB, data]
  );

  useEffect(() => {
    setSelectedA(data[0]?.name || "");
    setSelectedB(data[1]?.name || "");
  }, [data]);

  const getProfileColour = (profile: string, index = 0) =>
    (allProfiles?.indexOf(profile) ?? -1) >= 0
      ? alpha(
          graphColors.rainbow[
            (allProfiles?.indexOf(profile) || 0) % graphColors.rainbow.length
          ],
          1
        )
      : alpha(graphColors.rainbow[index % graphColors.rainbow.length], 1);

  const {
    barLine: {
      timelines: { stacked: stackedGraph, type: graphType },
    },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(
      setStatisticsBarLineChartSetting({
        key: "stacked",
        tab: "timelines",
        value,
      })
    );
  const setGraphType = (value: "bar" | "line") =>
    dispatch(
      setStatisticsBarLineChartSetting({ key: "type", tab: "timelines", value })
    );

  const labels = useMemo(
    () =>
      months.filter(
        filterLabels([
          [24, 2],
          [36, 3],
        ])
      ),
    [months]
  );
  const allowUnstacked =
    graphType === "line" ||
    (selectedAData.profiles.length <= 4 &&
      selectedBData.profiles.length <= 4 &&
      !singleTheme);

  const maxYVal = useMemo(
    () =>
      getMaxYValFromLineData(
        stackedGraph || !allowUnstacked,
        selectedAData.monthsLine,
        selectedBData.monthsLine
      ),
    [selectedAData, selectedBData, stackedGraph, allowUnstacked]
  );
  const barChart = (data: TimelinesDataObject, theme = singleTheme) =>
    graphType === "bar" ? (
      <ResponsiveBar
        axisBottom={{
          legend: "Month",
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
        colors={
          theme
            ? `var(--theme-${theme})`
            : (d) => getProfileColour(`${d.id}`, d.index)
        }
        data={data.months}
        groupMode={!stackedGraph && allowUnstacked ? "grouped" : "stacked"}
        indexBy="month"
        keys={data.profiles}
        labelSkipHeight={16}
        labelSkipWidth={16}
        labelTextColor={({ color }) =>
          getTextColour(color, "var(--theme-on-secondary)")
        }
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        maxValue={maxYVal}
        padding={0.33}
        theme={nivoTheme}
      />
    ) : null;
  const lineChart = (data: TimelinesDataObject, theme = singleTheme) =>
    graphType === "line" ? (
      <ResponsiveLine
        axisBottom={{
          legend: "Month",
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
        colors={
          theme
            ? `var(--theme-${theme})`
            : (d) => getProfileColour(`${d.id}`, d.index)
        }
        curve="cardinal"
        data={data.monthsLine}
        enableArea
        enableSlices={stackedGraph && !theme ? "x" : undefined}
        isInteractive
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        sliceTooltip={SliceTooltip}
        theme={nivoTheme}
        tooltip={PointTooltip}
        useMesh={!stackedGraph || !!theme}
        yScale={{ max: maxYVal, min: 0, stacked: stackedGraph, type: "linear" }}
      />
    ) : null;
  return (
    <Card {...props} className={classNames("timeline-card", props.className)}>
      <div className="halves-container">
        <div className="half-container">
          <div className="title-container">
            <div className="text-container">
              <Typography tag="h1" use="headline5">
                {selectedAData.name}
              </Typography>
              <Typography tag="p" use="subtitle2">
                {pluralise`${selectedAData.total} ${[
                  selectedAData.total,
                  "set",
                ]}`}
              </Typography>
            </div>
          </div>
          <div className="timeline-container">
            <div className="timeline-chart-container-container">
              <div className="timeline-chart-container timelines">
                {barChart(selectedAData)}
                {lineChart(selectedAData)}
              </div>
            </div>
            <div className="timeline-chips-container">
              <ChipSet choice>
                {data.map(({ name, total }) => (
                  <Chip
                    key={name}
                    disabled={selectedB === name}
                    label={`${name} (${total})`}
                    onInteraction={() => setSelectedA(name)}
                    selected={selectedA === name}
                  />
                ))}
              </ChipSet>
            </div>
          </div>
        </div>
        <div className="half-container">
          <div className="title-container">
            <div className="text-container">
              <Typography tag="h1" use="headline5">
                {selectedBData.name}
              </Typography>
              <Typography tag="p" use="subtitle2">
                {pluralise`${selectedBData.total} ${[
                  selectedBData.total,
                  "set",
                ]}`}
              </Typography>
            </div>
            <div className="button-container">
              {!singleTheme
                ? withTooltip(
                    <IconButton
                      checked={stackedGraph || !allowUnstacked}
                      disabled={!allowUnstacked}
                      icon={graphType === "line" ? "show_chart" : "bar_chart"}
                      onClick={() => setStackedGraph(!stackedGraph)}
                      onIcon={
                        graphType === "line"
                          ? "stacked_line_chart"
                          : "stacked_bar_chart"
                      }
                    />,
                    "Toggle stacked"
                  )
                : null}
              <SegmentedButton toggle>
                {withTooltip(
                  <SegmentedButtonSegment
                    icon={
                      singleTheme || !(stackedGraph || !allowUnstacked)
                        ? "bar_chart"
                        : "stacked_bar_chart"
                    }
                    onClick={() => {
                      setGraphType("bar");
                    }}
                    selected={graphType === "bar"}
                  />,
                  singleTheme || !(stackedGraph || !allowUnstacked)
                    ? "Bar chart"
                    : "Stacked bar chart"
                )}
                {withTooltip(
                  <SegmentedButtonSegment
                    icon={
                      singleTheme || !(stackedGraph || !allowUnstacked)
                        ? "show_chart"
                        : "stacked_line_chart"
                    }
                    onClick={() => {
                      setGraphType("line");
                    }}
                    selected={graphType === "line"}
                  />,
                  singleTheme || !(stackedGraph || !allowUnstacked)
                    ? "Line chart"
                    : "Stacked line chart"
                )}
              </SegmentedButton>
            </div>
          </div>
          <div className="timeline-container">
            <div className="timeline-chart-container-container">
              <div className="timeline-chart-container timelines">
                {barChart(selectedBData)}
                {lineChart(selectedBData)}
              </div>
            </div>
            <div className="timeline-chips-container">
              <ChipSet choice>
                {data.map(({ name, total }) => (
                  <Chip
                    key={name}
                    disabled={selectedA === name}
                    label={`${name} (${total})`}
                    onInteraction={
                      selectedA !== name ? () => setSelectedB(name) : undefined
                    }
                    selected={selectedB === name}
                  />
                ))}
              </ChipSet>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export type TimelinesSummaryCardProps = Overwrite<
  TimelinesCardProps,
  {
    category: string;
    chartKeys: string[];
    data: TimelinesDataObject;
    breakdownData?: TimelinesDataObject[];
    note?: ReactNode;
    overline?: ReactNode;
  }
>;

export const TimelinesSummaryCard = ({
  breakdownData,
  category,
  chartKeys,
  data,
  months,
  note,
  overline,
  singleTheme,
  ...props
}: TimelinesSummaryCardProps) => {
  const dispatch = useAppDispatch();
  const nivoTheme = useContext(NivoThemeContext);

  const [selectedProfile, setSelectedProfile] = useState("");
  useEffect(() => setSelectedProfile(""), [category]);

  const selectedData =
    breakdownData && selectedProfile
      ? breakdownData.find(({ name }) => name === selectedProfile) || data
      : data;

  const {
    barLine: {
      timelines: { stacked: stackedGraph, type: graphType },
    },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(
      setStatisticsBarLineChartSetting({
        key: "stacked",
        tab: "timelines",
        value,
      })
    );
  const setGraphType = (value: "bar" | "line") =>
    dispatch(
      setStatisticsBarLineChartSetting({ key: "type", tab: "timelines", value })
    );

  const selectChips = breakdownData ? (
    <div className="timeline-chips-container">
      <ChipSet choice>
        {[...breakdownData]
          .sort(alphabeticalSortPropCurried("name"))
          .map((obj) => (
            <Chip
              key={obj.name}
              label={obj.name}
              onInteraction={() => {
                setSelectedProfile(
                  obj.name === selectedProfile ? "" : obj.name
                );
              }}
              selected={obj.name === selectedProfile}
            />
          ))}
      </ChipSet>
    </div>
  ) : null;

  const labels = useMemo(
    () => months.filter(filterLabels([[36, 2]])),
    [months]
  );
  const allowedKeys = useMemo(
    () => (selectedProfile ? [selectedProfile] : chartKeys),
    [selectedProfile, chartKeys]
  );
  const lineData = useMemo(
    () =>
      selectedData.monthsLine.filter(
        (series) =>
          typeof series.id === "string" && allowedKeys.includes(series.id)
      ),
    [allowedKeys, selectedData.monthsLine]
  );
  const allowUnstacked =
    graphType === "line" || (allowedKeys.length <= 4 && !singleTheme);
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        axisBottom={{
          legend: "Month",
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
        colors={
          singleTheme ? `var(--theme-${singleTheme})` : graphColors.rainbow
        }
        data={selectedData.months}
        groupMode={!stackedGraph && allowUnstacked ? "grouped" : "stacked"}
        indexBy="month"
        keys={allowedKeys}
        labelSkipHeight={16}
        labelSkipWidth={16}
        labelTextColor={({ color }) =>
          getTextColour(color, "var(--theme-on-secondary)")
        }
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        padding={0.33}
        theme={nivoTheme}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ResponsiveLine
        axisBottom={{
          legend: "Month",
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
        colors={
          singleTheme ? `var(--theme-${singleTheme})` : graphColors.rainbow
        }
        curve="cardinal"
        data={
          lineData.length === 1
            ? lineData.map((series) => ({ ...series, id: "Count" }))
            : lineData
        }
        enableArea
        enableSlices={stackedGraph && lineData.length > 1 ? "x" : undefined}
        isInteractive
        margin={{ bottom: 64, left: 64, right: 48, top: 48 }}
        sliceTooltip={SliceTooltip}
        theme={nivoTheme}
        tooltip={PointTooltip}
        useMesh={!stackedGraph || lineData.length <= 1}
        yScale={{ min: 0, stacked: stackedGraph, type: "linear" }}
      />
    ) : null;
  return (
    <Card {...props} className={classNames("timeline-card", props.className)}>
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
            {pluralise`${selectedData.total} ${[selectedData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          {!singleTheme
            ? withTooltip(
                <IconButton
                  checked={stackedGraph || !allowUnstacked}
                  disabled={!allowUnstacked}
                  icon={graphType === "line" ? "show_chart" : "bar_chart"}
                  onClick={() => setStackedGraph(!stackedGraph)}
                  onIcon={
                    graphType === "line"
                      ? "stacked_line_chart"
                      : "stacked_bar_chart"
                  }
                />,
                "Toggle stacked"
              )
            : null}
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon={
                  singleTheme || !(stackedGraph || !allowUnstacked)
                    ? "bar_chart"
                    : "stacked_bar_chart"
                }
                onClick={() => {
                  setGraphType("bar");
                }}
                selected={graphType === "bar"}
              />,
              singleTheme || !(stackedGraph || !allowUnstacked)
                ? "Bar chart"
                : "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={
                  singleTheme || !(stackedGraph || !allowUnstacked)
                    ? "show_chart"
                    : "stacked_line_chart"
                }
                onClick={() => {
                  setGraphType("line");
                }}
                selected={graphType === "line"}
              />,
              singleTheme || !(stackedGraph || !allowUnstacked)
                ? "Line chart"
                : "Stacked line chart"
            )}
          </SegmentedButton>
        </div>
      </div>
      <div className="timeline-container">
        <div className="timeline-chart-container-container">
          <div className="timeline-chart-container timelines">
            {barChart}
            {lineChart}
          </div>
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

export const TimelineCardPlaceholder = ({
  style,
}: {
  style: CSSProperties;
}) => <Card className="timeline-card placeholder" style={style}></Card>;

export const MemoisedTimelineCardPlaceholder = memo(TimelineCardPlaceholder);
