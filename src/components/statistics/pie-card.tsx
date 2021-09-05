import React, { useState, useContext, useEffect, useMemo } from "react";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { selectCurrentThemeMap, selectDevice } from "@s/common";
import { getTextColour } from "@s/common/functions";
import { sunburstChildHasChildren } from "@s/statistics/functions";
import { StatusDataObject, StatusDataObjectSunburstChild } from "@s/statistics/types";
import { alphabeticalSortPropCurried, arrayIncludes, hasKey, objectKeys, pluralise } from "@s/util/functions";
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
import { ResponsiveSunburst, ComputedDatum, DatumId, SunburstCustomLayerProps } from "@nivo/sunburst";
import { NivoThemeContext } from "@c/util/theme-provider";
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
  overline?: React.ReactNode;
  note?: React.ReactNode;
};

export const StatusCard = (props: StatusCardProps) => {
  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const statusColors = currentTheme
    ? {
        IC: currentTheme.grey2,
        "Pre GB": currentTheme.grey1,
        "Live GB": currentTheme.secondary,
        "Post GB": currentTheme.primary,
        Shipped: currentTheme.primaryDark,
      }
    : {};
  const getStatusColor = <RawDatum,>(node: Omit<ComputedDatum<RawDatum>, "color" | "fill">) => {
    const category = [...node.path].find((pathItem) => arrayIncludes(objectKeys(statusColors), pathItem)) || "";
    if (hasKey(statusColors, category)) {
      return statusColors[category] || "#000";
    }
    return "#000";
  };

  const nivoTheme = useContext(NivoThemeContext);

  const [data, setData] = useState(props.data.sunburst);
  useEffect(() => setData(props.data.sunburst), [props.data.sunburst]);
  const toggleSeries = (string: typeof statuses[number]) => {
    if (string === data.id) {
      setData(props.data.sunburst);
    } else {
      const foundObject = props.data.sunburst.children.find((datum) => datum.id === string);
      if (foundObject && sunburstChildHasChildren(foundObject)) {
        setData(foundObject);
      }
    }
  };
  const noChildren = useMemo(() => !sunburstChildHasChildren(props.data.sunburst.children[0] || {}), [
    props.data.sunburst.children,
  ]);
  return (
    <Card className="pie-card">
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
      </div>
      <div className="pie-container">
        <div className="pie-chart-container">
          <ResponsiveSunburst<StatusDataObjectSunburstChild>
            data={data}
            value="val"
            colors={getStatusColor}
            inheritColorFromParent={false}
            margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
            theme={nivoTheme}
            borderColor={currentTheme?.elevatedSurface1}
            borderWidth={2}
            valueFormat=">-,"
            enableArcLabels
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={currentTheme ? ({ color }) => getTextColour(color, currentTheme) : undefined}
            layers={["arcs", "arcLabels", CentredLabel]}
            onClick={(clickedData) => {
              if (sunburstChildHasChildren(data)) {
                const foundObject = findObject(flatten(data.children), clickedData.id);
                if (foundObject && sunburstChildHasChildren(foundObject)) {
                  setData(foundObject);
                }
              }
            }}
          />
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
                    <Checkbox checked={data.id === "IC"} onClick={() => toggleSeries("IC")} disabled={noChildren} />
                  </DataTableCell>
                  <DataTableCell>IC</DataTableCell>
                  <DataTableCell isNumeric>{props.data.pie.ic}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="pre-gb">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={data.id === "Pre GB"}
                      onClick={() => toggleSeries("Pre GB")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Pre GB</DataTableCell>
                  <DataTableCell isNumeric>{props.data.pie.preGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="live-gb">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={data.id === "Live GB"}
                      onClick={() => toggleSeries("Live GB")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Live GB</DataTableCell>
                  <DataTableCell isNumeric>{props.data.pie.liveGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="post-gb">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={data.id === "Post GB"}
                      onClick={() => toggleSeries("Post GB")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Post GB</DataTableCell>
                  <DataTableCell isNumeric>{props.data.pie.postGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="post-gb-shipped">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={data.id === "Shipped"}
                      onClick={() => toggleSeries("Shipped")}
                      disabled={noChildren}
                    />
                  </DataTableCell>
                  <DataTableCell>Shipped</DataTableCell>
                  <DataTableCell isNumeric>{props.data.pie.postGbShipped}</DataTableCell>
                </DataTableRow>
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
      </div>
      {props.note ? (
        <Typography use="caption" tag="p" className="note">
          {props.note}
        </Typography>
      ) : null}
    </Card>
  );
};

interface StatusSummaryCardProps extends StatusCardProps {
  breakdownData: StatusDataObject[];
}

export const StatusSummaryCard = (props: StatusSummaryCardProps) => {
  const device = useAppSelector(selectDevice);
  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const statusColors = currentTheme
    ? {
        IC: currentTheme.grey2,
        "Pre GB": currentTheme.grey1,
        "Live GB": currentTheme.secondary,
        "Post GB": currentTheme.primary,
        Shipped: currentTheme.primaryDark,
      }
    : {};
  const getStatusColor = <RawDatum,>(node: Omit<ComputedDatum<RawDatum>, "color" | "fill">) => {
    const category = [...node.path].find((pathItem) => arrayIncludes(objectKeys(statusColors), pathItem)) || "";
    if (hasKey(statusColors, category)) {
      return statusColors[category] || "#000";
    }
    return "#000";
  };

  const nivoTheme = useContext(NivoThemeContext);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const chartData =
    selectedIndex >= 0 && props.breakdownData
      ? [...props.breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : props.data;
  const [data, setData] = useState(chartData.sunburst);
  useEffect(() => setData(chartData.sunburst), [chartData.sunburst]);
  const sideways = device === "desktop";
  const selectChips = props.breakdownData ? (
    <div className="pie-chips-container">
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
  const toggleSeries = (string: typeof statuses[number]) => {
    if (string === data.id) {
      setData(chartData.sunburst);
    } else {
      const foundObject = chartData.sunburst.children.find((datum) => datum.id === string);
      if (foundObject && sunburstChildHasChildren(foundObject)) {
        setData(foundObject);
      }
    }
  };
  const noChildren = useMemo(() => !sunburstChildHasChildren(chartData.sunburst.children[0] || {}), [
    chartData.sunburst.children,
  ]);
  return (
    <Card
      className={classNames("pie-card full-span", {
        sideways,
      })}
    >
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
      </div>
      <div className="pie-container">
        <div className="pie-chart-container">
          <ResponsiveSunburst<StatusDataObjectSunburstChild>
            data={data}
            value="val"
            colors={getStatusColor}
            inheritColorFromParent={false}
            margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
            theme={nivoTheme}
            borderColor={currentTheme?.elevatedSurface1}
            borderWidth={2}
            valueFormat=">-,"
            enableArcLabels
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={currentTheme ? ({ color }) => getTextColour(color, currentTheme) : undefined}
            layers={["arcs", "arcLabels", CentredLabel]}
            onClick={(clickedData) => {
              if (sunburstChildHasChildren(data)) {
                const foundObject = findObject(flatten(data.children), clickedData.id);
                if (foundObject && sunburstChildHasChildren(foundObject)) {
                  setData(foundObject);
                }
              }
            }}
          />
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
                    <Checkbox checked={data.id === "IC"} onClick={() => toggleSeries("IC")} disabled={noChildren} />
                  </DataTableCell>
                  <DataTableCell>IC</DataTableCell>
                  <DataTableCell isNumeric>{chartData.pie.ic}</DataTableCell>
                </DataTableRow>
                <DataTableRow className="pre-gb">
                  <DataTableCell hasFormControl>
                    <div className="indicator"></div>
                    <Checkbox
                      checked={data.id === "Pre GB"}
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
                      checked={data.id === "Live GB"}
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
                      checked={data.id === "Post GB"}
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
                      checked={data.id === "Shipped"}
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
      {props.note ? (
        <Typography use="caption" tag="p" className="note">
          {props.note}
        </Typography>
      ) : null}
    </Card>
  );
};
