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
import {
  selectChartSettings,
  setStatisticsCalendarChartSetting,
} from "@s/statistics";
import type { CalendarDataObject, Categories } from "@s/statistics/types";
import {
  alphabeticalSortPropCurried,
  iconObject,
  pluralise,
} from "@s/util/functions";
import { Palette } from "@i";
import "./calendar-card.scss";

const { heatmap } = graphColors;

type CalendarCardProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  data: CalendarDataObject;
  end: string;
  start: string;
  unit: string;
  note?: ReactNode;
  overline?: ReactNode;
  theme?: keyof typeof themeLists;
};

export const CalendarCard = ({
  data,
  end,
  note,
  overline,
  start,
  theme = "primary",
  unit,
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
        key: "palette",
        tab: "calendar",
        value: palette === "gradient" ? "heatmap" : "gradient",
      })
    );
  };

  return (
    <Card {...props} className={classNames("calendar-card", props.className)}>
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
              icon={iconObject(<Palette />)}
              onClick={toggleColour}
            />,
            "Toggle palette"
          )}
        </div>
      </div>
      <div className="content-container">
        <div className="chart-container">
          <ResponsiveCalendar
            colors={palette === "heatmap" ? heatmap : themeLists[theme]}
            data={data.data}
            dayBorderWidth={0}
            daySpacing={2}
            emptyColor="var(--theme-divider)"
            from={start}
            margin={{ bottom: 16, left: 16, right: 16, top: 16 }}
            monthBorderWidth={0}
            monthSpacing={6}
            theme={nivoTheme}
            to={end}
            tooltip={({ day, value }) => (
              <BasicTooltip
                id={DateTime.fromISO(day).toLocaleString(
                  DateTime.DATE_MED_WITH_WEEKDAY
                )}
                value={pluralise`${value} ${[parseInt(value), unit]}`}
              />
            )}
          />
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

interface CalendarSummaryCardProps extends CalendarCardProps {
  breakdownData: CalendarDataObject[];
  category: Categories;
}

export const CalendarSummaryCard = ({
  breakdownData,
  category,
  data,
  end,
  note,
  overline,
  start,
  theme = "primary",
  unit,
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
        key: "palette",
        tab: "calendar",
        value: palette === "gradient" ? "heatmap" : "gradient",
      })
    );
  };

  const [selectedIndex, setSelectedIndex] = useState(-1);
  useEffect(() => setSelectedIndex(-1), [category]);
  const chartData =
    selectedIndex >= 0 && breakdownData
      ? [...breakdownData].sort(alphabeticalSortPropCurried("name"))[
          selectedIndex
        ]
      : data;
  const selectChips = breakdownData ? (
    <div className="calendar-chips-container">
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
  ) : null;
  return (
    <Card {...props} className={classNames("calendar-card", props.className)}>
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
            {pluralise`${chartData.total} ${[chartData.total, "set"]}`}
          </Typography>
        </div>
        <div className="button-container">
          {withTooltip(
            <IconButton
              icon={iconObject(<Palette />)}
              onClick={toggleColour}
            />,
            "Toggle palette"
          )}
        </div>
      </div>
      <div className="content-container">
        <div className="chart-container">
          <ResponsiveCalendar
            colors={palette === "heatmap" ? heatmap : themeLists[theme]}
            data={chartData.data}
            dayBorderWidth={0}
            daySpacing={2}
            emptyColor="var(--theme-divider)"
            from={start}
            margin={{ bottom: 16, left: 24, right: 24, top: 16 }}
            monthBorderWidth={0}
            monthSpacing={6}
            theme={nivoTheme}
            to={end}
            tooltip={({ day, value }) => (
              <BasicTooltip
                id={DateTime.fromISO(day).toLocaleString(
                  DateTime.DATE_MED_WITH_WEEKDAY
                )}
                value={pluralise`${value} ${[parseInt(value), unit]}`}
              />
            )}
          />
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

export default CalendarCard;
