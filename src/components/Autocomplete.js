import React from 'react';
import { Menu, MenuItem } from '@rmwc/menu';
import './Autocomplete.scss';

export class Autocomplete extends React.Component {
    render() {
        const matchingItems = this.props.array.filter((item) => {
            return item.toLowerCase().indexOf(this.props.query.toLowerCase()) > -1;
        })
        return (
            <Menu className="autocomplete" focusOnOpen={false} open={this.props.open && matchingItems.length > 0} anchorCorner="bottomLeft" onSelect={(e) => this.props.select(this.props.prop, matchingItems[e.detail.index])}>
                {
                    matchingItems.map((item, index) => {
                        return <MenuItem key={index}>{item}</MenuItem>
                    })
                }
            </Menu>
        );
    }
}

export default Autocomplete;