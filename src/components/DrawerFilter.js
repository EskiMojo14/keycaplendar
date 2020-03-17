import React from 'react';
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from '@rmwc/drawer';
import { IconButton } from '@rmwc/icon-button';
import { Tooltip } from '@rmwc/tooltip';
import { FormField } from '@rmwc/formfield';
import { Typography } from '@rmwc/typography';
import { CheckboxFilter } from './CheckboxFilter';
import './DrawerFilter.scss';

export class DesktopDrawerFilter extends React.Component {
    render() {
        const vendors = this.props.vendors;
        const profiles = this.props.profiles;
        return (
            <Drawer dismissible open={this.props.open} className="filter-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Filters</DrawerTitle>
                    <Tooltip content="Close" align="bottom"><IconButton className="close-icon" icon="close" onClick={this.props.close} /></Tooltip>
                </DrawerHeader>
                <DrawerContent>
                    <div>
                        <div className="subheader">
                            <Typography use="caption">Vendor</Typography>
                        </div>
                        <div className="checkbox-list">
                            {vendors.map((value) => {
                                return (
                                    <FormField key={'vendor-' + value.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}>
                                        <CheckboxFilter label={value} />
                                    </FormField>
                                )
                            })}
                        </div>
                    </div>
                    <div>
                        <div className="subheader">
                            <Typography use="caption">Profile</Typography>
                        </div>
                        <div className="checkbox-list">
                            {profiles.map((value) => {
                                return (
                                    <FormField key={'profile-' + value.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}>
                                        <CheckboxFilter label={value} />
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
    render() {
        return (
            <Drawer modal open={this.props.open} onClose={this.props.close} className="filter-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Filters</DrawerTitle>
                    <Tooltip content="Close" align="bottom"><IconButton className="close-icon" icon="close" onClick={this.props.close} /></Tooltip>
                </DrawerHeader>
                <DrawerContent>
                    <div className="subheader">
                        <Typography use="subtitle2">Vendor</Typography>
                    </div>
                    <div className="checkbox-list">
                        {this.props.vendors.map((value) => {
                            return (
                                <FormField key={value.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}>
                                    <CheckboxFilter label={value} />
                                </FormField>
                            )
                        })}
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }
};

export default DesktopDrawerFilter;