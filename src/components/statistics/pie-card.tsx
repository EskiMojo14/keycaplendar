import { useContext, useEffect, useMemo, useState } from "react";
import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { ResponsiveCirclePacking } from "@nivo/circle-packing";
import type { ComputedDatum as PackingDatum } from "@nivo/circle-packing";
import { ResponsiveSunburst } from "@nivo/sunburst";
import type { DatumId, SunburstCustomLayerProps, ComputedDatum as SunburstDatum } from "@nivo/sunburst";
import { Card } from "@rmwc/card";
import { Checkbox } from "@rmwc/checkbox";
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
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import { NivoThemeContext } from "@c/util/theme-provider";
import { selectDevice } from "@s/common";
import { getTextColour } from "@s/common/functions";
import { selectChartSettings, setStatisticsSunburstPackingChartSetting } from "@s/statistics";
import { sunburstChildHasChildren } from "@s/statistics/functions";
import type { StatusDataObject, StatusDataObjectSunburstChild } from "@s/statistics/types";
import {
  alphabeticalSortPropCurried,
  arrayIncludes,
  hasKey,
  iconObject,
  objectKeys,
  pluralise,
} from "@s/util/functions";
import { BubbleChart, DonutSmall } from "@i";
import "./pie-card.scss";

const statuses = ["IC", "Live GB", "Pre GB", "Post GB", "Shipped"] as const;

const statusColors = {
  IC: "var(--theme-grey-2)",
  "Pre GB": "var(--theme-grey-1)",
  "Live GB": "var(--theme-secondary)",
  "Post GB": "var(--theme-primary)",
  Shipped: "var(--theme-primary-dark)",
  default: "var(--theme-lighter-divider)",
};

const flatten = (data: StatusDataObjectSunburstChild[]): StatusDataObjectSunburstChild[] =>
  data.reduce<StatusDataObjectSunburstChild[]>((acc, item) => {
    if (sunburstChildHasChildren(item)) {
      return [...acc, item, ...flatten(item.children)];
    }

    return [...acc, item];
  }, []);

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

type StatusCardProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  data: StatusDataObject;
  overline?: ReactNode;
  note?: ReactNode;
};

export const StatusCard = ({ data, overline, note, ...props }: StatusCardProps) => {
  const dispatch = useAppDispatch();

  const {
    sunburstPacking: {
      status: { type: graphType },
    },
  } = useAppSelector(selectChartSettings);
  const setGraphType = (value: "packing" | "sunburst") =>
    dispatch(setStatisticsSunburstPackingChartSetting({ tab: "status", key: "type", value }));
  const getStatusColor = <RawDatum,>(
    node: Omit<PackingDatum<RawDatum>, "color" | "fill"> | Omit<SunburstDatum<RawDatum>, "color" | "fill">
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
        borderColor="var(--theme-elevated-surface2)"
        borderWidth={2}
        valueFormat=">-,"
        enableArcLabels
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={({ color }) => getTextColour(color)}
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
        borderColor="var(--theme-elevated-surface2)"
        borderWidth={1}
        valueFormat=">-,"
        enableLabels
        labelsFilter={(label) => label.node.depth === 1}
        labelsSkipRadius={32}
        labelTextColor={({ color }) => getTextColour(color)}
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
                icon={iconObject(<DonutSmall />)}
                selected={graphType === "sunburst"}
                onClick={() => {
                  setGraphType("sunburst");
                }}
              />,
              "Sunburst chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={iconObject(<BubbleChart />)}
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
  const setGraphType = (value: "packing" | "sunburst") =>
    dispatch(setStatisticsSunburstPackingChartSetting({ tab: "status", key: "type", value }));

  const device = useAppSelector(selectDevice);

  const getStatusColor = <RawDatum,>(
    node: Omit<PackingDatum<RawDatum>, "color" | "fill"> | Omit<SunburstDatum<RawDatum>, "color" | "fill">
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
        borderColor="var(--theme-elevated-surface2)"
        borderWidth={2}
        valueFormat=">-,"
        enableArcLabels
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={({ color }) => getTextColour(color)}
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
        borderColor="var(--theme-elevated-surface2)"
        borderWidth={1}
        valueFormat=">-,"
        enableLabels
        labelsFilter={(label) => label.node.depth === 1}
        labelsSkipRadius={32}
        labelTextColor={({ color }) => getTextColour(color)}
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
                icon={iconObject(<DonutSmall />)}
                selected={graphType === "sunburst"}
                onClick={() => {
                  setGraphType("sunburst");
                }}
              />,
              "Sunburst chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={iconObject(<BubbleChart />)}
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
