import React from 'react';
import { ElementCard } from './ElementCard';
import './ViewCard.scss';

export class ViewCard extends React.Component {
    render() {
        return (
            <div className="group-container" style={{ "--columns": this.props.setCount }}>
                {this.props.sets.map((set, index) => {
                    const gbLaunch = (set.gbLaunch.includes('Q') ? set.gbLaunch : new Date(set.gbLaunch));
                    const gbEnd = new Date(set.gbEnd);
                    const icDate = new Date(set.icDate);
                    const today = new Date();
                    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    const nth = function(d) {
                        if (d > 3 && d < 21) return 'th';
                        switch (d % 10) {
                          case 1:  return "st";
                          case 2:  return "nd";
                          case 3:  return "rd";
                          default: return "th";
                        }
                      };
                    const title = set.profile + ' ' + set.colorway;
                    let subtitle;
                    if (set.gbLaunch && set.gbEnd) {
                        subtitle = gbLaunch.getDate() + nth(gbLaunch.getDate()) + '\xa0' + month[gbLaunch.getMonth()] + ' until ' + gbEnd.getDate() + nth(gbEnd.getDate()) + '\xa0' + month[gbEnd.getMonth()];
                    } else if (set.gbLaunch.includes('Q')) {
                        subtitle = 'GB expected ' + gbLaunch;
                    } else if (set.gbLaunch) {
                        subtitle = gbLaunch.getDate() + nth(gbLaunch.getDate()) + '\xa0' + month[gbLaunch.getMonth()];
                    } else {
                        subtitle = 'IC posted ' + icDate.getDate() + nth(icDate.getDate()) + '\xa0' + month[icDate.getMonth()] + (icDate.getFullYear() !== today.getFullYear() ? ' ' + icDate.getFullYear() : '');
                    }
                    const designer = set.designer.toString().replace(/,/g, " + ");
                    const thisWeek = (((gbEnd.getTime() - (7 * 24 * 60 * 60 * 1000)) < today.getTime()) && gbEnd.getTime() > today.getTime());
                    return (
                        <ElementCard selected={(this.props.detailSet === set)} cardWidth={Math.round(1/this.props.sets.length)} set={set} title={title} subtitle={subtitle} designer={designer} image={set.image} details={this.props.details} thisWeek={thisWeek} key={index}/>
                    )
                })}
            </div>
        );
    }
}
export default ViewCard;