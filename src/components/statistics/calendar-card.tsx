import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames";
import { DateTime } from "luxon";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectCurrentGraphColors, selectCurrentThemeMap } from "@s/common";
import { selectChartSettings, setStatisticsCalendarChartSetting } from "@s/statistics";
import { CalendarDataObject, Categories } from "@s/statistics/types";
import { alphabeticalSortPropCurried, iconObject, pluralise } from "@s/util/functions";
import { Card } from "@rmwc/card";
import { Chip, ChipSet } from "@rmwc/chip";
import { IconButton } from "@rmwc/icon-button";
import { Typography } from "@rmwc/typography";
import { ResponsiveCalendar } from "@nivo/calendar";
import { BasicTooltip } from "@nivo/tooltip";
import { NivoThemeContext } from "@c/util/theme-provider";
import { withTooltip } from "@c/util/hocs";
import "./calendar-card.scss";

type CalendarCardProps = {
  data: CalendarDataObject;
  start: string;
  end: string;
  unit: string;
  theme?: "primary" | "secondary";
  overline?: React.ReactNode;
  note?: React.ReactNode;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export const CalendarCard = ({ data, start, end, unit, theme, overline, note, ...props }: CalendarCardProps) => {
  const dispatch = useAppDispatch();

  const {
    calendar: {
      calendar: { palette },
    },
  } = useAppSelector(selectChartSettings);

  const nivoTheme = useContext(NivoThemeContext);
  const currentTheme = useAppSelector(selectCurrentThemeMap);
  const { heatmap } = useAppSelector(selectCurrentGraphColors);

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
          {withTooltip(
            <IconButton
              icon={iconObject(
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                    <g>
                      <rect fill="none" height="24" width="24" />
                    </g>
                    <g>
                      <path
                        d="M12,4c-4.41,0-8,3.59-8,8s3.59,8,8,8c0.28,0,0.5-0.22,0.5-0.5 c0-0.16-0.08-0.28-0.14-0.35c-0.41-0.46-0.63-1.05-0.63-1.65c0-1.38,1.12-2.5,2.5-2.5H16c2.21,0,4-1.79,4-4 C20,7.14,16.41,4,12,4z M6.5,13C5.67,13,5,12.33,5,11.5S5.67,10,6.5,10S8,10.67,8,11.5S7.33,13,6.5,13z M9.5,9 C8.67,9,8,8.33,8,7.5S8.67,6,9.5,6S11,6.67,11,7.5S10.33,9,9.5,9z M14.5,9C13.67,9,13,8.33,13,7.5S13.67,6,14.5,6 S16,6.67,16,7.5S15.33,9,14.5,9z M19,11.5c0,0.83-0.67,1.5-1.5,1.5S16,12.33,16,11.5s0.67-1.5,1.5-1.5S19,10.67,19,11.5z"
                        opacity=".3"
                      />
                      <path d="M12,2C6.49,2,2,6.49,2,12s4.49,10,10,10c1.38,0,2.5-1.12,2.5-2.5c0-0.61-0.23-1.21-0.64-1.67 c-0.08-0.09-0.13-0.21-0.13-0.33c0-0.28,0.22-0.5,0.5-0.5H16c3.31,0,6-2.69,6-6C22,6.04,17.51,2,12,2z M16,15h-1.77 c-1.38,0-2.5,1.12-2.5,2.5c0,0.61,0.22,1.19,0.63,1.65c0.06,0.07,0.14,0.19,0.14,0.35c0,0.28-0.22,0.5-0.5,0.5 c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.14,8,7C20,13.21,18.21,15,16,15z" />
                      <circle cx="6.5" cy="11.5" r="1.5" />
                      <circle cx="9.5" cy="7.5" r="1.5" />
                      <circle cx="14.5" cy="7.5" r="1.5" />
                      <circle cx="17.5" cy="11.5" r="1.5" />
                    </g>
                  </svg>
                </div>
              )}
              onClick={toggleColour}
            />,
            "Toggle palette"
          )}
        </div>
      </div>
      <div className="content-container">
        <div className="chart-container">
          <ResponsiveCalendar
            data={data.data}
            from={start}
            to={end}
            theme={nivoTheme}
            colors={palette === "heatmap" ? heatmap : currentTheme?.[`${theme || "primary"}Gradient`]}
            emptyColor={currentTheme?.divider}
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
  theme,
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
  const currentTheme = useAppSelector(selectCurrentThemeMap);
  const { heatmap } = useAppSelector(selectCurrentGraphColors);

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
          {withTooltip(
            <IconButton
              icon={iconObject(
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                    <g>
                      <rect fill="none" height="24" width="24" />
                    </g>
                    <g>
                      <path
                        d="M12,4c-4.41,0-8,3.59-8,8s3.59,8,8,8c0.28,0,0.5-0.22,0.5-0.5 c0-0.16-0.08-0.28-0.14-0.35c-0.41-0.46-0.63-1.05-0.63-1.65c0-1.38,1.12-2.5,2.5-2.5H16c2.21,0,4-1.79,4-4 C20,7.14,16.41,4,12,4z M6.5,13C5.67,13,5,12.33,5,11.5S5.67,10,6.5,10S8,10.67,8,11.5S7.33,13,6.5,13z M9.5,9 C8.67,9,8,8.33,8,7.5S8.67,6,9.5,6S11,6.67,11,7.5S10.33,9,9.5,9z M14.5,9C13.67,9,13,8.33,13,7.5S13.67,6,14.5,6 S16,6.67,16,7.5S15.33,9,14.5,9z M19,11.5c0,0.83-0.67,1.5-1.5,1.5S16,12.33,16,11.5s0.67-1.5,1.5-1.5S19,10.67,19,11.5z"
                        opacity=".3"
                      />
                      <path d="M12,2C6.49,2,2,6.49,2,12s4.49,10,10,10c1.38,0,2.5-1.12,2.5-2.5c0-0.61-0.23-1.21-0.64-1.67 c-0.08-0.09-0.13-0.21-0.13-0.33c0-0.28,0.22-0.5,0.5-0.5H16c3.31,0,6-2.69,6-6C22,6.04,17.51,2,12,2z M16,15h-1.77 c-1.38,0-2.5,1.12-2.5,2.5c0,0.61,0.22,1.19,0.63,1.65c0.06,0.07,0.14,0.19,0.14,0.35c0,0.28-0.22,0.5-0.5,0.5 c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.14,8,7C20,13.21,18.21,15,16,15z" />
                      <circle cx="6.5" cy="11.5" r="1.5" />
                      <circle cx="9.5" cy="7.5" r="1.5" />
                      <circle cx="14.5" cy="7.5" r="1.5" />
                      <circle cx="17.5" cy="11.5" r="1.5" />
                    </g>
                  </svg>
                </div>
              )}
              onClick={toggleColour}
            />,
            "Toggle palette"
          )}
        </div>
      </div>
      <div className="content-container">
        <div className="chart-container">
          <ResponsiveCalendar
            data={chartData.data}
            from={start}
            to={end}
            theme={nivoTheme}
            colors={palette === "heatmap" ? heatmap : currentTheme?.[`${theme || "primary"}Gradient`]}
            emptyColor={currentTheme?.divider}
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
