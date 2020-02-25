import React from 'react';
import { Menu, MenuItem } from '@rmwc/menu';
import './MenuView.scss';

export class MenuView extends React.Component {
    render() {        
        return (
            <Menu anchorCorner="bottomLeft" open={this.props.open} onSelect={this.props.onSelect} onClose={this.props.onClose}>
              <MenuItem selected={(this.props.view === 'card' ? true : false)}>Card</MenuItem>
              <MenuItem selected={(this.props.view === 'list' ? true : false)}>List</MenuItem>
              <MenuItem selected={(this.props.view === 'imageList' ? true : false)}>Image List</MenuItem>
            </Menu>
        );
    }
}
export default MenuView;