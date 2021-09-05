import React, { useState, useEffect, useContext, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectCurrentGraphColors, selectCurrentThemeMap } from "@s/common";
import { getTextColour } from "@s/common/functions";
import { ThemeMap } from "@s/common/types";
import { selectChartSettings, setStatisticsChartSetting } from "@s/statistics";
import { filterLabels } from "@s/statistics/functions";
import { ShippedDataObject, TimelinesDataObject } from "@s/statistics/types";
import { addOrRemove, alphabeticalSortPropCurried, hasKey, iconObject, pluralise } from "@s/util/functions";
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
  overline?: React.ReactNode;
  note?: React.ReactNode;
};

export const ShippedCard = (props: ShippedCardProps) => {
  const dispatch = useAppDispatch();

  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const {
    shipped: { type: graphType, stacked: stackedGraph },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsChartSetting({ tab: "shipped", key: "stacked", value }));
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsChartSetting({ tab: "shipped", key: "type", value }));

  const labels = useMemo(() => props.months.filter(filterLabels([[36, 2]])), [props.months]);
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        data={props.data.months}
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
        data={props.data.monthsLine}
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
        useMesh={!stackedGraph || props.data.monthsLine.length <= 1}
        enableSlices={stackedGraph && props.data.monthsLine.length > 1 ? "x" : undefined}
        sliceTooltip={SliceTooltip}
        isInteractive
      />
    ) : null;
  return (
    <Card className="timeline-card full-span">
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
        {props.note ? (
          <Typography use="caption" tag="p" className="note">
            {props.note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

interface ShippedSummaryCardProps extends ShippedCardProps {
  data: ShippedDataObject;
  months: string[];
  category: string;
  breakdownData: ShippedDataObject[];
  overline?: React.ReactNode;
  note?: React.ReactNode;
}

export const ShippedSummaryCard = (props: ShippedSummaryCardProps) => {
  const dispatch = useAppDispatch();

  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [props.category]);

  const {
    shipped: { type: graphType, stacked: stackedGraph },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsChartSetting({ tab: "shipped", key: "stacked", value }));
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsChartSetting({ tab: "shipped", key: "type", value }));

  const selectedData =
    selectedIndex >= 0 ? [...props.breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex] : props.data;
  const labels = useMemo(() => props.months.filter(filterLabels([[36, 2]])), [props.months]);
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
    <Card className="timeline-card full-span">
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
        {props.note ? (
          <Typography use="caption" tag="p" className="note">
            {props.note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

export type TimelinesCardProps = {
  data: TimelinesDataObject;
  chartKeys: string[];
  months: string[];
  category: string;
  singleTheme?: Exclude<keyof ThemeMap, "dark">;
  defaultType?: "bar" | "line";
  filterable?: boolean;
  allProfiles?: string[];
  overline?: React.ReactNode;
  note?: React.ReactNode;
};

export const TimelinesCard = (props: TimelinesCardProps) => {
  const dispatch = useAppDispatch();
  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);
  const graphColors = useAppSelector(selectCurrentGraphColors);

  const [filtered, setFiltered] = useState<string[]>([]);

  const {
    timelines: { type: graphType, stacked: stackedGraph },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsChartSetting({ tab: "timelines", key: "stacked", value }));
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsChartSetting({ tab: "timelines", key: "type", value }));

  const setFilter = (profile: string) => {
    const newFiltered = addOrRemove(filtered, profile);
    setFiltered(newFiltered);
  };
  const filterAll = () => {
    setFiltered(props.allProfiles || []);
  };
  const clearFilter = () => {
    setFiltered([]);
  };
  useEffect(filterAll, [props.category, props.allProfiles]);

  const filterButtons =
    props.filterable && props.allProfiles ? (
      <>
        {withTooltip(
          <IconButton
            icon={iconObject(
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px" width="24px">
                  <path d="M0,0H24V24H0Z" fill="none" />
                  <path
                    d="M13.71655,16.15582a4.5119,4.5119,0,1,1,2.43927-2.43927,5.9945,5.9945,0,0,1,4.01758-.60016A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.96389,5.96389,0,0,1,13.71655,16.15582Z"
                    opacity="0.3"
                  />
                  <path d="M12,7.5a4.5,4.5,0,1,0,1.71655,8.65582,6.02548,6.02548,0,0,1,2.43927-2.43927A4.49209,4.49209,0,0,0,12,7.5Zm0,7A2.5,2.5,0,1,1,14.5,12,2.50091,2.50091,0,0,1,12,14.5Zm1.02289,4.95294C12.68549,19.48193,12.345,19.5,12,19.5A11.82679,11.82679,0,0,1,1,12a11.81667,11.81667,0,0,1,22,0,11.81143,11.81143,0,0,1-.93243,1.85028,5.952,5.952,0,0,0-1.89417-.73389A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.99107,5.99107,0,0,0,13,19C13,19.15289,13.01166,19.30292,13.02289,19.45294ZM23.5,17l-5,5L15,18.5,16.5,17l2,2L22,15.5,23.5,17" />
                </svg>
              </div>
            )}
            disabled={filtered.length === props.data.profiles.length}
            onClick={filterAll}
          />,
          "Filter all series"
        )}
        {withTooltip(
          <IconButton
            icon={iconObject(
              <div>
                <svg viewBox="0 0 24 24" height="24px" width="24px">
                  <path d="M0,0H24V24H0Z" fill="none" />
                  <path
                    d="M13.71655,16.15582a4.5119,4.5119,0,1,1,2.43927-2.43927,5.9945,5.9945,0,0,1,4.01758-.60016A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.96389,5.96389,0,0,1,13.71655,16.15582Z"
                    opacity="0.3"
                  />
                  <path d="M12,7.5a4.5,4.5,0,1,0,1.71655,8.65582,6.02548,6.02548,0,0,1,2.43927-2.43927A4.49209,4.49209,0,0,0,12,7.5Zm0,7A2.5,2.5,0,1,1,14.5,12,2.50091,2.50091,0,0,1,12,14.5Zm1.02289,4.95294C12.68549,19.48193,12.345,19.5,12,19.5A11.82679,11.82679,0,0,1,1,12a11.81667,11.81667,0,0,1,22,0,11.81143,11.81143,0,0,1-.93243,1.85028,5.952,5.952,0,0,0-1.89417-.73389A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.99107,5.99107,0,0,0,13,19C13,19.15289,13.01166,19.30292,13.02289,19.45294ZM22.54,16.88,20.41,19l2.13,2.12-1.42,1.42L19,20.41l-2.12,2.13-1.41-1.42L17.59,19l-2.12-2.12,1.41-1.41L19,17.59l2.12-2.12,1.42,1.41" />
                </svg>
              </div>
            )}
            disabled={filtered.length === 0}
            onClick={clearFilter}
          />,
          "Clear filter"
        )}
      </>
    ) : null;
  const filterChips =
    props.filterable && props.allProfiles && hasKey(props.data, "profiles") ? (
      <div className="timeline-chips-container focus-chips">
        <ChipSet choice>
          {props.allProfiles.map((profile, index) => {
            if (props.data.profiles.includes(profile) || props.data.profiles.length === 0) {
              return (
                <Chip
                  key={profile}
                  label={profile}
                  icon={
                    filtered.length && !filtered.includes(profile)
                      ? iconObject(
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                            <g>
                              <rect fill="none" height="24" width="24" />
                            </g>
                            <g>
                              <g>
                                <circle cx="12" cy="12" opacity=".3" r="8" />
                                <path d="M12,2C6.47,2,2,6.47,2,12c0,5.53,4.47,10,10,10s10-4.47,10-10C22,6.47,17.53,2,12,2z M12,20c-4.42,0-8-3.58-8-8 c0-4.42,3.58-8,8-8s8,3.58,8,8C20,16.42,16.42,20,12,20z" />
                              </g>
                            </g>
                          </svg>
                        )
                      : "circle"
                  }
                  selected={filtered.includes(profile)}
                  onInteraction={() => {
                    setFilter(profile);
                  }}
                  className={`focus-chip focus-chip-index-${(index % (graphColors?.length || 0)) + 1}`}
                />
              );
            }
            return null;
          })}
        </ChipSet>
      </div>
    ) : null;
  const labels = useMemo(() => props.months.filter(filterLabels([[36, 2]])), [props.months]);
  const allowedKeys = useMemo(
    () =>
      props.filterable && filtered.length ? props.chartKeys.filter((key) => filtered.includes(key)) : props.chartKeys,
    [props.filterable, filtered, props.chartKeys]
  );
  const lineData = useMemo(
    () => props.data.monthsLine.filter((series) => typeof series.id === "string" && allowedKeys.includes(series.id)),
    [allowedKeys, props.data.monthsLine]
  );
  const allowUnstacked = graphType === "line" || (allowedKeys.length <= 4 && !props.singleTheme);
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        data={props.data.months}
        indexBy={"month"}
        keys={allowedKeys}
        groupMode={!stackedGraph && allowUnstacked ? "grouped" : "stacked"}
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        theme={nivoTheme}
        colors={
          currentTheme && props.singleTheme ? [currentTheme[props.singleTheme]] : graphColors ? graphColors : undefined
        }
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
        colors={
          currentTheme && props.singleTheme ? [currentTheme[props.singleTheme]] : graphColors ? graphColors : undefined
        }
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
    <Card className="timeline-card full-span">
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
          {filterButtons}
          {!props.singleTheme
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
                icon={props.singleTheme || !(stackedGraph || !allowUnstacked) ? "bar_chart" : "stacked_bar_chart"}
                selected={graphType === "bar"}
                onClick={() => {
                  setGraphType("bar");
                }}
              />,
              props.singleTheme || !(stackedGraph || !allowUnstacked) ? "Bar chart" : "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={props.singleTheme || !(stackedGraph || !allowUnstacked) ? "show_chart" : "stacked_line_chart"}
                selected={graphType === "line"}
                onClick={() => {
                  setGraphType("line");
                }}
              />,
              props.singleTheme || !(stackedGraph || !allowUnstacked) ? "Line chart" : "Stacked line chart"
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
        {filterChips}
        {props.note ? (
          <Typography use="caption" tag="p" className="note">
            {props.note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};

export interface TimelinesSummaryCardProps extends TimelinesCardProps {
  selectable?: boolean;
  breakdownData?: TimelinesDataObject[];
}

export const TimelinesSummaryCard = (props: TimelinesSummaryCardProps) => {
  const dispatch = useAppDispatch();
  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);
  const graphColors = useAppSelector(selectCurrentGraphColors);

  const [selectedProfile, setSelectedProfile] = useState("");
  useEffect(() => setSelectedProfile(""), [props.category]);

  const selectedData =
    props.selectable && props.breakdownData && selectedProfile
      ? props.breakdownData.find(({ name }) => name === selectedProfile) || props.data
      : props.data;

  const [filtered, setFiltered] = useState<string[]>([]);

  const {
    timelines: { type: graphType, stacked: stackedGraph },
  } = useAppSelector(selectChartSettings);
  const setStackedGraph = (value: boolean) =>
    dispatch(setStatisticsChartSetting({ tab: "timelines", key: "stacked", value }));
  const setGraphType = (value: "bar" | "line") =>
    dispatch(setStatisticsChartSetting({ tab: "timelines", key: "type", value }));

  const setFilter = (profile: string) => {
    const newFiltered = addOrRemove(filtered, profile);
    setFiltered(newFiltered);
  };
  const filterAll = () => {
    setFiltered(props.allProfiles || []);
  };
  const clearFilter = () => {
    setFiltered([]);
  };
  useEffect(filterAll, [props.category, props.allProfiles]);
  const selectChips =
    props.selectable && props.breakdownData ? (
      <div className="timeline-chips-container">
        <ChipSet choice>
          {[...props.breakdownData].sort(alphabeticalSortPropCurried("name")).map((obj) => (
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
  const filterButtons =
    props.filterable && props.allProfiles ? (
      <>
        {withTooltip(
          <IconButton
            icon={iconObject(
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px" width="24px">
                  <path d="M0,0H24V24H0Z" fill="none" />
                  <path
                    d="M13.71655,16.15582a4.5119,4.5119,0,1,1,2.43927-2.43927,5.9945,5.9945,0,0,1,4.01758-.60016A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.96389,5.96389,0,0,1,13.71655,16.15582Z"
                    opacity="0.3"
                  />
                  <path d="M12,7.5a4.5,4.5,0,1,0,1.71655,8.65582,6.02548,6.02548,0,0,1,2.43927-2.43927A4.49209,4.49209,0,0,0,12,7.5Zm0,7A2.5,2.5,0,1,1,14.5,12,2.50091,2.50091,0,0,1,12,14.5Zm1.02289,4.95294C12.68549,19.48193,12.345,19.5,12,19.5A11.82679,11.82679,0,0,1,1,12a11.81667,11.81667,0,0,1,22,0,11.81143,11.81143,0,0,1-.93243,1.85028,5.952,5.952,0,0,0-1.89417-.73389A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.99107,5.99107,0,0,0,13,19C13,19.15289,13.01166,19.30292,13.02289,19.45294ZM23.5,17l-5,5L15,18.5,16.5,17l2,2L22,15.5,23.5,17" />
                </svg>
              </div>
            )}
            disabled={filtered.length === props.data.profiles.length}
            onClick={filterAll}
          />,
          "Filter all series"
        )}
        {withTooltip(
          <IconButton
            icon={iconObject(
              <div>
                <svg viewBox="0 0 24 24" height="24px" width="24px">
                  <path d="M0,0H24V24H0Z" fill="none" />
                  <path
                    d="M13.71655,16.15582a4.5119,4.5119,0,1,1,2.43927-2.43927,5.9945,5.9945,0,0,1,4.01758-.60016A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.96389,5.96389,0,0,1,13.71655,16.15582Z"
                    opacity="0.3"
                  />
                  <path d="M12,7.5a4.5,4.5,0,1,0,1.71655,8.65582,6.02548,6.02548,0,0,1,2.43927-2.43927A4.49209,4.49209,0,0,0,12,7.5Zm0,7A2.5,2.5,0,1,1,14.5,12,2.50091,2.50091,0,0,1,12,14.5Zm1.02289,4.95294C12.68549,19.48193,12.345,19.5,12,19.5A11.82679,11.82679,0,0,1,1,12a11.81667,11.81667,0,0,1,22,0,11.81143,11.81143,0,0,1-.93243,1.85028,5.952,5.952,0,0,0-1.89417-.73389A9.949,9.949,0,0,0,20.82,12,9.82205,9.82205,0,0,0,3.18,12,9.77027,9.77027,0,0,0,12,17.5a9.95876,9.95876,0,0,0,1.21863-.08539A5.99107,5.99107,0,0,0,13,19C13,19.15289,13.01166,19.30292,13.02289,19.45294ZM22.54,16.88,20.41,19l2.13,2.12-1.42,1.42L19,20.41l-2.12,2.13-1.41-1.42L17.59,19l-2.12-2.12,1.41-1.41L19,17.59l2.12-2.12,1.42,1.41" />
                </svg>
              </div>
            )}
            disabled={filtered.length === 0}
            onClick={clearFilter}
          />,
          "Clear filter"
        )}
      </>
    ) : null;
  const filterChips =
    props.filterable && props.allProfiles && hasKey(props.data, "profiles") ? (
      <div className="timeline-chips-container focus-chips">
        <ChipSet choice>
          {props.allProfiles.map((profile, index) => {
            if (props.data.profiles.includes(profile) || props.data.profiles.length === 0) {
              return (
                <Chip
                  key={profile}
                  label={profile}
                  icon={
                    filtered.length && !filtered.includes(profile)
                      ? iconObject(
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                            <g>
                              <rect fill="none" height="24" width="24" />
                            </g>
                            <g>
                              <g>
                                <circle cx="12" cy="12" opacity=".3" r="8" />
                                <path d="M12,2C6.47,2,2,6.47,2,12c0,5.53,4.47,10,10,10s10-4.47,10-10C22,6.47,17.53,2,12,2z M12,20c-4.42,0-8-3.58-8-8 c0-4.42,3.58-8,8-8s8,3.58,8,8C20,16.42,16.42,20,12,20z" />
                              </g>
                            </g>
                          </svg>
                        )
                      : "circle"
                  }
                  selected={filtered.includes(profile)}
                  onInteraction={() => {
                    setFilter(profile);
                  }}
                  className={`focus-chip focus-chip-index-${(index % (graphColors?.length || 0)) + 1}`}
                />
              );
            }
            return null;
          })}
        </ChipSet>
      </div>
    ) : null;
  const labels = useMemo(() => props.months.filter(filterLabels([[36, 2]])), [props.months]);
  const allowedKeys = useMemo(
    () =>
      props.selectable && selectedProfile
        ? [selectedProfile]
        : props.filterable && filtered.length
        ? props.chartKeys.filter((key) => filtered.includes(key))
        : props.chartKeys,
    [props.selectable, selectedProfile, props.filterable, filtered, props.chartKeys]
  );
  const lineData = useMemo(
    () => selectedData.monthsLine.filter((series) => typeof series.id === "string" && allowedKeys.includes(series.id)),
    [allowedKeys, selectedData.monthsLine]
  );
  const allowUnstacked = graphType === "line" || (allowedKeys.length <= 4 && !props.singleTheme);
  const barChart =
    graphType === "bar" ? (
      <ResponsiveBar
        data={selectedData.months}
        indexBy={"month"}
        keys={allowedKeys}
        groupMode={!stackedGraph && allowUnstacked ? "grouped" : "stacked"}
        margin={{ top: 48, right: 48, bottom: 64, left: 64 }}
        theme={nivoTheme}
        colors={
          currentTheme && props.singleTheme ? [currentTheme[props.singleTheme]] : graphColors ? graphColors : undefined
        }
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
        colors={
          currentTheme && props.singleTheme ? [currentTheme[props.singleTheme]] : graphColors ? graphColors : undefined
        }
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
    <Card className="timeline-card full-span">
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
            {pluralise`${selectedData.total} ${[selectedData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          {filterButtons}
          {!props.singleTheme
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
                icon={props.singleTheme || !(stackedGraph || !allowUnstacked) ? "bar_chart" : "stacked_bar_chart"}
                selected={graphType === "bar"}
                onClick={() => {
                  setGraphType("bar");
                }}
              />,
              props.singleTheme || !(stackedGraph || !allowUnstacked) ? "Bar chart" : "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={props.singleTheme || !(stackedGraph || !allowUnstacked) ? "show_chart" : "stacked_line_chart"}
                selected={graphType === "line"}
                onClick={() => {
                  setGraphType("line");
                }}
              />,
              props.singleTheme || !(stackedGraph || !allowUnstacked) ? "Line chart" : "Stacked line chart"
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
        {filterChips}
        {props.note ? (
          <Typography use="caption" tag="p" className="note">
            {props.note}
          </Typography>
        ) : null}
      </div>
    </Card>
  );
};
