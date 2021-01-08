import React from "react";
import PropTypes from "prop-types";
import Chartist from "chartist";
import ChartistGraph from "react-chartist";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import chartistTooltip from "chartist-plugin-tooltips-updated";
import moment from "moment";
import { create, all } from "mathjs";
import classNames from "classnames";
import { camelise, countInArray, iconObject } from "../../util/functions";
import { setTypes, statisticsTypes, statisticsSortTypes } from "../../util/propTypeTemplates";
import { Card } from "@rmwc/card";
import { Typography } from "@rmwc/typography";
import { TimelineTable } from "../statistics/TimelineTable";
import { StatusCard, ShippedCard } from "../statistics/PieCard";
import { TableCard } from "../statistics/TableCard";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./ContentStatistics.scss";

const customPoint = (data) => {
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

const listener = { draw: (e) => customPoint(e) };

const math = create(all);

export class ContentStatistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
    };
  }
  createData = () => {
    const today = moment.utc();
    const yesterday = moment.utc().date(today.date() - 1);
    const limitedSets = this.props.sets.filter((set) => {
      if (set.gbLaunch && !set.gbLaunch.includes("Q")) {
        const year = parseInt(set.gbLaunch.slice(0, 4));
        const thisYear = moment().format("YYYY");
        return year >= thisYear - 2 && year <= thisYear + 1;
      } else {
        return true;
      }
    });

    //timeline
    let timelineData = {
      months: { icDate: [], gbLaunch: [] },
      monthData: { icDate: {}, gbLaunch: {} },
      countData: { icDate: [], gbLaunch: [] },
      profileCount: { icDate: {}, gbLaunch: {} },
      profileCountData: { icDate: [], gbLaunch: [] },
      profileChartType: "bar",
    };
    const { edited, ...timelineWhitelist } = this.props.statistics.timelineWhitelist;
    const checkVendors = (set) => {
      let bool = timelineWhitelist.vendorMode === "exclude";
      Object.keys(set.vendors).forEach((key) => {
        const vendor = set.vendors[key];
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
      return bool;
    };
    const timelineSets = limitedSets.filter((set) => {
      const shippedBool =
        (timelineWhitelist.shipped.includes("Shipped") && set.shipped) ||
        (timelineWhitelist.shipped.includes("Not shipped") && !set.shipped);
      if (set.vendors.length > 0) {
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
    properties.forEach((property) => {
      timelineSets.forEach((set) => {
        if (set[property] && !set[property].includes("Q")) {
          const month = moment(set[property]).format("YYYY-MM");
          if (!timelineData.months[property].includes(month)) {
            timelineData.months[property].push(month);
          }
        }
      });
      timelineData.months[property].sort(function (a, b) {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      });
      const monthDiff = (dateFrom, dateTo) => {
        return dateTo.month() - dateFrom.month() + 12 * (dateTo.year() - dateFrom.year());
      };
      const length =
        monthDiff(
          moment(timelineData.months[property][0]),
          moment(timelineData.months[property][timelineData.months[property].length - 1])
        ) + 1;
      let i;
      let allMonths = [];
      for (i = 0; i < length; i++) {
        allMonths.push(moment(timelineData.months[property][0]).add(i, "M").format("YYYY-MM"));
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
      timelineData.months[property] = [];
      allMonths.forEach((month) => {
        timelineData.months[property].push(moment(month).format("MMM YY"));
      });
      timelineWhitelist.profiles.forEach((profile) => {
        timelineData.profileCount[property][camelise(profile)] = [];
      });
      timelineData.months[property].forEach((month) => {
        let filteredSets = timelineSets.filter((set) => {
          if (set[property] && !set[property].includes("Q")) {
            const setMonth = moment(set[property]).format("MMM YY");
            return setMonth === month;
          } else {
            return false;
          }
        });
        timelineData.monthData[property][month] = {};
        timelineData.monthData[property][month].count = filteredSets.length;
        timelineData.countData[property].push(filteredSets.length);
        timelineWhitelist.profiles.forEach((profile) => {
          const profileSets = filteredSets.filter((set) => {
            return set.profile === profile;
          });
          timelineData.profileCount[property][camelise(profile)].push(profileSets.length);
          timelineData.monthData[property][month][camelise(profile)] = profileSets.length > 0 ? profileSets.length : "";
        });
      });
      timelineWhitelist.profiles.forEach((profile) => {
        timelineData.profileCountData[property].push(timelineData.profileCount[property][camelise(profile)]);
      });
    });
    //status
    let statusData = {
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
      set.vendors.forEach((vendor) => {
        if (!statusData.vendor.names.includes(vendor.name)) {
          statusData.vendor.names.push(vendor.name);
        }
      });
    });
    Object.keys(statusData).forEach((prop) => {
      statusData[prop].names.sort(function (a, b) {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
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
            return set.vendors.findIndex((vendor) => {
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
            return set.vendors.findIndex((vendor) => {
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
          const isLiveGb = startDate <= today && (endDate >= yesterday || !set.gbEnd);
          if (prop === "vendor") {
            return set.vendors.findIndex((vendor) => {
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
            return set.vendors.findIndex((vendor) => {
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
        var x = this.props.statisticsSort.status === "total" ? a.total : a.name.toLowerCase();
        var y = this.props.statisticsSort.status === "total" ? b.total : a.name.toLowerCase();
        if (x < y) {
          return this.props.statisticsSort.status === "total" ? 1 : -1;
        }
        if (x > y) {
          return this.props.statisticsSort.status === "total" ? -1 : 1;
        }
        return 0;
      });
    });
    //shipped
    let shippedData = {
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
      set.vendors.forEach((vendor) => {
        if (!shippedData.vendor.names.includes(vendor.name)) {
          shippedData.vendor.names.push(vendor.name);
        }
      });
    });
    Object.keys(shippedData).forEach((prop) => {
      shippedData[prop].names.sort(function (a, b) {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
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
            return set.vendors.findIndex((vendor) => {
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
            return set.vendors.findIndex((vendor) => {
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
        var x = this.props.statisticsSort.shipped === "total" ? a.total : a.name.toLowerCase();
        var y = this.props.statisticsSort.shipped === "total" ? b.total : a.name.toLowerCase();
        if (x < y) {
          return this.props.statisticsSort.shipped === "total" ? 1 : -1;
        }
        if (x > y) {
          return this.props.statisticsSort.shipped === "total" ? -1 : 1;
        }
        return 0;
      });
    });
    //duration
    let durationData = {
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
      let propSets = [];
      if (property === "gbLaunch") {
        propSets = dateSets.filter((set) => {
          return set.gbEnd.length === 10;
        });
      } else {
        propSets = dateSets;
      }
      propSets.forEach((set) => {
        if (!durationData[property].profile.names.includes(set.profile)) {
          durationData[property].profile.names.push(set.profile);
        }
        set.designer.forEach((designer) => {
          if (!durationData[property].designer.names.includes(designer)) {
            durationData[property].designer.names.push(designer);
          }
        });
        set.vendors.forEach((vendor) => {
          if (!durationData[property].vendor.names.includes(vendor.name)) {
            durationData[property].vendor.names.push(vendor.name);
          }
        });
      });

      Object.keys(durationData[property]).forEach((prop) => {
        durationData[property][prop].names.sort(function (a, b) {
          var x = a.toLowerCase();
          var y = b.toLowerCase();
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });

        durationData[property][prop].names = ["All"].concat(durationData[property][prop].names);
        durationData[property][prop].names.forEach((name) => {
          let data = [];
          if (name === "All") {
            propSets.forEach((set) => {
              const startDate = moment(set[property]);
              const endDate = moment(set[property === "gbLaunch" ? "gbEnd" : "gbLaunch"]);
              const length = endDate.diff(startDate, property === "icDate" ? "months" : "days");
              data.push(length);
            });
          } else {
            propSets
              .filter((set) => {
                let bool = false;
                if (prop === "vendor") {
                  bool =
                    set.vendors.findIndex((vendor) => {
                      return vendor.name === name;
                    }) !== -1
                      ? true
                      : false;
                } else if (prop === "designer") {
                  bool = set.designer.includes(name);
                } else {
                  bool = set[prop] === name;
                }
                return bool;
              })
              .forEach((set) => {
                const startDate = moment(set[property]);
                const endDate = moment(set[property === "gbLaunch" ? "gbEnd" : "gbLaunch"]);
                const length = endDate.diff(startDate, property === "icDate" ? "months" : "days");
                data.push(length);
              });
            Object.keys(durationData[property]).forEach((prop) => {
              durationData[property][prop].data.sort((a, b) => {
                if (a.name === "All" || b.name === "All") {
                  return a[0] === "all";
                }
                var x =
                  this.props.statisticsSort.duration === "alphabetical"
                    ? a.name.toLowerCase()
                    : a[this.props.statisticsSort.duration === "duration" ? "mean" : "total"];
                var y =
                  this.props.statisticsSort.duration === "alphabetical"
                    ? b.name.toLowerCase()
                    : b[this.props.statisticsSort.duration === "duration" ? "mean" : "total"];
                var c = a.name.toLowerCase();
                var d = b.name.toLowerCase();
                if (x < y) {
                  return this.props.statisticsSort.duration === "alphabetical" ? -1 : 1;
                }
                if (x > y) {
                  return this.props.statisticsSort.duration === "alphabetical" ? 1 : -1;
                }
                if (c < d) {
                  return -1;
                }
                if (c > d) {
                  return 1;
                }
                return 0;
              });
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
          let labels = math.range(math.min(data), math.max(data), 1, true).toArray();
          let count = [];
          labels.forEach((label) => {
            count.push(countInArray(data, label));
          });
          const range = math.max(data) - math.min(data);
          const rangeDisplay = `${math.min(data)} - ${math.max(data)} (${range})`;
          durationData[property][prop].data.push({
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
      });
    });
    //vendors
    let vendorsData = {
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
      set.vendors.forEach((vendor) => {
        if (!vendorsData.vendor.names.includes(vendor.name)) {
          vendorsData.vendor.names.push(vendor.name);
        }
      });
    });

    Object.keys(vendorsData).forEach((prop) => {
      vendorsData[prop].names.sort(function (a, b) {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
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
          propSets = vendorSets.filter((set) => set.vendors.map((vendor) => vendor.name).includes(name));
        } else {
          propSets = vendorSets.filter((set) => set[prop] === name);
        }
        const lengthArray = propSets.map((set) => set.vendors.length).sort();
        if (lengthArray.length > 0) {
          const labels = math.range(0, math.max(lengthArray), 1, true).toArray();
          const countArray = labels.map((val, index) => countInArray(lengthArray, index));
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
        var x = this.props.statisticsSort.vendors === "total" ? a.total : a.name.toLowerCase();
        var y = this.props.statisticsSort.vendors === "total" ? b.total : a.name.toLowerCase();
        if (x < y) {
          return this.props.statisticsSort.vendors === "total" ? 1 : -1;
        }
        if (x > y) {
          return this.props.statisticsSort.vendors === "total" ? -1 : 1;
        }
        return 0;
      });
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
  sortData = () => {
    const key = this.props.statisticsTab + "Data";
    let data = Object.assign({}, this.state[key]);
    if (this.props.statisticsTab === "duration") {
      Object.keys(data).forEach((property) => {
        Object.keys(data[property]).forEach((prop) => {
          data[property][prop].data.sort((a, b) => {
            if (a.name === "All" || b.name === "All") {
              return a.name === "all";
            }
            var x =
              this.props.statisticsSort[this.props.statisticsTab] === "alphabetical"
                ? a.name.toLowerCase()
                : a[this.props.statisticsSort[this.props.statisticsTab] === "duration" ? "mean" : "total"];
            var y =
              this.props.statisticsSort[this.props.statisticsTab] === "alphabetical"
                ? b.name.toLowerCase()
                : b[this.props.statisticsSort[this.props.statisticsTab] === "duration" ? "mean" : "total"];
            var c = a.name.toLowerCase();
            var d = b.name.toLowerCase();
            if (x < y) {
              return this.props.statisticsSort[this.props.statisticsTab] === "alphabetical" ? -1 : 1;
            }
            if (x > y) {
              return this.props.statisticsSort[this.props.statisticsTab] === "alphabetical" ? 1 : -1;
            }
            if (c < d) {
              return -1;
            }
            if (c > d) {
              return 1;
            }
            return 0;
          });
        });
      });
    } else {
      Object.keys(data).forEach((prop) => {
        data[prop].data.sort((a, b) => {
          var x = this.props.statisticsSort[this.props.statisticsTab] === "total" ? a.total : a.name.toLowerCase();
          var y = this.props.statisticsSort[this.props.statisticsTab] === "total" ? b.total : b.name.toLowerCase();
          var c = a.name.toLowerCase();
          var d = b.name.toLowerCase();
          if (x < y) {
            return this.props.statisticsSort[this.props.statisticsTab] === "total" ? 1 : -1;
          }
          if (x > y) {
            return this.props.statisticsSort[this.props.statisticsTab] === "total" ? -1 : 1;
          }
          if (c < d) {
            return -1;
          }
          if (c > d) {
            return 1;
          }
          return 0;
        });
      });
    }
    this.setState({
      [key]: data,
    });
  };
  setProfileChartType = (type) => {
    this.setState({ timelineData: { ...this.state.timelineData, profileChartType: type } });
  };
  setFocus = (letter) => {
    if (letter === this.state.focused) {
      this.setState({ focused: "" });
    } else {
      this.setState({ focused: letter });
    }
  };
  componentDidMount() {
    this.createData();
  }
  componentDidUpdate(prevProps) {
    if (this.props.navOpen !== prevProps.navOpen) {
      setTimeout(() => {
        this.forceUpdate();
      }, 400);
    }
    if (this.props.statistics.timelineWhitelist !== prevProps.statistics.timelineWhitelist && this.state.dataCreated) {
      this.createData();
    }
    if (this.props.statisticsSort !== prevProps.statisticsSort) {
      this.sortData();
    }
  }
  render() {
    const countChartData = {
      labels: this.state.timelineData.months[this.props.statistics.timeline],
      series: [this.state.timelineData.countData[this.props.statistics.timeline]],
    };
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

    const profileChartData = {
      labels: this.state.timelineData.months[this.props.statistics.timeline],
      series: this.state.timelineData.profileCountData[this.props.statistics.timeline].map((value, index) => ({
        meta: `${this.props.statistics.timelineWhitelist.profiles[index]}:&nbsp;`,
        value: value,
      })),
    };

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
            labelInterpolationFnc: (value, index) => {
              return index % 2 === 0 ? value : null;
            },
          },
        },
      ],
      [
        "(min-width: 840px) and (max-width: 959px)",
        {
          axisX: {
            labelInterpolationFnc: (value, index) => {
              return index % 3 === 0 ? value : null;
            },
          },
        },
      ],
      [
        "(max-width: 849px)",
        {
          axisX: {
            labelInterpolationFnc: (value, index) => {
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
    return (
      <div className={classNames("tab-container", this.props.statisticsTab)}>
        <div className="stats-tab timeline">
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
              Based on the data included in KeycapLendar. Earlier data will be less representative, as not all sets are
              included. KeycapLendar began tracking GBs in June 2019, and began tracking ICs in December 2019.
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
              profiles={this.props.statistics.timelineWhitelist.profiles}
              setFocus={this.setFocus}
              months={this.state.timelineData.months}
              statistics={this.props.statistics}
              monthData={this.state.timelineData.monthData}
            />
          </Card>
        </div>
        <div className="stats-tab stats-grid status">
          {this.state.statusData[this.props.statistics.status].data.map((data) => {
            return <StatusCard key={data.name} data={data} />;
          })}
        </div>
        <div className="stats-tab stats-grid shipped">
          {this.state.shippedData[this.props.statistics.shipped].data.map((data) => {
            return <ShippedCard key={data.name} data={data} />;
          })}
        </div>
        <div className="stats-tab stats-grid duration">
          {this.state.durationData[this.props.statistics.durationCat][this.props.statistics.durationGroup].data.map(
            (data) => {
              return (
                <TableCard
                  key={data.name}
                  data={data}
                  unit={`Time ${this.props.statistics.durationCat === "icDate" ? "(months)" : "(days)"}`}
                />
              );
            }
          )}
        </div>
        <div className="stats-tab stats-grid vendors">
          {this.state.vendorsData[this.props.statistics.vendors].data.map((data) => {
            return <TableCard key={data.name} data={data} unit="Vendors" />;
          })}
        </div>
      </div>
    );
  }
}

export default ContentStatistics;

ContentStatistics.propTypes = {
  allDesigners: PropTypes.arrayOf(PropTypes.string),
  allVendors: PropTypes.arrayOf(PropTypes.string),
  navOpen: PropTypes.bool,
  profiles: PropTypes.arrayOf(PropTypes.string),
  setStatisticsSort: PropTypes.func,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  statistics: PropTypes.shape(statisticsTypes),
  statisticsSort: PropTypes.shape(statisticsSortTypes),
  statisticsTab: PropTypes.string,
};
