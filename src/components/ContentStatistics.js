import React from "react";
import ChartistGraph from "react-chartist";
import moment from "moment";
import { Card } from "@rmwc/card";
import { Typography } from "@rmwc/typography";
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

export class ContentStatistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      months: [],
    };
  }
  componentDidMount() {
    let months = [];
    this.props.sets.forEach((set) => {
      if (set.gbLaunch && set.gbLaunch.indexOf("Q") === -1) {
        const month = moment(set.gbLaunch).format("YYYY-MM");
        if (months.indexOf(month) === -1) {
          months.push(month);
        }
      }
    });
    months.sort(function (a, b) {
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
    const length = monthDiff(moment(months[0]), moment(months[months.length - 1])) + 1;
    let i;
    let allMonths = [];
    for (i = 0; i < length; i++) {
      allMonths.push(moment(months[0]).add(i, "M").format("YYYY-MM"));
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
    months = [];
    allMonths.forEach((month) => {
      months.push(moment(month).format("MMM YY"));
    });
    this.setState({
      months: months,
    });
  }
  componentDidUpdate(prevProps) {
    if (this.props.navOpen !== prevProps.navOpen) {
      setTimeout(() => {
        this.forceUpdate();
      }, 400);
    }
  }
  render() {
    function camelize(str) {
      return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, "");
    }
    let monthData = {};
    let countData = [];
    let profileCount = {};
    let profileCountData = [];
    this.props.profiles.forEach((profile) => {
      profileCount[camelize(profile)] = [];
    });
    this.state.months.forEach((month) => {
      let filteredSets = this.props.sets.filter((set) => {
        if (set.gbLaunch && set.gbLaunch.indexOf("Q") === -1) {
          const setMonth = moment(set.gbLaunch).format("MMM YY");
          return setMonth === month;
        } else {
          return false;
        }
      });
      monthData[month] = {};
      monthData[month].count = filteredSets.length;
      countData.push(filteredSets.length);
      this.props.profiles.forEach((profile) => {
        const profileSets = filteredSets.filter((set) => {
          return set.profile === profile;
        });
        profileCount[camelize(profile)].push(profileSets.length);
        monthData[month][camelize(profile)] = profileSets.length > 0 ? profileSets.length : "";
      });
    });

    this.props.profiles.forEach((profile) => {
      profileCountData.push(profileCount[camelize(profile)]);
    });
    const countChartData = {
      labels: this.state.months,
      series: [countData],
    };
    const countChartOptions = {
      low: 0,
      axisY: {
        onlyInteger: true,
      },
    };

    const profileChartData = {
      labels: this.state.months,
      series: profileCountData,
    };

    const profileChartOptions = {
      stackBars: true,
      low: 0,
      axisY: {
        onlyInteger: true,
      },
    };
    const letters = [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
    ];
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
            Based on the data included in KeycapLendar. Earlier data will be less representative, as not all sets are included. KeycapLendar began tracking GBs in June 2019, and began tracking ICs in December 2019.
          </Typography>
        </Card>
        <Card className="profile-graph">
          <Typography use="headline5" tag="h1">
            Profile Breakdown
          </Typography>
          <div className="graph-container">
            <ChartistGraph
              className="ct-double-octave"
              data={profileChartData}
              options={profileChartOptions}
              type={"Bar"}
            />
          </div>
        </Card>
        <Card className="fullwidth">
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
                      <DataTableHeadCell alignEnd key={profile} className={"profile-title title-" + letters[index]}>
                        <div className="profile-title">{profile}</div>
                      </DataTableHeadCell>
                    );
                  })}
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                {this.state.months.map((month) => {
                  return (
                    <DataTableRow key={month}>
                      <DataTableCell className="right-border">{month}</DataTableCell>
                      <DataTableCell className="right-border" alignEnd>
                        {monthData[month].count}
                      </DataTableCell>
                      {this.props.profiles.map((profile) => {
                        return (
                          <DataTableCell alignEnd key={profile}>
                            {monthData[month][camelize(profile)]}
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
