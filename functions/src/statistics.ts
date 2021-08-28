import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { is } from "typescript-is";
import { typedFirestore } from "./slices/firebase/firestore";
import { DateTime } from "luxon";
import { create, all, MathJsStatic } from "mathjs";
import {
  StatisticsSetType,
  Categories,
  TimelinesData,
  TimelinesDataObject,
  StatusData,
  ShippedData,
  DurationData,
  VendorData,
  DurationDataObject,
  VendorDataObject,
  ShippedDataObject,
  Properties,
  StatusDataObjectSunburstChild,
  StatusDataObjectSunburstChildWithChild,
  StatusDataObject,
} from "./slices/statistics/types";
import {
  getSetMonthRange,
  alphabeticalSort,
  removeDuplicates,
  hasKey,
  countInArray,
  alphabeticalSortPropCurried,
  objectKeys,
} from "./slices/common/functions";

const bucket = admin.storage().bucket();

const math = create(all) as MathJsStatic;

const today = DateTime.utc();
const yesterday = today.minus({ days: 1 });
const categories: Categories[] = ["icDate", "gbLaunch"];

const monthFormat = "MMM yy";

const sanitiseBarData = (data: Record<string, number>[]) =>
  data.map((datum, index) => ({ ...datum, index })).filter((datum) => Object.keys(datum).length > 1);

const hydrateTimelinesData = (data: Record<string, number>[], months: string[], profiles: string[]) =>
  months.map((month, monthIndex) => {
    const blankObject = {
      month: months[monthIndex],
      index: monthIndex,
      ...profiles.reduce((a, profile) => ({ ...a, [profile]: 0 }), {}),
    };
    const foundObject = data.find(({ index }) => index === monthIndex);
    return { ...blankObject, ...(foundObject || {}) };
  });

const sunburstChildHasChildren = (
  child: StatusDataObjectSunburstChild
): child is StatusDataObjectSunburstChildWithChild => "children" in child;

const sanitiseStatusData = (data: StatusDataObject[]) =>
  data.map(({ sunburst, ...datum }) => {
    const filteredSunburst = sunburst
      ? sunburst
          .map((child, index) => ({ ...child, index }))
          .filter((child) => (sunburstChildHasChildren(child) ? true : child.val > 0))
          .map((child) =>
            sunburstChildHasChildren(child)
              ? {
                  ...child,
                  children: child.children.filter((child) => (sunburstChildHasChildren(child) ? true : child.val > 0)),
                }
              : child
          )
          .filter((child) => (sunburstChildHasChildren(child) ? child.children.length > 0 : true))
      : undefined;
    return filteredSunburst
      ? {
          ...datum,
          sunburst: filteredSunburst,
        }
      : datum;
  });

const hydrateStatusData = (
  data: StatusDataObject[],
  ids = ["IC", "Pre GB", "Live GB", "Post GB"]
): StatusDataObject[] =>
  data.map(({ sunburst, pie, ...datum }) => {
    const defaultSunburst = [pie.ic, pie.preGb, pie.liveGb, pie.postGb].map((val, index) => ({ id: ids[index], val }));
    if (sunburst) {
      return {
        ...datum,
        pie,
        sunburst: Array(4)
          .fill("")
          .map((_e, arrayIndex) => {
            const foundObject = sunburst.find(({ index }) => index && index === arrayIndex);
            return {
              ...defaultSunburst[arrayIndex],
              ...(foundObject || {}),
              id: ids[arrayIndex],
            };
          }),
      };
    }
    return {
      ...datum,
      pie,
      sunburst: defaultSunburst,
    };
  });

const sanitiseShippedData = (data: ShippedDataObject[]): ShippedDataObject[] =>
  data.map(({ months, ...datum }) => ({
    ...datum,
    months: months
      .map((month, index) =>
        Object.entries({ ...month, index })
          .filter(([key, value]) => key === "index" || (value && value > 0))
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
      )
      .filter((month) => Object.keys(month).length > 1),
  }));

const hydrateShippedData = (data: ShippedDataObject[], months: string[]): ShippedDataObject[] =>
  data.map(({ months: monthData, ...datum }) => ({
    ...datum,
    months: months.map((month, monthIndex) => {
      const blankObject = {
        month: months[monthIndex],
        index: monthIndex,
        shipped: 0,
        unshipped: 0,
      };
      const foundObject = monthData.find(({ index }) => index === monthIndex);
      return { ...blankObject, ...(foundObject || {}) };
    }),
  }));

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

const createTimelinesData = (sets: StatisticsSetType[]) => {
  const timelinesData: TimelinesData = {
    icDate: {
      months: [],
      allProfiles: [],
      summary: {
        name: "",
        total: 0,
        profiles: [],
        months: [],
      },
      breakdown: {
        profile: {
          name: "",
          total: 0,
        },
        designer: {
          name: "",
          total: 0,
          profiles: [],
          months: [],
        },
        vendor: {
          name: "",
          total: 0,
          profiles: [],
          months: [],
        },
      },
    },
    gbLaunch: {
      months: [],
      allProfiles: [],
      summary: {
        name: "",
        total: 0,
        profiles: [],
        months: [],
      },
      breakdown: {
        profile: {
          name: "",
          total: 0,
        },
        designer: {
          name: "",
          total: 0,
          profiles: [],
          months: [],
        },
        vendor: {
          name: "",
          total: 0,
          profiles: [],
          months: [],
        },
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
      return profileNames.reduce<TimelinesDataObject["months"][number]>(
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
      name: "Summary",
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
            return profiles.reduce<TimelinesDataObject["months"][number]>(
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

const createStatusData = (sets: StatisticsSetType[]) => {
  const statusData: StatusData = {
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
    sets: StatisticsSetType[],
    name: string,
    prop?: Properties,
    list?: string[]
  ): StatusDataObject => {
    const icSets = sets.filter((set: StatisticsSetType) => !set.gbLaunch || set.gbLaunch.includes("Q"));
    const preGbSets = sets.filter((set) => {
      let startDate;
      if (set.gbLaunch && !set.gbLaunch.includes("Q")) {
        startDate = DateTime.fromISO(set.gbLaunch, { zone: "utc" });
      }
      return startDate && startDate > today;
    });
    const liveGbSets = sets.filter((set) => {
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
    const postGbSets = sets.filter((set) => {
      const endDate = DateTime.fromISO(set.gbEnd, { zone: "utc" }).set({
        hour: 23,
        minute: 59,
        second: 59,
        millisecond: 999,
      });
      return endDate <= yesterday;
    });

    const baseObj = {
      name: name,
      total: sets.length,
      pie: { ic: icSets.length, preGb: preGbSets.length, liveGb: liveGbSets.length, postGb: postGbSets.length },
    };

    if (prop && list) {
      const sunburstSets = [icSets, preGbSets, liveGbSets, postGbSets];
      const sunburst: StatusDataObjectSunburstChild[] = sunburstSets.map((sets) => {
        const childSets = list.map((val) => {
          const filteredSets = filterPropSets(sets, prop, val);
          return {
            id: val,
            val: filteredSets.length,
          };
        });
        return {
          children: childSets,
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
    createStatusDataObject(sets, "Current keyset status", "profile", lists.profile),
  ])[0];

  objectKeys(statusData.breakdown).forEach((prop) => {
    const data =
      prop === "profile"
        ? lists[prop].map((name) => createStatusDataObject(filterPropSets(sets, prop, name), name))
        : sanitiseStatusData(
            lists[prop].map((name) =>
              createStatusDataObject(filterPropSets(sets, prop, name), name, "profile", lists.profile)
            )
          );
    statusData.breakdown[prop] = data;
    statusData.breakdown[prop].sort(
      (a, b) => alphabeticalSortPropCurried("total", true)(a, b) || alphabeticalSortPropCurried("name")(a, b)
    );
  });
  return Promise.resolve(statusData);
};

const createShippedData = (sets: StatisticsSetType[]) => {
  const shippedData: ShippedData = {
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

  const createShippedDataObject = (sets: StatisticsSetType[], name: string): ShippedDataObject => {
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

  shippedData.summary = sanitiseShippedData([createShippedDataObject(pastSets, "Shipped sets by GB month")])[0];

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

const createDurationData = (sets: StatisticsSetType[]) => {
  const durationData: DurationData = {
    icDate: {
      summary: {
        chartData: { labels: [], series: [] },
        mean: 0,
        median: 0,
        mode: [],
        name: "IC duration (months)",
        range: "",
        standardDev: 0,
        total: 0,
      },
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
    gbLaunch: {
      summary: {
        chartData: { labels: [], series: [] },
        mean: 0,
        median: 0,
        mode: [],
        name: "GB duration (days)",
        range: "",
        standardDev: 0,
        total: 0,
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

      const createDurationDataObject = (data: number[], name: string, total: number): DurationDataObject => {
        const labels = [
          ...math.range(math.round(math.min(data)), math.round(math.max(data)), 1, true).toArray(),
        ] as number[];
        const count = labels.map((label) => ({
          value: countInArray(math.round(data), label),
          meta: `${label} ${cat === "icDate" ? "months" : "days"}`,
        }));
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
          chartData: { labels, series: [count] },
        };
      };

      const summaryData = propSets.map((set) => {
        const startDate = DateTime.fromISO(set[cat], { zone: "utc" });
        const endDate = DateTime.fromISO(set[cat === "gbLaunch" ? "gbEnd" : "gbLaunch"], { zone: "utc" });
        const length = endDate.diff(startDate, cat === "icDate" ? "months" : "days");
        return math.round(length[cat === "icDate" ? "months" : "days"], 2);
      });

      const title = cat === "icDate" ? "IC duration (months)" : "GB duration (days)";

      durationData[cat].summary = createDurationDataObject(summaryData, title, propSets.length);

      objectKeys(durationData[cat].breakdown).forEach((property) => {
        durationData[cat].breakdown[property] = lists[property].map((name) => {
          const filteredSets = filterPropSets(propSets, property, name);
          const data = filteredSets.map((set) => {
            const startDate = DateTime.fromISO(set[cat], { zone: "utc" });
            const endDate = DateTime.fromISO(set[cat === "gbLaunch" ? "gbEnd" : "gbLaunch"], { zone: "utc" });
            const length = endDate.diff(startDate, cat === "icDate" ? "months" : "days");
            return math.round(length[cat === "icDate" ? "months" : "days"], 2);
          });
          return createDurationDataObject(data, name, filteredSets.length);
        });
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
  const vendorsData: VendorData = {
    summary: {
      chartData: { labels: [], series: [] },
      mean: 0,
      median: 0,
      mode: [],
      name: "Vendors per set",
      range: "",
      standardDev: 0,
      total: 0,
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

  const createVendorsDataObject = (data: number[], name: string, total: number): VendorDataObject => {
    const labels = [...math.range(0, math.max(data), 1, true).toArray()] as number[];
    const count = labels.map((_val, index) => countInArray(data, index));
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
      chartData: { labels, series: [count] },
    };
  };
  const summaryLengthArray = vendorSets.map((set) => (set.vendors ? set.vendors.length : 0)).sort();

  vendorsData.summary = createVendorsDataObject(summaryLengthArray, "Vendors per set", vendorSets.length);

  objectKeys(vendorsData.breakdown).forEach((prop) => {
    vendorsData.breakdown[prop] = lists[prop].map((name) => {
      const propSets = filterPropSets(vendorSets, prop, name);
      const lengthArray = propSets.map((set) => (set.vendors ? set.vendors.length : 0)).sort();
      return createVendorsDataObject(lengthArray, name, propSets.length);
    });

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
    const timelinesData = createTimelinesData(limitedSets);
    const statusData = createStatusData(limitedSets);
    const shippedData = createShippedData(limitedSets);
    const durationData = createDurationData(limitedSets);
    const vendorsData = createVendorsData(limitedSets);
    const statisticsData = {
      timelines: await timelinesData,
      status: await statusData,
      shipped: await shippedData,
      duration: await durationData,
      vendors: await vendorsData,
      timestamp: DateTime.utc().toISO(),
    };
    const jsonString = JSON.stringify(statisticsData);
    const file = bucket.file("statisticsDataTest.json");
    return file.save(jsonString, { contentType: "application/json" });
  });
