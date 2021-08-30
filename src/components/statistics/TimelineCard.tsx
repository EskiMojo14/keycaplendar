import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { Overwrite, ThemeMap } from "@s/common/types";
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
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/SegmentedButton";
import { withTooltip } from "@c/util/HOCs";
import "./TimelineCard.scss";

type ShippedCardProps = {
  data: ShippedDataObject;
  breakdownData?: ShippedDataObject[];
  summary?: boolean;
  defaultType?: "bar" | "line";
  overline?: React.ReactNode;
  note?: React.ReactNode;
};

export const ShippedCard = (props: ShippedCardProps) => {
  const device = useAppSelector(selectDevice);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [graphType, setGraphType] = useState<"bar" | "line">(props.defaultType || "bar");
  const chartData =
    selectedIndex >= 0 && props.summary && props.breakdownData
      ? [...props.breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : props.data;
  const selectChips =
    props.summary && props.breakdownData ? (
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
            {pluralise`${chartData.total} ${[chartData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon="stacked_bar_chart"
                selected={graphType === "bar"}
                onClick={() => {
                  setGraphType("bar");
                }}
              />,
              "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon="multiline_chart"
                selected={graphType === "line"}
                onClick={() => {
                  setGraphType("line");
                }}
              />,
              "Multiline chart"
            )}
          </SegmentedButton>
        </div>
      </div>
      <div className="timeline-container">
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
                  <DataTableCell isNumeric>{chartData.shipped}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator not-shipped"></div>Not shipped
                  </DataTableCell>
                  <DataTableCell isNumeric>{chartData.unshipped}</DataTableCell>
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

export type CommonTimelinesCardProps = {
  data: TimelinesDataObject;
  singleTheme?: Exclude<keyof ThemeMap, "dark">;
  defaultType?: "bar" | "line";
  category?: string;
  filterable?: boolean;
  allProfiles?: string[];
  summary?: false;
  profile?: false;
  breakdownData?: TimelinesDataObject[];
  overline?: React.ReactNode;
  note?: React.ReactNode;
};

export type SummaryTimelinesCardProps = Overwrite<
  CommonTimelinesCardProps,
  {
    summary: true;
    breakdownData?: { name: string; total: number; profiles?: string[] }[];
  }
>;
export type ProfileTimelinesCardProps = Overwrite<
  CommonTimelinesCardProps,
  {
    profile: true;
    data: { name: string; total: number; profiles?: string[] };
    chartData: Record<string, string | number>[];
  }
>;

export const TimelinesCard = <
  Props extends
    | CommonTimelinesCardProps
    | SummaryTimelinesCardProps
    | ProfileTimelinesCardProps = CommonTimelinesCardProps
>(
  props: Props
) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [props.category]);
  const chartData: TimelinesDataObject | { name: string; total: number; profiles?: string[] } =
    props.summary && props.breakdownData && selectedIndex >= 0
      ? [...props.breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : props.data;
  const [filtered, setFiltered] = useState<string[]>([]);
  const [graphType, setGraphType] = useState<"bar" | "line">(props.defaultType || "bar");
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
    props.summary && props.breakdownData ? (
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
            disabled={filtered.length === chartData.profiles?.length}
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
    props.filterable && props.allProfiles && hasKey(chartData, "profiles") ? (
      <div className="timeline-chips-container">
        <ChipSet filter>
          {props.allProfiles.map((profile) => {
            if (chartData.profiles?.includes(profile) || chartData.profiles?.length === 0) {
              return (
                <Chip
                  key={profile}
                  label={profile}
                  checkmark
                  selected={filtered.includes(profile)}
                  onInteraction={() => {
                    setFilter(profile);
                  }}
                />
              );
            }
            return null;
          })}
        </ChipSet>
      </div>
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
            {pluralise`${chartData.total} ${[chartData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          {filterButtons}
          <SegmentedButton toggle>
            {withTooltip(
              <SegmentedButtonSegment
                icon={props.singleTheme ? "bar_chart" : "stacked_bar_chart"}
                selected={graphType === "bar"}
                onClick={() => {
                  setGraphType("bar");
                }}
              />,
              props.singleTheme ? "Bar chart" : "Stacked bar chart"
            )}
            {withTooltip(
              <SegmentedButtonSegment
                icon={props.singleTheme ? "show_chart" : "multiline_chart"}
                selected={graphType === "line"}
                onClick={() => {
                  setGraphType("line");
                }}
              />,
              props.singleTheme ? "Line chart" : "Multiline chart"
            )}
          </SegmentedButton>
        </div>
      </div>
      <div className="timeline-container">
        <div
          className={classNames(
            "timeline-chart-container timelines",
            {
              single: props.singleTheme,
              filtered: filtered.length > 0,
            },
            typeof props.singleTheme === "string" ? props.singleTheme : "",
            filtered.map((index) => `series-index-${index}`)
          )}
        ></div>
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
