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
        return (
            <Drawer dismissible open={this.props.open} className="filter-drawer">
                <DrawerHeader dir="ltr">
                    <DrawerTitle>Filters</DrawerTitle>
                    <Tooltip content="Close" align="bottom"><IconButton className="close-icon" icon="close" onClick={this.props.closeFilterDrawer}/></Tooltip>
                </DrawerHeader>
                <DrawerContent dir="ltr">
                <div className="subheader">
                    <Typography use="subtitle2" theme="textSecondaryOnBackground">Vendor</Typography>
                </div>
                <div className="checkbox-list">
                    {this.props.vendors.map((value, index) => {
                        return (
                            <FormField>
                                <CheckboxFilter label={value} key={index}/>
                            </FormField>
                        )
                    })}
                </div>
                </DrawerContent>
            </Drawer>
        );
    }
};

export class TabletDrawerFilter extends React.Component {
    render() {
        return (
            <Drawer modal open={this.props.open} className="filter-drawer">
                <DrawerHeader dir="ltr">
                    <DrawerTitle>Filters</DrawerTitle>
                    <Tooltip content="Close" align="bottom"><IconButton className="close-icon" icon="close" onClick={this.props.closeFilterDrawer}/></Tooltip>
                </DrawerHeader>
                <DrawerContent dir="ltr">
                <div className="subheader">
                    <Typography use="subtitle2" theme="textSecondaryOnBackground">Vendor</Typography>
                </div>
                <div className="checkbox-list">
                        {this.props.vendors.map((value, index) => {
                            return (
                                <FormField>
                                    <CheckboxFilter label={value} key={index}/>
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