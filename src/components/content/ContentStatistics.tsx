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
import { camelise, capitalise, countInArray, iconObject, openModal, closeModal, hasKey } from "../../util/functions";
import { QueueType, SetType, WhitelistType } from "../../util/types";
import { Card } from "@rmwc/card";
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
import { TimelineTable } from "../statistics/TimelineTable";
import { StatusCard, ShippedCard } from "../statistics/PieCard";
import { TableCard } from "../statistics/TableCard";
import { DrawerFilterStatistics } from "../statistics/DrawerFilterStatistics";
import { DialogStatistics } from "../statistics/DialogStatistics";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./ContentStatistics.scss";

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

type DataObject<T> = {
  names: string[];
  data: T;
};

type TimelineData = {
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

type StatusDataObject = {
  ic: number;
  liveGb: number;
  name: string;
  postGb: number;
  preGb: number;
  total: number;
};

type StatusData = Record<Properties, DataObject<StatusDataObject[]>>;

type ShippedDataObject = {
  name: string;
  shipped: number;
  total: number;
  unshipped: number;
};

type ShippedData = Record<Properties, DataObject<ShippedDataObject[]>>;

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

type DurationData = Record<Categories, Record<Properties, DataObject<DurationDataObject[]>>>;

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

type VendorData = Record<Properties, DataObject<VendorDataObject[]>>;

type ContentStatisticsState = {
  timelineData: TimelineData;
  statusData: StatusData;
  shippedData: ShippedData;
  durationData: DurationData;
  vendorsData: VendorData;
  focused: string;
  dataCreated: boolean;
  settings: {
    timeline: string;
    status: string;
    shipped: string;
    durationCat: string;
    durationGroup: string;
    vendors: string;
  };
  whitelist: WhitelistType;
  sort: {
    status: string;
    shipped: string;
    duration: string;
    vendors: string;
  };
  filterDrawerOpen: boolean;
  categoryDialogOpen: boolean;
};

export class ContentStatistics extends React.Component<ContentStatisticsProps, ContentStatisticsState> {
  state: ContentStatisticsState = {
    timelineData: {
      months: { icDate: [], gbLaunch: [] },
      monthData: { icDate: {}, gbLaunch: {} },
      countData: { icDate: [], gbLaunch: [] },
      profileCount: { icDate: {}, gbLaunch: {} },
      profileCountData: { icDate: [], gbLaunch: [] },
      profileChartType: "bar",
    },
    statusData: {
      profile: {
        names: [],
        data: [],
      },
      designer: {
        names: [],
        data: [],
      },
      vendor: {
        names: [],
        data: [],
      },
    },
    shippedData: {
      profile: {
        names: [],
        data: [],
      },
      designer: {
        names: [],
        data: [],
      },
      vendor: {
        names: [],
        data: [],
      },
    },
    durationData: {
      icDate: {
        profile: {
          names: [],
          data: [],
        },
        designer: {
          names: [],
          data: [],
        },
        vendor: {
          names: [],
          data: [],
        },
      },
      gbLaunch: {
        profile: {
          names: [],
          data: [],
        },
        designer: {
          names: [],
          data: [],
        },
        vendor: {
          names: [],
          data: [],
        },
      },
    },
    vendorsData: {
      profile: {
        names: [],
        data: [],
      },
      designer: {
        names: [],
        data: [],
      },
      vendor: {
        names: [],
        data: [],
      },
    },
    focused: "",
    dataCreated: false,
    settings: {
      timeline: "gbLaunch",
      status: "profile",
      shipped: "profile",
      durationCat: "gbLaunch",
      durationGroup: "profile",
      vendors: "profile",
    },
    whitelist: new Whitelist(),
    sort: {
      status: "alphabetical",
      shipped: "alphabetical",
      duration: "alphabetical",
      vendors: "alphabetical",
    },
    filterDrawerOpen: false,
    categoryDialogOpen: false,
  };
  createData = (whitelist = this.state.whitelist) => {
    const today = moment.utc();
    const yesterday = moment.utc().date(today.date() - 1);
    const limitedSets = this.props.sets.filter((set) => {
      if (set.gbLaunch && !set.gbLaunch.includes("Q")) {
        const year = parseInt(set.gbLaunch.slice(0, 4));
        const thisYear = moment().year();
        return year >= thisYear - 2 && year <= thisYear + 1;
      } else {
        return true;
      }
    });
    //timeline
    const timelineData: TimelineData = {
      months: { icDate: [], gbLaunch: [] },
      monthData: { icDate: {}, gbLaunch: {} },
      countData: { icDate: [], gbLaunch: [] },
      profileCount: { icDate: {}, gbLaunch: {} },
      profileCountData: { icDate: [], gbLaunch: [] },
      profileChartType: "bar",
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { edited, ...timelineWhitelist } = whitelist;
    const checkVendors = (set: SetType) => {
      let bool = timelineWhitelist.vendorMode === "exclude";
      const vendors = set.vendors;
      if (vendors) {
        vendors.forEach((vendor) => {
          if (timelineWhitelist.vendorMode === "exclude") {
            if (timelineWhitelist.vendors.includes(vendor.name)) {
              bool = false;
            }
          } else {
            if (timelineWhitelist.vendors.includes(vendor.name)) {
              bool = true;
            }
          }
        });
      }
      return bool;
    };
    const timelineSets = limitedSets.filter((set) => {
      const shippedBool =
        (timelineWhitelist.shipped.includes("Shipped") && set.shipped) ||
        (timelineWhitelist.shipped.includes("Not shipped") && !set.shipped);
      const vendors = set.vendors;
      if (vendors && vendors.length > 0) {
        return checkVendors(set) && timelineWhitelist.profiles.includes(set.profile) && shippedBool;
      } else {
        if (timelineWhitelist.vendors.length === 1 && timelineWhitelist.vendorMode === "include") {
          return false;
        } else {
          return timelineWhitelist.profiles.includes(set.profile) && shippedBool;
        }
      }
    });
    const properties = ["icDate", "gbLaunch"];
    properties.forEach((prop) => {
      timelineSets.forEach((set) => {
        if (hasKey(set, prop)) {
          const val = set[prop];
          if (val && typeof val === "string" && !val.includes("Q")) {
            const month = moment(val).format("YYYY-MM");
            if (hasKey(timelineData.months, prop) && !timelineData.months[prop].includes(month)) {
              timelineData.months[prop].push(month);
            }
          }
        }
      });
      if (hasKey(timelineData.months, prop)) {
        timelineData.months[prop].sort(function (a, b) {
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
        const monthDiff = (dateFrom: moment.Moment, dateTo: moment.Moment) => {
          return dateTo.month() - dateFrom.month() + 12 * (dateTo.year() - dateFrom.year());
        };
        const length = hasKey(timelineData.months, prop)
          ? monthDiff(
              moment(timelineData.months[prop][0]),
              moment(timelineData.months[prop][timelineData.months[prop].length - 1])
            ) + 1
          : 0;
        let i;
        const allMonths = [];
        for (i = 0; i < length; i++) {
          allMonths.push(moment(timelineData.months[prop][0]).add(i, "M").format("YYYY-MM"));
        }
        allMonths.sort(function (a, b) {
          if (a < b) {
            return -1;
          }
          if (a > b) {
            return 1;
          }
          return 0;
        });
        timelineData.months[prop] = [];
        allMonths.forEach((month) => {
          timelineData.months[prop].push(moment(month).format("MMM YY"));
        });
        timelineWhitelist.profiles.forEach((profile) => {
          timelineData.profileCount[prop][camelise(profile)] = [];
        });
        timelineData.months[prop].forEach((month) => {
          const filteredSets = timelineSets.filter((set) => {
            if (set[prop] && !set[prop].includes("Q")) {
              const setMonth = moment(set[prop]).format("MMM YY");
              return setMonth === month;
            } else {
              return false;
            }
          });
          timelineData.monthData[prop][month] = {};
          timelineData.monthData[prop][month].count = filteredSets.length;
          timelineData.countData[prop].push(filteredSets.length);
          timelineWhitelist.profiles.forEach((profile) => {
            const profileSets = filteredSets.filter((set) => {
              return set.profile === profile;
            });
            timelineData.profileCount[prop][camelise(profile)].push(profileSets.length);
            timelineData.monthData[prop][month][camelise(profile)] = profileSets.length > 0 ? profileSets.length : "";
          });
        });
        timelineWhitelist.profiles.forEach((profile) => {
          timelineData.profileCountData[prop].push(timelineData.profileCount[prop][camelise(profile)]);
        });
      }
    });
    //status
    const statusData: StatusData = {
      profile: {
        names: [],
        data: [],
      },
      designer: {
        names: [],
        data: [],
      },
      vendor: {
        names: [],
        data: [],
      },
    };
    limitedSets.forEach((set) => {
      if (!statusData.profile.names.includes(set.profile)) {
        statusData.profile.names.push(set.profile);
      }
      set.designer.forEach((designer) => {
        if (!statusData.designer.names.includes(designer)) {
          statusData.designer.names.push(designer);
        }
      });
      if (set.vendors) {
        set.vendors.forEach((vendor) => {
          if (!statusData.vendor.names.includes(vendor.name)) {
            statusData.vendor.names.push(vendor.name);
          }
        });
      }
    });
    Object.keys(statusData).forEach((prop) => {
      if (hasKey(statusData, prop)) {
        statusData[prop].names.sort(function (a, b) {
          const x = a.toLowerCase();
          const y = b.toLowerCase();
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });
        statusData[prop].names.forEach((name) => {
          const icSets = limitedSets.filter((set) => {
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
          const preGbSets = limitedSets.filter((set) => {
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
          const liveGbSets = limitedSets.filter((set) => {
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
          const postGbSets = limitedSets.filter((set) => {
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
          statusData[prop].data.push({
            name: name,
            ic: icSets.length,
            preGb: preGbSets.length,
            liveGb: liveGbSets.length,
            postGb: postGbSets.length,
            total: icSets.length + preGbSets.length + liveGbSets.length + postGbSets.length,
          });
        });
        statusData[prop].data.sort((a, b) => {
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
    //shipped
    const shippedData: ShippedData = {
      profile: {
        names: [],
        data: [],
      },
      designer: {
        names: [],
        data: [],
      },
      vendor: {
        names: [],
        data: [],
      },
    };
    const pastSets = limitedSets.filter((set) => {
      const endDate = moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
      return endDate <= yesterday;
    });
    pastSets.forEach((set) => {
      if (!shippedData.profile.names.includes(set.profile)) {
        shippedData.profile.names.push(set.profile);
      }
      set.designer.forEach((designer) => {
        if (!shippedData.designer.names.includes(designer)) {
          shippedData.designer.names.push(designer);
        }
      });
      if (set.vendors) {
        set.vendors.forEach((vendor) => {
          if (!shippedData.vendor.names.includes(vendor.name)) {
            shippedData.vendor.names.push(vendor.name);
          }
        });
      }
    });
    Object.keys(shippedData).forEach((prop) => {
      if (hasKey(shippedData, prop)) {
        shippedData[prop].names.sort(function (a, b) {
          const x = a.toLowerCase();
          const y = b.toLowerCase();
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });
        shippedData[prop].names.forEach((name) => {
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
          shippedData[prop].data.push({
            name: name,
            shipped: shippedSets.length,
            unshipped: unshippedSets.length,
            total: shippedSets.length + unshippedSets.length,
          });
        });
        shippedData[prop].data.sort((a, b) => {
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
    //duration
    const durationData: DurationData = {
      icDate: {
        profile: {
          names: [],
          data: [],
        },
        designer: {
          names: [],
          data: [],
        },
        vendor: {
          names: [],
          data: [],
        },
      },
      gbLaunch: {
        profile: {
          names: [],
          data: [],
        },
        designer: {
          names: [],
          data: [],
        },
        vendor: {
          names: [],
          data: [],
        },
      },
    };
    const dateSets = limitedSets.filter((set) => {
      return set.gbLaunch && set.gbLaunch.length === 10;
    });
    properties.forEach((property) => {
      const prop = property;
      let propSets: SetType[] = [];
      if (prop === "gbLaunch") {
        propSets = dateSets.filter((set) => {
          return set.gbEnd.length === 10;
        });
      } else {
        propSets = dateSets;
      }
      if (hasKey(durationData, prop)) {
        propSets.forEach((set) => {
          if (!durationData[prop].profile.names.includes(set.profile)) {
            durationData[prop].profile.names.push(set.profile);
          }
          set.designer.forEach((designer) => {
            if (!durationData[prop].designer.names.includes(designer)) {
              durationData[prop].designer.names.push(designer);
            }
          });
          if (set.vendors) {
            set.vendors.forEach((vendor) => {
              if (!durationData[prop].vendor.names.includes(vendor.name)) {
                durationData[prop].vendor.names.push(vendor.name);
              }
            });
          }
        });

        Object.keys(durationData[prop]).forEach((property) => {
          if (hasKey(durationData[prop], property)) {
            durationData[prop][property].names.sort(function (a, b) {
              const x = a.toLowerCase();
              const y = b.toLowerCase();
              if (x < y) {
                return -1;
              }
              if (x > y) {
                return 1;
              }
              return 0;
            });

            durationData[prop][property].names = ["All"].concat(durationData[prop][property].names);
            durationData[prop][property].names.forEach((name) => {
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
                    durationData[prop][key].data.sort((a, b) => {
                      if (a.name === "All" || b.name === "All") {
                        return a.name === "All" ? -1 : 1;
                      }
                      const x =
                        this.state.sort.duration === "alphabetical"
                          ? (a.name as string).toLowerCase()
                          : a[this.state.sort.duration === "duration" ? "mean" : "total"];
                      const y =
                        this.state.sort.duration === "alphabetical"
                          ? (b.name as string).toLowerCase()
                          : b[this.state.sort.duration === "duration" ? "mean" : "total"];
                      const c = (a.name as string).toLowerCase();
                      const d = (b.name as string).toLowerCase();
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
              durationData[prop][property].data.push({
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
    //vendors
    const vendorsData: VendorData = {
      profile: {
        names: [],
        data: [],
      },
      designer: {
        names: [],
        data: [],
      },
      vendor: {
        names: [],
        data: [],
      },
    };
    const vendorSets = pastSets.filter((set) => set.vendors);

    vendorSets.forEach((set) => {
      if (!vendorsData.profile.names.includes(set.profile)) {
        vendorsData.profile.names.push(set.profile);
      }
      set.designer.forEach((designer) => {
        if (!vendorsData.designer.names.includes(designer)) {
          vendorsData.designer.names.push(designer);
        }
      });
      if (set.vendors) {
        set.vendors.forEach((vendor) => {
          if (!vendorsData.vendor.names.includes(vendor.name)) {
            vendorsData.vendor.names.push(vendor.name);
          }
        });
      }
    });

    Object.keys(vendorsData).forEach((prop) => {
      if (hasKey(vendorsData, prop)) {
        vendorsData[prop].names.sort(function (a, b) {
          const x = a.toLowerCase();
          const y = b.toLowerCase();
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });
        vendorsData[prop].names = ["All"].concat(vendorsData[prop].names);
        vendorsData[prop].names.forEach((name) => {
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
            vendorsData[prop].data.push({
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

        vendorsData[prop].data.sort((a, b) => {
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

    //set state
    this.setState({
      timelineData: timelineData,
      statusData: statusData,
      shippedData: shippedData,
      durationData: durationData,
      vendorsData: vendorsData,
      dataCreated: true,
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
                  data[property][prop].data.sort((a, b) => {
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
        } else {
          const data = { ...stateData } as StatusData | ShippedData | VendorData;
          Object.keys(data).forEach((prop) => {
            if (hasKey(data, prop)) {
              const value = data[prop];
              type DataObj = StatusDataObject | ShippedDataObject | VendorDataObject;
              value.data.sort((a: DataObj, b: DataObj) => {
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
    this.setState({ timelineData: { ...this.state.timelineData, profileChartType: type } });
  };
  setFocus = (letter: string) => {
    if (letter === this.state.focused) {
      this.setState({ focused: "" });
    } else {
      this.setState({ focused: letter });
    }
  };
  setSetting = (prop: string, query: string) => {
    this.setState({ settings: { ...this.state.settings, [prop]: query } });
  };
  setSort = (prop: string, query: string) => {
    const sort = { ...this.state.sort, [prop]: query };
    this.setState({ sort: sort });
    this.sortData(sort);
  };
  setWhitelist = (prop: string, val: WhitelistType | WhitelistType[keyof WhitelistType]) => {
    if (prop === "all" && typeof val === "object") {
      const edited = Object.keys(val);
      const whitelist = { ...this.state.whitelist, ...val, edited: edited };
      this.setState({ whitelist: whitelist });
      this.createData(whitelist);
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
      this.createData(whitelist);
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
      !this.state.dataCreated &&
      this.props.sets.length > 0
    ) {
      this.setWhitelist("profiles", this.props.profiles);
    }
  }
  render() {
    const countChartData =
      hasKey(this.state.timelineData.months, this.state.settings.timeline) &&
      hasKey(this.state.timelineData.countData, this.state.settings.timeline)
        ? {
            labels: this.state.timelineData.months[this.state.settings.timeline],
            series: [this.state.timelineData.countData[this.state.settings.timeline]],
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
      hasKey(this.state.timelineData.months, this.state.settings.timeline) &&
      hasKey(this.state.timelineData.countData, this.state.settings.timeline)
        ? {
            labels: this.state.timelineData.months[this.state.settings.timeline],
            series: this.state.timelineData.profileCountData[this.state.settings.timeline].map((value, index) => ({
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
      this.state.timelineData.profileChartType === "bar" ? (
        <ChartistGraph
          className="ct-double-octave"
          data={profileChartData}
          options={profileChartOptions}
          responsiveOptions={responsiveOptions}
          type={"Bar"}
        />
      ) : null;
    const lineGraph =
      this.state.timelineData.profileChartType === "line" ? (
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
      this.props.statisticsTab === "timeline" ? (
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
        </ToggleGroup>
        {categoryButtons(this.props.statisticsTab)}
      </>
    );
    const buttons = {
      timeline: (
        <>
          <Tooltip enterDelay={500} content="Filter" align="bottom">
            <TopAppBarActionItem icon="filter_list" onClick={this.openFilterDrawer} />
          </Tooltip>
          <ToggleGroup>
            <ToggleGroupButton
              selected={this.state.settings.timeline === "icDate"}
              onClick={() => {
                this.setSetting("timeline", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={this.state.settings.timeline === "gbLaunch"}
              onClick={() => {
                this.setSetting("timeline", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
        </>
      ),
      status: genericButtons,
      shipped: genericButtons,
      duration: (
        <>
          <ToggleGroup>
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
      this.props.statisticsTab !== "timeline" && this.context !== "desktop" ? (
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
        timeline: (
          <div className="stats-tab timeline" key={key}>
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
                    selected={this.state.timelineData.profileChartType === "bar"}
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
                    selected={this.state.timelineData.profileChartType === "line"}
                    onClick={() => {
                      this.setProfileChartType("line");
                    }}
                  />
                </ToggleGroup>
              </div>
              <div
                className={classNames("graph-container", {
                  focused: this.state.focused,
                  ["series-" + this.state.focused]: this.state.focused,
                })}
              >
                {barGraph}
                {lineGraph}
              </div>
            </Card>
            <Card
              className={classNames("fullwidth", {
                focused: this.state.focused,
                ["series-" + this.state.focused]: this.state.focused,
              })}
            >
              <TimelineTable
                profiles={this.state.whitelist.profiles}
                setFocus={this.setFocus}
                months={this.state.timelineData.months}
                statistics={this.state.settings}
                monthData={this.state.timelineData.monthData}
              />
            </Card>
          </div>
        ),
        status: (
          <div className="stats-tab stats-grid status" key={key}>
            {hasKey(this.state.statusData, this.state.settings.status)
              ? this.state.statusData[this.state.settings.status].data.map((data) => {
                  return <StatusCard key={data.name} data={data} />;
                })
              : null}
          </div>
        ),
        shipped: (
          <div className="stats-tab stats-grid shipped" key={key}>
            {hasKey(this.state.shippedData, this.state.settings.shipped)
              ? this.state.shippedData[this.state.settings.shipped].data.map((data) => {
                  return <ShippedCard key={data.name} data={data} />;
                })
              : null}
          </div>
        ),
        duration: (
          <div className="stats-tab stats-grid duration" key={key}>
            {hasKey(this.state.durationData, this.state.settings.durationCat) &&
            hasKey(this.state.durationData[this.state.settings.durationCat], this.state.settings.durationGroup)
              ? this.state.durationData[this.state.settings.durationCat][this.state.settings.durationGroup].data.map(
                  (data) => {
                    return (
                      <TableCard
                        key={data.name}
                        data={data}
                        unit={`Time ${this.state.settings.durationCat === "icDate" ? "(months)" : "(days)"}`}
                      />
                    );
                  }
                )
              : null}
          </div>
        ),
        vendors: (
          <div className="stats-tab stats-grid vendors" key={key}>
            {hasKey(this.state.vendorsData, this.state.settings.vendors)
              ? this.state.vendorsData[this.state.settings.vendors].data.map((data) => {
                  return <TableCard key={data.name} data={data} unit="Vendors" />;
                })
              : null}
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
          <LinearProgress closed={this.state.dataCreated} />
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
