import { DateTime, Interval } from "luxon";
import firebase from "@s/firebase";
import cloneDeep from "lodash.clonedeep";
import store from "~/app/store";
import { queue } from "~/app/snackbar-queue";
import {
  alphabeticalSortPropCurried,
  hasKey,
  iterateDays,
  mergeObject,
  objectEntries,
  ordinal,
  typeGuard,
} from "@s/util/functions";
import {
  setStatisticsData,
  setLoading,
  setStatisticsSetting,
  setStatisticsSort,
  setStatsTab,
  selectTab,
  selectData,
  selectSort,
} from ".";
import { categories, properties } from "./constants";
import {
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

export const setStatisticsTab = (tab: StatsTab, clearUrl = true, state = store.getState()) => {
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

export const setSetting = <T extends keyof StatisticsType>(prop: T, value: StatisticsType[T]) => {
  dispatch(setStatisticsSetting({ key: prop, value: value }));
};

export const setSort = <T extends keyof StatisticsSortType>(prop: T, value: StatisticsSortType[T]) => {
  dispatch(setStatisticsSort({ key: prop, value: value }));
  sortData();
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
            const formattedTimestamp = luxonTimetamp.toFormat(`HH:mm d'${timestampOrdinal}' MMM yyyy 'UTC'`);
            queue.notify({ title: "Last updated: " + formattedTimestamp, timeout: 4000 });
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

export const sunburstChildHasChildren = <Optimised extends true | false = false>(
  child: StatusDataObjectSunburstChild<Optimised>
): child is StatusDataObjectSunburstChildWithChild<Optimised> => hasKey(child, "children");

const hydrateData = ({ timelines, calendar, status, shipped, duration, vendors }: StatisticsData<true>) => {
  const hydrateTimelinesData = (data: Record<string, string | number>[], months: string[], profiles: string[]) =>
    months.map((month, monthIndex) => {
      const blankObject = {
        month: month,
        index: monthIndex,
        summary: 0,
        ...profiles.reduce((a, profile) => ({ ...a, [profile]: 0 }), {}),
      };
      const object = data.find(({ index }) => index === monthIndex);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { index = 0, ...foundObject } =
        typeof object?.index === "number" ? object : data.length === 1 ? data[0] : {};
      return { ...blankObject, ...foundObject };
    });

  const hydratedTimelinesData = objectEntries(timelines).reduce(
    (
      obj,
      [
        category,
        {
          months,
          allProfiles,
          summary: { months: summaryMonths, name, total, profiles },
          breakdown,
        },
      ]
    ): TimelinesData => {
      const summaryMonthsData = hydrateTimelinesData(summaryMonths, months, profiles);
      return {
        ...obj,
        [category]: {
          allProfiles,
          months,
          summary: {
            name,
            total,
            profiles,
            months: summaryMonthsData,
            monthsLine: ["summary", ...profiles].map((key) =>
              barDataToLineData(summaryMonthsData, key, "month", key as keyof typeof summaryMonthsData[number])
            ),
          },
          breakdown: objectEntries(breakdown).reduce(
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
                  if (typeGuard<TimelinesDataObject>(dataObj, (dataObj) => hasKey(dataObj, "profiles"))) {
                    const { months: dataMonths, name, total, profiles } = dataObj;
                    const monthsData = hydrateTimelinesData(dataMonths, months, profiles);
                    return {
                      name,
                      total,
                      profiles,
                      months: monthsData,
                      monthsLine: profiles.map((key) =>
                        barDataToLineData(monthsData, key, "month", key as keyof typeof monthsData[number])
                      ),
                    };
                  } else {
                    const monthsData = hydrateTimelinesData(summaryMonths, months, profiles);
                    return {
                      ...dataObj,
                      profiles: dataObj.name,
                      months: monthsData,
                      monthsLine: profiles.map((key) =>
                        barDataToLineData(monthsData, key, "month", key as keyof typeof monthsData[number])
                      ),
                    };
                  }
                }
              ),
            }),
            {} as typeof breakdown
          ),
        },
      };
    },
    {} as TimelinesData
  );

  const hydrateCalendarData = ({
    start,
    end,
    summary,
    breakdown,
  }: CalendarData<true>[Categories]): CalendarData<false>[Categories] => {
    const interval = Interval.fromDateTimes(DateTime.fromISO(start), DateTime.fromISO(end));
    const days = [...iterateDays(interval)].map((dateTime) => dateTime.toISODate());
    const hydrateCalendarDataObject = ({ data, ...obj }: CalendarDataObject<true>): CalendarDataObject<false> => ({
      ...obj,
      data: data.map(({ index, val }) => ({
        day: days[index],
        value: val,
      })),
    });
    return {
      start,
      end,
      years: Math.ceil(interval.toDuration("years").years),
      summary: hydrateCalendarDataObject(summary),
      breakdown: objectEntries(breakdown).reduce(
        (obj, [prop, array]) => ({ ...obj, [prop]: array.map((object) => hydrateCalendarDataObject(object)) }),
        {} as Record<Properties, CalendarDataObject<false>[]>
      ),
    };
  };

  const hydratedCalendarData = objectEntries(calendar).reduce(
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
    data.map(({ sunburst, pie, ...datum }) => {
      const { ic = 0, preGb = 0, liveGb = 0, postGb = 0, postGbShipped = 0 } = pie || {};
      const hydratedPie = { ic, preGb, liveGb, postGb, postGbShipped };
      const defaultSunburst = {
        id: datum.name,
        children: [ic, preGb, liveGb, postGb, postGbShipped].map((val, index) => ({
          id: ids[index],
          val,
        })),
      };
      if (sunburst) {
        return {
          ...datum,
          pie: hydratedPie,
          sunburst: {
            id: datum.name,
            children: Array(5)
              .fill("")
              .map((_e, arrayIndex) => {
                const object = sunburst.find(({ index }) => typeof index === "number" && index === arrayIndex);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { index = 0, ...foundObject } =
                  typeof object?.index === "number"
                    ? object
                    : sunburst[0].index === undefined
                    ? sunburst[0]
                    : { id: "", children: [] };
                return sunburstChildHasChildren(foundObject)
                  ? {
                      ...foundObject,
                      children: foundObject.children.map(
                        ({ id, ...child }) =>
                          ({ ...child, id: `${ids[arrayIndex]} - ${id}` } as StatusDataObjectSunburstChild)
                      ),
                      id: ids[arrayIndex],
                    }
                  : { ...defaultSunburst.children[arrayIndex], ...foundObject, id: ids[arrayIndex] };
              }),
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
    summary: hydrateStatusData([status.summary])[0],
    breakdown: objectEntries(status.breakdown).reduce(
      (obj, [prop, array]) => ({
        ...obj,
        [prop]: hydrateStatusData(array),
      }),
      {} as StatusData["breakdown"]
    ),
  };

  const hydrateShippedData = (data: ShippedDataObject<true>[], months: string[]): ShippedDataObject[] => {
    const blankObject: ShippedDataObject = {
      name: "",
      total: 0,
      shipped: 0,
      unshipped: 0,
      months: [],
      monthsLine: [],
    };
    return data.map(({ months: monthData, ...datum }) => {
      const monthsData = months.map((month, monthIndex) => {
        const blankObject = {
          month: month,
          index: monthIndex,
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
        monthsLine: (["shipped", "unshipped"] as const).map((key) => barDataToLineData(monthsData, key, "month", key)),
      };
    });
  };

  const hydratedShippedData: ShippedData = {
    summary: hydrateShippedData([shipped.summary], shipped.months)[0],
    months: shipped.months,
    breakdown: objectEntries(shipped.breakdown).reduce(
      (obj, [prop, array]) => ({
        ...obj,
        [prop]: hydrateShippedData(array, shipped.months),
      }),
      {} as ShippedData["breakdown"]
    ),
  };

  const hydrateCountData = (
    data: CountDataObject<true>[],
    idIsIndex = false,
    excludeZero = false
  ): CountDataObject[] => {
    const indexKey = idIsIndex ? "id" : "index";
    const blankObject: CountDataObject = {
      name: "",
      total: 0,
      mean: 0,
      median: 0,
      mode: [0],
      range: "",
      standardDev: 0,
      data: [],
      dataLine: [],
    };
    return data.map(({ data, ...datum }) => {
      const maxId = Math.max(...data.map((datum) => datum[indexKey] || 0), 0);
      const chartData = Array(idIsIndex ? maxId : maxId + 1)
        .fill("")
        .map((_e, arrayIndex) => {
          const object = data.find(
            (datum) =>
              typeof datum[indexKey] === "number" && datum[indexKey] === (idIsIndex ? arrayIndex + 1 : arrayIndex)
          );
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { index = 0, ...foundObject } =
            typeof object?.[indexKey] === "number"
              ? object
              : data.length === 1 && data[0][indexKey] === undefined
              ? data[0]
              : { id: idIsIndex ? arrayIndex + 1 : arrayIndex, count: 0 };
          return {
            id: foundObject.id,
            count: foundObject.count,
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

  const hydratedDurationData: DurationData = objectEntries(duration).reduce(
    (obj, [category, { summary, breakdown }]): DurationData => ({
      ...obj,
      [category]: {
        summary: hydrateCountData([summary], true)[0],
        breakdown: objectEntries(breakdown).reduce(
          (obj, [prop, array]) => ({
            ...obj,
            [prop]: hydrateCountData(array, true),
          }),
          {} as DurationData[Categories]["breakdown"]
        ),
      },
    }),
    {} as DurationData
  );

  const hydratedVendorData: VendorData = {
    summary: hydrateCountData([vendors.summary], true)[0],
    breakdown: objectEntries(vendors.breakdown).reduce(
      (obj, [prop, array]) => ({
        ...obj,
        [prop]: hydrateCountData(array, true),
      }),
      {} as VendorData["breakdown"]
    ),
  };

  const hydratedData: StatisticsData = {
    timelines: hydratedTimelinesData,
    calendar: hydratedCalendarData,
    status: hydratedStatusData,
    shipped: hydratedShippedData,
    duration: hydratedDurationData,
    vendors: hydratedVendorData,
  };
  dispatch(setStatisticsData(hydratedData));
  dispatch(setLoading(false));
};

export const sortData = (state = store.getState()) => {
  const statisticsTab = selectTab(state);
  const statisticsData = selectData(state);
  const sort = selectSort(state);
  if (statisticsTab !== "summary") {
    dispatch(setLoading(true));
    const tab = statisticsTab;
    const setData = (data: StatisticsData[keyof StatisticsData]) => {
      dispatch(setStatisticsData(mergeObject(statisticsData, { [tab]: data })));
      dispatch(setLoading(false));
    };
    if (tab === "duration") {
      const data = cloneDeep(statisticsData[tab]);
      categories.forEach((category) => {
        properties.forEach((property) => {
          const value = data[category].breakdown[property];
          const sortedValue = value.slice().sort((a, b) => {
            const key = sort[tab] === "alphabetical" ? "name" : sort[tab] === "duration" ? "mean" : "total";
            return (
              alphabeticalSortPropCurried(key, sort[tab] !== "alphabetical")(a, b) ||
              alphabeticalSortPropCurried("name")(a, b)
            );
          });
          data[category].breakdown[property] = sortedValue;
        });
      });
      setData(data);
    } else if (tab === "timelines" || tab === "calendar") {
      const data = cloneDeep(statisticsData[tab]);
      categories.forEach((category) => {
        properties.forEach((property) => {
          const array = data[category].breakdown[property];
          const sortedArray = array.slice().sort((a, b) => {
            const key = sort[tab] === "alphabetical" ? "name" : "total";
            return (
              alphabeticalSortPropCurried(key, sort[tab] !== "alphabetical")(a, b) ||
              alphabeticalSortPropCurried("name")(a, b)
            );
          });
          data[category].breakdown[
            property
          ] = sortedArray as StatisticsData["timelines"][Categories]["breakdown"][Properties];
        });
      });
      setData(data);
    } else {
      const data = cloneDeep(statisticsData[tab]);
      properties.forEach((properties) => {
        const value = data.breakdown[properties];
        type DataObj = typeof data.breakdown[Properties][number];
        const sortedValue = value.slice().sort((a: DataObj, b: DataObj) => {
          if (hasKey(sort, tab)) {
            const key = sort[tab] === "total" ? "total" : "name";
            return (
              alphabeticalSortPropCurried(key, sort[tab] === "total")(a, b) || alphabeticalSortPropCurried(key)(a, b)
            );
          }
          return 0;
        });
        data.breakdown[properties] = sortedValue;
      });
      setData(data);
    }
  }
};

export const barDataToLineData = <Datum extends Record<string, any>>(
  datumArray: Datum[],
  id: string,
  xKey: keyof Datum | ((datum: Datum) => string | number) = "id",
  yKey: (keyof Datum | ((datum: Datum) => string | number))[] | keyof Datum | ((datum: Datum) => string | number) = [
    "value" as keyof Datum,
  ]
): {
  id: string | number;
  data: {
    x: number | string | Date;
    y: number | string | Date;
  }[];
} => {
  const yKeys = yKey instanceof Array ? yKey : [yKey];
  return {
    id,
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
  };
};

/** Takes a set of breakpoint tuples and returns a filter function.
 * @param {number[][]} breakpoints Breakpoints
 * @returns Filter function to pass to `.filter()`
 * @example
 * array.filter(filterLabels([[24, 3, !props.summary],[16, 2]]))
 */

export const filterLabels = <T extends string | number>(
  breakpoints: ([minLength: number, divisor: number] | [minLength: number, divisor: number, condition: boolean])[]
) => (label: T, index: number, array: T[]): boolean => {
  for (const breakpoint of breakpoints.sort((aTuple, bTuple) => bTuple[0] - aTuple[0])) {
    if (array.length >= breakpoint[0] && (breakpoint[2] === undefined || breakpoint[2])) {
      return index % breakpoint[1] === 0;
    }
  }
  return true;
};
