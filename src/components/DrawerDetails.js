import React from 'react';
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from '@rmwc/drawer';
import { IconButton } from '@rmwc/icon-button';
import { Icon } from '@rmwc/icon';
import { Chip, ChipSet } from '@rmwc/chip';
import { Tooltip } from '@rmwc/tooltip';
import { Button } from '@rmwc/button';
import { List, ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, ListItemMeta } from '@rmwc/list';
import { Typography } from '@rmwc/typography';
import './DrawerDetails.scss';

export class DesktopDrawerDetails extends React.Component {
    setScroll() {
        const chipSet = document.getElementById('chip-set');
        if (document.querySelector('.mdc-chip-set .mdc-chip--selected')) {
            const selectedChip = document.querySelector('.mdc-chip-set .mdc-chip--selected');
            chipSet.scrollLeft = selectedChip.offsetLeft - 24;
        } else {
            chipSet.scrollLeft = 0;
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.search !== prevProps.search || this.props.set !== prevProps.set) {
            this.setScroll();
        }
    }
    render() {
        const set = this.props.set;
        const today = new Date();
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const nth = function (d) {
            if (d > 3 && d < 21) return 'th';
            switch (d % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };
        let gbLaunch;
        let gbEnd;
        let icDate;
        let verb;
        let ic;
        let gb;
        let vendorList;
        let chips = [];
        const chipsContent = ['profile', 'colorway', 'designer', 'vendors'];
        if (set.icDate) {
            gbLaunch = (set.gbLaunch.includes('Q') ? set.gbLaunch : new Date(set.gbLaunch));
            gbEnd = new Date(set.gbEnd);
            icDate = new Date(set.icDate);
            ic = 'IC posted ' + icDate.getDate() + nth(icDate.getDate()) + '\xa0' + month[icDate.getMonth()] + (icDate.getFullYear() !== today.getFullYear() ? ' ' + icDate.getFullYear() : '') + '.';
            if (gbLaunch <= today && gbEnd >= today) {
                verb = 'Running';
            } else if (gbEnd <= today) {
                verb = 'Ran';
            } else if (gbLaunch > today) {
                verb = 'Will run';
            } else {
                verb = 'Runs';
            };
            if (set.gbLaunch && set.gbEnd) {
                gb = verb + ' from ' + gbLaunch.getDate() + nth(gbLaunch.getDate()) + '\xa0' + month[gbLaunch.getMonth()] + (gbLaunch.getFullYear() !== today.getFullYear() && gbLaunch.getFullYear() !== gbEnd.getFullYear() ? ' ' + gbLaunch.getFullYear() : '') + ' until ' + gbEnd.getDate() + nth(gbEnd.getDate()) + '\xa0' + month[gbEnd.getMonth()] + (gbEnd.getFullYear() !== today.getFullYear() ? ' ' + gbEnd.getFullYear() : '') + '.';
            } else if ((set.gbLaunch ? set.gbLaunch : '').includes('Q')) {
                gb = 'GB expected ' + gbLaunch + '.';
            } else if ((set.gbLaunch ? set.gbLaunch : '')) {
                gb = verb + ' from ' + gbLaunch.getDate() + nth(gbLaunch.getDate()) + '\xa0' + month[gbLaunch.getMonth()] + (gbLaunch.getFullYear() !== today.getFullYear() && gbLaunch.getFullYear() !== gbEnd.getFullYear() ? ' ' + gbLaunch.getFullYear() : '') + '.';
            } else {
                gb = false;
            }
            chipsContent.forEach(prop => {
                if (prop === 'vendors') {
                    set.vendors.forEach((vendor) => {
                        chips.push(vendor.name);
                    })
                } else {
                    if (!Array.isArray(set[prop])) {
                        chips.push(set[prop]);
                    } else {
                        set[prop].forEach(entry => { chips.push(entry) })
                    }
                }
            });
        }
        const gbLine = (gb ? <Typography use="body2" tag="p">{gb}</Typography> : '');
        if (set.vendors) {
            vendorList = (
                <div className="details-list">
                    <Typography className="subheader" use="caption" tag="h4">Vendors</Typography>
                    <List twoLine>
                        {set.vendors.map((vendor, index) => {
                            if (vendor.storeLink !== '') {
                                return (
                                    <ListItem key={index} tag='a' href={vendor.storeLink} target="_blank" rel="noopener noreferrer">
                                        <ListItemText>
                                            <ListItemPrimaryText>{vendor.name}</ListItemPrimaryText>
                                            <ListItemSecondaryText>{vendor.region}</ListItemSecondaryText>
                                        </ListItemText>
                                        <ListItemMeta icon="launch" />
                                    </ListItem>
                                );
                            } else {
                                return (
                                    <ListItem key={index} disabled>
                                        <ListItemText>
                                            <ListItemPrimaryText>{vendor.name}</ListItemPrimaryText>
                                            <ListItemSecondaryText>{vendor.region}</ListItemSecondaryText>
                                        </ListItemText>
                                    </ListItem>
                                );
                            }
                        })}
                    </List>
                </div>)
        } else {
            if (set.storeLink) {
                vendorList = (
                    <div className="details-list">
                        <Typography className="subheader" use="caption" tag="h4">Vendors</Typography>
                        <List>
                            <ListItem tag='a' href={set.storeLink} target="_blank" rel="noopener noreferrer">
                                <ListItemText>
                                    <ListItemPrimaryText>{(set.vendor ? set.vendor : '')}</ListItemPrimaryText>
                                </ListItemText>
                                <ListItemMeta icon="launch" />
                            </ListItem>
                        </List>
                    </div>
                );

            } else {
                vendorList = (
                    <div className="details-list">
                        <Typography className="subheader" use="caption" tag="h4">Vendors</Typography>
                        <List>
                            <ListItem disabled>
                                <ListItemText>
                                    <ListItemPrimaryText>{(set.vendor ? set.vendor : '')}</ListItemPrimaryText>
                                </ListItemText>
                            </ListItem>
                        </List>
                    </div>
                )
            }
        }
        const adminButtons = (this.props.admin ? (
            <div className="admin-buttons">
                <Button className="edit" outlined label="Edit" onClick={() => this.props.edit(set)} icon={{
                    strategy: 'component',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" /><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" /></svg>
                    )
                }} />
                <Button className="delete" outlined danger label="Delete" onClick={() => this.props.delete(this.props.set)} />
            </div>
        ) : '');
        return (
            <Drawer dismissible open={this.props.open} className="details-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Details</DrawerTitle>
                    <Tooltip enterDelay={500} content="Close" align="bottom"><IconButton className="close-icon" icon="close" onClick={this.props.close} /></Tooltip>
                </DrawerHeader>
                <DrawerContent>
                    <div>
                        <div className="details-image" style={{ backgroundImage: 'url(' + set.image + ')' }}></div>
                        <div className="details-text">
                            <Typography use="overline" tag="h3">Designed by {(set.designer ? set.designer.toString().replace(/,/g, " + ") : '')}</Typography>
                            <Typography use="headline4" tag="h1">{(set.profile ? set.profile : '') + ' ' + (set.colorway ? set.colorway : '')}</Typography>
                            {gbLine}
                            <Typography use="body2" tag="p">{ic}</Typography>
                        </div>
                        <div className="details-button">
                            <Button outlined label="Link" tag="a" href={set.details} target="_blank" rel="noopener noreferrer" />
                        </div>
                        {vendorList}
                    </div>
                </DrawerContent>
                {adminButtons}
                <div className="search-chips-container">
                    <div className="search-chips-icon"><Icon icon="search" /></div>
                    <div className="search-chips">
                        <ChipSet id="chip-set" choice>
                            {chips.map((value) => {
                                return (
                                    <Chip label={value} key={value.toLowerCase()} selected={(this.props.search.toLowerCase() === value.toLowerCase())} onClick={() => this.props.setSearch(value)} />
                                )
                            })}
                        </ChipSet>
                    </div>
                </div>
            </Drawer >
        );
    }
};

export class TabletDrawerDetails extends React.Component {
    render() {
        const set = this.props.set;
        const today = new Date();
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const nth = function (d) {
            if (d > 3 && d < 21) return 'th';
            switch (d % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };
        let gbLaunch;
        let gbEnd;
        let icDate;
        let verb;
        let ic;
        let gb;
        let vendorList;
        let chips = [];
        const chipsContent = ['profile', 'colorway', 'designer', 'vendors'];
        if (set.icDate) {
            gbLaunch = (set.gbLaunch.includes('Q') ? set.gbLaunch : new Date(set.gbLaunch));
            gbEnd = new Date(set.gbEnd);
            icDate = new Date(set.icDate);
            ic = 'IC posted ' + icDate.getDate() + nth(icDate.getDate()) + '\xa0' + month[icDate.getMonth()] + (icDate.getFullYear() !== today.getFullYear() ? ' ' + icDate.getFullYear() : '') + '.';
            if (gbLaunch <= today && gbEnd >= today) {
                verb = 'Running';
            } else if (gbEnd <= today) {
                verb = 'Ran';
            } else if (gbLaunch > today) {
                verb = 'Will run';
            } else {
                verb = 'Runs';
            };
            if (set.gbLaunch && set.gbEnd) {
                gb = verb + ' from ' + gbLaunch.getDate() + nth(gbLaunch.getDate()) + '\xa0' + month[gbLaunch.getMonth()] + (gbLaunch.getFullYear() !== today.getFullYear() && gbLaunch.getFullYear() !== gbEnd.getFullYear() ? ' ' + gbLaunch.getFullYear() : '') + ' until ' + gbEnd.getDate() + nth(gbEnd.getDate()) + '\xa0' + month[gbEnd.getMonth()] + (gbEnd.getFullYear() !== today.getFullYear() ? ' ' + gbEnd.getFullYear() : '') + '.';
            } else if ((set.gbLaunch ? set.gbLaunch : '').includes('Q')) {
                gb = 'GB expected ' + gbLaunch + '.';
            } else if ((set.gbLaunch ? set.gbLaunch : '')) {
                gb = verb + ' from ' + gbLaunch.getDate() + nth(gbLaunch.getDate()) + '\xa0' + month[gbLaunch.getMonth()] + (gbLaunch.getFullYear() !== today.getFullYear() && gbLaunch.getFullYear() !== gbEnd.getFullYear() ? ' ' + gbLaunch.getFullYear() : '') + '.';
            } else {
                gb = false;
            }
            chipsContent.forEach(prop => {
                if (prop === 'vendors') {
                    set.vendors.forEach((vendor) => {
                        chips.push(vendor.name);
                    })
                } else {
                    if (!Array.isArray(set[prop])) {
                        chips.push(set[prop]);
                    } else {
                        set[prop].forEach(entry => { chips.push(entry) })
                    }
                }
            });
        }
        const gbLine = (gb ? <Typography use="body2" tag="p">{gb}</Typography> : '');
        if (set.vendors) {
            vendorList = (
                <div className="details-list">
                    <Typography className="subheader" use="caption" tag="h4">Vendors</Typography>
                    <List twoLine>
                        {set.vendors.map((vendor, index) => {
                            if (vendor.storeLink !== '') {
                                return (
                                    <ListItem key={index} tag='a' href={vendor.storeLink} target="_blank" rel="noopener noreferrer">
                                        <ListItemText>
                                            <ListItemPrimaryText>{vendor.name}</ListItemPrimaryText>
                                            <ListItemSecondaryText>{vendor.region}</ListItemSecondaryText>
                                        </ListItemText>
                                        <ListItemMeta icon="launch" />
                                    </ListItem>
                                );
                            } else {
                                return (
                                    <ListItem key={index} disabled>
                                        <ListItemText>
                                            <ListItemPrimaryText>{vendor.name}</ListItemPrimaryText>
                                            <ListItemSecondaryText>{vendor.region}</ListItemSecondaryText>
                                        </ListItemText>
                                    </ListItem>
                                );
                            }
                        })}
                    </List>
                </div>)
        } else {
            if (set.storeLink) {
                vendorList = (
                    <div className="details-list">
                        <Typography className="subheader" use="caption" tag="h4">Vendors</Typography>
                        <List>
                            <ListItem tag='a' href={set.storeLink} target="_blank" rel="noopener noreferrer">
                                <ListItemText>
                                    <ListItemPrimaryText>{(set.vendor ? set.vendor : '')}</ListItemPrimaryText>
                                </ListItemText>
                                <ListItemMeta icon="launch" />
                            </ListItem>
                        </List>
                    </div>
                );

            } else {
                vendorList = (
                    <div className="details-list">
                        <Typography className="subheader" use="caption" tag="h4">Vendors</Typography>
                        <List>
                            <ListItem disabled>
                                <ListItemText>
                                    <ListItemPrimaryText>{(set.vendor ? set.vendor : '')}</ListItemPrimaryText>
                                </ListItemText>
                            </ListItem>
                        </List>
                    </div>
                )
            }
        }
        const adminButtons = (this.props.admin ? (
            <div className="admin-buttons">
                <Button className="edit" outlined label="Edit" onClick={() => this.props.edit(set)} icon={{
                    strategy: 'component',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" /><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" /></svg>
                    )
                }} />
                <Button className="delete" outlined danger label="Delete" onClick={() => this.props.delete(this.props.set)} />
            </div>
        ) : (<div></div>));
        return (
            <Drawer modal open={this.props.open} onClose={this.props.close} className="details-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Details</DrawerTitle>
                </DrawerHeader>
                <DrawerContent>
                    <div className="details-image" style={{ backgroundImage: 'url(' + set.image + ')' }}></div>
                    <div className="details-text">
                        <Typography use="overline" tag="h3">Designed by {(set.designer ? set.designer.toString().replace(/,/g, " + ") : '')}</Typography>
                        <Typography use="headline4" tag="h1">{(set.profile ? set.profile : '') + ' ' + (set.colorway ? set.colorway : '')}</Typography>
                        {gbLine}
                        <Typography use="body2" tag="p">{ic}</Typography>
                    </div>
                    <div className="details-button">
                        <Button outlined label="Link" tag="a" href={set.details} target="_blank" rel="noopener noreferrer" />
                    </div>
                    {vendorList}
                </DrawerContent>
                {adminButtons}
                <div className="search-chips-container">
                    <div className="search-chips-icon"><Icon icon="search" /></div>
                    <div className="search-chips">
                        <ChipSet choice>
                            {chips.map((value) => {
                                return (
                                    <Chip label={value} key={value.toLowerCase()} selected={(this.props.search.toLowerCase() === value.toLowerCase())} onClick={() => {this.props.setSearch(value); this.props.close();}} />
                                )
                            })}
                        </ChipSet>
                    </div>
                </div>
            </Drawer>
        );
    }
};

export default DesktopDrawerDetails;