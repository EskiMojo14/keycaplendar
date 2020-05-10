import React from 'react';
//import Chartist from 'chartist';
import ChartistGraph from 'react-chartist';
import { Card } from '@rmwc/card';
import { Typography } from '@rmwc/typography';
import { DataTable, DataTableContent, DataTableHead, DataTableRow, DataTableHeadCell, DataTableBody, DataTableCell } from '@rmwc/data-table';
import './ContentStatistics.scss';

export class ContentStatistics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            months: []
        };
    }
    componentDidMount() {
        const monthName = (this.props.desktop ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] : ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]);
        let months = [];
        this.props.sets.forEach((set) => {
            if (set.gbLaunch && set.gbLaunch.indexOf('Q') === -1) {
                const launchDate = new Date(set.gbLaunch);
                const month = monthName[launchDate.getUTCMonth()] + ' ' + launchDate.getUTCFullYear();
                if (months.indexOf(month) === -1) {
                    months.push(month);
                };
            }
        })
        months.sort(function (a, b) {
            const aDate = new Date(`${a.slice(-4)}-${monthName.indexOf(a.slice(0, -5)) + 1}-01`);
            const bDate = new Date(`${b.slice(-4)}-${monthName.indexOf(b.slice(0, -5)) + 1}-01`);
            if (aDate < bDate) { return -1; }
            if (aDate > bDate) { return 1; }
            return 0;
        });
        this.setState({
            months: months
        });
    }
    componentDidUpdate(prevProps) {
        if (this.props.navOpen !== prevProps.navOpen) {
            setTimeout(() => {this.forceUpdate(); console.log('test')}, 400);
        }
    }
    render() {
        function camelize(str) {
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
              return index === 0 ? word.toLowerCase() : word.toUpperCase();
            }).replace(/\s+/g, '');
        }
        let monthData = {};
        const monthName = (this.props.desktop ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] : ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]);
        let countData = [];
        let shortMonths = [];
        let profileCount = {};
        let profileCountData = [];
        this.props.profiles.forEach((profile) => {
            profileCount[camelize(profile)] = [];
        });

        this.state.months.forEach((month) => {
            const monthSlice = month.slice(0, -4);
            const year = month.slice(-2);
            shortMonths.push(monthSlice + year);
            let filteredSets = this.props.sets.filter((set) => {
                if (set.gbLaunch && set.gbLaunch.indexOf('Q') === -1) {
                    const launchDate = new Date(set.gbLaunch);
                    const setMonth = monthName[launchDate.getUTCMonth()] + ' ' + launchDate.getUTCFullYear();
                    return setMonth === month;
                } else {
                    return false;
                }
            });
            monthData[camelize(month)] = {};
            monthData[camelize(month)].count = filteredSets.length;
            countData.push(filteredSets.length);
            this.props.profiles.forEach((profile) => {
                const profileSets = filteredSets.filter((set) => {
                    return set.profile === profile;
                });
                profileCount[camelize(profile)].push(profileSets.length);
                monthData[camelize(month)][camelize(profile)] = ( profileSets.length > 0 ? profileSets.length : '' );
            });
        })

        this.props.profiles.forEach((profile) => {
            profileCountData.push(profileCount[camelize(profile)]);
        });

        const countChartData = {
            labels: shortMonths,
            series: [
                countData
            ]
        }
        const countChartOptions = {
            low: 0,
            axisY: {
                onlyInteger: true
            }
        }

        const profileChartData = {
            labels: shortMonths,
            series: profileCountData
        }

        const profileChartOptions = {
            stackBars: true,
            low: 0,
            axisY: {
                onlyInteger: true
            }
        }
        const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        const tableCard = (this.props.desktop ? (
            <Card className="fullwidth">
                <DataTable>
                    <DataTableContent>
                        <DataTableHead>
                            <DataTableRow>
                                <DataTableHeadCell className="right-border">Month</DataTableHeadCell>
                                <DataTableHeadCell className="right-border" alignEnd>Sets</DataTableHeadCell>
                                {this.props.profiles.map((profile, index) => {
                                    return (
                                        <DataTableHeadCell alignEnd key={profile} className={'profile-title title-' + letters[index]} ><div className="profile-title">{profile}</div></DataTableHeadCell>
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
                                            {monthData[camelize(month)].count}
                                        </DataTableCell>
                                        {this.props.profiles.map((profile) => {
                                            return (
                                                <DataTableCell alignEnd key={profile}>{monthData[camelize(month)][camelize(profile)]}</DataTableCell>
                                            );
                                        })}
                                    </DataTableRow>
                                );
                            })}
                        </DataTableBody>
                    </DataTableContent>
                </DataTable>
            </Card>
        ) : (
            <Card className="fullwidth">
                <DataTable>
                    <DataTableContent>
                        <DataTableHead>
                            <DataTableRow>
                                {this.props.profiles.map((profile, index) => {
                                    return (
                                        <DataTableHeadCell alignEnd key={profile} className={'profile-title title-' + letters[index]} ><div className="profile-title">{profile}</div></DataTableHeadCell>
                                    );
                                })}
                            </DataTableRow>
                        </DataTableHead>
                    </DataTableContent>
                </DataTable>
            </Card>
        ));
        return (
            <div className="stats-grid">
                <Card className="count-graph">
                    <Typography use="headline5" tag="h1">Sets per Month</Typography>
                    <ChartistGraph className="ct-minor-seventh" data={countChartData} options={countChartOptions} type={'Line'} />
                </Card>
                <Card className="profile-graph">
                    <Typography use="headline5" tag="h1">Profile Breakdown</Typography>
                    <ChartistGraph className="ct-minor-seventh" data={profileChartData} options={profileChartOptions} type={'Bar'} />
                </Card>
                {tableCard}
            </div>
        )
    }
}

export default ContentStatistics;