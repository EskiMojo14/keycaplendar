import React from 'react';
import { ImageList } from '@rmwc/image-list';
import { ElementImage } from './ElementImage';
import './ViewImageList.scss';

export class ViewImageList extends React.Component {
    render() {
        const sets = this.props.sets;
        
        return (
            <ImageList style={{margin: -2}} withTextProtection>
                {sets.map((set, index) => {
                    const gbLaunch = new Date(set.gbLaunch);
                    const gbEnd = new Date(set.gbEnd);
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
                    const title = set.profile + ' ' + set.colourway;
                    const subtitle = gbLaunch.getDate() + nth(gbLaunch.getDate()) + '\xa0' + month[gbLaunch.getMonth()] + ' - ' + gbEnd.getDate() + nth(gbEnd.getDate()) + '\xa0' + month[gbEnd.getMonth()];
                    return (
                        <ElementImage title={title} subtitle={subtitle} image={set.image} details={set.details} key={index}/>
                    )
                })}
            </ImageList>
        );
    }
}
export default ViewImageList;