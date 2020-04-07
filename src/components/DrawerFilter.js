import React from 'react';
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from '@rmwc/drawer';
import { IconButton } from '@rmwc/icon-button';
import { Tooltip } from '@rmwc/tooltip';
import { FormField } from '@rmwc/formfield';
import { Typography } from '@rmwc/typography';
import { CheckboxFilter } from './CheckboxFilter';
import './DrawerFilter.scss';

export class DesktopDrawerFilter extends React.Component {
    handleChange = () => {
        const checkedVendors = document.querySelectorAll('#vendorList input[type=checkbox]:checked');
        let checkedVendorNames = [];
        checkedVendors.forEach((checkbox) => {
            checkedVendorNames.push(checkbox.name);
        });
        const checkedProfiles = document.querySelectorAll('#profileList input[type=checkbox]:checked');
        let checkedProfileNames = [];
        checkedProfiles.forEach((checkbox) => {
            checkedProfileNames.push(checkbox.name);
        });
        this.props.setWhitelist('vendors', checkedVendorNames);
        this.props.setWhitelist('profiles', checkedProfileNames);
    }
    render() {
        return (
            <Drawer dismissible open={this.props.open} className="filter-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Filters</DrawerTitle>
                    <Tooltip enterDelay={500} content="Close" align="bottom"><IconButton className="close-icon" icon="close" onClick={this.props.close} /></Tooltip>
                </DrawerHeader>
                <DrawerContent>
                    <div>
                        <div className="subheader">
                            <Typography use="caption">Profile</Typography>
                        </div>
                        <div id="profileList" className="checkbox-list">
                            {this.props.profiles.map((value) => {
                                return (
                                    <FormField key={'profile-' + value.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}>
                                        <CheckboxFilter label={value} onChange={this.handleChange} />
                                    </FormField>
                                )
                            })}
                        </div>
                    </div>
                    <div>
                        <div className="subheader">
                            <Typography use="caption">Vendor</Typography>
                        </div>
                        <div id="vendorList" className="checkbox-list">
                            {this.props.vendors.map((value) => {
                                return (
                                    <FormField key={'vendor-' + value.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}>
                                        <CheckboxFilter label={value} onChange={this.handleChange} />
                                    </FormField>
                                )
                            })}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }
};

export class TabletDrawerFilter extends React.Component {
    handleChange = () => {
        const checkedVendors = document.querySelectorAll('#vendorList input[type=checkbox]:checked');
        let checkedVendorNames = [];
        checkedVendors.forEach((checkbox) => {
            checkedVendorNames.push(checkbox.name);
        });
        const checkedProfiles = document.querySelectorAll('#profileList input[type=checkbox]:checked');
        let checkedProfileNames = [];
        checkedProfiles.forEach((checkbox) => {
            checkedProfileNames.push(checkbox.name);
        });
        this.props.setWhitelist('vendors', checkedVendorNames);
        this.props.setWhitelist('profiles', checkedProfileNames);
    }
    render() {
        return (
            <Drawer modal open={this.props.open} onClose={this.props.close} className="filter-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Filters</DrawerTitle>
                    <Tooltip enterDelay={500} content="Close" align="bottom"><IconButton className="close-icon" icon="close" onClick={this.props.close} /></Tooltip>
                </DrawerHeader>
                <DrawerContent>
                    <div>
                        <div className="subheader">
                            <Typography use="caption">Profile</Typography>
                        </div>
                        <div id="profileList" className="checkbox-list">
                            {this.props.profiles.map((value) => {
                                return (
                                    <FormField key={'profile-' + value.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}>
                                        <CheckboxFilter label={value} onChange={this.handleChange} />
                                    </FormField>
                                )
                            })}
                        </div>
                    </div>
                    <div>
                        <div className="subheader">
                            <Typography use="caption">Vendor</Typography>
                        </div>
                        <div id="vendorList" className="checkbox-list">
                            {this.props.vendors.map((value) => {
                                return (
                                    <FormField key={'vendor-' + value.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}>
                                        <CheckboxFilter label={value} onChange={this.handleChange} />
                                    </FormField>
                                )
                            })}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }
};

export default DesktopDrawerFilter;