import React from 'react';
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarNavigationIcon, TopAppBarTitle, TopAppBarActionItem, TopAppBarFixedAdjust } from '@rmwc/top-app-bar';
import { Tooltip } from '@rmwc/tooltip';
import { Ripple } from '@rmwc/ripple';
import { LinearProgress } from '@rmwc/linear-progress';
import { MenuSurfaceAnchor, Menu, MenuItem } from '@rmwc/menu';
import { MenuView } from './MenuView';
import { MenuSort } from './MenuSort';
import { MenuMore } from './MenuMore';
import './AppBar.scss';
import logo from '../logo.svg';

export class DesktopAppBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { sortMenuOpen: false, moreMenuOpen: false };
        this.openSortMenu = this.openSortMenu.bind(this);
        this.closeSortMenu = this.closeSortMenu.bind(this);
        this.openMoreMenu = this.openMoreMenu.bind(this);
        this.closeMoreMenu = this.closeMoreMenu.bind(this);
        this.changeView = this.changeView.bind(this);
    }
    openSortMenu() {
        this.setState({ sortMenuOpen: true });
    }
    closeSortMenu() {
        this.setState({ sortMenuOpen: false });
    }
    openMoreMenu() {
        this.setState({ moreMenuOpen: true });
    }
    closeMoreMenu() {
        this.setState({ moreMenuOpen: false });
    }
    changeView(index) {
        const views = ['card', 'list', 'imageList'];
        this.props.changeView(views[index]);
    }
    render() {
        const title = { calendar: 'Calendar', live: 'Live GBs', ic: 'IC Tracker', previous: 'Previous Sets', account: 'Account' };
        return (
            <div>
                <TopAppBar fixed>
                    <TopAppBarRow>
                        <TopAppBarSection alignStart>
                            <TopAppBarNavigationIcon icon="menu" onClick={this.props.toggleNavDrawer} />
                            <TopAppBarTitle onClick={this.props.toggleLoading}>{title[this.props.page]}</TopAppBarTitle>
                        </TopAppBarSection>
                        <TopAppBarSection alignEnd>
                            <MenuSurfaceAnchor className={(this.props.page === 'calendar' || this.props.page === 'ic' ? 'hidden' : '')}>
                                <MenuSort sort={this.props.sort} open={this.state.sortMenuOpen} onSelect={evt => this.props.setSort(evt.detail.index)} onClose={this.closeSortMenu} />
                                <Tooltip content="Sort" align="bottom" className={(this.props.page === 'calendar' || this.props.page === 'ic' ? 'hidden' : '')}>
                                    <TopAppBarActionItem icon="sort" style={{'--animation-delay': 1}} onClick={this.openSortMenu}/>
                                </Tooltip>
                            </MenuSurfaceAnchor>
                            <Tooltip content="Filter" align="bottom"><TopAppBarActionItem style={{'--animation-delay': 2}} icon="filter_list" onClick={this.props.toggleFilterDrawer} /></Tooltip>
                            <MenuSurfaceAnchor>
                                <MenuMore view={this.props.view} open={this.state.moreMenuOpen} changeView={this.changeView} onClose={this.closeMoreMenu} />
                                <Tooltip content="More" align="bottom">
                                    <TopAppBarActionItem style={{'--animation-delay': 3}} icon="more_vert" onClick={this.openMoreMenu} />
                                </Tooltip>
                            </MenuSurfaceAnchor>
                        </TopAppBarSection>
                    </TopAppBarRow>
                    <LinearProgress className={(this.props.loading ? '' : 'hidden')} />
                </TopAppBar>
                <TopAppBarFixedAdjust />
            </div>
        );
    }
};

export class TabletAppBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { sortMenuOpen: false, viewMenuOpen: false };
        this.openSortMenu = this.openSortMenu.bind(this);
        this.closeSortMenu = this.closeSortMenu.bind(this);
        this.openViewMenu = this.openViewMenu.bind(this);
        this.closeViewMenu = this.closeViewMenu.bind(this);
        this.changeView = this.changeView.bind(this);
    }
    openSortMenu() {
        this.setState({ sortMenuOpen: true });
    }
    closeSortMenu() {
        this.setState({ sortMenuOpen: false });
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
        let viewIcon;
        if (this.props.view === 'card') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M4 5h3v13H4zm14 0h3v13h-3zM8 18h9V5H8v13zm2-11h5v9h-5V7z" /><path d="M10 7h5v9h-5z" opacity=".3" /></svg>;
        } else if (this.props.view === 'list') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87" /><path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3" /><path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" /></svg>;
        } else if (this.props.view === 'imageList') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M11 12.5h3V16h-3zM11 7h3v3.5h-3zm-5 5.5h3V16H6zM6 7h3v3.5H6zm10 0h3v3.5h-3zm0 5.5h3V16h-3z" opacity=".3" /><path d="M4 5v13h17V5H4zm5 11H6v-3.5h3V16zm0-5.5H6V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5z" /></svg>;
        } else {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5 5h15v3H5zm12 5h3v9h-3zm-7 0h5v9h-5zm-5 0h3v9H5z" opacity=".3" /><path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-9h3v9zm7 0h-5v-9h5v9zm5 0h-3v-9h3v9zm0-11H5V5h15v3z" /></svg>;
        }
        const title = { calendar: 'Calendar', live: 'Live GBs', ic: 'IC Tracker', previous: 'Previous Sets', account: 'Account' };
        return (
            <div>
                <TopAppBar fixed>
                    <TopAppBarRow>
                        <TopAppBarSection alignStart>
                            <TopAppBarNavigationIcon icon="menu" onClick={this.props.toggleNavDrawer} />
                            <TopAppBarTitle onClick={this.props.toggleLoading}>{title[this.props.page]}</TopAppBarTitle>
                        </TopAppBarSection>
                        <TopAppBarSection alignEnd>
                            <MenuSurfaceAnchor className={(this.props.page === 'calendar' || this.props.page === 'ic' ? 'hidden' : '')}>
                                <MenuSort sort={this.props.sort} open={this.state.sortMenuOpen} onSelect={evt => this.props.setSort(evt.detail.index)} onClose={this.closeSortMenu} />
                                <Tooltip content="Sort" align="bottom" className={(this.props.page === 'calendar' || this.props.page === 'ic' ? 'hidden' : '')}>
                                    <TopAppBarActionItem style={{'--animation-delay': 1}} icon="sort" onClick={this.openSortMenu} />
                                </Tooltip>
                            </MenuSurfaceAnchor>
                            <Tooltip content="Filter" align="bottom"><TopAppBarActionItem style={{'--animation-delay': 2}} icon="filter_list" onClick={this.props.toggleFilterDrawer} /></Tooltip>
                            <MenuSurfaceAnchor>
                                <MenuView view={this.props.view} open={this.state.viewMenuOpen} onSelect={evt => this.changeView(evt.detail.index)} onClose={this.closeViewMenu} />
                                <Tooltip content="View" align="bottom">
                                    <div onClick={this.openViewMenu}>
                                        <Ripple unbounded>
                                            <div className="svg-container mdc-icon-button" style={{'--animation-delay': 3}}>
                                                {viewIcon}
                                            </div>
                                        </Ripple>
                                    </div>
                                </Tooltip>
                            </MenuSurfaceAnchor>
                            <Tooltip content="Toggle theme" align="bottom">
                                <div>
                                    <Ripple unbounded>
                                        <div className="svg-container mdc-icon-button" style={{'--animation-delay': 4}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M18 9.52V6h-3.52L12 3.52 9.52 6H6v3.52L3.52 12 6 14.48V18h3.52L12 20.48 14.48 18H18v-3.52L20.48 12 18 9.52zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z" opacity=".3" /><path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zm-2 5.79V18h-3.52L12 20.48 9.52 18H6v-3.52L3.52 12 6 9.52V6h3.52L12 3.52 14.48 6H18v3.52L20.48 12 18 14.48zM12 6v12c3.31 0 6-2.69 6-6s-2.69-6-6-6z" /></svg>
                                        </div>
                                    </Ripple>
                                </div>
                            </Tooltip>
                        </TopAppBarSection>
                    </TopAppBarRow>
                    <LinearProgress className={(this.props.loading ? '' : 'hidden')} />
                </TopAppBar>
                <TopAppBarFixedAdjust />
            </div>
        );
    }
};

export class MobileAppBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { sortMenuOpen: false, filterMenuOpen: false, viewMenuOpen: false };
        this.openSortMenu = this.openSortMenu.bind(this);
        this.closeSortMenu = this.closeSortMenu.bind(this);
        this.openFilterMenu = this.openFilterMenu.bind(this);
        this.closeFilterMenu = this.closeFilterMenu.bind(this);
        this.openViewMenu = this.openViewMenu.bind(this);
        this.closeViewMenu = this.closeViewMenu.bind(this);
        this.changeView = this.changeView.bind(this);
    }
    openSortMenu() {
        this.setState({ sortMenuOpen: true });
    }
    closeSortMenu() {
        this.setState({ sortMenuOpen: false });
    }
    openFilterMenu() {
        this.setState({ filterMenuOpen: true });
    }
    closeFilterMenu() {
        this.setState({ filterMenuOpen: false });
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
    scrollTop() {
        window.scrollTo(0, 0);
    }
    render() {
        let viewIcon;
        if (this.props.view === 'card') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M4 5h3v13H4zm14 0h3v13h-3zM8 18h9V5H8v13zm2-11h5v9h-5V7z" /><path d="M10 7h5v9h-5z" opacity=".3" /></svg>;
        } else if (this.props.view === 'list') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87" /><path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3" /><path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" /></svg>;
        } else if (this.props.view === 'imageList') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M11 12.5h3V16h-3zM11 7h3v3.5h-3zm-5 5.5h3V16H6zM6 7h3v3.5H6zm10 0h3v3.5h-3zm0 5.5h3V16h-3z" opacity=".3" /><path d="M4 5v13h17V5H4zm5 11H6v-3.5h3V16zm0-5.5H6V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5z" /></svg>;
        } else {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5 5h15v3H5zm12 5h3v9h-3zm-7 0h5v9h-5zm-5 0h3v9H5z" opacity=".3" /><path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-9h3v9zm7 0h-5v-9h5v9zm5 0h-3v-9h3v9zm0-11H5V5h15v3z" /></svg>;
        }
        const title = { calendar: 'Calendar', live: 'Live GBs', ic: 'IC Tracker', previous: 'Previous Sets', account: 'Account' };
        return (
            <div>
                <TopAppBar short>
                    <TopAppBarRow>
                        <TopAppBarSection alignStart className="nav-icon">
                            <TopAppBarNavigationIcon icon="menu" onClick={this.props.toggleNavDrawer} />
                            <TopAppBarTitle onClick={this.props.toggleLoading}>{title[this.props.page]}</TopAppBarTitle>
                        </TopAppBarSection>
                        <TopAppBarSection alignEnd className="actions">
                            <MenuSurfaceAnchor className={(this.props.page === 'calendar' || this.props.page === 'ic' ? 'hidden' : '')}>
                                <MenuSort sort={this.props.sort} open={this.state.sortMenuOpen} onSelect={evt => this.props.setSort(evt.detail.index)} onClose={this.closeSortMenu} />
                                <Tooltip className={(this.props.page === 'calendar' || this.props.page === 'ic' ? 'hidden' : '')} content="Sort" align="bottom">
                                    <TopAppBarActionItem style={{'--animation-delay': 1}} icon="sort" onClick={this.openSortMenu} />
                                </Tooltip>
                            </MenuSurfaceAnchor>
                            <MenuSurfaceAnchor>
                                <Menu anchorCorner="bottomLeft" open={this.state.filterMenuOpen} onSelect={evt => this.props.toggleDialog(evt.detail.index)} onClose={this.closeFilterMenu}>
                                    <MenuItem>Vendor</MenuItem>
                                    <MenuItem>Profile</MenuItem>
                                </Menu>
                                <Tooltip content="Filter" align="bottom">
                                    <TopAppBarActionItem style={{'--animation-delay': 2}} icon="filter_list" onClick={this.openFilterMenu} />
                                </Tooltip>
                            </MenuSurfaceAnchor>
                            <MenuSurfaceAnchor>
                                <MenuView view={this.props.view} open={this.state.viewMenuOpen} onSelect={evt => this.changeView(evt.detail.index)} onClose={this.closeViewMenu} />
                                <Tooltip content="View" align="bottom">
                                    <div onClick={this.openViewMenu}>
                                        <Ripple unbounded>
                                            <div className="svg-container mdc-icon-button" style={{'--animation-delay': 3}}>
                                                {viewIcon}
                                            </div>
                                        </Ripple>
                                    </div>
                                </Tooltip>
                            </MenuSurfaceAnchor>
                            <Tooltip content="Toggle theme" align="bottom">
                                <div>
                                    <Ripple unbounded>
                                        <div className="svg-container mdc-icon-button" style={{'--animation-delay': 4}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M18 9.52V6h-3.52L12 3.52 9.52 6H6v3.52L3.52 12 6 14.48V18h3.52L12 20.48 14.48 18H18v-3.52L20.48 12 18 9.52zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z" opacity=".3" /><path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zm-2 5.79V18h-3.52L12 20.48 9.52 18H6v-3.52L3.52 12 6 9.52V6h3.52L12 3.52 14.48 6H18v3.52L20.48 12 18 14.48zM12 6v12c3.31 0 6-2.69 6-6s-2.69-6-6-6z" /></svg>
                                        </div>
                                    </Ripple>
                                </div>
                            </Tooltip>
                        </TopAppBarSection>
                        <TopAppBarSection alignEnd className="short-logo" onClick={this.scrollTop}>
                            <img className="logo" src={logo} alt="logo" />
                        </TopAppBarSection>
                    </TopAppBarRow>
                    <LinearProgress className={(this.props.loading ? '' : 'hidden')} />
                </TopAppBar>
                <TopAppBarFixedAdjust />
            </div>
        );
    }
};

export default DesktopAppBar;