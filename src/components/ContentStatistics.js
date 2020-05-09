import React from 'react';
import { Card } from '@rmwc/card';
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
        const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
    render() {
        function camelize(str) {
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
              return index === 0 ? word.toLowerCase() : word.toUpperCase();
            }).replace(/\s+/g, '');
        }
        let monthData = {};
        const monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        this.state.months.forEach((month) => {
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
            this.props.profiles.forEach((profile) => {
                const profileSets = filteredSets.filter((set) => {
                    return set.profile === profile;
                });
                monthData[camelize(month)][camelize(profile)] = ( profileSets.length > 0 ? profileSets.length : '' );
            });
        })
        return (
            <div className="stats-grid">
                <Card className="fullwidth">
                    <DataTable>
                        <DataTableContent>
                            <DataTableHead>
                                <DataTableRow>
                                    <DataTableHeadCell className="right-border">Month</DataTableHeadCell>
                                    <DataTableHeadCell className="right-border" alignEnd>Sets</DataTableHeadCell>
                                    {this.props.profiles.map((profile) => {
                                        return (
                                            <DataTableHeadCell alignEnd key={profile}>{profile}</DataTableHeadCell>
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
            </div>
        )
    }
}

export default ContentStatistics;