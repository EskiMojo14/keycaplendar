import React from 'react';
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from '@rmwc/drawer';
import { IconButton } from '@rmwc/icon-button';
import { Tooltip } from '@rmwc/tooltip';
import { FormField } from '@rmwc/formfield';
import { Typography } from '@rmwc/typography';
import { Checkbox } from '@rmwc/checkbox';
import './DrawerFilter.scss';

export class DesktopDrawerFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            edited: false,
            profiles: {},
            vendors: {},
            allProfilesChecked: true,
            allProfilesUnchecked: false,
            allVendorsChecked: true,
            allVendorsUnchecked: false
        }
    }
    componentDidMount() {
        if (!this.state.edited && this.props.profiles.length > 0) {
            let profiles = {};
            this.props.profiles.forEach((profile) => {
                profiles[profile.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
                    name: profile,
                    checked: (this.props.whitelist.profiles.indexOf(profile) > -1 ? true : false)
                }
            });
            this.setState({
                edited: true,
                profiles: profiles
            });
            this.checkValues();
        }
        if (!this.state.edited && this.props.vendors.length > 0) {
            let vendors = {};
            this.props.vendors.forEach((vendor) => {
                vendors[vendor.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
                    name: vendor,
                    checked: (this.props.whitelist.vendors.indexOf(vendor) > -1 ? true : false)
                }
            });
            this.setState({
                edited: true,
                vendors: vendors
            });
            this.checkValues();
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.profiles !== prevProps.profiles && !this.state.edited && prevProps.profiles.length > 0) {
            let profiles = {};
            this.props.profiles.forEach((profile) => {
                profiles[profile.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
                    name: profile,
                    checked: (this.props.whitelist.profiles.indexOf(profile) > -1 ? true : false)
                }
            });
            this.setState({
                edited: true,
                profiles: profiles
            });
            this.checkValues();
        }
        if (this.props.vendors !== prevProps.vendors && !this.state.edited && prevProps.vendors.length > 0) {
            let vendors = {};
            this.props.vendors.forEach((vendor) => {
                vendors[vendor.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
                    name: vendor,
                    checked: (this.props.whitelist.vendors.indexOf(vendor) > -1 ? true : false)
                }
            });
            this.setState({
                edited: true,
                vendors: vendors
            });
            this.checkValues();
        }
    }
    handleChange = (e, prop) => {
        const propCopy = this.state[prop];
        propCopy[e.target.name].checked = e.target.checked;
        this.setState({
            [prop]: propCopy
        });
        this.changeWhitelist(prop);
        this.checkValues();
    }
    changeWhitelist = (prop) => {
        let whitelist = [];
        Object.keys(this.state[prop]).forEach((key) => {
            const value = this.state[prop][key];
            if (value.checked) {
                whitelist.push(value.name);
            }
        });
        this.props.setWhitelist(prop, whitelist);
    }
    checkAll = (prop) => {
        const propCopy = this.state[prop];
        Object.keys(propCopy).forEach((key) => {
            propCopy[key].checked = true;
        });
        this.setState({
            [prop]: propCopy
        });
        this.changeWhitelist(prop);
        this.checkValues();
    }
    uncheckAll = (prop) => {
        const propCopy = this.state[prop];
        Object.keys(propCopy).forEach((key) => {
            propCopy[key].checked = false;
        });
        this.setState({
            [prop]: propCopy
        });
        this.changeWhitelist(prop);
        this.checkValues();
    }
    checkValues = () => {
        const profiles = this.state.profiles;
        const vendors = this.state.vendors;
        let allProfilesChecked = true;
        let allVendorsChecked = true;
        Object.keys(profiles).forEach((key) => {
            if (profiles[key].checked === false) {
                allProfilesChecked = false;
            }
        });
        Object.keys(vendors).forEach((key) => {
            if (vendors[key].checked === false) {
                allVendorsChecked = false;
            }
        });
        let allProfilesUnchecked = true;
        let allVendorsUnchecked = true;
        Object.keys(profiles).forEach((key) => {
            if (profiles[key].checked === true) {
                allProfilesUnchecked = false;
            }
        });
        Object.keys(vendors).forEach((key) => {
            if (vendors[key].checked === true) {
                allVendorsUnchecked = false;
            }
        });
        this.setState({
            allProfilesChecked: allProfilesChecked,
            allProfilesUnchecked: allProfilesUnchecked,
            allVendorsChecked: allVendorsChecked,
            allVendorsUnchecked: allVendorsUnchecked
        });
    }
    render() {
        return (
            <Drawer dismissible open={this.props.open} className="filter-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Filters</DrawerTitle>
                    <Tooltip enterDelay={500} content="Close" align="bottom"><IconButton className="close-icon" icon="close" onClick={this.props.close} /></Tooltip>
                </DrawerHeader>
                <DrawerContent>
                    <div className="group">
                        <div className="subheader">
                            <Typography use="caption">Profile</Typography>
                        </div>
                        <div className="select-all">
                            <FormField>
                                <Checkbox label="Select all" checked={this.state.allProfilesChecked} indeterminate={(!this.state.allProfilesChecked && !this.state.allProfilesUnchecked)} onClick={() => { if (!this.state.allProfilesChecked) { this.checkAll('profiles') } else { this.uncheckAll('profiles') } }} />
                            </FormField>
                        </div>
                        <div id="profileList" className="checkbox-list">
                            {Object.keys(this.state.profiles).map((key) => {
                                const profile = this.state.profiles[key];
                                return (
                                    <FormField key={'profile-' + profile.name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}>
                                        <Checkbox checked={profile.checked} name={profile.name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())} label={profile.name} onChange={(e) => this.handleChange(e, 'profiles')} />
                                    </FormField>
                                )
                            })}
                        </div>
                    </div>
                    <div className="group">
                        <div className="subheader">
                            <Typography use="caption">Vendor</Typography>
                        </div>
                        <div className="select-all">
                            <FormField>
                                <Checkbox label="Select all" checked={this.state.allVendorsChecked} indeterminate={(!this.state.allVendorsChecked && !this.state.allVendorsUnchecked)} onClick={() => { if (!this.state.allVendorsChecked) { this.checkAll('vendors') } else { this.uncheckAll('vendors') } }} />
                            </FormField>
                        </div>
                        <div id="vendorList" className="checkbox-list">
                            {Object.keys(this.state.vendors).map((key) => {
                                const vendor = this.state.vendors[key];
                                return (
                                    <FormField key={'profile-' + vendor.name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}>
                                        <Checkbox checked={vendor.checked} name={vendor.name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())} label={vendor.name} onChange={(e) => this.handleChange(e, 'vendors')} />
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
    constructor(props) {
        super(props);
        this.state = {
            edited: false,
            profiles: {},
            vendors: {},
            allProfilesChecked: true,
            allProfilesUnchecked: false,
            allVendorsChecked: true,
            allVendorsUnchecked: false
        }
    }
    componentDidMount() {
        if (!this.state.edited && this.props.profiles.length > 0) {
            let profiles = {};
            this.props.profiles.forEach((profile) => {
                profiles[profile.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
                    name: profile,
                    checked: (this.props.whitelist.profiles.indexOf(profile) > -1 ? true : false)
                }
            });
            this.setState({
                edited: true,
                profiles: profiles
            });
            this.checkValues();
        }
        if (!this.state.edited && this.props.vendors.length > 0) {
            let vendors = {};
            this.props.vendors.forEach((vendor) => {
                vendors[vendor.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
                    name: vendor,
                    checked: (this.props.whitelist.vendors.indexOf(vendor) > -1 ? true : false)
                }
            });
            this.setState({
                edited: true,
                vendors: vendors
            });
            this.checkValues();
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.profiles !== prevProps.profiles && !this.state.edited && prevProps.profiles.length > 0) {
            let profiles = {};
            this.props.profiles.forEach((profile) => {
                profiles[profile.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
                    name: profile,
                    checked: (this.props.whitelist.profiles.indexOf(profile) > -1 ? true : false)
                }
            });
            this.setState({
                edited: true,
                profiles: profiles
            });
            this.checkValues();
        }
        if (this.props.vendors !== prevProps.vendors && !this.state.edited && prevProps.vendors.length > 0) {
            let vendors = {};
            this.props.vendors.forEach((vendor) => {
                vendors[vendor.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
                    name: vendor,
                    checked: (this.props.whitelist.vendors.indexOf(vendor) > -1 ? true : false)
                }
            });
            this.setState({
                edited: true,
                vendors: vendors
            });
            this.checkValues();
        }
    }
    handleChange = (e, prop) => {
        const propCopy = this.state[prop];
        propCopy[e.target.name].checked = e.target.checked;
        this.setState({
            [prop]: propCopy
        });
        this.changeWhitelist(prop);
        this.checkValues();
    }
    changeWhitelist = (prop) => {
        let whitelist = [];
        Object.keys(this.state[prop]).forEach((key) => {
            const value = this.state[prop][key];
            if (value.checked) {
                whitelist.push(value.name);
            }
        });
        this.props.setWhitelist(prop, whitelist);
    }
    checkAll = (prop) => {
        const propCopy = this.state[prop];
        Object.keys(propCopy).forEach((key) => {
            propCopy[key].checked = true;
        });
        this.setState({
            [prop]: propCopy
        });
        this.changeWhitelist(prop);
        this.checkValues();
    }
    uncheckAll = (prop) => {
        const propCopy = this.state[prop];
        Object.keys(propCopy).forEach((key) => {
            propCopy[key].checked = false;
        });
        this.setState({
            [prop]: propCopy
        });
        this.changeWhitelist(prop);
        this.checkValues();
    }
    checkValues = () => {
        const profiles = this.state.profiles;
        const vendors = this.state.vendors;
        let allProfilesChecked = true;
        let allVendorsChecked = true;
        Object.keys(profiles).forEach((key) => {
            if (profiles[key].checked === false) {
                allProfilesChecked = false;
            }
        });
        Object.keys(vendors).forEach((key) => {
            if (vendors[key].checked === false) {
                allVendorsChecked = false;
            }
        });
        let allProfilesUnchecked = true;
        let allVendorsUnchecked = true;
        Object.keys(profiles).forEach((key) => {
            if (profiles[key].checked === true) {
                allProfilesUnchecked = false;
            }
        });
        Object.keys(vendors).forEach((key) => {
            if (vendors[key].checked === true) {
                allVendorsUnchecked = false;
            }
        });
        this.setState({
            allProfilesChecked: allProfilesChecked,
            allProfilesUnchecked: allProfilesUnchecked,
            allVendorsChecked: allVendorsChecked,
            allVendorsUnchecked: allVendorsUnchecked
        });
    }
    render() {
        return (
            <Drawer modal open={this.props.open} onClose={this.props.close} className="filter-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Filters</DrawerTitle>
                </DrawerHeader>
                <DrawerContent>
                    <div className="group">
                        <div className="subheader">
                            <Typography use="caption">Profile</Typography>
                        </div>
                        <div className="select-all">
                            <FormField>
                                <Checkbox label="Select all" checked={this.state.allProfilesChecked} indeterminate={(!this.state.allProfilesChecked && !this.state.allProfilesUnchecked)} onClick={() => { if (!this.state.allProfilesChecked) { this.checkAll('profiles') } else { this.uncheckAll('profiles') } }} />
                            </FormField>
                        </div>
                        <div id="profileList" className="checkbox-list">
                            {Object.keys(this.state.profiles).map((key) => {
                                const profile = this.state.profiles[key];
                                return (
                                    <FormField key={'profile-' + profile.name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}>
                                        <Checkbox checked={profile.checked} name={profile.name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())} label={profile.name} onChange={(e) => this.handleChange(e, 'profiles')} />
                                    </FormField>
                                )
                            })}
                        </div>
                    </div>
                    <div className="group">
                        <div className="subheader">
                            <Typography use="caption">Vendor</Typography>
                        </div>
                        <div className="select-all">
                            <FormField>
                                <Checkbox label="Select all" checked={this.state.allVendorsChecked} indeterminate={(!this.state.allVendorsChecked && !this.state.allVendorsUnchecked)} onClick={() => { if (!this.state.allVendorsChecked) { this.checkAll('vendors') } else { this.uncheckAll('vendor') } }} />
                            </FormField>
                        </div>
                        <div id="vendorList" className="checkbox-list">
                            {Object.keys(this.state.vendors).map((key) => {
                                const vendor = this.state.vendors[key];
                                return (
                                    <FormField key={'profile-' + vendor.name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}>
                                        <Checkbox checked={vendor.checked} name={vendor.name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())} label={vendor.name} onChange={(e) => this.handleChange(e, 'vendors')} />
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