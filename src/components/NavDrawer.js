import React from 'react';
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from '@rmwc/drawer';
import { List, ListItem, ListItemGraphic, ListDivider } from '@rmwc/list';
import './NavDrawer.scss';
import logo from '../logo.svg';

export function DesktopNavDrawer() {

    const open = React.useState(true);
    return (
        <Drawer dismissible open={open}>
            <DrawerContent>
                <List>
                    <ListItem>
                        <ListItemGraphic icon={{
                            strategy: 'component',
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                            )
                        }} />
                        Calendar</ListItem>
                    <ListItem>
                        <ListItemGraphic icon={{
                            strategy: 'component',
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" /><path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" /></svg>
                            )
                        }} />
                        Live GBs</ListItem>
                    <ListItem>
                        <ListItemGraphic icon={{
                            strategy: 'component',
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M15 11V4H4v8.17L5.17 11H6z" opacity=".3" /><path d="M16 13c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10zm-12-.83V4h11v7H5.17L4 12.17zM22 7c0-.55-.45-1-1-1h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7z" /></svg>
                            )
                        }} />
                        IC Tracker</ListItem>
                    <ListItem>
                        <ListItemGraphic icon={{
                            strategy: 'component',
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z" /></svg>
                            )
                        }} />
                        Previous Sets</ListItem>
                    <ListItem>
                        <ListItemGraphic icon={{
                            strategy: 'component',
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5 9.2h3V19H5zM16.2 13H19v6h-2.8zm-5.6-8h2.8v14h-2.8z" /></svg>
                            )
                        }} />
                        Statistics</ListItem>
                </List>
            </DrawerContent>
        </Drawer>
    );
};

export function MobileNavDrawer() {

    const open = React.useState(true);
    return (
        <div>
            <Drawer modal open={open}>
                <DrawerHeader className="nav">
                    <img className="logo" src={logo} alt="logo" />
                    <DrawerTitle>KeycapLendar</DrawerTitle>
                </DrawerHeader>
                <DrawerContent>
                    <List>
                        <ListItem>
                            <ListItemGraphic icon={{
                                strategy: 'component',
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                                )
                            }} />
                            Calendar
              </ListItem>
                        <ListItem>
                            <ListItemGraphic icon={{
                                strategy: 'component',
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" /><path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" /></svg>
                                )
                            }} />
                            Live GBs</ListItem>
                        <ListItem>
                            <ListItemGraphic icon={{
                                strategy: 'component',
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M15 11V4H4v8.17L5.17 11H6z" opacity=".3" /><path d="M16 13c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10zm-12-.83V4h11v7H5.17L4 12.17zM22 7c0-.55-.45-1-1-1h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7z" /></svg>
                                )
                            }} />
                            IC Tracker</ListItem>
                        <ListItem>
                            <ListItemGraphic icon={{
                                strategy: 'component',
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z" /></svg>
                                )
                            }} />
                            Previous Sets</ListItem>
                        <ListItem>
                            <ListItemGraphic icon={{
                                strategy: 'component',
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5 9.2h3V19H5zM16.2 13H19v6h-2.8zm-5.6-8h2.8v14h-2.8z" /></svg>
                                )
                            }} />
                            Statistics</ListItem>
                    </List>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default DesktopNavDrawer;