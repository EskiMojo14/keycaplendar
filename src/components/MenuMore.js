import React from 'react';
import { Menu, MenuItem, MenuSurfaceAnchor } from '@rmwc/menu';
import { ListItemMeta } from '@rmwc/list';
import { MenuView } from './MenuView';
import './MenuMore.scss';

export class MenuMore extends React.Component {
    constructor(props) {
        super(props);
        this.state = { viewMenuOpen: false };
        this.closeMenu = this.closeMenu.bind(this);
        this.openViewMenu = this.openViewMenu.bind(this);
        this.closeViewMenu = this.closeViewMenu.bind(this);
        this.changeView = this.changeView.bind(this);
    }
    closeMenu() {
        this.props.onClose();
        this.closeViewMenu();
    }
    openViewMenu() {
        this.setState({ viewMenuOpen: true });
    }
    closeViewMenu() {
        this.setState({ viewMenuOpen: false });
    }
    changeView(index) {
        const views = ['card', 'list', 'imageList'];
        this.props.changeView(views[index]);
    }
    render() {
        return (
            <Menu className="overflow-menu" anchorCorner="bottomLeft" open={this.props.open} onSelect={this.props.onSelect} onClose={this.closeMenu}>
                <MenuSurfaceAnchor onMouseLeave={this.closeViewMenu}>
                    <MenuView anchorCorner="topRight" view={this.props.view} open={this.state.viewMenuOpen} onSelect={evt => this.props.changeView(evt.detail.index)} onClose={this.closeViewMenu} cascading/>

                    <MenuItem onMouseEnter={this.openViewMenu}>
                        View
                        <ListItemMeta icon="arrow_right" />
                    </MenuItem>
                </MenuSurfaceAnchor>
                <MenuItem>Toggle theme</MenuItem>
            </Menu>
        );
    }
}
export default MenuMore;