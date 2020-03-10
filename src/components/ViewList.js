import React from 'react';
import { List, ListDivider } from '@rmwc/list';
import { ElementList } from './ElementList';
import './ViewList.scss';

export class ViewList extends React.Component {
    constructor(props) {
        super(props);
        this.filterSets = this.filterSets.bind(this);
    }
    filterSets() {
        const sets = this.props.sets;
        let filteredSets = [];
        sets.forEach(set => {
            if (set.vendor === this.props.vendor) {
                filteredSets.push(set);
            }
        });
        return filteredSets;
    }
    render() {
        const filteredSets = this.filterSets();

        return (
            <List twoLine className="view-list">
                {filteredSets.map((set, index) => {
                    const gbLaunch = (set.gbLaunch.includes('Q') ? set.gbLaunch : new Date(set.gbLaunch));
                    const gbEnd = new Date(set.gbEnd);
                    const icDate = new Date(set.icDate);
                    const today = new Date();
                    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const nth = function (d) {
                        if (d > 3 && d < 21) return 'th';
                        switch (d % 10) {
                            case 1: return "st";
                            case 2: return "nd";
                            case 3: return "rd";
                            default: return "th";
                        }
                    };
                    const title = set.profile + ' ' + set.colorway;
                    let verb;
                    if (gbLaunch <= today && gbEnd >= today) {
                        verb = 'Running';
                    } else if (gbEnd <= today) {
                        verb = 'Ran';
                    } else if (gbLaunch > today) {
                        verb = 'Will run';
                    } else {
                        verb = 'Runs';
                    };
                    let subtitle;
                    if (set.gbLaunch && set.gbEnd) {
                        subtitle = verb + ' from ' + gbLaunch.getDate() + nth(gbLaunch.getDate()) + '\xa0' + month[gbLaunch.getMonth()] + ' until ' + gbEnd.getDate() + nth(gbEnd.getDate()) + '\xa0' + month[gbEnd.getMonth()];
                    } else if (set.gbLaunch.includes('Q')) {
                        subtitle = 'IC posted ' + icDate.getDate() + nth(icDate.getDate()) + '\xa0' + month[icDate.getMonth()] + (icDate.getFullYear() !== today.getFullYear() ? ' ' + icDate.getFullYear() : '') + ', GB expected ' + gbLaunch;
                    } else if (set.gbLaunch) {
                        subtitle = verb + ' from ' + gbLaunch.getDate() + nth(gbLaunch.getDate()) + '\xa0' + month[gbLaunch.getMonth()];
                    } else {
                        subtitle = 'IC posted ' + icDate.getDate() + nth(icDate.getDate()) + '\xa0' + month[icDate.getMonth()] + (icDate.getFullYear() !== today.getFullYear() ? ' ' + icDate.getFullYear() : '');
                    }
                    return (
                        <ElementList title={title} subtitle={subtitle} image={set.image} details={set.details} store={set.storeLink} admin={this.props.admin} edit={this.props.edit} key={index} />
                    )
                })}
                <ListDivider />
            </List>
        );
    }
}
export default ViewList;