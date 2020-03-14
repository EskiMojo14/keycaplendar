import React from 'react';
import { Typography } from '@rmwc/typography';
import { ViewCard } from './ViewCard';
import { ViewList } from './ViewList';
import { ViewImageList } from './ViewImageList';

import './ContentGrid.scss';

export class ContentGrid extends React.Component {
    filterSets = (sets, group, sort, page) => {
        let filteredSets = [];
        sets.forEach(set => {
            if (sort === 'date') {
                const query = (page === 'live' ? 'gbEnd' : 'gbLaunch');
                const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                const setDate = new Date(set[query]);
                const setMonth = month[setDate.getMonth()];
                if (setMonth === group) {
                    filteredSets.push(set);
                }
            } else {
                if (set[sort] === group) {
                    filteredSets.push(set);
                }
            }
        });
        return filteredSets;
    }
    createGroup = (sets, setCount) => {
        if (this.props.view === 'card') {
            return(<ViewCard setCount={setCount} sets={sets} admin={this.props.admin} edit={this.props.edit} />);
        } else if (this.props.view === 'list') {
            return(<ViewList sets={sets} admin={this.props.admin} edit={this.props.edit} />);
        } else if (this.props.view === 'imageList') {
            return(<ViewImageList setCount={setCount} sets={sets} admin={this.props.admin} edit={this.props.edit} />);
        }
    }
    render() {
        return (
            <div className={this.props.view + ' content-grid'}>
                {this.props.groups.map((value, index) => {
                    const filteredSets = this.filterSets(this.props.sets, value, this.props.sort, this.props.page);
                    const setCount = (filteredSets.length > this.props.maxColumns ? this.props.maxColumns : filteredSets.length);
                    return (
                        <div className="outer-container" style={{ "--columns": setCount }}key={index}>
                            <div className="subheader">
                                <Typography use="subtitle2" key={index}>{value}</Typography>
                            </div>
                            {this.createGroup(filteredSets, setCount)}
                        </div>
                    )
                })}
            </div>
        );
    }
}
export default ContentGrid;