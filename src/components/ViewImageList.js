import React from 'react';
import { ImageList } from '@rmwc/image-list';
import { ElementImage } from './ElementImage';
import './ViewImageList.scss';

export class ViewImageList extends React.Component {
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
            <ImageList style={{margin: -2}} withTextProtection>
                {filteredSets.map((set, index) => {
                    const gbLaunch = (set.gbLaunch.includes('Q') ? set.gbLaunch : new Date(set.gbLaunch));
                    const gbEnd = new Date(set.gbEnd);
                    const icDate = new Date(set.icDate);
                    const today = new Date();
                    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
                        subtitle = gbLaunch.getDate() + nth(gbLaunch.getDate()) + '\xa0' + month[gbLaunch.getMonth()] + ' - ' + gbEnd.getDate() + nth(gbEnd.getDate()) + '\xa0' + month[gbEnd.getMonth()];
                    } else if (set.gbLaunch.includes('Q')) {
                        subtitle = 'IC ' + icDate.getDate() + nth(icDate.getDate()) + '\xa0' + month[icDate.getMonth()] + (icDate.getFullYear() !== today.getFullYear() ? ' ' + icDate.getFullYear() : '') + ', expected ' + gbLaunch;
                    } else if (set.gbLaunch) {
                        subtitle = gbLaunch.getDate() + nth(gbLaunch.getDate()) + '\xa0' + month[gbLaunch.getMonth()];
                    } else {
                        subtitle = 'IC ' + icDate.getDate() + nth(icDate.getDate()) + '\xa0' + month[icDate.getMonth()] + (icDate.getFullYear() !== today.getFullYear() ? ' ' + icDate.getFullYear() : '') ;
                    }
                    return (
                        <ElementImage title={title} subtitle={subtitle} image={set.image} details={set.details} key={index}/>
                    )
                })}
            </ImageList>
        );
    }
}
export default ViewImageList;