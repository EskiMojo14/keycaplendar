import React from 'react';
import { ImageList } from '@rmwc/image-list';
import { ElementImage } from './ElementImage';

export class ViewImageList extends React.Component {
    render() {
        return (
            <ImageList style={{margin: -2 }} withTextProtection>
                {this.props.sets.map((set, index) => {
                    const gbLaunch = (set.gbLaunch.includes('Q') ? set.gbLaunch : new Date(set.gbLaunch));
                    const gbEnd = new Date(set.gbEnd);
                    const icDate = new Date(set.icDate);
                    const today = new Date();
                    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const fullMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
                        subtitle = gbLaunch.getUTCDate() + nth(gbLaunch.getUTCDate()) + '\xa0' + month[gbLaunch.getUTCMonth()] + ' - ' + gbEnd.getUTCDate() + nth(gbEnd.getUTCDate()) + '\xa0' + month[gbEnd.getUTCMonth()];
                    } else if (set.gbLaunch.includes('Q')) {
                        subtitle = 'Expected ' + gbLaunch;
                    } else if (set.gbMonth) {
                        subtitle = 'Expected ' + fullMonth[gbLaunch.getUTCMonth()];
                    } else if (set.gbLaunch) {
                        subtitle = gbLaunch.getUTCDate() + nth(gbLaunch.getUTCDate()) + '\xa0' + month[gbLaunch.getUTCMonth()];
                    } else {
                        subtitle = 'IC ' + icDate.getUTCDate() + nth(icDate.getUTCDate()) + '\xa0' + month[icDate.getUTCMonth()] + (icDate.getUTCFullYear() !== today.getUTCFullYear() ? ' ' + icDate.getUTCFullYear() : '') ;
                    }
                    
                    const oneDay = 24 * 60 * 60 * 1000;
                    const thisWeek = (((gbEnd.getTime() - (7 * oneDay)) < today.getTime()) && gbEnd.getTime() > today.getTime());
                    const daysLeft = Math.round(Math.abs((gbEnd - today) / oneDay));
                    let live = false;
                    if (Object.prototype.toString.call(gbLaunch) === '[object Date]') {
                        live = (gbLaunch.getTime() < today.getTime() && gbEnd.getTime() > today.getTime());
                    }
                    return (
                        <ElementImage page={this.props.page} selected={(this.props.detailSet === set || this.props.editSet === set)} title={title} subtitle={subtitle} image={set.image} set={set} details={this.props.details} closeDetails={this.props.closeDetails} thisWeek={thisWeek} daysLeft={daysLeft} live={live} key={index}/>
                    )
                })}
            </ImageList>
        );
    }
}
export default ViewImageList;