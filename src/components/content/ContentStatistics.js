import React from "react";
import ChartistGraph from "react-chartist";
import chartistPluginAxisTitle from "chartist-plugin-axistitle";
import moment from "moment";
import { create, all } from "mathjs";
import { Card } from "@rmwc/card";
import { Typography } from "@rmwc/typography";
import { TimelineTable } from "../statistics/TimelineTable";
import { StatusCard, ShippedCard } from "../statistics/PieCard";
import { DurationCard } from "../statistics/DurationCard";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./ContentStatistics.scss";

function camelize(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}
function countInArray(arr, val) {
  return arr.reduce((count, item) => count + (item === val), 0);
}

const math = create(all);

export class ContentStatistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      months: { icDate: [], gbLaunch: [] },
      monthData: { icDate: {}, gbLaunch: {} },
      countData: { icDate: [], gbLaunch: [] },
      profileCount: { icDate: {}, gbLaunch: {} },
      profileCountData: { icDate: [], gbLaunch: [] },
      profileChartType: "bar",
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
      focused: "",
    };
  }
  createData = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    //timeline
    let months = { icDate: [], gbLaunch: [] };
    let monthData = { icDate: {}, gbLaunch: {} };
    let countData = { icDate: [], gbLaunch: [] };
    let profileCount = { icDate: {}, gbLaunch: {} };
    let profileCountData = { icDate: [], gbLaunch: [] };
    const properties = ["icDate", "gbLaunch"];
    properties.forEach((property) => {
      this.props.sets.forEach((set) => {
        if (set[property] && set[property].indexOf("Q") === -1) {
          const month = moment(set[property]).format("YYYY-MM");
          if (months[property].indexOf(month) === -1) {
            months[property].push(month);
          }
        }
      });
      months[property].sort(function (a, b) {
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
      const length = monthDiff(moment(months[property][0]), moment(months[property][months[property].length - 1])) + 1;
      let i;
      let allMonths = [];
      for (i = 0; i < length; i++) {
        allMonths.push(moment(months[property][0]).add(i, "M").format("YYYY-MM"));
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
      months[property] = [];
      allMonths.forEach((month) => {
        months[property].push(moment(month).format("MMM YY"));
      });
      this.props.profiles.forEach((profile) => {
        profileCount[property][camelize(profile)] = [];
      });
      months[property].forEach((month) => {
        let filteredSets = this.props.sets.filter((set) => {
          if (set[property] && set[property].indexOf("Q") === -1) {
            const setMonth = moment(set[property]).format("MMM YY");
            return setMonth === month;
          } else {
            return false;
          }
        });
        monthData[property][month] = {};
        monthData[property][month].count = filteredSets.length;
        countData[property].push(filteredSets.length);
        this.props.profiles.forEach((profile) => {
          const profileSets = filteredSets.filter((set) => {
            return set.profile === profile;
          });
          profileCount[property][camelize(profile)].push(profileSets.length);
          monthData[property][month][camelize(profile)] = profileSets.length > 0 ? profileSets.length : "";
        });
      });
      this.props.profiles.forEach((profile) => {
        profileCountData[property].push(profileCount[property][camelize(profile)]);
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
    this.props.sets.forEach((set) => {
      if (statusData.profile.names.indexOf(set.profile) === -1) {
        statusData.profile.names.push(set.profile);
      }
      set.designer.forEach((designer) => {
        if (statusData.designer.names.indexOf(designer) === -1) {
          statusData.designer.names.push(designer);
        }
      });
      set.vendors.forEach((vendor) => {
        if (statusData.vendor.names.indexOf(vendor.name) === -1) {
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
        const icSets = this.props.sets.filter((set) => {
          const startDate = set.gbLaunch.includes("Q") || set.gbLaunch === "" ? set.gbLaunch : new Date(set.gbLaunch);
          const isIC = !startDate || startDate === "" || set.gbLaunch.includes("Q");
          if (prop === "vendor") {
            return set.vendors.findIndex((vendor) => {
              return vendor.name === name && isIC;
            }) !== -1
              ? true
              : false;
          } else if (prop === "designer") {
            return set.designer.indexOf(name) !== -1 && isIC;
          } else {
            return set[prop] === name && isIC;
          }
        });
        const preGbSets = this.props.sets.filter((set) => {
          const startDate = new Date(set.gbLaunch);
          const isPreGb = startDate > today;
          if (prop === "vendor") {
            return set.vendors.findIndex((vendor) => {
              return vendor.name === name && isPreGb;
            }) !== -1
              ? true
              : false;
          } else if (prop === "designer") {
            return set.designer.indexOf(name) !== -1 && isPreGb;
          } else {
            return set[prop] === name && isPreGb;
          }
        });
        const liveGbSets = this.props.sets.filter((set) => {
          const startDate = new Date(set.gbLaunch);
          const endDate = new Date(set.gbEnd);
          const isLiveGb = startDate <= today && (endDate >= yesterday || set.gbEnd === "");
          if (prop === "vendor") {
            return set.vendors.findIndex((vendor) => {
              return vendor.name === name && isLiveGb;
            }) !== -1
              ? true
              : false;
          } else if (prop === "designer") {
            return set.designer.indexOf(name) !== -1 && isLiveGb;
          } else {
            return set[prop] === name && isLiveGb;
          }
        });
        const postGbSets = this.props.sets.filter((set) => {
          const endDate = new Date(set.gbEnd);
          endDate.setHours(23);
          endDate.setMinutes(59);
          endDate.setSeconds(59);
          endDate.setMilliseconds(999);
          const isPostGb = endDate <= yesterday;
          if (prop === "vendor") {
            return set.vendors.findIndex((vendor) => {
              return vendor.name === name && isPostGb;
            }) !== -1
              ? true
              : false;
          } else if (prop === "designer") {
            return set.designer.indexOf(name) !== -1 && isPostGb;
          } else {
            return set[prop] === name && isPostGb;
          }
        });
        statusData[prop].data.push([
          icSets.length,
          preGbSets.length,
          liveGbSets.length,
          postGbSets.length,
          icSets.length + preGbSets.length + liveGbSets.length + postGbSets.length,
          name,
        ]);
      });
      statusData[prop].data.sort((a, b) => {
        var x = this.props.statisticsSort.status === "total" ? a[4] : a[5].toLowerCase();
        var y = this.props.statisticsSort.status === "total" ? b[4] : a[5].toLowerCase();
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
    const pastSets = this.props.sets.filter((set) => {
      const endDate = new Date(set.gbEnd);
      endDate.setHours(23);
      endDate.setMinutes(59);
      endDate.setSeconds(59);
      endDate.setMilliseconds(999);
      return endDate <= yesterday;
    });
    pastSets.forEach((set) => {
      if (shippedData.profile.names.indexOf(set.profile) === -1) {
        shippedData.profile.names.push(set.profile);
      }
      set.designer.forEach((designer) => {
        if (shippedData.designer.names.indexOf(designer) === -1) {
          shippedData.designer.names.push(designer);
        }
      });
      set.vendors.forEach((vendor) => {
        if (shippedData.vendor.names.indexOf(vendor.name) === -1) {
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
            return set.designer.indexOf(name) !== -1 && set.shipped === true;
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
            return set.designer.indexOf(name) !== -1 && set.shipped !== true;
          } else {
            return set[prop] === name && set.shipped !== true;
          }
        });
        shippedData[prop].data.push([
          shippedSets.length,
          unshippedSets.length,
          shippedSets.length + unshippedSets.length,
          name,
        ]);
      });
      shippedData[prop].data.sort((a, b) => {
        var x = this.props.statisticsSort.shipped === "total" ? a[2] : a[3].toLowerCase();
        var y = this.props.statisticsSort.shipped === "total" ? b[2] : a[3].toLowerCase();
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
    const dateSets = this.props.sets.filter((set) => {
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
        if (durationData[property].profile.names.indexOf(set.profile) === -1) {
          durationData[property].profile.names.push(set.profile);
        }
        set.designer.forEach((designer) => {
          if (durationData[property].designer.names.indexOf(designer) === -1) {
            durationData[property].designer.names.push(designer);
          }
        });
        set.vendors.forEach((vendor) => {
          if (durationData[property].vendor.names.indexOf(vendor.name) === -1) {
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
                  bool = set.designer.indexOf(name) !== -1;
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
                if (length > 500) {
                  console.log(set.colorway, length);
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
          let labels = math.range(math.min(data), math.max(data), 1, true).toArray();
          let count = [];
          labels.forEach((label) => {
            count.push(countInArray(data, label));
          });
          const range = math.max(data) - math.min(data);
          const rangeDisplay = math.min(data) + "-" + math.max(data) + " (" + range + ")";
          durationData[property][prop].data.push([
            name,
            data.length,
            math.round(math.mean(data), 2),
            math.median(data),
            math.mode(data),
            rangeDisplay,
            math.round(math.std(data), 2),
            [labels, count],
          ]);
        });
      });
    });
    this.setState({
      months: months,
      monthData: monthData,
      countData: countData,
      profileCount: profileCount,
      profileCountData: profileCountData,
      statusData: statusData,
      shippedData: shippedData,
      durationData: durationData,
    });
  };
  sortData = () => {
    const key = this.props.statisticsTab + "Data";
    let data = Object.assign({}, this.state[key]);
    if (this.props.statisticsTab === "duration") {
      Object.keys(data).forEach((property) => {
        Object.keys(data[property]).forEach((prop) => {
          data[property][prop].data.sort((a, b) => {
            if (a[0] === "All" || b[0] === "All") {
              return a[0] === "all";
            }
            var x =
              this.props.statisticsSort[this.props.statisticsTab] === "alphabetical"
                ? a[0].toLowerCase()
                : a[this.props.statisticsSort[this.props.statisticsTab] === "duration" ? 2 : 1];
            var y =
              this.props.statisticsSort[this.props.statisticsTab] === "alphabetical"
                ? b[0].toLowerCase()
                : b[this.props.statisticsSort[this.props.statisticsTab] === "duration" ? 2 : 1];
            var c = a[0].toLowerCase();
            var d = b[0].toLowerCase();
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
          var x =
            this.props.statisticsSort[this.props.statisticsTab] === "total"
              ? a[this.props.statisticsTab === "status" ? 4 : 2]
              : a[this.props.statisticsTab === "status" ? 5 : 3].toLowerCase();
          var y =
            this.props.statisticsSort[this.props.statisticsTab] === "total"
              ? b[this.props.statisticsTab === "status" ? 4 : 2]
              : b[this.props.statisticsTab === "status" ? 5 : 3].toLowerCase();
          var c = a[this.props.statisticsTab === "status" ? 5 : 3].toLowerCase();
          var d = b[this.props.statisticsTab === "status" ? 5 : 3].toLowerCase();
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
    this.setState({ profileChartType: type });
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
    if (this.props.statisticsSort !== prevProps.statisticsSort) {
      this.sortData();
    }
  }
  render() {
    const countChartData = {
      labels: this.state.months[this.props.statistics.timeline],
      series: [this.state.countData[this.props.statistics.timeline]],
    };
    const countChartOptions = {
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
              y: 32,
            },
            textAnchor: "middle",
          },
          axisY: {
            axisTitle: "Count",
            axisClass: "ct-axis-title",
            offset: {
              x: 0,
              y: 16,
            },
            flipTitle: true,
          },
        }),
      ],
    };

    const profileChartData = {
      labels: this.state.months[this.props.statistics.timeline],
      series: this.state.profileCountData[this.props.statistics.timeline],
    };

    const profileChartOptions = {
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
              y: 32,
            },
            textAnchor: "middle",
          },
          axisY: {
            axisTitle: "Count",
            axisClass: "ct-axis-title",
            offset: {
              x: 0,
              y: 16,
            },
            flipTitle: true,
          },
        }),
      ],
    };
    const barGraph =
      this.state.profileChartType === "bar" ? (
        <ChartistGraph
          className="ct-double-octave"
          data={profileChartData}
          options={profileChartOptions}
          type={"Bar"}
        />
      ) : null;
    const lineGraph =
      this.state.profileChartType === "line" ? (
        <ChartistGraph
          className="ct-double-octave"
          data={profileChartData}
          options={profileChartOptions}
          type={"Line"}
        />
      ) : null;
    return (
      <div className={"tab-container " + this.props.statisticsTab}>
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
                  icon={{
                    strategy: "component",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21M18,14H22V16H18V14M12,6H16V9H12V6M16,15H12V10H16V15M6,10H10V12H6V10M10,16H6V13H10V16Z" />
                      </svg>
                    ),
                  }}
                  selected={this.state.profileChartType === "bar"}
                  onClick={() => {
                    this.setProfileChartType("bar");
                  }}
                />
                <ToggleGroupButton
                  icon={{
                    strategy: "component",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
                      </svg>
                    ),
                  }}
                  selected={this.state.profileChartType === "line"}
                  onClick={() => {
                    this.setProfileChartType("line");
                  }}
                />
              </ToggleGroup>
            </div>
            <div
              className={"graph-container" + (this.state.focused === "" ? "" : " focused series-" + this.state.focused)}
            >
              {barGraph}
              {lineGraph}
            </div>
          </Card>
          <Card className={"fullwidth" + (this.state.focused === "" ? "" : " focused series-" + this.state.focused)}>
            <TimelineTable
              profiles={this.props.profiles}
              setFocus={this.setFocus}
              months={this.state.months}
              statistics={this.props.statistics}
              monthData={this.state.monthData}
            />
          </Card>
        </div>
        <div className="stats-tab stats-grid status">
          {this.state.statusData[this.props.statistics.status].data.map((data, index) => {
            return <StatusCard key={index} data={data} />;
          })}
        </div>
        <div className="stats-tab stats-grid shipped">
          {this.state.shippedData[this.props.statistics.shipped].data.map((data, index) => {
            return <ShippedCard key={index} data={data} />;
          })}
        </div>
        <div className="stats-tab stats-grid duration">
          {this.state.durationData[this.props.statistics.durationCat][this.props.statistics.durationGroup].data.map(
            (data, index) => {
              return <DurationCard key={index} data={data} durationCat={this.props.statistics.durationCat} />;
            }
          )}
        </div>
      </div>
    );
  }
}

export default ContentStatistics;
