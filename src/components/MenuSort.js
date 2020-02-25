import React from 'react';
import { Menu, MenuItem } from '@rmwc/menu';

export class MenuSort extends React.Component {
    render() {        
        return (
            <Menu anchorCorner="bottomLeft" open={this.props.open} onSelect={this.props.onSelect} onClose={this.props.onClose}>
              <MenuItem selected={(this.props.sort === 'vendor' ? true : false)}>Vendor</MenuItem>
              <MenuItem selected={(this.props.sort === 'date' ? true : false)}>End date</MenuItem>
              <MenuItem selected={(this.props.sort === 'profile' ? true : false)}>Profile</MenuItem>
            </Menu>
        );
    }
}
export default MenuSort;