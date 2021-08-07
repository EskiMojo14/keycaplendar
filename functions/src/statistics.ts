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
  TimelineDataObject,
  StatusData,
  ShippedData,
  DurationData,
  VendorData,
  ChartData,
} from "./slices/statistics/types";
import {
  getSetMonthRange,
  alphabeticalSort,
  uniqueArray,
  hasKey,
  countInArray,
  alphabeticalSortPropCurried,
} from "./slices/common/functions";

const bucket = admin.storage().bucket();

const math = create(all) as MathJsStatic;

const today = DateTime.utc();
const yesterday = today.minus({ days: 1 });
const categories: Categories[] = ["icDate", "gbLaunch"];

const createTimelinesData = (sets: StatisticsSetType[]) => {
  const timelinesData: TimelinesData = {
    icDate: {
      summary: {
        count: {
          name: "Timeline: ICs per month",
          total: 0,
          timeline: {
            profiles: [],
            series: [],
          },
        },
        breakdown: {
          name: "Timeline: ICs per month by profile",
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
          name: "Timeline: GBs per month",
          total: 0,
          timeline: {
            profiles: [],
            series: [],
          },
        },
        breakdown: {
          name: "Timeline: GBs per month by profile",
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
  Object.keys(timelinesData).forEach((cat) => {
    if (hasKey(timelinesData, cat)) {
      const catSets = cat === "gbLaunch" ? gbSets : sets;
      timelinesData[cat].summary.count.total = catSets.length;
      timelinesData[cat].summary.breakdown.total = catSets.length;

      const months = getSetMonthRange(catSets, cat, "MMM yy");

      timelinesData[cat].months = months;

      timelinesData[cat].summary.count.timeline.series = [
        months.map((month) => {
          return catSets.filter((set) => {
            const setProp = set[cat];
            const setMonth =
              is<string>(setProp) && !setProp.includes("Q")
                ? DateTime.fromISO(setProp, { zone: "utc" }).toFormat("MMM yy")
                : null;
            return setMonth && setMonth === month;
          }).length;
        }),
      ];

      const profileNames = alphabeticalSort(uniqueArray(catSets.map((set) => set.profile)));
      const designerNames = alphabeticalSort(uniqueArray(catSets.map((set) => set.designer).flat(1)));
      const vendorNames = alphabeticalSort(
        uniqueArray(catSets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat(1))
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
          return length > 0 ? { meta: profile, value: length } : 0;
        }),
        className: `ct-series-${String.fromCharCode(97 + (index % 26))} ct-series-index-${index}`,
        index: index,
      }));

      Object.keys(timelinesData[cat].breakdown).forEach((property) => {
        if (hasKey(timelinesData[cat].breakdown, property)) {
          const data: TimelineDataObject[] = [];
          lists[property].forEach((name) => {
            const filteredSets = catSets.filter((set) => {
              let bool = false;
              if (property === "vendor") {
                bool = set.vendors && set.vendors.some((vendor) => vendor.name === name) ? true : false;
              } else if (property === "designer") {
                bool = set.designer.includes(name);
              } else {
                bool = set[property] === name;
              }
              return bool;
            });
            const profiles = alphabeticalSort(uniqueArray(filteredSets.map((set) => set.profile)));

            let timelineData: ChartData;
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
                    return num > 0
                      ? {
                          meta: profile,
                          value: num,
                        }
                      : 0;
                  }),
                  className: `ct-series-${String.fromCharCode(97 + (index % 26))} ct-series-index-${index}`,
                  index: index,
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
        }
      });
    }
  });
  return Promise.resolve(timelinesData);
};

const createStatusData = (sets: StatisticsSetType[]) => {
  const statusData: StatusData = {
    profile: [],
    designer: [],
    vendor: [],
  };
  const profileNames = alphabeticalSort(uniqueArray(sets.map((set) => set.profile)));
  const designerNames = alphabeticalSort(uniqueArray(sets.map((set) => set.designer).flat(1)));
  const vendorNames = alphabeticalSort(
    uniqueArray(sets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat(1))
  );
  const lists = {
    profile: profileNames,
    designer: designerNames,
    vendor: vendorNames,
  };
  Object.keys(statusData).forEach((prop) => {
    if (hasKey(statusData, prop)) {
      lists[prop].forEach((name) => {
        const icSets = sets.filter((set) => {
          const isIC = !set.gbLaunch || set.gbLaunch.includes("Q");
          if (prop === "vendor") {
            return set.vendors &&
              set.vendors.findIndex((vendor) => {
                return vendor.name === name && isIC;
              }) !== -1
              ? true
              : false;
          } else if (prop === "designer") {
            return set.designer.includes(name) && isIC;
          } else {
            return set[prop] === name && isIC;
          }
        });
        const preGbSets = sets.filter((set) => {
          let startDate;
          if (set.gbLaunch && !set.gbLaunch.includes("Q")) {
            startDate = DateTime.fromISO(set.gbLaunch, { zone: "utc" });
          }
          const isPreGb = startDate && startDate > today;
          if (prop === "vendor") {
            return set.vendors &&
              set.vendors.findIndex((vendor) => {
                return vendor.name === name && isPreGb;
              }) !== -1
              ? true
              : false;
          } else if (prop === "designer") {
            return set.designer.includes(name) && isPreGb;
          } else {
            return set[prop] === name && isPreGb;
          }
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
          const isLiveGb = startDate && startDate <= today && (endDate >= yesterday || !set.gbEnd);
          if (prop === "vendor") {
            return set.vendors &&
              set.vendors.findIndex((vendor) => {
                return vendor.name === name && isLiveGb;
              }) !== -1
              ? true
              : false;
          } else if (prop === "designer") {
            return set.designer.includes(name) && isLiveGb;
          } else {
            return set[prop] === name && isLiveGb;
          }
        });
        const postGbSets = sets.filter((set) => {
          const endDate = DateTime.fromISO(set.gbEnd, { zone: "utc" }).set({
            hour: 23,
            minute: 59,
            second: 59,
            millisecond: 999,
          });
          const isPostGb = endDate <= yesterday;
          if (prop === "vendor") {
            return set.vendors &&
              set.vendors.findIndex((vendor) => {
                return vendor.name === name && isPostGb;
              }) !== -1
              ? true
              : false;
          } else if (prop === "designer") {
            return set.designer.includes(name) && isPostGb;
          } else {
            return set[prop] === name && isPostGb;
          }
        });
        statusData[prop].push({
          name: name,
          ic: icSets.length,
          preGb: preGbSets.length,
          liveGb: liveGbSets.length,
          postGb: postGbSets.length,
          total: icSets.length + preGbSets.length + liveGbSets.length + postGbSets.length,
        });
      });
      statusData[prop].sort(
        (a, b) => alphabeticalSortPropCurried("total", true)(a, b) || alphabeticalSortPropCurried("name")(a, b)
      );
    }
  });
  return Promise.resolve(statusData);
};

const createShippedData = (sets: StatisticsSetType[]) => {
  const shippedData: ShippedData = {
    profile: [],
    designer: [],
    vendor: [],
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
  const profileNames = alphabeticalSort(uniqueArray(pastSets.map((set) => set.profile)));
  const designerNames = alphabeticalSort(uniqueArray(pastSets.map((set) => set.designer).flat(1)));
  const vendorNames = alphabeticalSort(
    uniqueArray(pastSets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat(1))
  );
  const lists = {
    profile: profileNames,
    designer: designerNames,
    vendor: vendorNames,
  };
  Object.keys(shippedData).forEach((prop) => {
    if (hasKey(shippedData, prop)) {
      lists[prop].forEach((name) => {
        const shippedSets = pastSets.filter((set) => {
          if (prop === "vendor") {
            return set.vendors &&
              set.vendors.findIndex((vendor) => {
                return vendor.name === name && set.shipped === true;
              }) !== -1
              ? true
              : false;
          } else if (prop === "designer") {
            return set.designer.includes(name) && set.shipped === true;
          } else {
            return set[prop] === name && set.shipped === true;
          }
        });
        const unshippedSets = pastSets.filter((set) => {
          if (prop === "vendor") {
            return set.vendors &&
              set.vendors.findIndex((vendor) => {
                return vendor.name === name && set.shipped !== true;
              }) !== -1
              ? true
              : false;
          } else if (prop === "designer") {
            return set.designer.includes(name) && set.shipped !== true;
          } else {
            return set[prop] === name && set.shipped !== true;
          }
        });
        const timelineData = months.map((month) => {
          const shipped = shippedSets.filter((set) => {
            const setEnd = set.gbEnd ? DateTime.fromISO(set.gbEnd, { zone: "utc" }).toFormat("MMM yy") : null;
            return setEnd && setEnd === month;
          });
          const unshipped = unshippedSets.filter((set) => {
            const setEnd = set.gbEnd ? DateTime.fromISO(set.gbEnd, { zone: "utc" }).toFormat("MMM yy") : null;
            return setEnd && setEnd === month;
          });
          return {
            shipped: { meta: "Shipped", value: shipped.length },
            unshipped: { meta: "Unshipped", value: unshipped.length },
          };
        });
        shippedData[prop].push({
          name: name,
          shipped: shippedSets.length,
          unshipped: unshippedSets.length,
          total: shippedSets.length + unshippedSets.length,
          timeline: {
            months: months,
            series: timelineData,
          },
        });
      });
      shippedData[prop].sort(
        (a, b) => alphabeticalSortPropCurried("total", true)(a, b) || alphabeticalSortPropCurried("name")(a, b)
      );
    }
  });
  return Promise.resolve(shippedData);
};

const createDurationData = (sets: StatisticsSetType[]) => {
  const durationData: DurationData = {
    icDate: {
      profile: [],
      designer: [],
      vendor: [],
    },
    gbLaunch: {
      profile: [],
      designer: [],
      vendor: [],
    },
  };
  const dateSets = sets.filter((set) => set.gbLaunch && set.gbLaunch.length === 10);
  categories.forEach((cat) => {
    const propSets: StatisticsSetType[] =
      cat === "gbLaunch" ? dateSets.filter((set) => set.gbEnd.length === 10) : dateSets;
    if (hasKey(durationData, cat)) {
      const profileNames = alphabeticalSort(uniqueArray(propSets.map((set) => set.profile)));
      const designerNames = alphabeticalSort(uniqueArray(propSets.map((set) => set.designer).flat(1)));
      const vendorNames = alphabeticalSort(
        uniqueArray(propSets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat(1))
      );
      const lists = {
        profile: profileNames,
        designer: designerNames,
        vendor: vendorNames,
      };

      Object.keys(durationData[cat]).forEach((property) => {
        if (hasKey(durationData[cat], property)) {
          lists[property] = ["All"].concat(lists[property]);
          lists[property].forEach((name) => {
            const data: number[] = [];
            if (name === "All") {
              propSets.forEach((set) => {
                const startDate = DateTime.fromISO(set[cat], { zone: "utc" });
                const endDate = DateTime.fromISO(set[cat === "gbLaunch" ? "gbEnd" : "gbLaunch"], { zone: "utc" });
                const length = endDate.diff(startDate, cat === "icDate" ? "months" : "days");
                data.push(math.round(length[cat === "icDate" ? "months" : "days"], 2));
              });
            } else {
              propSets
                .filter((set) => {
                  let bool = false;
                  if (property === "vendor") {
                    bool =
                      set.vendors &&
                      set.vendors.findIndex((vendor) => {
                        return vendor.name === name;
                      }) !== -1
                        ? true
                        : false;
                  } else if (property === "designer") {
                    bool = set.designer.includes(name);
                  } else {
                    bool = set[property] === name;
                  }
                  return bool;
                })
                .forEach((set) => {
                  const startDate = DateTime.fromISO(set[cat], { zone: "utc" });
                  const endDate = DateTime.fromISO(set[cat === "gbLaunch" ? "gbEnd" : "gbLaunch"], { zone: "utc" });
                  const length = endDate.diff(startDate, cat === "icDate" ? "months" : "days");
                  data.push(math.round(length[cat === "icDate" ? "months" : "days"], 2));
                });
              Object.keys(durationData[cat]).forEach((key) => {
                if (hasKey(durationData[cat], key)) {
                  durationData[cat][key].sort((a, b) => {
                    if (a.name === "All" || b.name === "All") {
                      return a.name === "All" ? -1 : 1;
                    }
                    return (
                      alphabeticalSortPropCurried("total", true)(a, b) || alphabeticalSortPropCurried("name")(a, b)
                    );
                  });
                }
              });
            }
            data.sort();
            const labels = [
              ...math.range(math.round(math.min(data)), math.round(math.max(data)), 1, true).toArray(),
            ] as number[];
            const count = labels.map((label) => countInArray(math.round(data), label));
            const range = math.max(data) - math.min(data);
            const rangeDisplay = `${math.min(data)} - ${math.max(data)} (${range})`;
            durationData[cat][property].push({
              name: name,
              total: data.length,
              mean: math.round(math.mean(data), 2),
              median: math.median(data),
              mode: math.mode(data),
              range: rangeDisplay,
              standardDev: math.round(math.std(data), 2),
              chartData: { labels, series: [count] },
            });
          });
        }
      });
    }
  });
  return Promise.resolve(durationData);
};

const createVendorsData = (sets: StatisticsSetType[]) => {
  const vendorsData: VendorData = {
    profile: [],
    designer: [],
    vendor: [],
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

  const profileNames = alphabeticalSort(uniqueArray(vendorSets.map((set) => set.profile)));
  const designerNames = alphabeticalSort(uniqueArray(vendorSets.map((set) => set.designer).flat(1)));
  const vendorNames = alphabeticalSort(
    uniqueArray(vendorSets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat(1))
  );
  const lists = {
    profile: profileNames,
    designer: designerNames,
    vendor: vendorNames,
  };

  Object.keys(vendorsData).forEach((prop) => {
    if (hasKey(vendorsData, prop)) {
      lists[prop] = ["All"].concat(lists[prop]);
      lists[prop].forEach((name) => {
        let propSets = [];
        if (name === "All") {
          propSets = vendorSets;
        } else if (prop === "designer") {
          propSets = vendorSets.filter((set) => set.designer.includes(name));
        } else if (prop === "vendor") {
          propSets = vendorSets.filter((set) => set.vendors && set.vendors.map((vendor) => vendor.name).includes(name));
        } else {
          propSets = vendorSets.filter((set) => set[prop] === name);
        }
        const lengthArray = propSets.map((set) => (set.vendors ? set.vendors.length : 0)).sort();
        if (lengthArray.length > 0) {
          const labels = [...math.range(0, math.max(lengthArray), 1, true).toArray()] as number[];
          const count = labels.map((_val, index) => countInArray(lengthArray, index));
          const range = math.max(lengthArray) - math.min(lengthArray);
          const rangeDisplay = `${math.min(lengthArray)} - ${math.max(lengthArray)} (${range})`;
          vendorsData[prop].push({
            name: name,
            total: propSets.length,
            mean: math.round(math.mean(lengthArray), 2),
            median: math.median(lengthArray),
            mode: math.mode(lengthArray),
            range: rangeDisplay,
            standardDev: math.round(math.std(lengthArray), 2),
            chartData: { labels, series: [count] },
          });
        }
      });

      vendorsData[prop].sort(
        (a, b) => alphabeticalSortPropCurried("total", true)(a, b) || alphabeticalSortPropCurried("name")(a, b)
      );
    }
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
      timelinesData: await timelinesData,
      statusData: await statusData,
      shippedData: await shippedData,
      durationData: await durationData,
      vendorsData: await vendorsData,
      timestamp: DateTime.utc().toISO(),
    };
    const jsonString = JSON.stringify(statisticsData);
    const file = bucket.file("statisticsDataTest.json");
    return file.save(jsonString, { contentType: "application/json" });
  });
