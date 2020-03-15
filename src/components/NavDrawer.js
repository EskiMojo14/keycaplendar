import React from 'react';
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from '@rmwc/drawer';
import { List, ListItem, ListItemGraphic } from '@rmwc/list';
import { IconButton } from '@rmwc/icon-button';
import { Tooltip } from '@rmwc/tooltip';
import { Ripple } from '@rmwc/ripple';
import './NavDrawer.scss';
import logo from '../logo.svg';

export class DesktopNavDrawer extends React.Component {
    render() {
        const drawerOpen = this.props.open;
        const filledIcons = false;
        return (
            <Drawer dismissible open={drawerOpen}>
                <DrawerHeader className="nav">
                    <img className="logo" src={logo} alt="logo" />
                    <DrawerTitle>KeycapLendar</DrawerTitle>
                    <IconButton icon="chevron_left" onClick={this.props.close}/>
                </DrawerHeader>
                <DrawerContent>
                    <List>
                        <ListItem onClick={(e) => this.props.changePage('calendar')} selected={(this.props.page === 'calendar' ? true : false)}>
                            <ListItemGraphic icon={{
                                strategy: (this.props.page === 'calendar' && filledIcons ? 'ligature' : 'component'),
                                icon: (this.props.page === 'calendar' && filledIcons ? 'calendar_today' : (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                                ))
                            }} />
                            Calendar
                        </ListItem>
                        <ListItem onClick={(e) => this.props.changePage('live')} selected={(this.props.page === 'live' ? true : false)}>
                            <ListItemGraphic icon={{
                                strategy: (this.props.page === 'live' && filledIcons ? 'ligature' : 'component'),
                                icon: (this.props.page === 'live' && filledIcons ? 'store' : (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" /><path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" /></svg>
                                ))
                            }} />
                            Live GBs
                        </ListItem>
                        <ListItem onClick={(e) => this.props.changePage('ic')} selected={(this.props.page === 'ic' ? true : false)}>
                            <ListItemGraphic icon={{
                                strategy: (this.props.page === 'ic' && filledIcons ? 'ligature' : 'component'),
                                icon: (this.props.page === 'ic' && filledIcons ? 'forum' : (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M15 11V4H4v8.17L5.17 11H6z" opacity=".3" /><path d="M16 13c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10zm-12-.83V4h11v7H5.17L4 12.17zM22 7c0-.55-.45-1-1-1h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7z" /></svg>
                                ))
                            }} />
                            IC Tracker
                        </ListItem>
                        <ListItem onClick={(e) => this.props.changePage('previous')} selected={(this.props.page === 'previous' ? true : false)}>
                            <ListItemGraphic icon={{
                                strategy: 'component',
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z" /></svg>
                                )
                            }} />
                            Previous Sets
                        </ListItem>
                    </List>
                </DrawerContent>
                <div className="drawer-footer">
                    <List className="drawer-footer-list">
                        <ListItem disabled ripple={false}>
                            <ListItemGraphic icon={{
                                strategy: 'component',
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12 4c-4.41 0-8 3.59-8 8 0 1.82.62 3.49 1.64 4.83 1.43-1.74 4.9-2.33 6.36-2.33s4.93.59 6.36 2.33C19.38 15.49 20 13.82 20 12c0-4.41-3.59-8-8-8zm0 9c-1.94 0-3.5-1.56-3.5-3.5S10.06 6 12 6s3.5 1.56 3.5 3.5S13.94 13 12 13z" opacity=".3" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.07 18.28c.43-.9 3.05-1.78 4.93-1.78s4.51.88 4.93 1.78C15.57 19.36 13.86 20 12 20s-3.57-.64-4.93-1.72zm11.29-1.45c-1.43-1.74-4.9-2.33-6.36-2.33s-4.93.59-6.36 2.33C4.62 15.49 4 13.82 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 1.82-.62 3.49-1.64 4.83zM12 6c-1.94 0-3.5 1.56-3.5 3.5S10.06 13 12 13s3.5-1.56 3.5-3.5S13.94 6 12 6zm0 5c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z" /></svg>
                                )
                            }} />
                            Account
                        </ListItem>
                    </List>
                    <div className="footer-button">
                        <Tooltip content="Log in" align="top">
                            <Ripple unbounded>
                                <div className="svg-container mdc-icon-button">
                                    <svg viewBox="0 0 24 24"><path d="M19,3H5C3.89,3 3,3.89 3,5V9H5V5H19V19H5V15H3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M10.08,15.58L11.5,17L16.5,12L11.5,7L10.08,8.41L12.67,11H3V13H12.67L10.08,15.58Z" /></svg>
                                </div>
                            </Ripple>
                        </Tooltip>
                    </div>
                </div>
            </Drawer>
        );
    }
};

export class MobileNavDrawer extends React.Component {
    constructor(props) {
        super(props);
        this.toggleDrawerIcon = this.toggleDrawerIcon.bind(this);
        this.changePage = this.changePage.bind(this);
    }

    toggleDrawerIcon() {
        this.props.toggle();
    }

    changePage(newPage) {
        this.props.changePage(newPage);
        this.props.close();
    }
    render() {
        const drawerOpen = this.props.open;
        return (
            <div>
                <Drawer modal open={drawerOpen} onClose={this.props.close}>
                    <DrawerHeader className="nav">
                        <img className="logo" src={logo} alt="logo" />
                        <DrawerTitle>KeycapLendar</DrawerTitle>
                    </DrawerHeader>
                    <DrawerContent>
                        <List>
                            <ListItem onClick={(e) => this.changePage('calendar')} selected={(this.props.page === 'calendar' ? true : false)}>
                                <ListItemGraphic icon={{
                                    strategy: 'component',
                                    icon: (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                                    )
                                }} />
                                Calendar
                            </ListItem>
                            <ListItem onClick={(e) => this.changePage('live')} selected={(this.props.page === 'live' ? true : false)}>
                                <ListItemGraphic icon={{
                                    strategy: 'component',
                                    icon: (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" /><path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" /></svg>
                                    )
                                }} />
                                Live GBs
                            </ListItem>
                            <ListItem onClick={(e) => this.changePage('ic')} selected={(this.props.page === 'ic' ? true : false)}>
                                <ListItemGraphic icon={{
                                    strategy: 'component',
                                    icon: (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M15 11V4H4v8.17L5.17 11H6z" opacity=".3" /><path d="M16 13c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10zm-12-.83V4h11v7H5.17L4 12.17zM22 7c0-.55-.45-1-1-1h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7z" /></svg>
                                    )
                                }} />
                                IC Tracker
                            </ListItem>
                            <ListItem onClick={(e) => this.changePage('previous')} selected={(this.props.page === 'previous' ? true : false)}>
                                <ListItemGraphic icon={{
                                    strategy: 'component',
                                    icon: (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z" /></svg>
                                    )
                                }} />
                                Previous Sets
                            </ListItem>
                        </List>
                    </DrawerContent>
                    <div className="drawer-footer">
                        <List className="drawer-footer-list">
                            <ListItem disabled ripple={false}>
                                <ListItemGraphic icon={{
                                    strategy: 'component',
                                    icon: (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M12 4c-4.41 0-8 3.59-8 8 0 1.82.62 3.49 1.64 4.83 1.43-1.74 4.9-2.33 6.36-2.33s4.93.59 6.36 2.33C19.38 15.49 20 13.82 20 12c0-4.41-3.59-8-8-8zm0 9c-1.94 0-3.5-1.56-3.5-3.5S10.06 6 12 6s3.5 1.56 3.5 3.5S13.94 13 12 13z" opacity=".3" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM7.07 18.28c.43-.9 3.05-1.78 4.93-1.78s4.51.88 4.93 1.78C15.57 19.36 13.86 20 12 20s-3.57-.64-4.93-1.72zm11.29-1.45c-1.43-1.74-4.9-2.33-6.36-2.33s-4.93.59-6.36 2.33C4.62 15.49 4 13.82 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 1.82-.62 3.49-1.64 4.83zM12 6c-1.94 0-3.5 1.56-3.5 3.5S10.06 13 12 13s3.5-1.56 3.5-3.5S13.94 6 12 6zm0 5c-.83 0-1.5-.67-1.5-1.5S11.17 8 12 8s1.5.67 1.5 1.5S12.83 11 12 11z" /></svg>
                                    )
                                }} />
                                Account
                        </ListItem>
                        </List>
                        <div className="footer-button">
                            <Tooltip content="Log in" align="top">
                                <Ripple unbounded>
                                    <div className="svg-container mdc-icon-button">
                                        <svg viewBox="0 0 24 24"><path d="M19,3H5C3.89,3 3,3.89 3,5V9H5V5H19V19H5V15H3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M10.08,15.58L11.5,17L16.5,12L11.5,7L10.08,8.41L12.67,11H3V13H12.67L10.08,15.58Z" /></svg>
                                    </div>
                                </Ripple>
                            </Tooltip>
                        </div>
                    </div>
                </Drawer>
            </div>
        );
    }
};

export default DesktopNavDrawer;