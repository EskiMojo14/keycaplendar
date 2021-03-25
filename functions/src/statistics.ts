import * as functions from "firebase-functions";
import * as moment from "moment";
import { utc } from "moment";
import { create, all, MathJsStatic } from "mathjs";
import { SetType, StatisticsSortType, Categories, Properties } from "./util/types";
import { getSetMonthRange, alphabeticalSort, uniqueArray, hasKey, countInArray } from "./util/functions";

const math = create(all) as MathJsStatic;

type TimelineDataObject = {
  name: string;
  total: number;
  timeline: {
    months: string[];
    profiles: string[];
    series:
      | {
          meta: string;
          value: number;
        }[][]
      | number[][];
  };
};

type CountDataObject = {
  total: number;
  months: string[];
  series: number[][];
};

type SummaryData = {
  count: Record<Categories, CountDataObject>;
  profile: Record<Categories, { profiles: string[]; data: TimelineDataObject }>;
};

const today = utc();
const yesterday = utc().date(today.date() - 1);
const categories: Categories[] = ["icDate", "gbLaunch"];

const createSummaryData = (sets: SetType[]) => {
  const summaryData: SummaryData = {
    count: {
      icDate: { total: 0, months: [], series: [] },
      gbLaunch: { total: 0, months: [], series: [] },
    },
    profile: {
      icDate: {
        profiles: [],
        data: {
          name: "Profile breakdown",
          total: 0,
          timeline: {
            months: [],
            profiles: [],
            series: [],
          },
        },
      },
      gbLaunch: {
        profiles: [],
        data: {
          name: "Profile breakdown",
          total: 0,
          timeline: {
            months: [],
            profiles: [],
            series: [],
          },
        },
      },
    },
  };
  const gbSets = sets.filter((set) => set.gbLaunch && set.gbLaunch.length === 10);
  categories.forEach((cat) => {
    const catSets = cat === "gbLaunch" ? gbSets : sets;

    summaryData.count[cat].total = catSets.length;
    summaryData.profile[cat].data.total = catSets.length;

    const months = getSetMonthRange(catSets, cat, "MMM YY");
    summaryData.count[cat].months = months;
    summaryData.profile[cat].data.timeline.months = months;

    summaryData.count[cat].series = [
      months.map((month) => {
        return catSets.filter((set) => {
          const setProp = set[cat];
          const setMonth =
            typeof setProp === "string" && !setProp.includes("Q") ? moment(setProp).format("MMM YY") : null;
          return setMonth && setMonth === month;
        }).length;
      }),
    ];

    const profiles = alphabeticalSort(uniqueArray(catSets.map((set) => set.profile)));
    summaryData.profile[cat].profiles = profiles;
    summaryData.profile[cat].data.timeline.profiles = profiles;

    summaryData.profile[cat].data.timeline.series = profiles.map((profile) => {
      return months.map((month) => {
        const length = catSets.filter((set) => {
          const setProp = set[cat];
          const setMonth =
            typeof setProp === "string" && !setProp.includes("Q") ? moment(setProp).format("MMM YY") : null;
          return setMonth && setMonth === month && set.profile === profile;
        }).length;
        return { meta: `${profile}&nbsp;`, value: length };
      });
    });
  });
  return summaryData;
};

type TimelinesData = Record<Categories, Record<Properties, { profiles: string[]; data: TimelineDataObject[] }>>;

const createTimelinesData = (sets: SetType[], sort: string) => {
  const timelinesData: TimelinesData = {
    icDate: {
      profile: {
        profiles: [],
        data: [],
      },
      designer: {
        profiles: [],
        data: [],
      },
      vendor: {
        profiles: [],
        data: [],
      },
    },
    gbLaunch: {
      profile: {
        profiles: [],
        data: [],
      },
      designer: {
        profiles: [],
        data: [],
      },
      vendor: {
        profiles: [],
        data: [],
      },
    },
  };
  const gbSets = sets.filter((set) => set.gbLaunch && set.gbLaunch.length === 10);
  Object.keys(timelinesData).forEach((prop) => {
    if (hasKey(timelinesData, prop)) {
      const propSets = prop === "gbLaunch" ? gbSets : sets;
      const months = getSetMonthRange(propSets, prop, "MMM YY");
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

      Object.keys(timelinesData[prop]).forEach((property) => {
        if (hasKey(timelinesData[prop], property)) {
          const data: TimelineDataObject[] = [];
          timelinesData[prop][property].profiles = profileNames;
          lists[property].forEach((name) => {
            const filteredSets = propSets.filter((set) => {
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
            });
            const profiles = alphabeticalSort(uniqueArray(filteredSets.map((set) => set.profile)));

            let timelineData;
            if (property === "vendor" || property === "designer") {
              timelineData = profileNames.map((profile) => {
                return months.map((month) => {
                  const monthSets = filteredSets.filter((set) => {
                    const date = set[prop] ? moment(set[prop]).format("MMM YY") : null;
                    return date && date === month;
                  });
                  const num = monthSets.filter((set) => set.profile === profile).length;
                  return {
                    meta: `${profile}:&nbsp;`,
                    value: num,
                  };
                });
              });
            } else {
              timelineData = [
                months.map((month) => {
                  const monthSets = filteredSets.filter((set) => {
                    const date = set[prop] ? moment(set[prop]).format("MMM YY") : null;
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
                months: months,
                profiles: profiles,
                series: timelineData,
              },
            });
          });
          data.sort((a, b) => {
            const x = sort === "alphabetical" ? a.name.toLowerCase() : a.total;
            const y = sort === "alphabetical" ? b.name.toLowerCase() : b.total;
            const c = a.name.toLowerCase();
            const d = b.name.toLowerCase();
            if (x < y) {
              return sort === "alphabetical" ? -1 : 1;
            }
            if (x > y) {
              return sort === "alphabetical" ? 1 : -1;
            }
            if (c < d) {
              return -1;
            }
            if (c > d) {
              return 1;
            }
            return 0;
          });
          timelinesData[prop][property].data = data;
        }
      });
    }
  });
  return timelinesData;
};

type StatusDataObject = {
  ic: number;
  liveGb: number;
  name: string;
  postGb: number;
  preGb: number;
  total: number;
};

type StatusData = Record<Properties, StatusDataObject[]>;

const createStatusData = (sets: SetType[], sort: string) => {
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
            startDate = utc(set.gbLaunch);
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
            startDate = utc(set.gbLaunch);
          }
          const endDate = utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
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
          const endDate = utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
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
      statusData[prop].sort((a, b) => {
        const x = sort === "total" ? a.total : (a.name as string).toLowerCase();
        const y = sort === "total" ? b.total : (b.name as string).toLowerCase();
        if (x < y) {
          return sort === "total" ? 1 : -1;
        }
        if (x > y) {
          return sort === "total" ? -1 : 1;
        }
        return 0;
      });
    }
  });
  return statusData;
};

type ShippedDataObject = {
  name: string;
  shipped: number;
  total: number;
  unshipped: number;
  timeline: {
    months: string[];
    series: {
      [key: string]: {
        meta: string;
        value: number;
      };
    }[];
  };
};

type ShippedData = Record<Properties, ShippedDataObject[]>;

const createShippedData = (sets: SetType[], sort: string) => {
  const shippedData: ShippedData = {
    profile: [],
    designer: [],
    vendor: [],
  };
  const pastSets = sets.filter((set) => {
    const endDate = utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
    return endDate <= yesterday;
  });
  const months = getSetMonthRange(pastSets, "gbEnd", "MMM YY");
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
            const setEnd = set.gbEnd ? moment(set.gbEnd).format("MMM YY") : null;
            return setEnd && setEnd === month;
          });
          const unshipped = unshippedSets.filter((set) => {
            const setEnd = set.gbEnd ? moment(set.gbEnd).format("MMM YY") : null;
            return setEnd && setEnd === month;
          });
          return {
            shipped: { meta: "Shipped:&nbsp;", value: shipped.length },
            unshipped: { meta: "Unshipped:&nbsp;", value: unshipped.length },
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
      shippedData[prop].sort((a, b) => {
        const x = sort === "total" ? a.total : (a.name as string).toLowerCase();
        const y = sort === "total" ? b.total : (b.name as string).toLowerCase();
        if (x < y) {
          return sort === "total" ? 1 : -1;
        }
        if (x > y) {
          return sort === "total" ? -1 : 1;
        }
        return 0;
      });
    }
  });
  return shippedData;
};

type DurationDataObject = {
  chartData: number[][];
  mean: number;
  median: number;
  mode: number[];
  name: string;
  range: string;
  standardDev: number;
  total: number;
};

type DurationData = Record<Categories, Record<Properties, DurationDataObject[]>>;

const createDurationData = (sets: SetType[], sort: string) => {
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
  const dateSets = sets.filter((set) => {
    return set.gbLaunch && set.gbLaunch.length === 10;
  });
  categories.forEach((cat) => {
    const propSets: SetType[] =
      cat === "gbLaunch"
        ? dateSets.filter((set) => {
            return set.gbEnd.length === 10; // eslint-disable-line indent
          }) // eslint-disable-line indent
        : dateSets;
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
                const startDate = moment(set[cat]);
                const endDate = moment(set[cat === "gbLaunch" ? "gbEnd" : "gbLaunch"]);
                const length = endDate.diff(startDate, cat === "icDate" ? "months" : "days");
                data.push(length);
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
                  const startDate = moment(set[cat]);
                  const endDate = moment(set[cat === "gbLaunch" ? "gbEnd" : "gbLaunch"]);
                  const length = endDate.diff(startDate, cat === "icDate" ? "months" : "days");
                  data.push(length);
                });
              Object.keys(durationData[cat]).forEach((key) => {
                if (hasKey(durationData[cat], key)) {
                  durationData[cat][key].sort((a, b) => {
                    if (a.name === "All" || b.name === "All") {
                      return a.name === "All" ? -1 : 1;
                    }
                    const x =
                      sort === "alphabetical" ? a.name.toLowerCase() : a[sort === "duration" ? "mean" : "total"];
                    const y =
                      sort === "alphabetical" ? b.name.toLowerCase() : b[sort === "duration" ? "mean" : "total"];
                    const c = a.name.toLowerCase();
                    const d = b.name.toLowerCase();
                    if (x < y) {
                      return sort === "alphabetical" ? -1 : 1;
                    }
                    if (x > y) {
                      return sort === "alphabetical" ? 1 : -1;
                    }
                    if (c < d) {
                      return -1;
                    }
                    if (c > d) {
                      return 1;
                    }
                    return 0;
                  });
                }
              });
            }
            data.sort((a, b) => {
              if (a < b) {
                return -1;
              }
              if (a > b) {
                return 1;
              }
              return 0;
            });
            const labels = [...math.range(math.min(data), math.max(data), 1, true).toArray()] as number[];
            const count: number[] = [];
            labels.forEach((label) => {
              count.push(countInArray(data, label));
            });
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
              chartData: [labels, count],
            });
          });
        }
      });
    }
  });
  return durationData;
};

type VendorDataObject = {
  chartData: number[][];
  mean: number;
  median: number;
  mode: number[];
  name: string;
  range: string;
  standardDev: number;
  total: number;
};

type VendorData = Record<Properties, VendorDataObject[]>;

const createVendorsData = (sets: SetType[], sort: string) => {
  const vendorsData: VendorData = {
    profile: [],
    designer: [],
    vendor: [],
  };
  const pastSets = sets.filter((set) => {
    const endDate = utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
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
          const countArray = labels.map((_val, index) => countInArray(lengthArray, index));
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
            chartData: [labels, countArray],
          });
        }
      });

      vendorsData[prop].sort((a, b) => {
        const x = sort === "total" ? a.total : a.name.toLowerCase();
        const y = sort === "total" ? b.total : b.name.toLowerCase();
        if (x < y) {
          return sort === "total" ? 1 : -1;
        }
        if (x > y) {
          return sort === "total" ? -1 : 1;
        }
        return 0;
      });
    }
  });
  return vendorsData;
};

type CreateStatisticsData = {
  sets: SetType[];
  sort: StatisticsSortType;
};

const runtimeOpts: functions.RuntimeOptions = {
  timeoutSeconds: 540,
  memory: "2GB",
};

export const createStatistics = functions.runWith(runtimeOpts).https.onCall((data: CreateStatisticsData, context) => {
  const summaryData = createSummaryData(data.sets);
  const timelinesData = createTimelinesData(data.sets, data.sort.timelines);
  const statusData = createStatusData(data.sets, data.sort.status);
  const shippedData = createShippedData(data.sets, data.sort.shipped);
  const durationData = createDurationData(data.sets, data.sort.duration);
  const vendorsData = createVendorsData(data.sets, data.sort.vendors);
  return {
    summaryData: summaryData,
    timelinesData: timelinesData,
    statusData: statusData,
    shippedData: shippedData,
    durationData: durationData,
    vendorsData: vendorsData,
  };
});
