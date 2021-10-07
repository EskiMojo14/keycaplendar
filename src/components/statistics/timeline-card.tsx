import {
  useState,
  useEffect,
  useContext,
  useMemo,
  memo,
  ReactNode,
  DetailedHTMLProps,
  HTMLAttributes,
  CSSProperties,
} from "react";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectCurrentGraphColors, selectCurrentThemeMap } from "@s/common";
import { getTextColour } from "@s/common/functions";
import { ThemeColorName } from "@s/common/types";
import { selectChartSettings, setStatisticsBarLineChartSetting } from "@s/statistics";
import { filterLabels, getMaxYValFromLineData } from "@s/statistics/functions";
import { ShippedDataObject, TimelinesDataObject } from "@s/statistics/types";
import { alphabeticalSortPropCurried, pluralise } from "@s/util/functions";
import { Overwrite } from "@s/util/types";
import { Card } from "@rmwc/card";
import { ChipSet, Chip } from "@rmwc/chip";
import { IconButton } from "@rmwc/icon-button";
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
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { PointTooltip, SliceTooltip } from "@c/statistics/nivo-tooltip";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import { withTooltip } from "@c/util/hocs";
import { NivoThemeContext } from "@c/util/theme-provider";
import "./timeline-card.scss";

type ShippedCardProps = {
  data: ShippedDataObject;
  months: string[];
  overline?: ReactNode;
  note?: ReactNode;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const ShippedCard = ({ data, months, overline, note, ...props }: ShippedCardProps) => {
  const dispatch = useAppDispatch();

  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const {
    barLine: {
      shipped: { type: graphType, stacked: stackedGraph },
    },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsBarLineChartSetting({ tab: "shipped", key: "stacked", value }));
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsBarLineChartSetting({ tab: "shipped", key: "type", value }));

  const labels = useMemo(() => months.filter(filterLabels([[36, 2]])), [months]);
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        data={data.months}
        indexBy={"month"}
        keys={["shipped", "unshipped"]}
        groupMode={stackedGraph ? "stacked" : "grouped"}
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        theme={nivoTheme}
        colors={currentTheme ? [currentTheme.primaryDark, currentTheme.primary] : undefined}
        padding={0.33}
        labelSkipHeight={16}
        labelTextColor={currentTheme ? ({ color }) => getTextColour(color, currentTheme) : undefined}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: "Month",
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ResponsiveLine
        data={data.monthsLine}
        yScale={{ type: "linear", min: 0, stacked: stackedGraph }}
        curve="cardinal"
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        enableArea
        theme={nivoTheme}
        colors={currentTheme ? [currentTheme.primaryDark, currentTheme.primary] : undefined}
        tooltip={PointTooltip}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: "Month",
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        useMesh={!stackedGraph || data.monthsLine.length <= 1}
        enableSlices={stackedGraph && data.monthsLine.length > 1 ? "x" : undefined}
        sliceTooltip={SliceTooltip}
        isInteractive
      />
    ) : null;
  return (
    <Card {...props} className={classNames("timeline-card", props.className)}>
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
          {withTooltip(
            <IconButton
              icon={graphType === "line" ? "show_chart" : "bar_chart"}
              onIcon={graphType === "line" ? "stacked_line_chart" : "stacked_bar_chart"}
              checked={stackedGraph}
              onClick={() => setStackedGraph(!stackedGraph)}
            />,
            "Toggle stacked"
          )}
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon={stackedGraph ? "stacked_bar_chart" : "bar_chart"}
                selected={graphType === "bar"}
                onClick={() => {
                  setGraphType("bar");
                }}
              />,
              "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={stackedGraph ? "stacked_line_chart" : "show_chart"}
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
          <Typography use="caption" tag="p" className="note">
            {note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

interface ShippedSummaryCardProps extends ShippedCardProps {
  category: string;
  breakdownData: ShippedDataObject[];
}

export const ShippedSummaryCard = ({
  data,
  category,
  breakdownData,
  months,
  overline,
  note,
  ...props
}: ShippedSummaryCardProps) => {
  const dispatch = useAppDispatch();

  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [category]);

  const {
    barLine: {
      shipped: { type: graphType, stacked: stackedGraph },
    },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsBarLineChartSetting({ tab: "shipped", key: "stacked", value }));
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsBarLineChartSetting({ tab: "shipped", key: "type", value }));

  const selectedData =
    selectedIndex >= 0 ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex] : data;
  const labels = useMemo(() => months.filter(filterLabels([[36, 2]])), [months]);
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        data={selectedData.months}
        indexBy={"month"}
        keys={["shipped", "unshipped"]}
        groupMode={stackedGraph ? "stacked" : "grouped"}
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        theme={nivoTheme}
        colors={currentTheme ? [currentTheme.primaryDark, currentTheme.primary] : undefined}
        padding={0.33}
        labelSkipHeight={16}
        labelTextColor={currentTheme ? ({ color }) => getTextColour(color, currentTheme) : undefined}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: "Month",
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ResponsiveLine
        data={selectedData.monthsLine}
        yScale={{ type: "linear", min: 0, stacked: stackedGraph }}
        curve="cardinal"
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        enableArea
        theme={nivoTheme}
        colors={currentTheme ? [currentTheme.primaryDark, currentTheme.primary] : undefined}
        tooltip={PointTooltip}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: "Month",
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        useMesh={!stackedGraph || selectedData.monthsLine.length <= 1}
        enableSlices={stackedGraph && selectedData.monthsLine.length > 1 ? "x" : undefined}
        sliceTooltip={SliceTooltip}
        isInteractive
      />
    ) : null;
  return (
    <Card {...props} className={classNames("timeline-card", props.className)}>
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
            {pluralise`${selectedData.total} ${[selectedData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          {withTooltip(
            <IconButton
              icon={graphType === "line" ? "show_chart" : "bar_chart"}
              onIcon={graphType === "line" ? "stacked_line_chart" : "stacked_bar_chart"}
              checked={stackedGraph}
              onClick={() => setStackedGraph(!stackedGraph)}
            />,
            "Toggle stacked"
          )}
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon={stackedGraph ? "stacked_bar_chart" : "bar_chart"}
                selected={graphType === "bar"}
                onClick={() => {
                  setGraphType("bar");
                }}
              />,
              "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={stackedGraph ? "stacked_line_chart" : "show_chart"}
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
                  <DataTableCell isNumeric>{selectedData.shipped}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator not-shipped"></div>Not shipped
                  </DataTableCell>
                  <DataTableCell isNumeric>{selectedData.unshipped}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
        <div className="timeline-chips-container">
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
        {note ? (
          <Typography use="caption" tag="p" className="note">
            {note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

export type TimelinesCardProps = {
  data: TimelinesDataObject[];
  months: string[];
  singleTheme?: ThemeColorName;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const blankTimelinesDataObject: TimelinesDataObject = {
  name: "",
  total: 0,
  profiles: [],
  months: [],
  monthsLine: [],
};

export const TimelinesCard = ({ data, months, singleTheme, ...props }: TimelinesCardProps) => {
  const dispatch = useAppDispatch();
  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);
  const { rainbow: graphColors } = useAppSelector(selectCurrentGraphColors);

  const [selectedA, setSelectedA] = useState(data[0]?.name || "");
  const selectedAData: TimelinesDataObject = useMemo(
    () => data.find((series) => series.name === selectedA) || blankTimelinesDataObject,
    [selectedA, data]
  );

  const [selectedB, setSelectedB] = useState(data[1]?.name || "");
  const selectedBData: TimelinesDataObject = useMemo(
    () => data.find((series) => series.name === selectedB) || blankTimelinesDataObject,
    [selectedB, data]
  );

  useEffect(() => {
    setSelectedA(data[0]?.name || "");
    setSelectedB(data[1]?.name || "");
  }, [data]);

  const {
    barLine: {
      timelines: { type: graphType, stacked: stackedGraph },
    },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsBarLineChartSetting({ tab: "timelines", key: "stacked", value }));
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsBarLineChartSetting({ tab: "timelines", key: "type", value }));

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
    graphType === "line" || (selectedAData.profiles.length <= 4 && selectedBData.profiles.length <= 4 && !singleTheme);

  const maxYVal = useMemo(
    () => getMaxYValFromLineData(stackedGraph || !allowUnstacked, selectedAData.monthsLine, selectedBData.monthsLine),
    [selectedAData, selectedBData, stackedGraph, allowUnstacked]
  );
  const barChart = (data: TimelinesDataObject, theme = singleTheme) =>
    graphType === "bar" ? (
      <ResponsiveBar
        data={data.months}
        maxValue={maxYVal}
        indexBy={"month"}
        keys={data.profiles}
        groupMode={!stackedGraph && allowUnstacked ? "grouped" : "stacked"}
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        theme={nivoTheme}
        colors={currentTheme && theme ? [currentTheme[theme]] : graphColors || undefined}
        padding={0.33}
        labelSkipWidth={16}
        labelSkipHeight={16}
        labelTextColor={
          currentTheme ? ({ color }) => getTextColour(color, currentTheme, currentTheme.onSecondary) : undefined
        }
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: "Month",
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
      />
    ) : null;
  const lineChart = (data: TimelinesDataObject, theme = singleTheme) =>
    graphType === "line" ? (
      <ResponsiveLine
        data={data.monthsLine}
        yScale={{ type: "linear", min: 0, max: maxYVal, stacked: stackedGraph }}
        curve="cardinal"
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        enableArea
        theme={nivoTheme}
        colors={currentTheme && theme ? [currentTheme[theme]] : graphColors ? graphColors : undefined}
        tooltip={PointTooltip}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: "Month",
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        useMesh={!stackedGraph || data.monthsLine.length <= 1}
        enableSlices={stackedGraph && data.monthsLine.length > 1 ? "x" : undefined}
        sliceTooltip={SliceTooltip}
        isInteractive
      />
    ) : null;
  return (
    <Card {...props} className={classNames("timeline-card", props.className)}>
      <div className="halves-container">
        <div className="half-container">
          <div className="title-container">
            <div className="text-container">
              <Typography use="headline5" tag="h1">
                {selectedAData.name}
              </Typography>
              <Typography use="subtitle2" tag="p">
                {pluralise`${selectedAData.total} ${[selectedAData.total, "set"]}`}
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
                    label={`${name} (${total})`}
                    selected={selectedA === name}
                    disabled={selectedB === name}
                    onInteraction={() => setSelectedA(name)}
                  />
                ))}
              </ChipSet>
            </div>
          </div>
        </div>
        <div className="half-container">
          <div className="title-container">
            <div className="text-container">
              <Typography use="headline5" tag="h1">
                {selectedBData.name}
              </Typography>
              <Typography use="subtitle2" tag="p">
                {pluralise`${selectedBData.total} ${[selectedBData.total, "set"]}`}
              </Typography>
            </div>
            <div className="button-container">
              {!singleTheme
                ? withTooltip(
                    <IconButton
                      icon={graphType === "line" ? "show_chart" : "bar_chart"}
                      onIcon={graphType === "line" ? "stacked_line_chart" : "stacked_bar_chart"}
                      checked={stackedGraph || !allowUnstacked}
                      disabled={!allowUnstacked}
                      onClick={() => setStackedGraph(!stackedGraph)}
                    />,
                    "Toggle stacked"
                  )
                : null}
              <SegmentedButton toggle>
                {withTooltip(
                  <SegmentedButtonSegment
                    icon={singleTheme || !(stackedGraph || !allowUnstacked) ? "bar_chart" : "stacked_bar_chart"}
                    selected={graphType === "bar"}
                    onClick={() => {
                      setGraphType("bar");
                    }}
                  />,
                  singleTheme || !(stackedGraph || !allowUnstacked) ? "Bar chart" : "Stacked bar chart"
                )}
                {withTooltip(
                  <SegmentedButtonSegment
                    icon={singleTheme || !(stackedGraph || !allowUnstacked) ? "show_chart" : "stacked_line_chart"}
                    selected={graphType === "line"}
                    onClick={() => {
                      setGraphType("line");
                    }}
                  />,
                  singleTheme || !(stackedGraph || !allowUnstacked) ? "Line chart" : "Stacked line chart"
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
                    label={`${name} (${total})`}
                    selected={selectedB === name}
                    disabled={selectedA === name}
                    onInteraction={selectedA !== name ? () => setSelectedB(name) : undefined}
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
    data: TimelinesDataObject;
    breakdownData?: TimelinesDataObject[];
    chartKeys: string[];
    category: string;
    overline?: ReactNode;
    note?: ReactNode;
  }
>;

export const TimelinesSummaryCard = ({
  data,
  breakdownData,
  chartKeys,
  months,
  category,
  singleTheme,
  overline,
  note,
  ...props
}: TimelinesSummaryCardProps) => {
  const dispatch = useAppDispatch();
  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);
  const { rainbow: graphColors } = useAppSelector(selectCurrentGraphColors);

  const [selectedProfile, setSelectedProfile] = useState("");
  useEffect(() => setSelectedProfile(""), [category]);

  const selectedData =
    breakdownData && selectedProfile ? breakdownData.find(({ name }) => name === selectedProfile) || data : data;

  const {
    barLine: {
      timelines: { type: graphType, stacked: stackedGraph },
    },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsBarLineChartSetting({ tab: "timelines", key: "stacked", value }));
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsBarLineChartSetting({ tab: "timelines", key: "type", value }));

  const selectChips = breakdownData ? (
    <div className="timeline-chips-container">
      <ChipSet choice>
        {[...breakdownData].sort(alphabeticalSortPropCurried("name")).map((obj) => (
          <Chip
            key={obj.name}
            label={obj.name}
            selected={obj.name === selectedProfile}
            onInteraction={() => {
              setSelectedProfile(obj.name === selectedProfile ? "" : obj.name);
            }}
          />
        ))}
      </ChipSet>
    </div>
  ) : null;

  const labels = useMemo(() => months.filter(filterLabels([[36, 2]])), [months]);
  const allowedKeys = useMemo(() => (selectedProfile ? [selectedProfile] : chartKeys), [selectedProfile, chartKeys]);
  const lineData = useMemo(
    () => selectedData.monthsLine.filter((series) => typeof series.id === "string" && allowedKeys.includes(series.id)),
    [allowedKeys, selectedData.monthsLine]
  );
  const allowUnstacked = graphType === "line" || (allowedKeys.length <= 4 && !singleTheme);
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        data={selectedData.months}
        indexBy={"month"}
        keys={allowedKeys}
        groupMode={!stackedGraph && allowUnstacked ? "grouped" : "stacked"}
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        theme={nivoTheme}
        colors={currentTheme && singleTheme ? [currentTheme[singleTheme]] : graphColors || undefined}
        padding={0.33}
        labelSkipWidth={16}
        labelSkipHeight={16}
        labelTextColor={
          currentTheme ? ({ color }) => getTextColour(color, currentTheme, currentTheme.onSecondary) : undefined
        }
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: "Month",
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
      />
    ) : null;
  const lineChart =
    graphType === "line" ? (
      <ResponsiveLine
        data={lineData.length === 1 ? lineData.map((series) => ({ ...series, id: "Count" })) : lineData}
        yScale={{ type: "linear", min: 0, stacked: stackedGraph }}
        curve="cardinal"
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        enableArea
        theme={nivoTheme}
        colors={currentTheme && singleTheme ? [currentTheme[singleTheme]] : graphColors ? graphColors : undefined}
        tooltip={PointTooltip}
        axisLeft={{
          legend: "Count",
          legendOffset: -40,
          legendPosition: "middle",
          tickValues: 5,
        }}
        axisBottom={{
          legend: "Month",
          legendOffset: 40,
          legendPosition: "middle",
          tickValues: labels,
        }}
        useMesh={!stackedGraph || lineData.length <= 1}
        enableSlices={stackedGraph && lineData.length > 1 ? "x" : undefined}
        sliceTooltip={SliceTooltip}
        isInteractive
      />
    ) : null;
  return (
    <Card {...props} className={classNames("timeline-card", props.className)}>
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
            {pluralise`${selectedData.total} ${[selectedData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          {!singleTheme
            ? withTooltip(
                <IconButton
                  icon={graphType === "line" ? "show_chart" : "bar_chart"}
                  onIcon={graphType === "line" ? "stacked_line_chart" : "stacked_bar_chart"}
                  checked={stackedGraph || !allowUnstacked}
                  disabled={!allowUnstacked}
                  onClick={() => setStackedGraph(!stackedGraph)}
                />,
                "Toggle stacked"
              )
            : null}
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon={singleTheme || !(stackedGraph || !allowUnstacked) ? "bar_chart" : "stacked_bar_chart"}
                selected={graphType === "bar"}
                onClick={() => {
                  setGraphType("bar");
                }}
              />,
              singleTheme || !(stackedGraph || !allowUnstacked) ? "Bar chart" : "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={singleTheme || !(stackedGraph || !allowUnstacked) ? "show_chart" : "stacked_line_chart"}
                selected={graphType === "line"}
                onClick={() => {
                  setGraphType("line");
                }}
              />,
              singleTheme || !(stackedGraph || !allowUnstacked) ? "Line chart" : "Stacked line chart"
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
          <Typography use="caption" tag="p" className="note">
            {note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

export const TimelineCardPlaceholder = ({ style }: { style: CSSProperties }) => (
  <Card className="timeline-card placeholder" style={style}></Card>
);

export const MemoisedTimelineCardPlaceholder = memo(TimelineCardPlaceholder);
