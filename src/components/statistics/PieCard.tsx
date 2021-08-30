import React, { useState, useContext } from "react";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { selectCurrentThemeMap, selectDevice } from "@s/common";
import { StatusDataObject, StatusDataObjectSunburstChild } from "@s/statistics/types";
import { alphabeticalSortPropCurried, pluralise } from "@s/util/functions";
import { Card } from "@rmwc/card";
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
import { ResponsiveSunburst } from "@nivo/sunburst";
import { NivoThemeContext } from "@c/util/ThemeProvider";
import "./PieCard.scss";
type StatusCardProps = {
  data: StatusDataObject;
  breakdownData?: StatusDataObject[];
  summary?: boolean;
  overline?: React.ReactNode;
  note?: React.ReactNode;
};

export const StatusCard = (props: StatusCardProps) => {
  const device = useAppSelector(selectDevice);
  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const nivoTheme = useContext(NivoThemeContext);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const chartData =
    selectedIndex >= 0 && props.summary && props.breakdownData
      ? [...props.breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : props.data;
  const sideways = props.summary && device === "desktop";
  const selectChips =
    props.summary && props.breakdownData ? (
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
  return (
    <Card
      className={classNames("pie-card", {
        "full-span": props.summary,
        sideways,
      })}
    >
      <div className="title-container">
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
      <div className={classNames("pie-container", { "ct-double-octave": sideways })}>
        <div className="pie-chart-container">
          <ResponsiveSunburst<StatusDataObjectSunburstChild>
            data={chartData.sunburst}
            colors={
              currentTheme
                ? [currentTheme.grey2, currentTheme.grey1, currentTheme.secondary, currentTheme.primary]
                : undefined
            }
            value="val"
            margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
            theme={nivoTheme}
            borderColor={currentTheme?.elevatedSurface1}
            borderWidth={2}
            cornerRadius={4}
            valueFormat=">-,"
            enableArcLabels
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={({ color }) => {
              if (currentTheme) {
                if (color === currentTheme.secondary) {
                  return currentTheme.onSecondary;
                } else if (color === currentTheme.primary) {
                  return currentTheme.onPrimary;
                }
                return currentTheme.textHigh;
              }
              return "#000";
            }}
          />
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
                    <div className="indicator ic"></div>IC
                  </DataTableCell>
                  <DataTableCell isNumeric>{chartData.pie.ic}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator pre-gb"></div>Pre GB
                  </DataTableCell>
                  <DataTableCell isNumeric>{chartData.pie.preGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator live-gb"></div>Live GB
                  </DataTableCell>
                  <DataTableCell isNumeric>{chartData.pie.liveGb}</DataTableCell>
                </DataTableRow>
                <DataTableRow>
                  <DataTableCell>
                    <div className="indicator post-gb"></div>Post GB
                  </DataTableCell>
                  <DataTableCell isNumeric>{chartData.pie.postGb}</DataTableCell>
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
