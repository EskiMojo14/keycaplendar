import type { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import { useContext, useEffect, useState } from "react";
import { ResponsiveCalendar } from "@nivo/calendar";
import { BasicTooltip } from "@nivo/tooltip";
import { Card } from "@rmwc/card";
import { Chip, ChipSet } from "@rmwc/chip";
import { IconButton } from "@rmwc/icon-button";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { DateTime } from "luxon";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { withTooltip } from "@c/util/hocs";
import { NivoThemeContext } from "@c/util/theme-provider";
import { graphColors, themeLists } from "@s/common/constants";
import { selectChartSettings, setStatisticsCalendarChartSetting } from "@s/statistics";
import type { CalendarDataObject, Categories } from "@s/statistics/types";
import { alphabeticalSortPropCurried, iconObject, pluralise } from "@s/util/functions";
import { Palette } from "@i";
import "./calendar-card.scss";

const { heatmap } = graphColors;

type CalendarCardProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  data: CalendarDataObject;
  start: string;
  end: string;
  unit: string;
  theme?: keyof typeof themeLists;
  overline?: ReactNode;
  note?: ReactNode;
};

export const CalendarCard = ({
  data,
  start,
  end,
  unit,
  theme = "primary",
  overline,
  note,
  ...props
}: CalendarCardProps) => {
  const dispatch = useAppDispatch();

  const {
    calendar: {
      calendar: { palette },
    },
  } = useAppSelector(selectChartSettings);

  const nivoTheme = useContext(NivoThemeContext);

  const toggleColour = () => {
    dispatch(
      setStatisticsCalendarChartSetting({
        tab: "calendar",
        key: "palette",
        value: palette === "gradient" ? "heatmap" : "gradient",
      })
    );
  };

  return (
    <Card {...props} className={classNames("calendar-card", props.className)}>
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
          {withTooltip(<IconButton icon={iconObject(<Palette />)} onClick={toggleColour} />, "Toggle palette")}
        </div>
      </div>
      <div className="content-container">
        <div className="chart-container">
          <ResponsiveCalendar
            data={data.data}
            from={start}
            to={end}
            theme={nivoTheme}
            colors={palette === "heatmap" ? heatmap : themeLists[theme]}
            emptyColor="var(--theme-divider)"
            dayBorderWidth={0}
            monthBorderWidth={0}
            daySpacing={2}
            monthSpacing={6}
            margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
            tooltip={({ day, value }) => (
              <BasicTooltip
                id={DateTime.fromISO(day).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                value={pluralise`${value} ${[parseInt(value), unit]}`}
              />
            )}
          />
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

interface CalendarSummaryCardProps extends CalendarCardProps {
  category: Categories;
  breakdownData: CalendarDataObject[];
}

export const CalendarSummaryCard = ({
  data,
  category,
  breakdownData,
  start,
  end,
  unit,
  theme = "primary",
  overline,
  note,
  ...props
}: CalendarSummaryCardProps) => {
  const dispatch = useAppDispatch();

  const {
    calendar: {
      calendar: { palette },
    },
  } = useAppSelector(selectChartSettings);

  const nivoTheme = useContext(NivoThemeContext);

  const toggleColour = () => {
    dispatch(
      setStatisticsCalendarChartSetting({
        tab: "calendar",
        key: "palette",
        value: palette === "gradient" ? "heatmap" : "gradient",
      })
    );
  };

  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [category]);
  const chartData =
    selectedIndex >= 0 && breakdownData
      ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[selectedIndex]
      : data;
  const selectChips = breakdownData ? (
    <div className="calendar-chips-container">
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
  return (
    <Card {...props} className={classNames("calendar-card", props.className)}>
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
          {withTooltip(<IconButton icon={iconObject(<Palette />)} onClick={toggleColour} />, "Toggle palette")}
        </div>
      </div>
      <div className="content-container">
        <div className="chart-container">
          <ResponsiveCalendar
            data={chartData.data}
            from={start}
            to={end}
            theme={nivoTheme}
            colors={palette === "heatmap" ? heatmap : themeLists[theme]}
            emptyColor="var(--theme-divider)"
            dayBorderWidth={0}
            monthBorderWidth={0}
            daySpacing={2}
            monthSpacing={6}
            margin={{ top: 16, right: 24, bottom: 16, left: 24 }}
            tooltip={({ day, value }) => (
              <BasicTooltip
                id={DateTime.fromISO(day).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}
                value={pluralise`${value} ${[parseInt(value), unit]}`}
              />
            )}
          />
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

export default CalendarCard;
