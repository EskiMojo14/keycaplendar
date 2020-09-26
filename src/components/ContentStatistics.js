import React from "react";
import ChartistGraph from "react-chartist";
import moment from "moment";
import { Card } from "@rmwc/card";
import { Typography } from "@rmwc/typography";
import { Ripple } from "@rmwc/ripple";
import { Button } from "@rmwc/button";
import {
  DataTable,
  DataTableContent,
  DataTableHead,
  DataTableRow,
  DataTableHeadCell,
  DataTableBody,
  DataTableCell,
} from "@rmwc/data-table";
import "./ContentStatistics.scss";

function camelize(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

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
      focused: "",
    };
  }
  createData = () => {
    const properties = ["icDate", "gbLaunch"];
    let months = { icDate: [], gbLaunch: [] };
    let monthData = { icDate: {}, gbLaunch: {} };
    let countData = { icDate: [], gbLaunch: [] };
    let profileCount = { icDate: {}, gbLaunch: {} };
    let profileCountData = { icDate: [], gbLaunch: [] };
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
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
    //timeline
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
            return set.designer.indexOf(name) !== -1 && isIC ? true : false;
          } else {
            return set[prop] === name && isIC ? true : false;
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
            return set.designer.indexOf(name) !== -1 && isPreGb ? true : false;
          } else {
            return set[prop] === name && isPreGb ? true : false;
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
            return set.designer.indexOf(name) !== -1 && isLiveGb ? true : false;
          } else {
            return set[prop] === name && isLiveGb ? true : false;
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
            return set.designer.indexOf(name) !== -1 && isPostGb ? true : false;
          } else {
            return set[prop] === name && isPostGb ? true : false;
          }
        });
        statusData[prop].data.push([
          icSets.length,
          preGbSets.length,
          liveGbSets.length,
          postGbSets.length,
          icSets.length + preGbSets.length + liveGbSets.length + postGbSets.length,
        ]);
      });
    });
    //shipped
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
            return set.designer.indexOf(name) !== -1 && set.shipped === true ? true : false;
          } else {
            return set[prop] === name && set.shipped === true ? true : false;
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
            return set.designer.indexOf(name) !== -1 && set.shipped !== true ? true : false;
          } else {
            return set[prop] === name && set.shipped !== true ? true : false;
          }
        });
        shippedData[prop].data.push([
          shippedSets.length,
          unshippedSets.length,
          shippedSets.length + unshippedSets.length,
        ]);
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
    };
    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
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
              <div className="toggle-group">
                <Button
                  outlined
                  icon={{
                    strategy: "component",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M22,21H2V3H4V19H6V17H10V19H12V16H16V19H18V17H22V21M18,14H22V16H18V14M12,6H16V9H12V6M16,15H12V10H16V15M6,10H10V12H6V10M10,16H6V13H10V16Z" />
                      </svg>
                    ),
                  }}
                  className={this.state.profileChartType === "bar" ? "mdc-button--selected" : ""}
                  onClick={() => {
                    this.setProfileChartType("bar");
                  }}
                />
                <Button
                  outlined
                  icon={{
                    strategy: "component",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z" />
                      </svg>
                    ),
                  }}
                  className={this.state.profileChartType === "line" ? "mdc-button--selected" : ""}
                  onClick={() => {
                    this.setProfileChartType("line");
                  }}
                />
              </div>
            </div>
            <div
              className={"graph-container" + (this.state.focused === "" ? "" : " focused series-" + this.state.focused)}
            >
              {barGraph}
              {lineGraph}
            </div>
          </Card>
          <Card className={"fullwidth" + (this.state.focused === "" ? "" : " focused series-" + this.state.focused)}>
            <DataTable>
              <DataTableContent>
                <DataTableHead>
                  <DataTableRow>
                    <DataTableHeadCell className="right-border">Month</DataTableHeadCell>
                    <DataTableHeadCell className="right-border" alignEnd>
                      Sets
                    </DataTableHeadCell>
                    {this.props.profiles.map((profile, index) => {
                      return (
                        <Ripple key={profile}>
                          <DataTableHeadCell
                            alignEnd
                            className={"profile-title title-" + letters[index]}
                            onClick={() => {
                              this.setFocus(letters[index]);
                            }}
                          >
                            {profile}
                            <div className="profile-indicator"></div>
                          </DataTableHeadCell>
                        </Ripple>
                      );
                    })}
                  </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                  {this.state.months[this.props.statistics.timeline].map((month) => {
                    return (
                      <DataTableRow key={month}>
                        <DataTableCell className="right-border">{month}</DataTableCell>
                        <DataTableCell className="right-border" alignEnd>
                          {this.state.monthData[this.props.statistics.timeline][month].count}
                        </DataTableCell>
                        {this.props.profiles.map((profile, index) => {
                          return (
                            <DataTableCell alignEnd key={profile} className={"cell-" + letters[index]}>
                              {this.state.monthData[this.props.statistics.timeline][month][camelize(profile)]}
                            </DataTableCell>
                          );
                        })}
                      </DataTableRow>
                    );
                  })}
                </DataTableBody>
              </DataTableContent>
            </DataTable>
          </Card>
        </div>
        <div className="stats-tab stats-grid status">
          {this.state.statusData[this.props.statistics.status].names.map((name, index) => {
            return (
              <Card key={index} className="pie-card">
                <Typography use="headline5" tag="h1">
                  {name}
                </Typography>
                <div className="pie-container">
                  <div className="table-container">
                    <DataTable>
                      <DataTableContent>
                        <DataTableHead>
                          <DataTableRow>
                            <DataTableHeadCell>Status</DataTableHeadCell>
                            <DataTableHeadCell alignEnd>Sets</DataTableHeadCell>
                          </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                          <DataTableRow>
                            <DataTableCell>
                              <div className="indicator ic"></div>IC
                            </DataTableCell>
                            <DataTableCell alignEnd>
                              {this.state.statusData[this.props.statistics.status].data[index][0]}
                            </DataTableCell>
                          </DataTableRow>
                          <DataTableRow>
                            <DataTableCell>
                              <div className="indicator pre-gb"></div>Pre GB
                            </DataTableCell>
                            <DataTableCell alignEnd>
                              {this.state.statusData[this.props.statistics.status].data[index][1]}
                            </DataTableCell>
                          </DataTableRow>
                          <DataTableRow>
                            <DataTableCell>
                              <div className="indicator live-gb"></div>Live GB
                            </DataTableCell>
                            <DataTableCell alignEnd>
                              {this.state.statusData[this.props.statistics.status].data[index][2]}
                            </DataTableCell>
                          </DataTableRow>
                          <DataTableRow>
                            <DataTableCell>
                              <div className="indicator post-gb"></div>Post GB
                            </DataTableCell>
                            <DataTableCell alignEnd>
                              {this.state.statusData[this.props.statistics.status].data[index][3]}
                            </DataTableCell>
                          </DataTableRow>
                          <DataTableRow>
                            <DataTableCell className="bold">Total</DataTableCell>
                            <DataTableCell alignEnd>
                              {this.state.statusData[this.props.statistics.status].data[index][4]}
                            </DataTableCell>
                          </DataTableRow>
                        </DataTableBody>
                      </DataTableContent>
                    </DataTable>
                  </div>
                  <div className="pie-chart-container status">
                    <ChartistGraph
                      className="ct-octave"
                      data={{
                        series: [
                          this.state.statusData[this.props.statistics.status].data[index][0],
                          this.state.statusData[this.props.statistics.status].data[index][1],
                          this.state.statusData[this.props.statistics.status].data[index][2],
                          this.state.statusData[this.props.statistics.status].data[index][3],
                        ],
                        labels: [" ", " ", " ", " "],
                      }}
                      type={"Pie"}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <div className="stats-tab stats-grid shipped">
          {this.state.shippedData[this.props.statistics.shipped].names.map((name, index) => {
            return (
              <Card key={index} className="pie-card">
                <Typography use="headline5" tag="h1">
                  {name}
                </Typography>
                <div className="pie-container">
                  <div className="table-container">
                    <DataTable>
                      <DataTableContent>
                        <DataTableHead>
                          <DataTableRow>
                            <DataTableHeadCell>Status</DataTableHeadCell>
                            <DataTableHeadCell alignEnd>Sets</DataTableHeadCell>
                          </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                          <DataTableRow>
                            <DataTableCell>
                              <div className="indicator shipped"></div>Shipped
                            </DataTableCell>
                            <DataTableCell alignEnd>
                              {this.state.shippedData[this.props.statistics.shipped].data[index][0]}
                            </DataTableCell>
                          </DataTableRow>
                          <DataTableRow>
                            <DataTableCell>
                              <div className="indicator not-shipped"></div>Not shipped
                            </DataTableCell>
                            <DataTableCell alignEnd>
                              {this.state.shippedData[this.props.statistics.shipped].data[index][1]}
                            </DataTableCell>
                          </DataTableRow>
                          <DataTableRow>
                            <DataTableCell className="bold">Total</DataTableCell>
                            <DataTableCell alignEnd>
                              {this.state.shippedData[this.props.statistics.shipped].data[index][2]}
                            </DataTableCell>
                          </DataTableRow>
                        </DataTableBody>
                      </DataTableContent>
                    </DataTable>
                  </div>
                  <div className="pie-chart-container shipped">
                    <ChartistGraph
                      className="ct-octave"
                      data={{
                        series: [
                          this.state.shippedData[this.props.statistics.shipped].data[index][1],
                          this.state.shippedData[this.props.statistics.shipped].data[index][0],
                        ],
                        labels: [" ", " "],
                      }}
                      type={"Pie"}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ContentStatistics;
