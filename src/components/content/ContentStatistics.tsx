import React from "react";
import Chartist from "chartist";
import ChartistGraph from "react-chartist";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import moment from "moment";
import { create, all, MathJsStatic } from "mathjs";
import classNames from "classnames";
import SwipeableViews from "react-swipeable-views";
import { virtualize } from "react-swipeable-views-utils";
import { statsTabs } from "../../util/constants";
import { DeviceContext } from "../../util/contexts";
import { Whitelist } from "../../util/constructors";
import {
  camelise,
  capitalise,
  countInArray,
  iconObject,
  openModal,
  closeModal,
  hasKey,
  getSetMonthRange,
  uniqueArray,
  alphabeticalSort,
  addOrRemove,
} from "../../util/functions";
import { QueueType, SetType, WhitelistType } from "../../util/types";
import { Card } from "@rmwc/card";
import { Chip, ChipSet } from "@rmwc/chip";
import { IconButton } from "@rmwc/icon-button";
import { LinearProgress } from "@rmwc/linear-progress";
import { TabBar, Tab } from "@rmwc/tabs";
import { Tooltip } from "@rmwc/tooltip";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
  TopAppBarActionItem,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { Footer } from "../common/Footer";
import { StatusCard } from "../statistics/PieCard";
import { TableCard } from "../statistics/TableCard";
import { ShippedCard, TimelinesCard } from "../statistics/TimelineCard";
import { DrawerFilterStatistics } from "../statistics/DrawerFilterStatistics";
import { DialogStatistics } from "../statistics/DialogStatistics";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./ContentStatistics.scss";

const letters = "abcdefghijklmnopqrstuvwxyz".split("");

const customPoint = (data: any) => {
  if (data.type === "point") {
    const circle = new Chartist.Svg(
      "circle",
      {
        cx: [data.x],
        cy: [data.y],
        r: [6],
        "ct:value": data.value.y,
        "ct:meta": data.meta,
      },
      "ct-stroked-point"
    );
    data.element.replace(circle);
  }
};

const listener = { draw: (e: any) => customPoint(e) };

const math = create(all) as MathJsStatic;

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

type ContentStatisticsProps = {
  allDesigners: string[];
  allVendors: string[];
  bottomNav: boolean;
  navOpen: boolean;
  openNav: () => void;
  profiles: string[];
  sets: SetType[];
  setStatisticsTab: (tab: string) => void;
  snackbarQueue: QueueType;
  statisticsTab: string;
};

type Categories = "icDate" | "gbLaunch";

type Properties = "profile" | "designer" | "vendor";

type Sorts = "total" | "alphabetical";

type SummaryData = {
  months: {
    gbLaunch: string[];
    icDate: string[];
  };
  monthData: {
    gbLaunch: { [key: string]: { [key: string]: string | number } };
    icDate: { [key: string]: { [key: string]: string | number } };
  };
  countData: Record<Categories, number[]>;
  profileCount: Record<Categories, { [key: string]: number[] }>;
  profileCountData: Record<Categories, number[][]>;
  profileChartType: string;
};

type TimelinesDataObject = {
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

type TimelinesData = Record<Categories, Record<Properties, { profiles: string[]; data: TimelinesDataObject[] }>>;

type StatusDataObject = {
  ic: number;
  liveGb: number;
  name: string;
  postGb: number;
  preGb: number;
  total: number;
};

type StatusData = Record<Properties, StatusDataObject[]>;

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

type ContentStatisticsState = {
  summaryData: SummaryData;
  timelinesData: TimelinesData;
  statusData: StatusData;
  shippedData: ShippedData;
  durationData: DurationData;
  vendorsData: VendorData;
  sets: SetType[];
  focused: string[];
  dataCreated: string[];
  settings: {
    summary: Categories;
    timelinesCat: Categories;
    timelinesGroup: Properties;
    status: Properties;
    shipped: Properties;
    durationCat: Categories;
    durationGroup: Properties;
    vendors: Properties;
  };
  whitelist: WhitelistType;
  sort: {
    timelines: Sorts;
    status: Sorts;
    shipped: Sorts;
    duration: Sorts | "duration";
    vendors: Sorts;
  };
  filterDrawerOpen: boolean;
  categoryDialogOpen: boolean;
};

const today = moment.utc();
const yesterday = moment.utc().date(today.date() - 1);
const properties = ["icDate", "gbLaunch"];

export class ContentStatistics extends React.Component<ContentStatisticsProps, ContentStatisticsState> {
  state: ContentStatisticsState = {
    summaryData: {
      months: { icDate: [], gbLaunch: [] },
      monthData: { icDate: {}, gbLaunch: {} },
      countData: { icDate: [], gbLaunch: [] },
      profileCount: { icDate: {}, gbLaunch: {} },
      profileCountData: { icDate: [], gbLaunch: [] },
      profileChartType: "bar",
    },
    timelinesData: {
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
    },
    statusData: {
      profile: [],
      designer: [],
      vendor: [],
    },
    shippedData: {
      profile: [],
      designer: [],
      vendor: [],
    },
    durationData: {
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
    },
    vendorsData: {
      profile: [],
      designer: [],
      vendor: [],
    },
    sets: [],
    focused: [],
    dataCreated: [],
    settings: {
      summary: "gbLaunch",
      timelinesCat: "gbLaunch",
      timelinesGroup: "profile",
      status: "profile",
      shipped: "profile",
      durationCat: "gbLaunch",
      durationGroup: "profile",
      vendors: "profile",
    },
    whitelist: new Whitelist(),
    sort: {
      timelines: "total",
      status: "total",
      shipped: "total",
      duration: "total",
      vendors: "total",
    },
    filterDrawerOpen: false,
    categoryDialogOpen: false,
  };

  createData = (whitelist = this.state.whitelist) => {
    const limitedSets = this.props.sets.filter((set) => {
      if (set.gbLaunch && !set.gbLaunch.includes("Q")) {
        const year = parseInt(set.gbLaunch.slice(0, 4));
        const thisYear = moment().year();
        return year >= thisYear - 2 && year <= thisYear + 1;
      } else {
        return true;
      }
    });
    this.setState({ sets: limitedSets });
    this.createSummaryData(limitedSets, whitelist);
    this.createTimelinesData(limitedSets);
    this.createStatusData(limitedSets);
    this.createShippedData(limitedSets);
    this.createDurationData(limitedSets);
    this.createVendorsData(limitedSets);
  };

  createSummaryData = (sets: SetType[], whitelist = this.state.whitelist) => {
    //summary
    const summaryData: SummaryData = {
      months: { icDate: [], gbLaunch: [] },
      monthData: { icDate: {}, gbLaunch: {} },
      countData: { icDate: [], gbLaunch: [] },
      profileCount: { icDate: {}, gbLaunch: {} },
      profileCountData: { icDate: [], gbLaunch: [] },
      profileChartType: "bar",
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { edited, ...summaryWhitelist } = whitelist;
    const checkVendors = (set: SetType) => {
      let bool = summaryWhitelist.vendorMode === "exclude";
      const vendors = set.vendors;
      if (vendors) {
        vendors.forEach((vendor) => {
          if (summaryWhitelist.vendorMode === "exclude") {
            if (summaryWhitelist.vendors.includes(vendor.name)) {
              bool = false;
            }
          } else {
            if (summaryWhitelist.vendors.includes(vendor.name)) {
              bool = true;
            }
          }
        });
      }
      return bool;
    };
    const timelineSets = sets.filter((set) => {
      const shippedBool =
        (summaryWhitelist.shipped.includes("Shipped") && set.shipped) ||
        (summaryWhitelist.shipped.includes("Not shipped") && !set.shipped);
      const vendors = set.vendors;
      if (vendors && vendors.length > 0) {
        return checkVendors(set) && summaryWhitelist.profiles.includes(set.profile) && shippedBool;
      } else {
        if (summaryWhitelist.vendors.length === 1 && summaryWhitelist.vendorMode === "include") {
          return false;
        } else {
          return summaryWhitelist.profiles.includes(set.profile) && shippedBool;
        }
      }
    });
    properties.forEach((prop) => {
      if (hasKey(summaryData.months, prop)) {
        summaryData.months[prop] = getSetMonthRange(timelineSets, prop, "MMM YY");
        summaryWhitelist.profiles.forEach((profile) => {
          summaryData.profileCount[prop][camelise(profile)] = [];
        });
        summaryData.months[prop].forEach((month) => {
          const filteredSets = timelineSets.filter((set) => {
            if (set[prop] && !set[prop].includes("Q")) {
              const setMonth = moment(set[prop]).format("MMM YY");
              return setMonth === month;
            } else {
              return false;
            }
          });
          summaryData.monthData[prop][month] = {};
          summaryData.monthData[prop][month].count = filteredSets.length;
          summaryData.countData[prop].push(filteredSets.length);
          summaryWhitelist.profiles.forEach((profile) => {
            const profileSets = filteredSets.filter((set) => {
              return set.profile === profile;
            });
            summaryData.profileCount[prop][camelise(profile)].push(profileSets.length);
            summaryData.monthData[prop][month][camelise(profile)] = profileSets.length > 0 ? profileSets.length : "";
          });
        });
        summaryData.profileCountData[prop] = summaryWhitelist.profiles.map(
          (profile) => summaryData.profileCount[prop][camelise(profile)]
        );
      }
    });
    this.setState((prevState) => {
      return {
        summaryData: summaryData,
        dataCreated: prevState.dataCreated.includes("summary")
          ? prevState.dataCreated
          : [...prevState.dataCreated, "summary"],
      };
    });
  };

  createTimelinesData = (sets: SetType[]) => {
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
            const data: TimelinesDataObject[] = [];
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
              const x = this.state.sort.timelines === "alphabetical" ? a.name.toLowerCase() : a.total;
              const y = this.state.sort.timelines === "alphabetical" ? b.name.toLowerCase() : b.total;
              const c = a.name.toLowerCase();
              const d = b.name.toLowerCase();
              if (x < y) {
                return this.state.sort.timelines === "alphabetical" ? -1 : 1;
              }
              if (x > y) {
                return this.state.sort.timelines === "alphabetical" ? 1 : -1;
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
    this.setState((prevState) => {
      return {
        timelinesData: timelinesData,
        dataCreated: prevState.dataCreated.includes("timelines")
          ? prevState.dataCreated
          : [...prevState.dataCreated, "timelines"],
      };
    });
  };

  createStatusData = (sets: SetType[]) => {
    //status
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
              startDate = moment.utc(set.gbLaunch);
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
              startDate = moment.utc(set.gbLaunch);
            }
            const endDate = moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
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
            const endDate = moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
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
          const x = this.state.sort.status === "total" ? a.total : (a.name as string).toLowerCase();
          const y = this.state.sort.status === "total" ? b.total : (b.name as string).toLowerCase();
          if (x < y) {
            return this.state.sort.status === "total" ? 1 : -1;
          }
          if (x > y) {
            return this.state.sort.status === "total" ? -1 : 1;
          }
          return 0;
        });
      }
    });
    this.setState((prevState) => {
      return {
        statusData: statusData,
        dataCreated: prevState.dataCreated.includes("status")
          ? prevState.dataCreated
          : [...prevState.dataCreated, "status"],
      };
    });
  };

  createShippedData = (sets: SetType[]) => {
    //shipped
    const shippedData: ShippedData = {
      profile: [],
      designer: [],
      vendor: [],
    };
    const pastSets = sets.filter((set) => {
      const endDate = moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
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
          const x = this.state.sort.shipped === "total" ? a.total : (a.name as string).toLowerCase();
          const y = this.state.sort.shipped === "total" ? b.total : (b.name as string).toLowerCase();
          if (x < y) {
            return this.state.sort.shipped === "total" ? 1 : -1;
          }
          if (x > y) {
            return this.state.sort.shipped === "total" ? -1 : 1;
          }
          return 0;
        });
      }
    });
    this.setState((prevState) => {
      return {
        shippedData: shippedData,
        dataCreated: prevState.dataCreated.includes("shipped")
          ? prevState.dataCreated
          : [...prevState.dataCreated, "shipped"],
      };
    });
  };

  createDurationData = (sets: SetType[]) => {
    //duration
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
    properties.forEach((prop) => {
      const propSets: SetType[] =
        prop === "gbLaunch"
          ? dateSets.filter((set) => {
              return set.gbEnd.length === 10;
            })
          : dateSets;
      if (hasKey(durationData, prop)) {
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

        Object.keys(durationData[prop]).forEach((property) => {
          if (hasKey(durationData[prop], property)) {
            lists[property] = ["All"].concat(lists[property]);
            lists[property].forEach((name) => {
              const data: number[] = [];
              if (name === "All") {
                propSets.forEach((set) => {
                  const startDate = moment(set[prop]);
                  const endDate = moment(set[prop === "gbLaunch" ? "gbEnd" : "gbLaunch"]);
                  const length = endDate.diff(startDate, prop === "icDate" ? "months" : "days");
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
                    const startDate = moment(set[prop]);
                    const endDate = moment(set[prop === "gbLaunch" ? "gbEnd" : "gbLaunch"]);
                    const length = endDate.diff(startDate, prop === "icDate" ? "months" : "days");
                    data.push(length);
                  });
                Object.keys(durationData[prop]).forEach((key) => {
                  if (hasKey(durationData[prop], key)) {
                    durationData[prop][key].sort((a, b) => {
                      if (a.name === "All" || b.name === "All") {
                        return a.name === "All" ? -1 : 1;
                      }
                      const x =
                        this.state.sort.duration === "alphabetical"
                          ? a.name.toLowerCase()
                          : a[this.state.sort.duration === "duration" ? "mean" : "total"];
                      const y =
                        this.state.sort.duration === "alphabetical"
                          ? b.name.toLowerCase()
                          : b[this.state.sort.duration === "duration" ? "mean" : "total"];
                      const c = a.name.toLowerCase();
                      const d = b.name.toLowerCase();
                      if (x < y) {
                        return this.state.sort.duration === "alphabetical" ? -1 : 1;
                      }
                      if (x > y) {
                        return this.state.sort.duration === "alphabetical" ? 1 : -1;
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
              data.sort(function (a, b) {
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
              durationData[prop][property].push({
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
    this.setState((prevState) => {
      return {
        durationData: durationData,
        dataCreated: prevState.dataCreated.includes("duration")
          ? prevState.dataCreated
          : [...prevState.dataCreated, "duration"],
      };
    });
  };

  createVendorsData = (sets: SetType[]) => {
    //vendors
    const vendorsData: VendorData = {
      profile: [],
      designer: [],
      vendor: [],
    };
    const pastSets = sets.filter((set) => {
      const endDate = moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
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
            propSets = vendorSets.filter(
              (set) => set.vendors && set.vendors.map((vendor) => vendor.name).includes(name)
            );
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
          const x = this.state.sort.vendors === "total" ? a.total : a.name.toLowerCase();
          const y = this.state.sort.vendors === "total" ? b.total : b.name.toLowerCase();
          if (x < y) {
            return this.state.sort.vendors === "total" ? 1 : -1;
          }
          if (x > y) {
            return this.state.sort.vendors === "total" ? -1 : 1;
          }
          return 0;
        });
      }
    });
    this.setState((prevState) => {
      return {
        vendorsData: vendorsData,
        dataCreated: prevState.dataCreated.includes("vendors")
          ? prevState.dataCreated
          : [...prevState.dataCreated, "vendors"],
      };
    });
  };

  sortData = (sort = this.state.sort) => {
    const key = this.props.statisticsTab + "Data";
    if (hasKey(this.state, key)) {
      const stateData = this.state[key];
      const tab = this.props.statisticsTab;
      if (typeof stateData === "object") {
        if (tab === "duration") {
          const data = { ...stateData } as DurationData;
          Object.keys(data).forEach((property) => {
            if (hasKey(data, property)) {
              Object.keys(data[property]).forEach((prop) => {
                if (hasKey(data[property], prop)) {
                  data[property][prop].sort((a, b) => {
                    if (a.name === "All" || b.name === "All") {
                      return a.name === "all" ? -1 : 1;
                    }
                    const x =
                      sort[tab] === "alphabetical"
                        ? a.name.toLowerCase()
                        : a[sort[tab] === "duration" ? "mean" : "total"];
                    const y =
                      sort[tab] === "alphabetical"
                        ? b.name.toLowerCase()
                        : b[sort[tab] === "duration" ? "mean" : "total"];
                    const c = a.name.toLowerCase();
                    const d = b.name.toLowerCase();
                    if (x < y) {
                      return sort[tab] === "alphabetical" ? -1 : 1;
                    }
                    if (x > y) {
                      return sort[tab] === "alphabetical" ? 1 : -1;
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
          });
          this.setState<never>({
            [key]: data,
          });
        } else if (tab === "timelines") {
          const data = { ...stateData } as TimelinesData;
          Object.keys(data).forEach((property) => {
            if (hasKey(data, property)) {
              Object.keys(data[property]).forEach((prop) => {
                if (hasKey(data[property], prop)) {
                  data[property][prop].data.sort((a, b) => {
                    const x = sort[tab] === "alphabetical" ? a.name.toLowerCase() : a.total;
                    const y = sort[tab] === "alphabetical" ? b.name.toLowerCase() : b.total;
                    const c = a.name.toLowerCase();
                    const d = b.name.toLowerCase();
                    if (x < y) {
                      return sort[tab] === "alphabetical" ? -1 : 1;
                    }
                    if (x > y) {
                      return sort[tab] === "alphabetical" ? 1 : -1;
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
          });
          this.setState<never>({
            [key]: data,
          });
        } else {
          const data = { ...stateData } as StatusData | ShippedData | VendorData;
          Object.keys(data).forEach((prop) => {
            if (hasKey(data, prop)) {
              const value = data[prop];
              type DataObj = StatusDataObject | ShippedDataObject | VendorDataObject;
              value.sort((a: DataObj, b: DataObj) => {
                if (hasKey(sort, tab)) {
                  const x = sort[tab] === "total" ? a.total : a.name.toLowerCase();
                  const y = sort[tab] === "total" ? b.total : b.name.toLowerCase();
                  const c = a.name.toLowerCase();
                  const d = b.name.toLowerCase();
                  if (x < y) {
                    return sort[tab] === "total" ? 1 : -1;
                  }
                  if (x > y) {
                    return sort[tab] === "total" ? -1 : 1;
                  }
                  if (c < d) {
                    return -1;
                  }
                  if (c > d) {
                    return 1;
                  }
                  return 0;
                } else {
                  return 0;
                }
              });
            }
          });
          this.setState<never>({
            [key]: data,
          });
        }
      }
    }
  };
  setProfileChartType = (type: string) => {
    this.setState({ summaryData: { ...this.state.summaryData, profileChartType: type } });
  };
  setFocus = (letter: string) => {
    this.setState((prevState) => {
      return { focused: addOrRemove(prevState.focused, letter) };
    });
  };
  clearFocus = () => {
    this.setState({ focused: [] });
  };
  setSetting = (prop: string, query: string) => {
    this.setState({ settings: { ...this.state.settings, [prop]: query } });
  };
  setSort = (prop: string, query: string) => {
    const sort = { ...this.state.sort, [prop]: query };
    this.setState({ sort: sort });
    this.sortData(sort);
  };
  setWhitelist = (prop: string, val: WhitelistType | WhitelistType[keyof WhitelistType], createAll = false) => {
    if (prop === "all" && typeof val === "object") {
      const edited = Object.keys(val);
      const whitelist = { ...this.state.whitelist, ...val, edited: edited };
      this.setState({ whitelist: whitelist });
      if (createAll) {
        this.createData(whitelist);
      } else {
        this.createSummaryData(this.state.sets, whitelist);
      }
    } else {
      const edited = this.state.whitelist.edited
        ? this.state.whitelist.edited.includes(prop)
          ? this.state.whitelist.edited
          : [...this.state.whitelist.edited, prop]
        : [prop];
      const whitelist = { ...this.state.whitelist, [prop]: val, edited: edited };
      this.setState({
        whitelist: whitelist,
      });
      if (createAll) {
        this.createData(whitelist);
      } else {
        this.createSummaryData(this.state.sets, whitelist);
      }
    }
  };
  openFilterDrawer = () => {
    openModal();
    this.setState({
      filterDrawerOpen: true,
    });
  };
  closeFilterDrawer = () => {
    closeModal();
    this.setState({
      filterDrawerOpen: false,
    });
  };
  openCategoryDialog = () => {
    this.setState({
      categoryDialogOpen: true,
    });
  };
  closeCategoryDialog = () => {
    this.setState({
      categoryDialogOpen: false,
    });
  };
  handleChangeIndex = (index: number) => {
    this.props.setStatisticsTab(statsTabs[index]);
  };
  componentDidUpdate(prevProps: ContentStatisticsProps) {
    if (this.props.navOpen !== prevProps.navOpen) {
      setTimeout(() => {
        this.forceUpdate();
      }, 400);
    }
    if (
      this.state.whitelist.edited &&
      !this.state.whitelist.edited.includes("profiles") &&
      this.props.profiles.length > 0 &&
      this.state.dataCreated.length !== statsTabs.length &&
      this.props.sets.length > 0
    ) {
      this.setWhitelist("profiles", this.props.profiles, true);
    }
  }
  render() {
    const countChartData =
      hasKey(this.state.summaryData.months, this.state.settings.summary) &&
      hasKey(this.state.summaryData.countData, this.state.settings.summary)
        ? {
            labels: this.state.summaryData.months[this.state.settings.summary],
            series: [this.state.summaryData.countData[this.state.settings.summary]],
          }
        : { labels: [], series: [] };
    const countChartOptions = {
      showArea: true,
      low: 0,
      axisY: {
        onlyInteger: true,
      },
      chartPadding: {
        top: 16,
        right: 0,
        bottom: 16,
        left: 16,
      },
      plugins: [
        chartistPluginAxisTitle({
          axisX: {
            axisTitle: "Month",
            axisClass: "ct-axis-title",
            offset: {
              x: 0,
              y: 40,
            },
            textAnchor: "middle",
          },
          axisY: {
            axisTitle: "Count",
            axisClass: "ct-axis-title",
            offset: {
              x: 0,
              y: 24,
            },
            flipTitle: true,
          },
        }),
        chartistTooltip({ pointClass: "ct-stroked-point" }),
      ],
    };

    const profileChartData =
      hasKey(this.state.summaryData.months, this.state.settings.summary) &&
      hasKey(this.state.summaryData.countData, this.state.settings.summary)
        ? {
            labels: this.state.summaryData.months[this.state.settings.summary],
            series: this.state.summaryData.profileCountData[this.state.settings.summary].map((value, index) => ({
              meta: `${this.state.whitelist.profiles[index]}:&nbsp;`,
              value: value,
            })),
          }
        : { labels: [], series: [] };

    const profileChartOptions = {
      showArea: true,
      stackBars: true,
      low: 0,
      axisY: {
        onlyInteger: true,
      },
      chartPadding: {
        top: 16,
        right: 0,
        bottom: 16,
        left: 16,
      },
      plugins: [
        chartistPluginAxisTitle({
          axisX: {
            axisTitle: "Month",
            axisClass: "ct-axis-title",
            offset: {
              x: 0,
              y: 40,
            },
            textAnchor: "middle",
          },
          axisY: {
            axisTitle: "Count",
            axisClass: "ct-axis-title",
            offset: {
              x: 0,
              y: 24,
            },
            flipTitle: true,
          },
        }),
        chartistTooltip({ metaIsHTML: true, pointClass: "ct-stroked-point" }),
      ],
    };

    const responsiveOptions = [
      [
        "(min-width: 960px) and (max-width: 1600px)",
        {
          axisX: {
            labelInterpolationFnc: (value: any, index: number) => {
              return index % 2 === 0 ? value : null;
            },
          },
        },
      ],
      [
        "(min-width: 840px) and (max-width: 959px)",
        {
          axisX: {
            labelInterpolationFnc: (value: any, index: number) => {
              return index % 3 === 0 ? value : null;
            },
          },
        },
      ],
      [
        "(max-width: 849px)",
        {
          axisX: {
            labelInterpolationFnc: (value: any, index: number) => {
              return index % 3 === 0 ? value : null;
            },
          },
        },
      ],
    ];
    const barGraph =
      this.state.summaryData.profileChartType === "bar" ? (
        <ChartistGraph
          className="ct-double-octave"
          data={profileChartData}
          options={profileChartOptions}
          responsiveOptions={responsiveOptions}
          type={"Bar"}
        />
      ) : null;
    const lineGraph =
      this.state.summaryData.profileChartType === "line" ? (
        <ChartistGraph
          className="ct-double-octave"
          data={profileChartData}
          options={profileChartOptions}
          listener={listener}
          responsiveOptions={responsiveOptions}
          type={"Line"}
        />
      ) : null;
    const filterDrawer =
      this.props.statisticsTab === "summary" ? (
        <DrawerFilterStatistics
          profiles={this.props.profiles}
          vendors={this.props.allVendors}
          open={this.state.filterDrawerOpen}
          close={this.closeFilterDrawer}
          setWhitelist={this.setWhitelist}
          whitelist={this.state.whitelist}
          snackbarQueue={this.props.snackbarQueue}
        />
      ) : null;
    const categoryButtons = (cat: string) => {
      return this.context === "desktop" ? (
        <ToggleGroup>
          <ToggleGroupButton
            selected={hasKey(this.state.settings, cat) && this.state.settings[cat] === "profile"}
            onClick={() => {
              this.setSetting(cat, "profile");
            }}
            label="Profile"
          />
          <ToggleGroupButton
            selected={hasKey(this.state.settings, cat) && this.state.settings[cat] === "designer"}
            onClick={() => {
              this.setSetting(cat, "designer");
            }}
            label="Designer"
          />
          <ToggleGroupButton
            selected={hasKey(this.state.settings, cat) && this.state.settings[cat] === "vendor"}
            onClick={() => {
              this.setSetting(cat, "vendor");
            }}
            label="Vendor"
          />
        </ToggleGroup>
      ) : (
        <Tooltip enterDelay={500} content="Category" align="top">
          <TopAppBarActionItem
            className="category-button"
            onClick={this.openCategoryDialog}
            style={{ "--animation-delay": 0 }}
            icon={iconObject(
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <circle cx="17.5" cy="17.5" opacity=".3" r="2.5" />
                  <path d="M5 15.5h4v4H5zm7-9.66L10.07 9h3.86z" opacity=".3" />
                  <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM11 13.5H3v8h8v-8zm-2 6H5v-4h4v4z" />
                </svg>
              </div>
            )}
          />
        </Tooltip>
      );
    };
    const genericButtons = (
      <>
        <ToggleGroup>
          <Tooltip enterDelay={500} align="bottom" content="Total">
            <ToggleGroupButton
              selected={
                hasKey(this.state.sort, this.props.statisticsTab) &&
                this.state.sort[this.props.statisticsTab] === "total"
              }
              onClick={() => {
                this.setSort(this.props.statisticsTab, "total");
              }}
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                </svg>
              )}
            />
          </Tooltip>
          <Tooltip enterDelay={500} align="bottom" content="Alphabetical">
            <ToggleGroupButton
              selected={
                hasKey(this.state.sort, this.props.statisticsTab) &&
                this.state.sort[this.props.statisticsTab] === "alphabetical"
              }
              onClick={() => {
                this.setSort(this.props.statisticsTab, "alphabetical");
              }}
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                </svg>
              )}
            />
          </Tooltip>
        </ToggleGroup>
        {categoryButtons(this.props.statisticsTab)}
      </>
    );
    const buttons = {
      summary: (
        <>
          <Tooltip enterDelay={500} content="Filter" align="bottom">
            <TopAppBarActionItem icon="filter_list" onClick={this.openFilterDrawer} />
          </Tooltip>
          <ToggleGroup>
            <ToggleGroupButton
              selected={this.state.settings.summary === "icDate"}
              onClick={() => {
                this.setSetting("summary", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={this.state.settings.summary === "gbLaunch"}
              onClick={() => {
                this.setSetting("summary", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
        </>
      ),
      timelines: (
        <>
          <ToggleGroup>
            <Tooltip enterDelay={500} align="bottom" content="Total">
              <ToggleGroupButton
                selected={this.state.sort.timelines === "total"}
                onClick={() => {
                  this.setSort("timelines", "total");
                }}
                icon={iconObject(
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                  </svg>
                )}
              />
            </Tooltip>
            <Tooltip enterDelay={500} align="bottom" content="Alphabetical">
              <ToggleGroupButton
                selected={this.state.sort.timelines === "alphabetical"}
                onClick={() => {
                  this.setSort("timelines", "alphabetical");
                }}
                icon={iconObject(
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                  </svg>
                )}
              />
            </Tooltip>
          </ToggleGroup>
          <ToggleGroup>
            <ToggleGroupButton
              selected={this.state.settings.timelinesCat === "icDate"}
              onClick={() => {
                this.setSetting("timelinesCat", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={this.state.settings.timelinesCat === "gbLaunch"}
              onClick={() => {
                this.setSetting("timelinesCat", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
          {categoryButtons("timelinesGroup")}
        </>
      ),
      status: genericButtons,
      shipped: genericButtons,
      duration: (
        <>
          <ToggleGroup>
            <Tooltip enterDelay={500} align="bottom" content="Total">
              <ToggleGroupButton
                selected={this.state.sort.duration === "total"}
                onClick={() => {
                  this.setSort("duration", "total");
                }}
                icon={iconObject(
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                  </svg>
                )}
              />
            </Tooltip>
            <Tooltip enterDelay={500} align="bottom" content="Alphabetical">
              <ToggleGroupButton
                selected={this.state.sort.duration === "alphabetical"}
                onClick={() => {
                  this.setSort("duration", "alphabetical");
                }}
                icon={iconObject(
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                  </svg>
                )}
              />
            </Tooltip>
            <Tooltip enterDelay={500} align="bottom" content="Duration">
              <ToggleGroupButton
                selected={this.state.sort.duration === "duration"}
                onClick={() => {
                  this.setSort("duration", "duration");
                }}
                icon={iconObject(
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M5 8h14V6H5z" opacity=".3" />
                    <path d="M7 11h2v2H7zm12-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-4 3h2v2h-2zm-4 0h2v2h-2z" />
                  </svg>
                )}
              />
            </Tooltip>
          </ToggleGroup>
          <ToggleGroup>
            <ToggleGroupButton
              selected={this.state.settings.durationCat === "icDate"}
              onClick={() => {
                this.setSetting("durationCat", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={this.state.settings.durationCat === "gbLaunch"}
              onClick={() => {
                this.setSetting("durationCat", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
          {categoryButtons("durationGroup")}
        </>
      ),
      vendors: genericButtons,
    };
    const categoryDialog =
      this.props.statisticsTab !== "summary" && this.context !== "desktop" ? (
        <DialogStatistics
          open={this.state.categoryDialogOpen}
          onClose={this.closeCategoryDialog}
          statistics={this.state.settings}
          setStatistics={this.setSetting}
          statisticsTab={this.props.statisticsTab}
        />
      ) : null;
    const tabRow = (
      <TopAppBarRow className="tab-row">
        <TopAppBarSection alignStart>
          <TabBar
            activeTabIndex={statsTabs.indexOf(this.props.statisticsTab)}
            onActivate={(e) => this.props.setStatisticsTab(statsTabs[e.detail.index])}
          >
            {statsTabs.map((tab) => (
              <Tab key={tab}>{capitalise(tab)}</Tab>
            ))}
          </TabBar>
        </TopAppBarSection>
      </TopAppBarRow>
    );
    const slideRenderer = (params: any) => {
      const { index, key } = params;
      const tab = statsTabs[index];
      const tabs = {
        summary: (
          <div className="stats-tab summary" key={key}>
            <Card className="count-graph">
              <Typography use="headline5" tag="h1">
                Sets per Month
              </Typography>
              <div className="graph-container">
                <ChartistGraph
                  className="ct-double-octave"
                  data={countChartData}
                  options={countChartOptions}
                  listener={listener}
                  responsiveOptions={responsiveOptions}
                  type={"Line"}
                />
              </div>
              <Typography use="caption" tag="p">
                Based on the data included in KeycapLendar. Earlier data will be less representative, as not all sets
                are included. KeycapLendar began tracking GBs in June 2019, and began tracking ICs in December 2019.
              </Typography>
            </Card>
            <Card className="profile-graph">
              <div className="title-container">
                <Typography use="headline5" tag="h1">
                  Profile Breakdown
                </Typography>
                <ToggleGroup>
                  <ToggleGroupButton
                    icon={iconObject(
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21M18,14H22V16H18V14M12,6H16V9H12V6M16,15H12V10H16V15M6,10H10V12H6V10M10,16H6V13H10V16Z" />
                      </svg>
                    )}
                    selected={this.state.summaryData.profileChartType === "bar"}
                    onClick={() => {
                      this.setProfileChartType("bar");
                    }}
                  />
                  <ToggleGroupButton
                    icon={iconObject(
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
                      </svg>
                    )}
                    selected={this.state.summaryData.profileChartType === "line"}
                    onClick={() => {
                      this.setProfileChartType("line");
                    }}
                  />
                </ToggleGroup>
              </div>
              <div
                className={classNames(
                  "graph-container",
                  {
                    focused: this.state.focused.length > 0,
                  },
                  this.state.focused.map((letter) => "series-" + letter)
                )}
              >
                {barGraph}
                {lineGraph}
              </div>
              <div className="chips-container focus-chips">
                <IconButton icon="clear" disabled={this.state.focused.length === 0} onClick={this.clearFocus} />
                <ChipSet choice>
                  {this.state.whitelist.profiles.map((profile, index) => (
                    <Chip
                      key={profile}
                      icon="fiber_manual_record"
                      label={profile}
                      selected={this.state.focused.includes(letters[index])}
                      onInteraction={() => {
                        this.setFocus(letters[index]);
                      }}
                      className={"focus-chip-" + letters[index]}
                    />
                  ))}
                </ChipSet>
              </div>
            </Card>
          </div>
        ),
        timelines: (
          <div className="stats-tab stats-grid timelines" key={key}>
            {this.state.timelinesData[this.state.settings.timelinesCat][this.state.settings.timelinesGroup].data.map(
              (data) => {
                return (
                  <TimelinesCard
                    key={data.name}
                    data={data}
                    profileGroups={this.state.settings.timelinesGroup === "profile"}
                    allProfiles={
                      this.state.timelinesData[this.state.settings.timelinesCat][this.state.settings.timelinesGroup]
                        .profiles
                    }
                  />
                );
              }
            )}
          </div>
        ),
        status: (
          <div className="stats-tab stats-grid status" key={key}>
            {this.state.statusData[this.state.settings.status].map((data) => {
              return <StatusCard key={data.name} data={data} />;
            })}
          </div>
        ),
        shipped: (
          <div className="stats-tab stats-grid shipped" key={key}>
            {this.state.shippedData[this.state.settings.shipped].map((data) => {
              return <ShippedCard key={data.name} data={data} />;
            })}
          </div>
        ),
        duration: (
          <div className="stats-tab stats-grid duration" key={key}>
            {this.state.durationData[this.state.settings.durationCat][this.state.settings.durationGroup].map((data) => {
              return (
                <TableCard
                  key={data.name}
                  data={data}
                  unit={`Time ${this.state.settings.durationCat === "icDate" ? "(months)" : "(days)"}`}
                />
              );
            })}
          </div>
        ),
        vendors: (
          <div className="stats-tab stats-grid vendors" key={key}>
            {this.state.vendorsData[this.state.settings.vendors].map((data) => {
              return <TableCard key={data.name} data={data} unit="Vendors" />;
            })}
          </div>
        ),
      };
      return hasKey(tabs, tab) && tabs[tab] ? tabs[tab] : <div key={key} />;
    };

    return (
      <>
        <TopAppBar fixed className={classNames({ "bottom-app-bar": this.props.bottomNav })}>
          {this.props.bottomNav ? tabRow : null}
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="menu" onClick={this.props.openNav} />
              <TopAppBarTitle>{this.context !== "mobile" ? "Statistics" : null}</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
              {hasKey(buttons, this.props.statisticsTab) ? buttons[this.props.statisticsTab] : null}
            </TopAppBarSection>
          </TopAppBarRow>
          {this.props.bottomNav ? null : tabRow}
          <LinearProgress closed={this.state.dataCreated.length === statsTabs.length} />
        </TopAppBar>
        {this.props.bottomNav ? null : <TopAppBarFixedAdjust />}
        <div className="main">
          {filterDrawer}
          {categoryDialog}
          <VirtualizeSwipeableViews
            className={this.props.statisticsTab}
            springConfig={{
              duration: "0.35s",
              easeFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              delay: "0s",
            }}
            slideCount={statsTabs.length}
            index={statsTabs.indexOf(this.props.statisticsTab)}
            onChangeIndex={this.handleChangeIndex}
            slideRenderer={slideRenderer}
          />
          <Footer />
        </div>
        {this.props.bottomNav ? <TopAppBarFixedAdjust /> : null}
      </>
    );
  }
}

export default ContentStatistics;

ContentStatistics.contextType = DeviceContext;
