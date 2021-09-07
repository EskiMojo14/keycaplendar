import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { is } from "typescript-is";
import { typedFirestore } from "./slices/firebase/firestore";
import { DateTime, Interval } from "luxon";
import { create, all, MathJsStatic } from "mathjs";
import {
  CalendarData,
  CalendarDataObject,
  CalendarDatum,
  Categories,
  CountDataObject,
  DurationData,
  Properties,
  ShippedData,
  ShippedDataObject,
  StatisticsSetType,
  StatusData,
  StatusDataObject,
  StatusDataObjectSunburstChild,
  StatusDataObjectSunburstChildWithChild,
  TimelinesData,
  TimelinesDataObject,
  VendorData,
} from "./slices/statistics/types";
import {
  getSetMonthRange,
  alphabeticalSort,
  removeDuplicates,
  hasKey,
  countInArray,
  alphabeticalSortPropCurried,
  objectKeys,
  objectEntries,
  iterateDays,
} from "./slices/util/functions";
import { pageConditions } from "./slices/main/functions";

const bucket = admin.storage().bucket();

const math = create(all) as MathJsStatic;

const today = DateTime.utc();
const yesterday = today.minus({ days: 1 });
const categories: Categories[] = ["icDate", "gbLaunch"];

const monthFormat = "MMM yy";

const filterCatSetsByMonth = (
  sets: StatisticsSetType[],
  prop: "icDate" | "gbLaunch" | "gbEnd",
  month: string,
  format = monthFormat
): StatisticsSetType[] =>
  sets.filter((set) => {
    const setProp = set[prop];
    const setMonth =
      is<string>(setProp) && !setProp.includes("Q")
        ? DateTime.fromISO(setProp, { zone: "utc" }).toFormat(format)
        : null;
    return setMonth && setMonth === month;
  });

const filterPropSets = (sets: StatisticsSetType[], prop: Properties, val: string): StatisticsSetType[] =>
  sets.filter(
    (set) =>
      (prop === "vendor" && set.vendors && set.vendors.findIndex((vendor) => vendor.name === val) !== -1) ||
      (prop === "designer" && set.designer.includes(val)) ||
      (prop !== "vendor" && prop !== "designer" && set[prop] === val)
  );

const sunburstChildHasChildren = <Optimised extends true | false = false>(
  child: StatusDataObjectSunburstChild<Optimised>
): child is StatusDataObjectSunburstChildWithChild<Optimised> => hasKey(child, "children");

const sanitiseBarData = (data: Record<string, number>[]) =>
  data
    .map((datum, index, array) => (array.length > 1 ? { ...datum, index } : datum))
    .filter((datum, i, array) => Object.keys(datum).length > (array.length > 1 ? 1 : 0));

const createTimelinesData = (sets: StatisticsSetType[]) => {
  const timelinesData: TimelinesData<true> = {
    icDate: {
      months: [],
      allProfiles: [],
      summary: {
        name: "ICs per month",
        total: 0,
        profiles: [],
        months: [],
      },
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
    gbLaunch: {
      months: [],
      allProfiles: [],
      summary: {
        name: "GBs per month",
        total: 0,
        profiles: [],
        months: [],
      },
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
  };
  const gbSets = sets.filter((set) => set.gbLaunch && set.gbLaunch.length === 10);
  objectKeys(timelinesData).forEach((cat) => {
    const catSets = cat === "gbLaunch" ? gbSets : sets;

    const months = getSetMonthRange(catSets, cat, monthFormat);

    timelinesData[cat].months = months;

    const profileNames = alphabeticalSort(removeDuplicates(catSets.map((set) => set.profile)));
    const designerNames = alphabeticalSort(removeDuplicates(catSets.map((set) => set.designer).flat(1)));
    const vendorNames = alphabeticalSort(
      removeDuplicates(catSets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat(1))
    );

    timelinesData[cat].allProfiles = profileNames;

    const lists = {
      profile: profileNames,
      designer: designerNames,
      vendor: vendorNames,
    };

    const profileMonths = months.map((month) => {
      const monthSets = filterCatSetsByMonth(catSets, cat, month);
      return profileNames.reduce<TimelinesDataObject<true>["months"][number]>(
        (obj, profile) => {
          const profileSets = filterPropSets(monthSets, "profile", profile);
          return profileSets.length > 0 ? { ...obj, [profile]: profileSets.length } : obj;
        },
        monthSets.length > 0
          ? {
              summary: monthSets.length,
            }
          : {}
      );
    });

    timelinesData[cat].summary = {
      name: timelinesData[cat].summary.name,
      total: catSets.length,
      profiles: profileNames,
      months: sanitiseBarData(profileMonths),
    };

    timelinesData[cat].breakdown = objectKeys(timelinesData[cat].breakdown).reduce((obj, property) => {
      const list = lists[property];

      const data = list.map((name) => {
        const filteredSets = filterPropSets(catSets, property, name);
        if (property === "profile") {
          return {
            name,
            total: filteredSets.length,
          };
        } else {
          const profiles = alphabeticalSort(removeDuplicates(filteredSets.map((set) => set.profile)));
          const monthsData = months.map((month) => {
            const monthSets = filterCatSetsByMonth(filteredSets, cat, month);
            return profiles.reduce<TimelinesDataObject<true>["months"][number]>(
              (obj, profile) => {
                const profileSets = filterPropSets(monthSets, "profile", profile);
                return profileSets.length > 0 ? { ...obj, [profile]: profileSets.length } : obj;
              },
              monthSets.length > 0
                ? {
                    summary: monthSets.length,
                  }
                : {}
            );
          });
          return {
            name,
            total: filteredSets.length,
            profiles,
            months: sanitiseBarData(monthsData),
          };
        }
      });

      data.sort(
        (a, b) => alphabeticalSortPropCurried("total", true)(a, b) || alphabeticalSortPropCurried("name")(a, b)
      );

      return {
        ...obj,
        [property]: data,
      };
    }, timelinesData[cat].breakdown);
  });
  return Promise.resolve(timelinesData);
};

const createCalendarData = (sets: StatisticsSetType[]) => {
  const calendarData: CalendarData<true> = {
    icDate: {
      start: "",
      end: "",
      summary: {
        name: "ICs per day",
        total: 0,
        data: [],
      },
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
    gbLaunch: {
      start: "",
      end: "",
      summary: {
        name: "Live GBs per day",
        total: 0,
        data: [],
      },
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
  };
  const gbSets = sets.filter(
    (set) => set.gbLaunch && set.gbLaunch.length === 10 && set.gbEnd && set.gbEnd.length === 10
  );
  objectKeys(calendarData).forEach((cat) => {
    const catSets = cat === "gbLaunch" ? gbSets : sets;
    calendarData[cat].summary.total = catSets.length;

    const sortedDates = removeDuplicates(alphabeticalSort(catSets.map((set) => set[cat])));
    const startDate = sortedDates[0];
    const endDate = sortedDates[sortedDates.length - 1];
    const interval = Interval.fromDateTimes(DateTime.fromISO(startDate), DateTime.fromISO(endDate));
    const days = [...iterateDays(interval)].map((dateTime) => dateTime.toISODate());
    calendarData[cat].start = startDate;
    calendarData[cat].end = endDate;

    const profileNames = alphabeticalSort(removeDuplicates(catSets.map((set) => set.profile)));
    const designerNames = alphabeticalSort(removeDuplicates(catSets.map((set) => set.designer).flat(1)));
    const vendorNames = alphabeticalSort(
      removeDuplicates(catSets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat(1))
    );

    const lists = {
      profile: profileNames,
      designer: designerNames,
      vendor: vendorNames,
    };

    const createCalendarDataObject = (sets: StatisticsSetType[], name: string): CalendarDataObject<true> => {
      const dayData = days
        .map<CalendarDatum<true>>((day, index) => {
          const value = sets.filter((set) => (cat === "gbLaunch" ? pageConditions(set, day).live : set.icDate === day));
          return {
            index,
            val: value.length,
          };
        })
        .filter((datum) => datum.val > 0);
      return {
        name,
        total: sets.length,
        data: dayData,
      };
    };

    calendarData[cat].summary = createCalendarDataObject(catSets, calendarData[cat].summary.name);

    calendarData[cat].breakdown = objectKeys(calendarData[cat].breakdown).reduce((obj, prop) => {
      const list = lists[prop];
      return {
        ...obj,
        [prop]: list.map((name) => createCalendarDataObject(filterPropSets(catSets, prop, name), name)),
      };
    }, {} as Record<Properties, CalendarDataObject<true>[]>);

    objectKeys(calendarData[cat].breakdown).forEach((prop) => {
      calendarData[cat].breakdown[prop].sort(
        (a, b) => alphabeticalSortPropCurried("total")(a, b) || alphabeticalSortPropCurried("name")(a, b)
      );
    });
  });
  return Promise.resolve(calendarData);
};

const sanitiseStatusData = (data: StatusDataObject<true>[]): StatusDataObject<true>[] =>
  data.map(({ sunburst, pie = {}, ...datum }) => {
    const filteredPie = objectEntries(pie)
      .filter(([key, val]) => val && val > 0)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {} as StatusDataObject<true>["pie"]);
    const filteredSunburst = sunburst
      ? sunburst
          .map((child, index, array) => (array.length > 1 ? { ...child, index } : child))
          .map((child) =>
            sunburstChildHasChildren(child)
              ? {
                  ...child,
                  children: child.children.filter((child) => (sunburstChildHasChildren(child) ? true : child.val > 0)),
                }
              : child
          )
          .filter((child) => (sunburstChildHasChildren(child) ? child.children.length > 0 : child.val > 0))
      : undefined;
    return sunburst
      ? {
          ...datum,
          pie: filteredPie,
          sunburst: filteredSunburst,
        }
      : {
          ...datum,
          pie: filteredPie,
        };
  });

const createStatusData = (sets: StatisticsSetType[]) => {
  const statusData: StatusData<true> = {
    summary: {
      name: "Current keyset status",
      total: 0,
      pie: { ic: 0, preGb: 0, liveGb: 0, postGb: 0 },
      sunburst: [],
    },
    breakdown: {
      profile: [],
      designer: [],
      vendor: [],
    },
  };
  const profileNames = alphabeticalSort(removeDuplicates(sets.map((set) => set.profile)));
  const designerNames = alphabeticalSort(removeDuplicates(sets.map((set) => set.designer).flat(1)));
  const vendorNames = alphabeticalSort(
    removeDuplicates(sets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat(1))
  );
  const lists = {
    profile: profileNames,
    designer: designerNames,
    vendor: vendorNames,
  };
  const createStatusDataObject = (
    objSets: StatisticsSetType[],
    name: string,
    prop?: Properties,
    list?: string[]
  ): StatusDataObject<true> => {
    const icSets = objSets.filter((set: StatisticsSetType) => !set.gbLaunch || set.gbLaunch.includes("Q"));
    const preGbSets = objSets.filter((set) => {
      let startDate;
      if (set.gbLaunch && !set.gbLaunch.includes("Q")) {
        startDate = DateTime.fromISO(set.gbLaunch, { zone: "utc" });
      }
      return startDate && startDate > today;
    });
    const liveGbSets = objSets.filter((set) => {
      let startDate;
      if (set.gbLaunch && !set.gbLaunch.includes("Q")) {
        startDate = DateTime.fromISO(set.gbLaunch, { zone: "utc" });
      }
      const endDate = DateTime.fromISO(set.gbEnd, { zone: "utc" }).set({
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999,
      });
      return startDate && startDate <= today && (endDate >= yesterday || !set.gbEnd);
    });
    const postGbSets = objSets.filter((set) => {
      const endDate = DateTime.fromISO(set.gbEnd, { zone: "utc" }).set({
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999,
      });
      return endDate <= yesterday;
    });
    const postGbUnshipped = postGbSets.filter((set) => !set.shipped);
    const postGbShipped = postGbSets.filter((set) => set.shipped);

    const baseObj = {
      name: name,
      total: objSets.length,
      pie: {
        ic: icSets.length || undefined,
        preGb: preGbSets.length || undefined,
        liveGb: liveGbSets.length || undefined,
        postGb: postGbUnshipped.length || undefined,
        postGbShipped: postGbShipped.length || undefined,
      },
    };

    if (prop && list) {
      const sunburstSets = [icSets, preGbSets, liveGbSets, postGbUnshipped, postGbShipped];
      const sunburst: StatusDataObjectSunburstChild<true>[] = sunburstSets.map((statusSets) => {
        const children = list.map((val) => {
          const filteredSets = filterPropSets(statusSets, prop, val);
          return {
            id: val,
            val: filteredSets.length,
          };
        });
        return {
          children,
        };
      });
      return {
        ...baseObj,
        sunburst,
      };
    }
    return baseObj;
  };

  statusData.summary = sanitiseStatusData([
    createStatusDataObject(sets, statusData.summary.name, "profile", profileNames),
  ])[0];

  objectKeys(statusData.breakdown).forEach((prop) => {
    const data =
      prop === "profile"
        ? sanitiseStatusData(lists[prop].map((name) => createStatusDataObject(filterPropSets(sets, prop, name), name)))
        : sanitiseStatusData(
            lists[prop].map((name) =>
              createStatusDataObject(filterPropSets(sets, prop, name), name, "profile", profileNames)
            )
          );
    statusData.breakdown[prop] = data;
    statusData.breakdown[prop].sort(
      (a, b) => alphabeticalSortPropCurried("total", true)(a, b) || alphabeticalSortPropCurried("name")(a, b)
    );
  });
  return Promise.resolve(statusData);
};

const sanitiseShippedData = (data: ShippedDataObject<true>[]): ShippedDataObject<true>[] =>
  data.map(({ months, shipped, unshipped, ...datum }) => ({
    ...datum,
    shipped: shipped || undefined,
    unshipped: unshipped || undefined,
    months: months
      .map((month, index, array) =>
        Object.entries(array.length > 1 ? { ...month, index } : month)
          .filter(([key, value]) => key === "index" || (value && value > 0))
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
      )
      .filter((month) => Object.keys(month).length > 1),
  }));

const createShippedData = (sets: StatisticsSetType[]) => {
  const shippedData: ShippedData<true> = {
    summary: {
      name: "Shipped sets by GB month",
      total: 0,
      shipped: 0,
      unshipped: 0,
      months: [],
    },
    months: [],
    breakdown: {
      profile: [],
      designer: [],
      vendor: [],
    },
  };
  const pastSets = sets.filter((set) => {
    const endDate = DateTime.fromISO(set.gbEnd, { zone: "utc" }).set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    });
    return endDate <= yesterday;
  });
  const months = getSetMonthRange(pastSets, "gbEnd", monthFormat);

  shippedData.months = months;

  const profileNames = alphabeticalSort(removeDuplicates(pastSets.map((set) => set.profile)));
  const designerNames = alphabeticalSort(removeDuplicates(pastSets.map((set) => set.designer).flat(1)));
  const vendorNames = alphabeticalSort(
    removeDuplicates(pastSets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat(1))
  );
  const lists = {
    profile: profileNames,
    designer: designerNames,
    vendor: vendorNames,
  };

  const createShippedDataObject = (sets: StatisticsSetType[], name: string): ShippedDataObject<true> => {
    const shippedSets = sets.filter((set) => set.shipped);
    const unshippedSets = sets.filter((set) => !set.shipped);
    const data = months.map((month) => {
      const filteredShippedSets = filterCatSetsByMonth(shippedSets, "gbEnd", month);
      const filteredUnshippedSets = filterCatSetsByMonth(unshippedSets, "gbEnd", month);
      return { unshipped: filteredUnshippedSets.length, shipped: filteredShippedSets.length };
    });
    return {
      name: name,
      total: sets.length,
      shipped: shippedSets.length,
      unshipped: unshippedSets.length,
      months: data,
    };
  };

  shippedData.summary = sanitiseShippedData([createShippedDataObject(pastSets, shippedData.summary.name)])[0];

  objectKeys(shippedData.breakdown).forEach((prop) => {
    shippedData.breakdown[prop] = sanitiseShippedData(
      lists[prop].map((name) => createShippedDataObject(filterPropSets(pastSets, prop, name), name))
    );
    shippedData.breakdown[prop].sort(
      (a, b) => alphabeticalSortPropCurried("total", true)(a, b) || alphabeticalSortPropCurried("name")(a, b)
    );
  });
  return Promise.resolve(shippedData);
};

const sanitiseCountData = (data: CountDataObject<true>[], idIsIndex = false): CountDataObject<true>[] =>
  data.map(({ data, name, total, mode, range, ...datum }) => {
    const filteredDatum = objectEntries(datum)
      .filter(([key, val]) => typeof val === "number" && val > 0)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {} as typeof datum);
    const filteredData = data
      // uses any because compiler doesn't like this for some reason
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((datum: any, index: any, array: any[]) => (array.length > 1 && !idIsIndex ? { ...datum, index } : datum))
      .filter(({ count }) => count > 0)
      .filter((datum) => Object.keys(datum).length > (idIsIndex ? 1 : 2));
    return {
      ...filteredDatum,
      name,
      total,
      range,
      mode: (mode && mode.length > 1) || (mode && mode[0] > 0) ? mode : undefined,
      data: filteredData,
    };
  });

const createDurationData = (sets: StatisticsSetType[]) => {
  const durationData: DurationData<true> = {
    icDate: {
      summary: {
        name: "IC duration (months)",
        total: 0,
        mean: 0,
        median: 0,
        mode: [],
        range: "",
        standardDev: 0,
        data: [],
      },
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
    gbLaunch: {
      summary: {
        name: "GB duration (days)",
        total: 0,
        mean: 0,
        median: 0,
        mode: [],
        range: "",
        standardDev: 0,
        data: [],
      },
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
  };
  const dateSets = sets.filter((set) => set.gbLaunch && set.gbLaunch.length === 10);
  categories.forEach((cat) => {
    const propSets: StatisticsSetType[] =
      cat === "gbLaunch" ? dateSets.filter((set) => set.gbEnd.length === 10) : dateSets;
    if (hasKey(durationData, cat)) {
      const profileNames = alphabeticalSort(removeDuplicates(propSets.map((set) => set.profile)));
      const designerNames = alphabeticalSort(removeDuplicates(propSets.map((set) => set.designer).flat(1)));
      const vendorNames = alphabeticalSort(
        removeDuplicates(propSets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat(1))
      );
      const lists = {
        profile: profileNames,
        designer: designerNames,
        vendor: vendorNames,
      };

      const createDurationDataObject = (data: number[], name: string, total: number): CountDataObject<true> => {
        const labels = [...math.range(0, math.round(math.max(data)), 1, true).toArray()] as number[];
        const range = math.max(data) - math.min(data);
        const rangeDisplay = `${math.min(data)} - ${math.max(data)} (${range})`;
        return {
          name: name,
          total: total,
          mean: math.round(math.mean(data), 2),
          median: math.median(data),
          mode: math.mode(data),
          range: rangeDisplay,
          standardDev: math.round(math.std(data), 2),
          data: labels.map((label) => ({
            count: countInArray(math.round(data), label),
            id: label,
          })),
        };
      };

      const summaryData = propSets.map((set) => {
        const startDate = DateTime.fromISO(set[cat], { zone: "utc" });
        const endDate = DateTime.fromISO(set[cat === "gbLaunch" ? "gbEnd" : "gbLaunch"], { zone: "utc" });
        const length = endDate.diff(startDate, cat === "icDate" ? "months" : "days");
        return math.round(length[cat === "icDate" ? "months" : "days"], 2);
      });

      durationData[cat].summary = sanitiseCountData(
        [createDurationDataObject(summaryData, durationData[cat].summary.name, propSets.length)],
        true
      )[0];

      objectKeys(durationData[cat].breakdown).forEach((property) => {
        durationData[cat].breakdown[property] = sanitiseCountData(
          lists[property].map((name) => {
            const filteredSets = filterPropSets(propSets, property, name);
            const data = filteredSets.map((set) => {
              const startDate = DateTime.fromISO(set[cat], { zone: "utc" });
              const endDate = DateTime.fromISO(set[cat === "gbLaunch" ? "gbEnd" : "gbLaunch"], { zone: "utc" });
              const length = endDate.diff(startDate, cat === "icDate" ? "months" : "days");
              return math.round(length[cat === "icDate" ? "months" : "days"], 2);
            });
            return createDurationDataObject(data, name, filteredSets.length);
          }),
          true
        );
        objectKeys(durationData[cat].breakdown).forEach((prop) => {
          durationData[cat].breakdown[prop].sort(
            (a, b) => alphabeticalSortPropCurried("total", true)(a, b) || alphabeticalSortPropCurried("name")(a, b)
          );
        });
      });
    }
  });
  return Promise.resolve(durationData);
};

const createVendorsData = (sets: StatisticsSetType[]) => {
  const vendorsData: VendorData<true> = {
    summary: {
      name: "Vendors per set",
      total: 0,
      mean: 0,
      median: 0,
      mode: [],
      range: "",
      standardDev: 0,
      data: [],
    },
    breakdown: {
      profile: [],
      designer: [],
      vendor: [],
    },
  };
  const pastSets = sets.filter((set) => {
    const endDate = DateTime.fromISO(set.gbEnd, { zone: "utc" }).set({
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 999,
    });
    return endDate <= yesterday;
  });
  const vendorSets = pastSets.filter((set) => set.vendors);

  const profileNames = alphabeticalSort(removeDuplicates(vendorSets.map((set) => set.profile)));
  const designerNames = alphabeticalSort(removeDuplicates(vendorSets.map((set) => set.designer).flat(1)));
  const vendorNames = alphabeticalSort(
    removeDuplicates(vendorSets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat(1))
  );
  const lists = {
    profile: profileNames,
    designer: designerNames,
    vendor: vendorNames,
  };

  const createVendorsDataObject = (data: number[], name: string, total: number): CountDataObject<true> => {
    const labels = [...math.range(0, math.max(data), 1, true).toArray()] as number[];
    const range = math.max(data) - math.min(data);
    const rangeDisplay = `${math.min(data)} - ${math.max(data)} (${range})`;
    return {
      name: name,
      total: total,
      mean: math.round(math.mean(data), 2),
      median: math.median(data),
      mode: math.mode(data),
      range: rangeDisplay,
      standardDev: math.round(math.std(data), 2),
      data: labels.map((label, index) => ({ count: countInArray(data, index), id: label })),
    };
  };
  const summaryLengthArray = vendorSets.map((set) => (set.vendors ? set.vendors.length : 0)).sort();

  vendorsData.summary = sanitiseCountData(
    [createVendorsDataObject(summaryLengthArray, vendorsData.summary.name, vendorSets.length)],
    true
  )[0];

  objectKeys(vendorsData.breakdown).forEach((prop) => {
    vendorsData.breakdown[prop] = sanitiseCountData(
      lists[prop].map((name) => {
        const propSets = filterPropSets(vendorSets, prop, name);
        const lengthArray = propSets.map((set) => (set.vendors ? set.vendors.length : 0)).sort();
        return createVendorsDataObject(lengthArray, name, propSets.length);
      }),
      true
    );

    vendorsData.breakdown[prop].sort(
      (a, b) => alphabeticalSortPropCurried("total", true)(a, b) || alphabeticalSortPropCurried("name")(a, b)
    );
  });
  return Promise.resolve(vendorsData);
};

const runtimeOpts: functions.RuntimeOptions = {
  timeoutSeconds: 540,
  memory: "4GB",
};

/**
 * Creates statistics data, and writes to a json file in storage.
 */

export const createStatistics = functions
  .runWith(runtimeOpts)
  // .pubsub.schedule("every 12 hours")
  // .onRun(async (context) => {
  .https.onCall(async (data, contextverylongnameevenlongerpls) => {
    const snapshot = await typedFirestore.collection("keysets").get();
    const sets: StatisticsSetType[] = snapshot.docs
      .map((doc) => {
        const { profile, colorway, designer, icDate, gbEnd, shipped, vendors } = doc.data();

        const lastOfMonth = DateTime.fromISO(doc.data().gbLaunch, { zone: "utc" }).daysInMonth;
        const gbLaunch =
          doc.data().gbMonth && doc.data().gbLaunch ? doc.data().gbLaunch + "-" + lastOfMonth : doc.data().gbLaunch;

        return {
          id: doc.id,
          profile,
          colorway,
          designer,
          icDate,
          gbLaunch,
          gbEnd,
          shipped,
          vendors,
        };
      })
      .filter((set) => Boolean(set.profile));
    sets.sort(alphabeticalSortPropCurried("colorway"));
    const limitedSets = sets.filter((set) => {
      if (set.gbLaunch && !set.gbLaunch.includes("Q")) {
        const year = parseInt(set.gbLaunch.slice(0, 4));
        const thisYear = DateTime.utc().year;
        return year >= thisYear - 2 && year <= thisYear + 1;
      } else {
        return true;
      }
    });
    const timelinesData = await createTimelinesData(limitedSets);
    const calendarData = await createCalendarData(limitedSets);
    const statusData = await createStatusData(limitedSets);
    const shippedData = await createShippedData(limitedSets);
    const durationData = await createDurationData(limitedSets);
    const vendorsData = await createVendorsData(limitedSets);
    const statisticsData = {
      timelines: timelinesData,
      calendar: calendarData,
      status: statusData,
      shipped: shippedData,
      duration: durationData,
      vendors: vendorsData,
      timestamp: DateTime.utc().toISO(),
    };
    const jsonString = JSON.stringify(statisticsData);
    const file = bucket.file("statisticsDataTest.json");
    return file.save(jsonString, { contentType: "application/json" });
  });
