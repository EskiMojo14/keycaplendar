/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
import type { Datum, Serie } from "@nivo/line";
import produce from "immer";
import { DateTime, Interval } from "luxon";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import firebase from "@s/firebase";
import {
  alphabeticalSortPropCurried,
  hasKey,
  iterateDays,
  objectEntries,
  ordinal,
  typeGuard,
} from "@s/util/functions";
import {
  selectData,
  selectSort,
  selectTab,
  setLoading,
  setStatisticsData,
  setStatisticsSetting,
  setStatisticsSort,
  setStatsTab,
} from ".";
import { categories, properties } from "./constants";
import type {
  CalendarData,
  CalendarDataObject,
  Categories,
  CountDataObject,
  DurationData,
  Properties,
  ShippedData,
  ShippedDataObject,
  StatisticsData,
  StatisticsSortType,
  StatisticsType,
  StatsTab,
  StatusData,
  StatusDataObject,
  StatusDataObjectSunburstChild,
  StatusDataObjectSunburstChildWithChild,
  TimelinesData,
  TimelinesDataObject,
  VendorData,
} from "./types";

const storage = firebase.storage();

const { dispatch } = store;

export const barDataToLineData = <Datum extends Record<string, any>>(
  datumArray: Datum[],
  id: string,
  xKey: keyof Datum | ((datum: Datum) => number | string) = "id",
  yKey:
    | (keyof Datum | ((datum: Datum) => number | string))[]
    | keyof Datum
    | ((datum: Datum) => number | string) = ["value" as keyof Datum]
): {
  data: {
    x: Date | number | string;
    y: Date | number | string;
  }[];
  id: number | string;
} => {
  const yKeys = yKey instanceof Array ? yKey : [yKey];
  return {
    data: yKeys
      .map((yKey) =>
        datumArray.map((datum) => {
          const x = typeof xKey === "function" ? xKey(datum) : datum[xKey];
          const y = typeof yKey === "function" ? yKey(datum) : datum[yKey];
          return {
            x,
            y,
          };
        })
      )
      .flat(1),
    id,
  };
};

export const sunburstChildHasChildren = <
  Optimised extends false | true = false
>(
  child: StatusDataObjectSunburstChild<Optimised>
): child is StatusDataObjectSunburstChildWithChild<Optimised> =>
  hasKey(child, "children");

const hydrateData = ({
  calendar,
  duration,
  shipped,
  status,
  timelines,
  vendors,
}: StatisticsData<true>) => {
  const hydrateTimelinesData = (
    data: Record<string, number | string>[],
    months: string[],
    profiles: string[]
  ) =>
    months.map((month, monthIndex) => {
      const blankObject = {
        index: monthIndex,
        month,
        summary: 0,
        ...profiles.reduce((a, profile) => ({ ...a, [profile]: 0 }), {}),
      };
      const object = data.find(({ index }) => index === monthIndex);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { index = 0, ...foundObject } =
        typeof object?.index === "number"
          ? object
          : data.length === 1 && !hasKey(data[0], "index")
          ? data[0]
          : {};
      return { ...blankObject, ...foundObject };
    });

  const hydratedTimelinesData = objectEntries(timelines).reduce<TimelinesData>(
    (
      obj,
      [
        category,
        {
          allProfiles,
          breakdown,
          months,
          summary: { months: summaryMonths, name, profiles, total },
        },
      ]
    ): TimelinesData => {
      const summaryMonthsData = hydrateTimelinesData(
        summaryMonths,
        months,
        profiles
      );
      return {
        ...obj,
        [category]: {
          allProfiles,
          breakdown: objectEntries(breakdown).reduce<typeof breakdown>(
            (obj, [prop, array]) => ({
              ...obj,
              [prop]: array.map(
                (
                  dataObj:
                    | TimelinesDataObject<true>
                    | {
                        name: string;
                        total: number;
                      }
                ) => {
                  if (
                    typeGuard<TimelinesDataObject>(dataObj, (dataObj) =>
                      hasKey(dataObj, "profiles")
                    )
                  ) {
                    const {
                      months: dataMonths,
                      name,
                      profiles,
                      total,
                    } = dataObj;
                    const monthsData = hydrateTimelinesData(
                      dataMonths,
                      months,
                      profiles
                    );
                    return {
                      months: monthsData,
                      monthsLine: profiles.map((key) =>
                        barDataToLineData(
                          monthsData,
                          key,
                          "month",
                          key as keyof typeof monthsData[number]
                        )
                      ),
                      name,
                      profiles,
                      total,
                    };
                  } else {
                    const monthsData = hydrateTimelinesData(
                      summaryMonths,
                      months,
                      profiles
                    );
                    return {
                      ...dataObj,
                      months: monthsData,
                      monthsLine: [
                        barDataToLineData(
                          monthsData,
                          dataObj.name,
                          "month",
                          dataObj.name as keyof typeof monthsData[number]
                        ),
                      ],
                      profiles: [dataObj.name],
                    };
                  }
                }
              ),
            }),
            {} as typeof breakdown
          ),
          months,
          summary: {
            months: summaryMonthsData,
            monthsLine: ["summary", ...profiles].map((key) =>
              barDataToLineData(
                summaryMonthsData,
                key,
                "month",
                key as keyof typeof summaryMonthsData[number]
              )
            ),
            name,
            profiles,
            total,
          },
        },
      };
    },
    {} as TimelinesData
  );

  const hydrateCalendarData = ({
    breakdown,
    end,
    start,
    summary,
  }: CalendarData<true>[Categories]): CalendarData<false>[Categories] => {
    const interval = Interval.fromDateTimes(
      DateTime.fromISO(start),
      DateTime.fromISO(end)
    );
    const days = [...iterateDays(interval)].map((dateTime) =>
      dateTime.toISODate()
    );
    const hydrateCalendarDataObject = ({
      data,
      ...obj
    }: CalendarDataObject<true>): CalendarDataObject<false> => ({
      ...obj,
      data: data.map(({ index, val }) => ({
        day: days[index],
        value: val,
      })),
    });
    return {
      breakdown: objectEntries(breakdown).reduce<
        Record<Properties, CalendarDataObject<false>[]>
      >(
        (obj, [prop, array]) => ({
          ...obj,
          [prop]: array.map((object) => hydrateCalendarDataObject(object)),
        }),
        {} as Record<Properties, CalendarDataObject<false>[]>
      ),
      end,
      start,
      summary: hydrateCalendarDataObject(summary),
      years: Math.ceil(interval.toDuration("years").years),
    };
  };

  const hydratedCalendarData = objectEntries(calendar).reduce<
    CalendarData<false>
  >(
    (obj, [cat, catData]) => ({
      ...obj,
      [cat]: hydrateCalendarData(catData),
    }),
    {} as CalendarData<false>
  );

  const hydrateStatusData = (
    data: StatusDataObject<true>[],
    ids = ["IC", "Pre GB", "Live GB", "Post GB", "Shipped"]
  ): StatusDataObject[] =>
    data.map(({ pie, sunburst, ...datum }) => {
      const {
        ic = 0,
        liveGb = 0,
        postGb = 0,
        postGbShipped = 0,
        preGb = 0,
      } = pie || {};
      const hydratedPie = { ic, liveGb, postGb, postGbShipped, preGb };
      const defaultSunburst = {
        children: [ic, preGb, liveGb, postGb, postGbShipped].map(
          (val, index) => ({
            id: ids[index],
            val,
          })
        ),
        id: datum.name,
      };
      if (sunburst) {
        return {
          ...datum,
          pie: hydratedPie,
          sunburst: {
            children: Array(5)
              .fill("")
              .map((_e, arrayIndex) => {
                const object = sunburst.find(
                  ({ index }) =>
                    typeof index === "number" && index === arrayIndex
                );
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { index = 0, ...foundObject } =
                  typeof object?.index === "number"
                    ? object
                    : sunburst[0].index === undefined
                    ? sunburst[0]
                    : { children: [], id: "" };
                return sunburstChildHasChildren(foundObject)
                  ? {
                      ...foundObject,
                      children: foundObject.children.map(
                        ({ id, ...child }) =>
                          ({
                            ...child,
                            id: `${ids[arrayIndex]} - ${id}`,
                          } as StatusDataObjectSunburstChild)
                      ),
                      id: ids[arrayIndex],
                    }
                  : {
                      ...defaultSunburst.children[arrayIndex],
                      ...foundObject,
                      id: ids[arrayIndex],
                    };
              }),
            id: datum.name,
          },
        };
      }
      return {
        ...datum,
        pie: hydratedPie,
        sunburst: defaultSunburst,
      };
    });

  const hydratedStatusData: StatusData = {
    breakdown: objectEntries(status.breakdown).reduce<StatusData["breakdown"]>(
      (obj, [prop, array]) => ({
        ...obj,
        [prop]: hydrateStatusData(array),
      }),
      {} as StatusData["breakdown"]
    ),
    summary: hydrateStatusData([status.summary])[0],
  };

  const hydrateShippedData = (
    data: ShippedDataObject<true>[],
    months: string[]
  ): ShippedDataObject[] => {
    const blankObject: ShippedDataObject = {
      months: [],
      monthsLine: [],
      name: "",
      shipped: 0,
      total: 0,
      unshipped: 0,
    };
    return data.map(({ months: monthData, ...datum }) => {
      const monthsData = months.map((month, monthIndex) => {
        const blankObject = {
          index: monthIndex,
          month,
          shipped: 0,
          unshipped: 0,
        };
        const object = monthData.find(({ index }) => index === monthIndex);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { index = 0, ...foundObject } =
          typeof object?.index === "number"
            ? object
            : monthData.length === 1 && monthData[0].index === undefined
            ? monthData[0]
            : {};
        return { ...blankObject, ...foundObject };
      });
      return {
        ...blankObject,
        ...datum,
        months: monthsData,
        monthsLine: (["shipped", "unshipped"] as const).map((key) =>
          barDataToLineData(monthsData, key, "month", key)
        ),
      };
    });
  };

  const hydratedShippedData: ShippedData = {
    breakdown: objectEntries(shipped.breakdown).reduce<
      ShippedData["breakdown"]
    >(
      (obj, [prop, array]) => ({
        ...obj,
        [prop]: hydrateShippedData(array, shipped.months),
      }),
      {} as ShippedData["breakdown"]
    ),
    months: shipped.months,
    summary: hydrateShippedData([shipped.summary], shipped.months)[0],
  };

  const hydrateCountData = (
    data: CountDataObject<true>[],
    idIsIndex = false,
    excludeZero = false
  ): CountDataObject[] => {
    const indexKey = idIsIndex ? "id" : "index";
    const blankObject: CountDataObject = {
      data: [],
      dataLine: [],
      mean: 0,
      median: 0,
      mode: [0],
      name: "",
      range: "",
      standardDev: 0,
      total: 0,
    };
    return data.map(({ data, ...datum }) => {
      const maxId = Math.max(...data.map((datum) => datum[indexKey] || 0), 0);
      const chartData = Array(idIsIndex ? maxId : maxId + 1)
        .fill("")
        .map((_e, arrayIndex) => {
          const object = data.find(
            (datum) =>
              typeof datum[indexKey] === "number" &&
              datum[indexKey] === (idIsIndex ? arrayIndex + 1 : arrayIndex)
          );
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { index = 0, ...foundObject } =
            typeof object?.[indexKey] === "number"
              ? object
              : data.length === 1 && data[0][indexKey] === undefined
              ? data[0]
              : { count: 0, id: idIsIndex ? arrayIndex + 1 : arrayIndex };
          return {
            count: foundObject.count,
            id: foundObject.id,
          };
        })
        .slice(excludeZero ? 1 : 0);
      return {
        ...blankObject,
        ...datum,
        data: chartData,
        dataLine: [barDataToLineData(chartData, "Count series", "id", "count")],
      };
    });
  };

  const hydratedDurationData: DurationData = objectEntries(
    duration
  ).reduce<DurationData>(
    (obj, [category, { breakdown, summary }]): DurationData => ({
      ...obj,
      [category]: {
        breakdown: objectEntries(breakdown).reduce<
          DurationData[Categories]["breakdown"]
        >(
          (obj, [prop, array]) => ({
            ...obj,
            [prop]: hydrateCountData(array, true),
          }),
          {} as DurationData[Categories]["breakdown"]
        ),
        summary: hydrateCountData([summary], true)[0],
      },
    }),
    {} as DurationData
  );

  const hydratedVendorData: VendorData = {
    breakdown: objectEntries(vendors.breakdown).reduce<VendorData["breakdown"]>(
      (obj, [prop, array]) => ({
        ...obj,
        [prop]: hydrateCountData(array, true),
      }),
      {} as VendorData["breakdown"]
    ),
    summary: hydrateCountData([vendors.summary], true)[0],
  };

  const hydratedData: StatisticsData = {
    calendar: hydratedCalendarData,
    duration: hydratedDurationData,
    shipped: hydratedShippedData,
    status: hydratedStatusData,
    timelines: hydratedTimelinesData,
    vendors: hydratedVendorData,
  };
  dispatch(setStatisticsData(hydratedData));
  dispatch(setLoading(false));
};

export const sortData = (state = store.getState()) => {
  const tab = selectTab(state);
  const statisticsData = selectData(state);
  const sort = selectSort(state);
  if (tab !== "summary") {
    dispatch(setLoading(true));
    const sortedData = produce(statisticsData, (statisticsDataDraft) => {
      if (tab === "duration") {
        categories.forEach((category) => {
          properties.forEach((property) => {
            statisticsDataDraft[tab][category].breakdown[property].sort(
              (a, b) => {
                const key =
                  sort[tab] === "alphabetical"
                    ? "name"
                    : sort[tab] === "duration"
                    ? "mean"
                    : "total";
                return (
                  alphabeticalSortPropCurried(
                    key,
                    sort[tab] !== "alphabetical"
                  )(a, b) || alphabeticalSortPropCurried("name")(a, b)
                );
              }
            );
          });
        });
      } else if (tab === "timelines" || tab === "calendar") {
        categories.forEach((category) => {
          properties.forEach((property) => {
            statisticsDataDraft[tab][category].breakdown[property].sort(
              (a, b) => {
                const key = sort[tab] === "alphabetical" ? "name" : "total";
                return (
                  alphabeticalSortPropCurried(
                    key,
                    sort[tab] !== "alphabetical"
                  )(a, b) || alphabeticalSortPropCurried("name")(a, b)
                );
              }
            );
          });
        });
      } else {
        properties.forEach((properties) => {
          statisticsDataDraft[tab].breakdown[properties].sort((a, b) => {
            if (hasKey(sort, tab)) {
              const key = sort[tab] === "total" ? "total" : "name";
              return (
                alphabeticalSortPropCurried(key, sort[tab] === "total")(a, b) ||
                alphabeticalSortPropCurried(key)(a, b)
              );
            }
            return 0;
          });
        });
      }
    });
    dispatch(setStatisticsData(sortedData));
    dispatch(setLoading(false));
  }
};

export const getData = async () => {
  const fileRef = storage.ref("statisticsDataTest.json");
  dispatch(setLoading(true));
  fileRef
    .getDownloadURL()
    .then((url) => {
      fetch(url)
        .then((response) => {
          response.json().then((data) => {
            const { timestamp, ...statisticsData } = data;
            const luxonTimetamp = DateTime.fromISO(timestamp, { zone: "utc" });
            const timestampOrdinal = ordinal(luxonTimetamp.day);
            const formattedTimestamp = luxonTimetamp.toFormat(
              `HH:mm d'${timestampOrdinal}' MMM yyyy 'UTC'`
            );
            queue.notify({
              timeout: 4000,
              title: "Last updated: " + formattedTimestamp,
            });
            hydrateData(statisticsData);
          });
        })
        .catch((error) => {
          console.log(error);
          dispatch(setLoading(false));
          queue.notify({ title: "Failed to fetch statistics data: " + error });
        });
    })
    .catch((error) => {
      console.log(error);
      dispatch(setLoading(false));
      queue.notify({ title: "Failed to create statistics data: " + error });
    });
};

/** Takes a set of breakpoint tuples and returns a filter function.
 * @param {([minLength: number, divisor: number, condition: boolean]|[minLength: number, divisor: number])[][]} breakpoints Breakpoints
 * @returns Filter function to pass to `.filter()`
 * @example
 * array.filter(filterLabels([[24, 3, !props.summary],[16, 2]]))
 */

export const filterLabels =
  <T>(
    breakpoints: (
      | [minLength: number, divisor: number, condition: boolean]
      | [minLength: number, divisor: number]
    )[]
  ) =>
  (label: T, index: number, array: T[]): boolean => {
    for (const breakpoint of breakpoints.sort(
      (aTuple, bTuple) => bTuple[0] - aTuple[0]
    )) {
      if (
        array.length >= breakpoint[0] &&
        (breakpoint[2] === undefined || breakpoint[2])
      ) {
        return index % breakpoint[1] === 0;
      }
    }
    return true;
  };

/**
 * Gets the maximum Y value from a set of line data, so charts can line up.
 * @param stacked Whether the chart is stacked
 * @param seriesArray Series data to use
 * @returns Maximum Y value.
 */

export const getMaxYValFromLineData = (
  stacked: boolean,
  ...seriesArray: Serie[][]
) =>
  stacked
    ? Math.max(
        ...seriesArray.map((seriesSet) =>
          Math.max(
            ...Object.values(
              seriesSet
                .reduce<Datum[]>((prev, series) => prev.concat(series.data), [])
                .reduce<Record<string, number>>(
                  (prev, { x, y }) => ({
                    ...prev,
                    [`${x}`]: (prev[`${x}`] || 0) + parseInt(`${y ?? 0}`),
                  }),
                  {}
                )
            )
          )
        )
      )
    : Math.max(
        ...seriesArray.map((seriesSet) =>
          seriesSet.reduce<number>(
            (prev, series) =>
              Math.max(
                prev,
                ...series.data.map(({ y }) => parseInt(`${y ?? 0}`))
              ),
            0
          )
        )
      );

export const setStatisticsTab = (
  tab: StatsTab,
  clearUrl = true,
  state = store.getState()
) => {
  const statsTab = selectTab(state);
  dispatch(setStatsTab(tab));
  if (statsTab !== tab) {
    document.documentElement.scrollTop = 0;
  }
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("statisticsTab")) {
      params.delete("statisticsTab");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  }
};

export const setSetting = <T extends keyof StatisticsType>(
  prop: T,
  value: StatisticsType[T]
) => {
  dispatch(setStatisticsSetting(prop, value));
};

export const setSort = <T extends keyof StatisticsSortType>(
  prop: T,
  value: StatisticsSortType[T]
) => {
  dispatch(setStatisticsSort(prop, value));
  sortData();
};
