import React from 'react';
import { Typography } from '@rmwc/typography';
import { ViewCard } from './ViewCard';
import { ViewList } from './ViewList';
import { ViewImageList } from './ViewImageList';

import './ContentGrid.scss';

export class ContentGrid extends React.Component {
    filterSets = (sets, vendor) => {
        let filteredSets = [];
        sets.forEach(set => {
            if (set.vendor === vendor) {
                filteredSets.push(set);
            }
        });
        return filteredSets;
    }
    createGroup = (vendor, sets, setCount) => {
        if (this.props.view === 'card') {
            return(<ViewCard setCount={setCount} vendor={vendor} sets={sets} admin={this.props.admin} edit={this.props.edit} />);
        } else if (this.props.view === 'list') {
            return(<ViewList vendor={vendor} sets={sets} admin={this.props.admin} edit={this.props.edit} />);
        } else if (this.props.view === 'imageList') {
            return(<ViewImageList setCount={setCount} vendor={vendor} sets={sets} admin={this.props.admin} edit={this.props.edit} />);
        }
    }
    render() {
        return (
            <div className={this.props.view + ' content-grid'}>
                {this.props.vendors.map((value, index) => {
                    const filteredSets = this.filterSets(this.props.sets, value);
                    const setCount = (filteredSets.length > this.props.maxColumns ? this.props.maxColumns : filteredSets.length);
                    return (
                        <div className="outer-container" style={{ "--columns": setCount }}key={index}>
                            <div className="subheader">
                                <Typography use="subtitle2" key={index}>{value}</Typography>
                            </div>
                            {this.createGroup(value, filteredSets, setCount)}
                        </div>
                    )
                })}
            </div>
        );
    }
}
export default ContentGrid;