import React, { useContext, useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useAppSelector } from "~/app/hooks";
import { selectCurrentThemeMap } from "@s/common";
import { CalendarDataObject, Categories } from "@s/statistics/types";
import { alphabeticalSortPropCurried, pluralise } from "@s/util/functions";
import { Card } from "@rmwc/card";
import { Chip, ChipSet } from "@rmwc/chip";
import { Typography } from "@rmwc/typography";
import { ResponsiveCalendar } from "@nivo/calendar";
import { BasicTooltip } from "@nivo/tooltip";
import { NivoThemeContext } from "@c/util/theme-provider";
import "./calendar-card.scss";

type CalendarCardProps = {
  data: CalendarDataObject;
  years: number;
  start: string;
  end: string;
  unit: string;
  theme?: "primary" | "secondary";
  overline?: React.ReactNode;
  note?: React.ReactNode;
};

export const CalendarCard = (props: CalendarCardProps) => {
  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);
  return (
    <Card className="calendar-card">
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
      <div className="content-container">
        <div className="chart-container" style={{ "--years": props.years }}>
          <ResponsiveCalendar
            data={props.data.data}
            from={props.start}
            to={props.end}
            theme={nivoTheme}
            colors={currentTheme?.[`${props.theme || "primary"}Gradient`]}
            emptyColor={currentTheme?.divider}
            dayBorderWidth={0}
            monthBorderWidth={0}
            daySpacing={2}
            monthSpacing={6}
            tooltip={({ day, value, ...rest }) => (
              <BasicTooltip
                id={DateTime.fromISO(day).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                value={pluralise`${value} ${[parseInt(value), props.unit]}`}
                enableChip
                {...rest}
              />
            )}
          />
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

interface CalendarSummaryCardProps extends CalendarCardProps {
  category: Categories;
  breakdownData: CalendarDataObject[];
}

export const CalendarSummaryCard = (props: CalendarSummaryCardProps) => {
  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [props.category]);
  const chartData =
    selectedIndex >= 0 && props.breakdownData
      ? [...props.breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : props.data;
  const selectChips = props.breakdownData ? (
    <div className="calendar-chips-container">
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
    <Card className="calendar-card full-span">
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
      <div className="content-container">
        <div className="chart-container" style={{ "--years": props.years }}>
          <ResponsiveCalendar
            data={chartData.data}
            from={props.start}
            to={props.end}
            theme={nivoTheme}
            colors={currentTheme?.[`${props.theme || "primary"}Gradient`]}
            emptyColor={currentTheme?.divider}
            dayBorderWidth={0}
            monthBorderWidth={0}
            daySpacing={2}
            monthSpacing={6}
            tooltip={({ day, value, ...rest }) => (
              <BasicTooltip
                id={DateTime.fromISO(day).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                value={pluralise`${value} ${[parseInt(value), props.unit]}`}
                enableChip
                {...rest}
              />
            )}
          />
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

export default CalendarCard;
