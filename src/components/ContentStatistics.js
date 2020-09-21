import React from "react";
import ChartistGraph from "react-chartist";
import moment from "moment";
import { Card } from "@rmwc/card";
import { Typography } from "@rmwc/typography";
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
    this.setState({
      months: months,
      monthData: monthData,
      countData: countData,
      profileCount: profileCount,
      profileCountData: profileCountData,
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
      labels: this.state.months[this.props.statistics],
      series: [this.state.countData[this.props.statistics]],
    };
    const countChartOptions = {
      low: 0,
      axisY: {
        onlyInteger: true,
      },
    };

    const profileChartData = {
      labels: this.state.months[this.props.statistics],
      series: this.state.profileCountData[this.props.statistics],
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
      <div className="stats-grid">
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
                      <DataTableHeadCell
                        alignEnd
                        key={profile}
                        className={"profile-title title-" + letters[index]}
                        onClick={() => {
                          this.setFocus(letters[index]);
                        }}
                      >
                        <div className="profile-title">{profile}</div>
                      </DataTableHeadCell>
                    );
                  })}
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                {this.state.months[this.props.statistics].map((month) => {
                  return (
                    <DataTableRow key={month}>
                      <DataTableCell className="right-border">{month}</DataTableCell>
                      <DataTableCell className="right-border" alignEnd>
                        {this.state.monthData[this.props.statistics][month].count}
                      </DataTableCell>
                      {this.props.profiles.map((profile, index) => {
                        return (
                          <DataTableCell alignEnd key={profile} className={"cell-" + letters[index]}>
                            {this.state.monthData[this.props.statistics][month][camelize(profile)]}
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
    );
  }
}

export default ContentStatistics;
