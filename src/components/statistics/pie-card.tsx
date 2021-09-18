import { useState, useContext, useEffect, useMemo, ReactNode, HTMLAttributes, DetailedHTMLProps } from "react";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectCurrentThemeMap, selectDevice } from "@s/common";
import { getTextColour } from "@s/common/functions";
import { selectChartSettings, setStatisticsSunburstPackingChartSetting } from "@s/statistics";
import { sunburstChildHasChildren } from "@s/statistics/functions";
import { StatusDataObject, StatusDataObjectSunburstChild } from "@s/statistics/types";
import {
  alphabeticalSortPropCurried,
  arrayIncludes,
  hasKey,
  iconObject,
  objectKeys,
  pluralise,
} from "@s/util/functions";
import { Card } from "@rmwc/card";
import { Checkbox } from "@rmwc/checkbox";
import { Chip, ChipSet } from "@rmwc/chip";
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
import { ResponsiveSunburst, ComputedDatum as SunburstDatum, DatumId, SunburstCustomLayerProps } from "@nivo/sunburst";
import { ResponsiveCirclePacking, ComputedDatum as PackingDatum } from "@nivo/circle-packing";
import { NivoThemeContext } from "@c/util/theme-provider";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import { withTooltip } from "@c/util/hocs";
import "./pie-card.scss";

const statuses = ["IC", "Live GB", "Pre GB", "Post GB", "Shipped"] as const;

const flatten = (data: StatusDataObjectSunburstChild[]): StatusDataObjectSunburstChild[] =>
  data.reduce((acc, item) => {
    if (sunburstChildHasChildren(item)) {
      return [...acc, item, ...flatten(item.children)];
    }

    return [...acc, item];
  }, [] as StatusDataObjectSunburstChild[]);

const findObject = (data: StatusDataObjectSunburstChild[], name: DatumId) =>
  data.find((searchedName) => searchedName.id === name);

const CentredLabel = <RawDatum,>({ nodes, centerX, centerY }: SunburstCustomLayerProps<RawDatum>) => {
  const category = nodes.find((node) => node && arrayIncludes(statuses, node.id));
  return !category && nodes[0] ? (
    <text
      x={centerX}
      y={centerY}
      textAnchor="middle"
      dominantBaseline="central"
      className="mdc-typography--headline5"
      style={{ fill: "currentColor" }}
    >
      {`${nodes[0]?.id}`.split(" - ")[0]}
    </text>
  ) : null;
};

type StatusCardProps = {
  data: StatusDataObject;
  overline?: ReactNode;
  note?: ReactNode;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const StatusCard = ({ data, overline, note, ...props }: StatusCardProps) => {
  const dispatch = useAppDispatch();

  const {
    sunburstPacking: {
      status: { type: graphType },
    },
  } = useAppSelector(selectChartSettings);
  const setGraphType = (value: "sunburst" | "packing") =>
    dispatch(setStatisticsSunburstPackingChartSetting({ tab: "status", key: "type", value }));

  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const statusColors = currentTheme
    ? {
        IC: currentTheme.grey2,
        "Pre GB": currentTheme.grey1,
        "Live GB": currentTheme.secondary,
        "Post GB": currentTheme.primary,
        Shipped: currentTheme.primaryDark,
        default: currentTheme.lighterDivider,
      }
    : {};
  const getStatusColor = <RawDatum,>(
    node: Omit<SunburstDatum<RawDatum>, "color" | "fill"> | Omit<PackingDatum<RawDatum>, "color" | "fill">
  ) => {
    const category = [...node.path].find((pathItem) => arrayIncludes(objectKeys(statusColors), pathItem)) || "";
    if (hasKey(statusColors, category)) {
      return statusColors[category] || statusColors.default || "transparent";
    }
    return statusColors.default || "transparent";
  };

  const nivoTheme = useContext(NivoThemeContext);

  const [chartData, setChartData] = useState(data.sunburst);
  useEffect(() => setChartData(data.sunburst), [data.sunburst]);
  const toggleSeries = (string: typeof statuses[number]) => {
    if (string === chartData.id) {
      setChartData(data.sunburst);
    } else {
      const foundObject = data.sunburst.children.find((datum) => datum.id === string);
      if (foundObject && sunburstChildHasChildren(foundObject)) {
        setChartData(foundObject);
      }
    }
  };
  const noChildren = useMemo(() => !sunburstChildHasChildren(data.sunburst.children[0] || {}), [
    data.sunburst.children,
  ]);
  const sunburstChart =
    graphType === "sunburst" ? (
      <ResponsiveSunburst<StatusDataObjectSunburstChild>
        data={chartData}
        value="val"
        colors={getStatusColor}
        inheritColorFromParent={false}
        margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
        theme={nivoTheme}
        borderColor={currentTheme?.elevatedSurface[1]}
        borderWidth={2}
        valueFormat=">-,"
        enableArcLabels
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={currentTheme ? ({ color }) => getTextColour(color, currentTheme) : undefined}
        layers={["arcs", "arcLabels", CentredLabel]}
        onClick={(clickedData) => {
          if (sunburstChildHasChildren(chartData)) {
            const foundObject = findObject(flatten(chartData.children), clickedData.id);
            if (foundObject && sunburstChildHasChildren(foundObject)) {
              setChartData(foundObject);
            }
          }
        }}
      />
    ) : null;
  const packingChart =
    graphType === "packing" ? (
      <ResponsiveCirclePacking<StatusDataObjectSunburstChild>
        data={chartData}
        value="val"
        colors={getStatusColor}
        colorBy="id"
        inheritColorFromParent={false}
        margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
        theme={nivoTheme}
        borderColor={currentTheme?.elevatedSurface[1]}
        borderWidth={1}
        valueFormat=">-,"
        enableLabels
        labelsFilter={(label) => label.node.depth === 1}
        labelsSkipRadius={32}
        labelTextColor={currentTheme ? ({ color }) => getTextColour(color, currentTheme) : undefined}
        onClick={(clickedData) => {
          if (sunburstChildHasChildren(chartData)) {
            const foundObject = findObject(flatten(chartData.children), clickedData.id);
            if (foundObject && sunburstChildHasChildren(foundObject)) {
              setChartData(foundObject);
            }
          }
        }}
      />
    ) : null;
  return (
    <Card {...props} className={classNames("pie-card", props.className)}>
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
                icon={iconObject(
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                      d="M15.99 9h3.43C18.6 7 17 5.4 15 4.58v3.43c.37.28.71.62.99.99zM4 12c0 3.35 2.04 6.24 5 7.42v-3.44c-1.23-.93-2-2.4-2-3.99C7 10.4 7.77 8.93 9 8V4.58C6.04 5.76 4 8.65 4 12zm11 3.99v3.43c2-.82 3.6-2.42 4.42-4.42h-3.43c-.28.37-.62.71-.99.99z"
                      opacity=".3"
                    />
                    <path d="M14.82 11h7.13c-.47-4.72-4.23-8.48-8.95-8.95v7.13c.85.31 1.51.97 1.82 1.82zM15 4.58C17 5.4 18.6 7 19.42 9h-3.43c-.28-.37-.62-.71-.99-.99V4.58zM2 12c0 5.19 3.95 9.45 9 9.95v-7.13C9.84 14.4 9 13.3 9 12c0-1.3.84-2.4 2-2.82V2.05c-5.05.5-9 4.76-9 9.95zm7-7.42v3.44c-1.23.92-2 2.39-2 3.98 0 1.59.77 3.06 2 3.99v3.44C6.04 18.24 4 15.35 4 12c0-3.35 2.04-6.24 5-7.42zm4 10.24v7.13c4.72-.47 8.48-4.23 8.95-8.95h-7.13c-.31.85-.97 1.51-1.82 1.82zm2 1.17c.37-.28.71-.61.99-.99h3.43C18.6 17 17 18.6 15 19.42v-3.43z" />
                  </svg>
                )}
                selected={graphType === "sunburst"}
                onClick={() => {
                  setGraphType("sunburst");
                }}
              />,
              "Sunburst chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={iconObject(
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                      d="M16.5 12c1.93 0 3.5-1.57 3.5-3.5S18.43 5 16.5 5 13 6.57 13 8.5s1.57 3.5 3.5 3.5z"
                      opacity=".3"
                    />
                    <circle cx="15.01" cy="18" opacity=".3" r="1" />
                    <circle cx="7" cy="14" opacity=".3" r="2" />
                    <path d="M7 18c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm11.01 6c0-1.65-1.35-3-3-3s-3 1.35-3 3 1.35 3 3 3 3-1.35 3-3zm-4 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm2.49-4c3.03 0 5.5-2.47 5.5-5.5S19.53 3 16.5 3 11 5.47 11 8.5s2.47 5.5 5.5 5.5zm0-9C18.43 5 20 6.57 20 8.5S18.43 12 16.5 12 13 10.43 13 8.5 14.57 5 16.5 5z" />
                  </svg>
                )}
                selected={graphType === "packing"}
                onClick={() => {
                  setGraphType("packing");
                }}
              />,
              "Circle packing chart"
            )}
          </SegmentedButton>
        </div>
      </div>
      <div className="pie-container">
        <div className="pie-chart-container">
          {sunburstChart}
          {packingChart}
        </div>
        <div className="table-container">
          <DataTable className="rounded">
            <DataTableContent>
              <DataTableHead>
                <DataTableRow>
                  <DataTableHeadCell hasFormControl></DataTableHeadCell>
                  <DataTableHeadCell>Status</DataTableHeadCell>
                  <DataTableHeadCell isNumeric>Sets</DataTableHeadCell>
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                <DataTableRow className="ic">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={chartData.id === "IC"}
                      onClick={() => toggleSeries("IC")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>IC</DataTableCell>
                  <DataTableCell isNumeric>{data.pie.ic}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="pre-gb">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={chartData.id === "Pre GB"}
                      onClick={() => toggleSeries("Pre GB")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Pre GB</DataTableCell>
                  <DataTableCell isNumeric>{data.pie.preGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="live-gb">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={chartData.id === "Live GB"}
                      onClick={() => toggleSeries("Live GB")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Live GB</DataTableCell>
                  <DataTableCell isNumeric>{data.pie.liveGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="post-gb">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={chartData.id === "Post GB"}
                      onClick={() => toggleSeries("Post GB")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Post GB</DataTableCell>
                  <DataTableCell isNumeric>{data.pie.postGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="post-gb-shipped">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={chartData.id === "Shipped"}
                      onClick={() => toggleSeries("Shipped")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Shipped</DataTableCell>
                  <DataTableCell isNumeric>{data.pie.postGbShipped}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
      </div>
      {note ? (
        <Typography use="caption" tag="p" className="note">
          {note}
        </Typography>
      ) : null}
    </Card>
  );
};

interface StatusSummaryCardProps extends StatusCardProps {
  breakdownData: StatusDataObject[];
}

export const StatusSummaryCard = ({ data, breakdownData, overline, note, ...props }: StatusSummaryCardProps) => {
  const dispatch = useAppDispatch();

  const {
    sunburstPacking: {
      status: { type: graphType },
    },
  } = useAppSelector(selectChartSettings);
  const setGraphType = (value: "sunburst" | "packing") =>
    dispatch(setStatisticsSunburstPackingChartSetting({ tab: "status", key: "type", value }));

  const device = useAppSelector(selectDevice);
  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const statusColors = currentTheme
    ? {
        IC: currentTheme.grey2,
        "Pre GB": currentTheme.grey1,
        "Live GB": currentTheme.secondary,
        "Post GB": currentTheme.primary,
        Shipped: currentTheme.primaryDark,
        default: currentTheme.lighterDivider,
      }
    : {};
  const getStatusColor = <RawDatum,>(
    node: Omit<SunburstDatum<RawDatum>, "color" | "fill"> | Omit<PackingDatum<RawDatum>, "color" | "fill">
  ) => {
    const category = [...node.path].find((pathItem) => arrayIncludes(objectKeys(statusColors), pathItem)) || "";
    if (hasKey(statusColors, category)) {
      return statusColors[category] || statusColors.default || "transparent";
    }
    return statusColors.default || "transparent";
  };

  const nivoTheme = useContext(NivoThemeContext);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const chartData =
    selectedIndex >= 0 && breakdownData
      ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : data;
  const [filterData, setFilterData] = useState(chartData.sunburst);
  useEffect(() => setFilterData(chartData.sunburst), [chartData.sunburst]);
  const sideways = device === "desktop";
  const selectChips = breakdownData ? (
    <div className="pie-chips-container">
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
  const toggleSeries = (string: typeof statuses[number]) => {
    if (string === filterData.id) {
      setFilterData(chartData.sunburst);
    } else {
      const foundObject = chartData.sunburst.children.find((datum) => datum.id === string);
      if (foundObject && sunburstChildHasChildren(foundObject)) {
        setFilterData(foundObject);
      }
    }
  };
  const noChildren = useMemo(() => !sunburstChildHasChildren(chartData.sunburst.children[0] || {}), [
    chartData.sunburst.children,
  ]);

  const sunburstChart =
    graphType === "sunburst" ? (
      <ResponsiveSunburst<StatusDataObjectSunburstChild>
        data={filterData}
        value="val"
        colors={getStatusColor}
        inheritColorFromParent={false}
        margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
        theme={nivoTheme}
        borderColor={currentTheme?.elevatedSurface[1]}
        borderWidth={2}
        valueFormat=">-,"
        enableArcLabels
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={currentTheme ? ({ color }) => getTextColour(color, currentTheme) : undefined}
        layers={["arcs", "arcLabels", CentredLabel]}
        onClick={(clickedData) => {
          if (sunburstChildHasChildren(filterData)) {
            const foundObject = findObject(flatten(filterData.children), clickedData.id);
            if (foundObject && sunburstChildHasChildren(foundObject)) {
              setFilterData(foundObject);
            }
          }
        }}
      />
    ) : null;
  const packingChart =
    graphType === "packing" ? (
      <ResponsiveCirclePacking<StatusDataObjectSunburstChild>
        data={filterData}
        value="val"
        colors={getStatusColor}
        colorBy="id"
        inheritColorFromParent={false}
        margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
        theme={nivoTheme}
        borderColor={currentTheme?.elevatedSurface[1]}
        borderWidth={1}
        valueFormat=">-,"
        enableLabels
        labelsFilter={(label) => label.node.depth === 1}
        labelsSkipRadius={32}
        labelTextColor={currentTheme ? ({ color }) => getTextColour(color, currentTheme) : undefined}
        onClick={(clickedData) => {
          if (sunburstChildHasChildren(filterData)) {
            const foundObject = findObject(flatten(filterData.children), clickedData.id);
            if (foundObject && sunburstChildHasChildren(foundObject)) {
              setFilterData(foundObject);
            }
          }
        }}
      />
    ) : null;
  return (
    <Card
      {...props}
      className={classNames(
        "pie-card",
        {
          sideways,
        },
        props.className
      )}
    >
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
                icon={iconObject(
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                      d="M15.99 9h3.43C18.6 7 17 5.4 15 4.58v3.43c.37.28.71.62.99.99zM4 12c0 3.35 2.04 6.24 5 7.42v-3.44c-1.23-.93-2-2.4-2-3.99C7 10.4 7.77 8.93 9 8V4.58C6.04 5.76 4 8.65 4 12zm11 3.99v3.43c2-.82 3.6-2.42 4.42-4.42h-3.43c-.28.37-.62.71-.99.99z"
                      opacity=".3"
                    />
                    <path d="M14.82 11h7.13c-.47-4.72-4.23-8.48-8.95-8.95v7.13c.85.31 1.51.97 1.82 1.82zM15 4.58C17 5.4 18.6 7 19.42 9h-3.43c-.28-.37-.62-.71-.99-.99V4.58zM2 12c0 5.19 3.95 9.45 9 9.95v-7.13C9.84 14.4 9 13.3 9 12c0-1.3.84-2.4 2-2.82V2.05c-5.05.5-9 4.76-9 9.95zm7-7.42v3.44c-1.23.92-2 2.39-2 3.98 0 1.59.77 3.06 2 3.99v3.44C6.04 18.24 4 15.35 4 12c0-3.35 2.04-6.24 5-7.42zm4 10.24v7.13c4.72-.47 8.48-4.23 8.95-8.95h-7.13c-.31.85-.97 1.51-1.82 1.82zm2 1.17c.37-.28.71-.61.99-.99h3.43C18.6 17 17 18.6 15 19.42v-3.43z" />
                  </svg>
                )}
                selected={graphType === "sunburst"}
                onClick={() => {
                  setGraphType("sunburst");
                }}
              />,
              "Sunburst chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={iconObject(
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                      d="M16.5 12c1.93 0 3.5-1.57 3.5-3.5S18.43 5 16.5 5 13 6.57 13 8.5s1.57 3.5 3.5 3.5z"
                      opacity=".3"
                    />
                    <circle cx="15.01" cy="18" opacity=".3" r="1" />
                    <circle cx="7" cy="14" opacity=".3" r="2" />
                    <path d="M7 18c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm11.01 6c0-1.65-1.35-3-3-3s-3 1.35-3 3 1.35 3 3 3 3-1.35 3-3zm-4 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm2.49-4c3.03 0 5.5-2.47 5.5-5.5S19.53 3 16.5 3 11 5.47 11 8.5s2.47 5.5 5.5 5.5zm0-9C18.43 5 20 6.57 20 8.5S18.43 12 16.5 12 13 10.43 13 8.5 14.57 5 16.5 5z" />
                  </svg>
                )}
                selected={graphType === "packing"}
                onClick={() => {
                  setGraphType("packing");
                }}
              />,
              "Circle packing chart"
            )}
          </SegmentedButton>
        </div>
      </div>
      <div className="pie-container">
        <div className="pie-chart-container">
          {sunburstChart}
          {packingChart}
        </div>
        <div className="table-container">
          <DataTable className="rounded">
            <DataTableContent>
              <DataTableHead>
                <DataTableRow>
                  <DataTableHeadCell hasFormControl></DataTableHeadCell>
                  <DataTableHeadCell>Status</DataTableHeadCell>
                  <DataTableHeadCell isNumeric>Sets</DataTableHeadCell>
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                <DataTableRow className="ic">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={filterData.id === "IC"}
                      onClick={() => toggleSeries("IC")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>IC</DataTableCell>
                  <DataTableCell isNumeric>{chartData.pie.ic}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="pre-gb">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={filterData.id === "Pre GB"}
                      onClick={() => toggleSeries("Pre GB")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Pre GB</DataTableCell>
                  <DataTableCell isNumeric>{chartData.pie.preGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="live-gb">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={filterData.id === "Live GB"}
                      onClick={() => toggleSeries("Live GB")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Live GB</DataTableCell>
                  <DataTableCell isNumeric>{chartData.pie.liveGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="post-gb">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={filterData.id === "Post GB"}
                      onClick={() => toggleSeries("Post GB")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Post GB</DataTableCell>
                  <DataTableCell isNumeric>{chartData.pie.postGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="post-gb-shipped">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={filterData.id === "Shipped"}
                      onClick={() => toggleSeries("Shipped")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Shipped</DataTableCell>
                  <DataTableCell isNumeric>{chartData.pie.postGbShipped}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
      </div>
      {selectChips}
      {note ? (
        <Typography use="caption" tag="p" className="note">
          {note}
        </Typography>
      ) : null}
    </Card>
  );
};
