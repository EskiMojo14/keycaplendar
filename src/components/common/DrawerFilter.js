import React from "react";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./DrawerFilter.scss";

export class DrawerFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edited: false,
      profiles: {},
      vendors: {},
      allProfilesChecked: true,
      allProfilesUnchecked: false,
      allVendorsChecked: true,
      allVendorsUnchecked: false,
    };
  }
  componentDidMount() {
    if (!this.state.edited && this.props.profiles.length > 0) {
      let profiles = {};
      this.props.profiles.forEach((profile) => {
        profiles[profile.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
          name: profile,
          checked: this.props.whitelist.profiles.includes(profile),
        };
      });
      this.setState({
        edited: true,
        profiles: profiles,
      });
      this.checkValues();
    }
    if (!this.state.edited && this.props.vendors.length > 0) {
      let vendors = {};
      this.props.vendors.forEach((vendor) => {
        vendors[vendor.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
          name: vendor,
          checked: this.props.whitelist.vendors.includes(vendor),
        };
      });
      this.setState({
        edited: true,
        vendors: vendors,
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
          checked: this.props.whitelist.profiles.includes(profile),
        };
      });
      this.setState({
        edited: true,
        profiles: profiles,
      });
      this.checkValues();
    }
    if (this.props.vendors !== prevProps.vendors && !this.state.edited && prevProps.vendors.length > 0) {
      let vendors = {};
      this.props.vendors.forEach((vendor) => {
        vendors[vendor.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
          name: vendor,
          checked: this.props.whitelist.vendors.includes(vendor),
        };
      });
      this.setState({
        edited: true,
        vendors: vendors,
      });
      this.checkValues();
    }
  }
  handleChange = (name, prop) => {
    const propCopy = this.state[prop];
    propCopy[name].checked = !propCopy[name].checked;
    this.setState({
      [prop]: propCopy,
    });
    this.changeWhitelist(prop);
    this.checkValues();
  };
  changeWhitelist = (prop) => {
    let whitelist = [];
    Object.keys(this.state[prop]).forEach((key) => {
      const value = this.state[prop][key];
      if (value.checked) {
        whitelist.push(value.name);
      }
    });
    this.props.setWhitelist(prop, whitelist);
  };
  checkAll = (prop) => {
    const propCopy = this.state[prop];
    Object.keys(propCopy).forEach((key) => {
      propCopy[key].checked = true;
    });
    this.setState({
      [prop]: propCopy,
    });
    this.changeWhitelist(prop);
    this.checkValues();
  };
  uncheckAll = (prop) => {
    const propCopy = this.state[prop];
    Object.keys(propCopy).forEach((key) => {
      propCopy[key].checked = false;
    });
    this.setState({
      [prop]: propCopy,
    });
    this.changeWhitelist(prop);
    this.checkValues();
  };
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
      allVendorsUnchecked: allVendorsUnchecked,
    });
  };
  render() {
    const dismissible = this.props.device === "desktop" && this.props.view !== "compact";
    const closeIcon = dismissible ? (
      <Tooltip enterDelay={500} content="Close" align="bottom">
        <IconButton className="close-icon" icon="close" onClick={this.props.close} />
      </Tooltip>
    ) : null;
    return (
      <Drawer
        dismissible={dismissible}
        modal={!dismissible}
        open={this.props.open}
        onClose={this.props.close}
        className="filter-drawer drawer-right"
      >
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          {closeIcon}
        </DrawerHeader>
        <DrawerContent>
          <div className="group">
            <div className="subheader">
              <Typography use="caption">Profile</Typography>
            </div>
            <div className="filter-button-container">
              <Button
                label="All"
                onClick={() => {
                  this.checkAll("profiles");
                }}
              />
              <Button
                label="None"
                onClick={() => {
                  this.uncheckAll("profiles");
                }}
              />
            </div>
            <div className="filter-chip-container">
              <ChipSet filter>
                {Object.keys(this.state.profiles).map((key) => {
                  const profile = this.state.profiles[key];
                  return (
                    <Chip
                      key={"profile-" + profile.name}
                      label={profile.name}
                      selected={profile.checked}
                      checkmark
                      onInteraction={() => this.handleChange(key, "profiles")}
                    />
                  );
                })}
              </ChipSet>
            </div>
          </div>
          <div className="group">
            <div className="subheader">
              <Typography use="caption">Vendor</Typography>
            </div>
            <div className="filter-toggle-button-container">
              <ToggleGroup>
                <ToggleGroupButton
                  label="Include"
                  onClick={() => {
                    this.props.setWhitelist("vendorMode", "include");
                  }}
                  selected={this.props.whitelist.vendorMode === "include"}
                />
                <ToggleGroupButton
                  label="Exclude"
                  onClick={() => {
                    this.props.setWhitelist("vendorMode", "exclude");
                  }}
                  selected={this.props.whitelist.vendorMode === "exclude"}
                />
              </ToggleGroup>
            </div>
            <div className="filter-button-container">
              <Button
                label="All"
                onClick={() => {
                  this.checkAll("vendors");
                }}
              />
              <Button
                label="None"
                onClick={() => {
                  this.uncheckAll("vendors");
                }}
              />
            </div>
            <div className="filter-chip-container">
              <ChipSet filter>
                {Object.keys(this.state.vendors).map((key) => {
                  const vendor = this.state.vendors[key];
                  return (
                    <Chip
                      key={"profile-" + vendor.name}
                      label={vendor.name}
                      selected={vendor.checked}
                      checkmark
                      onInteraction={() => this.handleChange(key, "vendors")}
                    />
                  );
                })}
              </ChipSet>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
}

export default DrawerFilter;
