import React from "react";
import PropTypes from "prop-types";
import { whitelistTypes } from "../util/propTypeTemplates";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { Select } from "@rmwc/select";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./DrawerFilter.scss";

const addOrRemove = (oldArray, value) => {
  const array = [...oldArray];
  const index = array.indexOf(value);

  if (index === -1) {
    array.push(value);
  } else {
    array.splice(index, 1);
  }

  return array;
};

function Preset(name, profiles, shipped, vendorMode, vendors) {
  this.name = name;
  this.whitelist = {
    profiles: profiles,
    shipped: shipped,
    vendorMode: vendorMode,
    vendors: vendors,
  };
}

const shippedArray = ["Shipped", "Not shipped"];

const presetArray = [
  new Preset("None", [], [], "include", []),
  new Preset("GMK only", ["GMK"], ["Shipped", "Not shipped"], "exclude", []),
];

export class DrawerFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preset: "None",
    };
  }
  selectPreset = (e) => {
    const opt = e.detail.value;
    this.setState({ preset: opt });
    const preset = presetArray.filter((preset) => {
      return preset.name === opt;
    })[0];
    if (preset) {
      this.setWhitelist("all", preset.whitelist);
    }
  };
  handleChange = (name, prop) => {
    const array = this.props.whitelist[prop];
    const editedArray = addOrRemove(array, name);
    this.setWhitelist(prop, editedArray);
  };
  setWhitelist = (prop, whitelist) => {
    this.props.setWhitelist(prop, whitelist);
  };
  checkAll = (prop) => {
    const array = prop === "shipped" ? shippedArray : this.props[prop];
    this.setWhitelist(prop, array);
  };
  uncheckAll = (prop) => {
    this.setWhitelist(prop, []);
  };
  copyLink = () => {
    const params = new URLSearchParams(window.location.search);
    const editedArray = this.props.whitelist.profiles.map((profile) => profile.replace(" ", "-"));
    if (editedArray.length === this.props.profiles.length) {
      params.delete("profile");
      params.delete("profiles");
    } else if (editedArray.length === 1) {
      params.delete("profiles");
      params.set("profile", editedArray.join(" "));
    } else {
      params.delete("profile");
      params.set("profiles", editedArray.join(" "));
    }
    const url = window.location.href.split("?")[0] + "?" + params.toString();
    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.props.snackbarQueue.notify({ title: "Copied filtered URL to clipboard." });
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error copying to clipboard" + error });
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
        <div className="preset-group">
          <div className="subheader">
            <Typography use="caption">Preset</Typography>
          </div>
          <Select
            outlined
            enhanced
            value={this.state.preset}
            options={presetArray.map((preset) => preset.name)}
            onChange={this.selectPreset}
          />
          <div className="preset-buttons">
            <Button label="Save" outlined />
            <Button label="Delete" outlined className="delete" />
          </div>
        </div>
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
              <Button
                disabled={
                  this.props.whitelist.profiles.length === this.props.profiles.length ||
                  this.props.whitelist.profiles.length === 0
                }
                label="Copy link"
                onClick={() => {
                  if (
                    this.props.whitelist.profiles.length !== this.props.profiles.length &&
                    this.props.whitelist.profiles.length !== 0
                  ) {
                    this.copyLink();
                  }
                }}
              />
            </div>
            <div className="filter-chip-container">
              <ChipSet filter>
                {this.props.profiles.map((profile) => {
                  return (
                    <Chip
                      key={"profile-" + profile}
                      label={profile}
                      selected={this.props.whitelist.profiles.includes(profile)}
                      checkmark
                      onInteraction={() => this.handleChange(profile, "profiles")}
                    />
                  );
                })}
              </ChipSet>
            </div>
          </div>
          <div className="group">
            <div className="subheader">
              <Typography use="caption">Shipped</Typography>
            </div>
            <div className="filter-button-container">
              <Button
                label="All"
                onClick={() => {
                  this.checkAll("shipped");
                }}
              />
              <Button
                label="None"
                onClick={() => {
                  this.uncheckAll("shipped");
                }}
              />
            </div>
            <div className="filter-chip-container">
              <ChipSet filter>
                {shippedArray.map((prop) => {
                  return (
                    <Chip
                      key={"shipped-" + prop}
                      label={prop}
                      selected={this.props.whitelist.shipped.includes(prop)}
                      checkmark
                      onInteraction={() => this.handleChange(prop, "shipped")}
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
                {this.props.vendors.map((vendor) => {
                  return (
                    <Chip
                      key={"profile-" + vendor}
                      label={vendor}
                      selected={this.props.whitelist.vendors.includes(vendor)}
                      checkmark
                      onInteraction={() => this.handleChange(vendor, "vendors")}
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

DrawerFilter.propTypes = {
  close: PropTypes.func,
  device: PropTypes.string,
  open: PropTypes.bool,
  profiles: PropTypes.arrayOf(PropTypes.string),
  setWhitelist: PropTypes.func,
  vendors: PropTypes.arrayOf(PropTypes.string),
  view: PropTypes.string,
  whitelist: PropTypes.shape(whitelistTypes),
};
