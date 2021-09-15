import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { is } from "typescript-is";
import { DateTime } from "luxon";
import { IChartistData } from "chartist";
import { create, all, MathJsStatic } from "mathjs";
import {
  StatisticsSetType,
  Categories,
  TimelinesData,
  TimelineDataObject,
  StatusData,
  ShippedData,
  DurationData,
  VendorData,
  DurationDataObject,
  VendorDataObject,
  ShippedDataObject,
  StatusDataObject,
  Properties,
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

const filterSets = (sets: StatisticsSetType[], prop: Properties, val: string): StatisticsSetType[] =>
  sets.filter(
    (set) =>
      (prop === "vendor" &&
        set.vendors &&
        set.vendors.findIndex((vendor) => {
          return vendor.name === val;
        }) !== -1) ||
      (prop === "designer" && set.designer.includes(val)) ||
      (prop !== "vendor" && prop !== "designer" && set[prop] === val)
  );

const createTimelinesData = (sets: StatisticsSetType[]) => {
  const timelinesData: TimelinesData = {
    icDate: {
      summary: {
        count: {
          name: "ICs per month",
          total: 0,
          timeline: {
            profiles: [],
            series: [],
          },
        },
        breakdown: {
          name: "ICs per month by profile",
          total: 0,
          timeline: {
            profiles: [],
            series: [],
          },
        },
      },
      months: [],
      allProfiles: [],
      breakdown: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
    gbLaunch: {
      summary: {
        count: {
          name: "GBs per month",
          total: 0,
          timeline: {
            profiles: [],
            series: [],
          },
        },
        breakdown: {
          name: "GBs per month by profile",
          total: 0,
          timeline: {
            profiles: [],
            series: [],
          },
        },
      },
      months: [],
      allProfiles: [],
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
    timelinesData[cat].summary.count.total = catSets.length;
    timelinesData[cat].summary.breakdown.total = catSets.length;

    const months = getSetMonthRange(catSets, cat, "MMM yy");

    timelinesData[cat].months = months;

    timelinesData[cat].summary.count.timeline.series = [
      months.map((month) => {
        const length = catSets.filter((set) => {
          const setProp = set[cat];
          const setMonth =
            is<string>(setProp) && !setProp.includes("Q")
              ? DateTime.fromISO(setProp, { zone: "utc" }).toFormat("MMM yy")
              : null;
          return setMonth && setMonth === month;
        }).length;
        return length;
      }),
    ];

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

    timelinesData[cat].allProfiles = profileNames;

    timelinesData[cat].summary.breakdown.timeline.series = profileNames.map((profile, index) => ({
      data: months.map((month) => {
        const length = catSets.filter((set) => {
          const setProp = set[cat];
          const setMonth =
            is<string>(setProp) && !setProp.includes("Q")
              ? DateTime.fromISO(setProp, { zone: "utc" }).toFormat("MMM yy")
              : null;
          return setMonth && setMonth === month && set.profile === profile;
        }).length;
        return length;
      }),
      className: `ct-series-${String.fromCharCode(97 + (index % 26))} ct-series-index-${index}`,
      index: index,
      name: profile,
    }));

    objectKeys(timelinesData[cat].breakdown).forEach((property) => {
      const data: TimelineDataObject[] = [];
      lists[property].forEach((name) => {
        const filteredSets = filterSets(catSets, property, name);
        const profiles = alphabeticalSort(removeDuplicates(filteredSets.map((set) => set.profile)));

        let timelineData: IChartistData["series"];
        if (property === "vendor" || property === "designer") {
          timelineData = profiles.map((profile) => {
            const index = profileNames.indexOf(profile);
            return {
              data: months.map((month) => {
                const monthSets = filteredSets.filter((set) => {
                  const date = set[cat] ? DateTime.fromISO(set[cat], { zone: "utc" }).toFormat("MMM yy") : null;
                  return date && date === month;
                });
                const num = monthSets.filter((set) => set.profile === profile).length;
                return num;
              }),
              className: `ct-series-${String.fromCharCode(97 + (index % 26))} ct-series-index-${index}`,
              index: index,
              name: profile,
            };
          });
        } else {
          timelineData = [
            months.map((month) => {
              const monthSets = filteredSets.filter((set) => {
                const date = set[cat] ? DateTime.fromISO(set[cat], { zone: "utc" }).toFormat("MMM yy") : null;
                return date && date === month;
              });
              return monthSets.length;
            }),
          ];
        }

        data.push({
          name: name,
          total: filteredSets.length,
          timeline: {
            profiles: profiles,
            series: timelineData,
          },
        });
      });
      data.sort(
        (a, b) => alphabeticalSortPropCurried("total", true)(a, b) || alphabeticalSortPropCurried("name")(a, b)
      );
      timelinesData[cat].breakdown[property] = data;
    });
  });
  return Promise.resolve(timelinesData);
};

const createStatusData = (sets: StatisticsSetType[]) => {
  const statusData: StatusData = {
    summary: {
      name: "Current keyset status",
      total: 0,
      ic: 0,
      preGb: 0,
      liveGb: 0,
      postGb: 0,
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
  const createStatusDataObject = (sets: StatisticsSetType[], name: string): StatusDataObject => {
    const icSets = sets.filter((set) => !set.gbLaunch || set.gbLaunch.includes("Q"));
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
    return {
      name: name,
      ic: icSets.length,
      preGb: preGbSets.length,
      liveGb: liveGbSets.length,
      postGb: postGbSets.length,
      total: sets.length,
    };
  };

  statusData.summary = createStatusDataObject(sets, "Current keyset status");

  objectKeys(statusData.breakdown).forEach((prop) => {
    statusData.breakdown[prop] = lists[prop].map((name) => createStatusDataObject(filterSets(sets, prop, name), name));
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
      timeline: {
        shipped: [],
        unshipped: [],
      },
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
  const months = getSetMonthRange(pastSets, "gbEnd", "MMM yy");

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
    const shipped = {
      data: months.map((month) => {
        const filteredSets = shippedSets.filter((set) => {
          const setEnd = set.gbEnd ? DateTime.fromISO(set.gbEnd, { zone: "utc" }).toFormat("MMM yy") : null;
          return setEnd && setEnd === month;
        });
        return filteredSets.length;
      }),
      name: "Shipped",
    };
    const unshipped = {
      data: months.map((month) => {
        const filteredSets = unshippedSets.filter((set) => {
          const setEnd = set.gbEnd ? DateTime.fromISO(set.gbEnd, { zone: "utc" }).toFormat("MMM yy") : null;
          return setEnd && setEnd === month;
        });
        return filteredSets.length;
      }),
      name: "Unshipped",
    };
    return {
      name: name,
      total: sets.length,
      shipped: shippedSets.length,
      unshipped: unshippedSets.length,
      timeline: {
        shipped,
        unshipped,
      },
    };
  };

  shippedData.summary = createShippedDataObject(pastSets, "Shipped sets by GB month");

  objectKeys(shippedData.breakdown).forEach((prop) => {
    shippedData.breakdown[prop] = lists[prop].map((name) =>
      createShippedDataObject(filterSets(pastSets, prop, name), name)
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
          const filteredSets = filterSets(propSets, property, name);
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
      const propSets = filterSets(vendorSets, prop, name);
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
  .pubsub.schedule("every 12 hours")
  .onRun(async (context) => {
    // .https.onCall(async (data, contextverylongnameevenlongerpls) => {
    const snapshot = await admin.firestore().collection("keysets").get();
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
    const file = bucket.file("statisticsData.json");
    return file.save(jsonString, { contentType: "application/json" });
  });
