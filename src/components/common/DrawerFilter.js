import React from "react";
import PropTypes from "prop-types";
import isEqual from "lodash.isequal";
import { nanoid } from "nanoid";
import { whitelistTypes } from "../util/propTypeTemplates";
import { UserContext } from "../util/contexts";
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

function Preset(name, favorites, profiles, shipped, vendorMode, vendors) {
  this.name = name;
  this.id = nanoid();
  this.whitelist = {
    favorites: favorites,
    profiles: profiles,
    shipped: shipped,
    vendorMode: vendorMode,
    vendors: vendors,
  };
}

const shippedArray = ["Shipped", "Not shipped"];

const presetArray = [
  new Preset("New*", false, [], [], "include", []),
  new Preset("GMK only", false, ["GMK"], ["Shipped", "Not shipped"], "exclude", []),
];

export class DrawerFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      preset: "New*",
    };
  }
  componentDidUpdate = (prevProps) => {
    if (!isEqual(this.props.whitelist, prevProps.whitelist)) {
      this.setPreset();
    }
  };
  findPreset = () => {
    const { edited, ...newWhitelist } = this.props.whitelist;
    const preset = presetArray.filter((preset) => {
      return isEqual(preset.whitelist, newWhitelist);
    })[0];
    return preset;
  };
  setPreset = () => {
    const preset = this.findPreset();
    if (preset) {
      if (this.state.preset !== preset.name) {
        this.setState({ preset: preset.name });
      }
    } else {
      if (this.state.preset !== "New*") {
        this.setState({ preset: "New*" });
      }
    }
  };
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
  savePreset = () => {
    const preset = this.findPreset();
    if (preset) {
      this.props.openPreset(preset);
    } else {
      const { favorites, profiles, shipped, vendorMode, vendors } = this.props.whitelist;
      const newPreset = new Preset("", favorites, profiles, shipped, vendorMode, vendors);
      this.props.openPreset(newPreset);
    }
  };
  handleChange = (name, prop) => {
    const original = this.props.whitelist[prop];
    const edited = prop === "favorites" ? !original : addOrRemove(original, name);
    this.setWhitelist(prop, edited);
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
    const presetMenu = this.context.user.email ? (
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
          <Button label={this.state.preset === "New*" ? "Save" : "Rename"} onClick={this.savePreset} outlined />
          <Button label="Delete" disabled={this.state.preset === "New*"} outlined className="delete" />
        </div>
      </div>
    ) : null;
    const favorites = this.context.user.email ? (
      <div className="group">
        <div className="subheader">
          <Typography use="caption">Favorites</Typography>
        </div>
        <div className="filter-chip-container">
          <ChipSet choice>
            <Chip
              label="Favorites"
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                      d="M16.5 5c-1.54 0-3.04.99-3.56 2.36h-1.87C10.54 5.99 9.04 5 7.5 5 5.5 5 4 6.5 4 8.5c0 2.89 3.14 5.74 7.9 10.05l.1.1.1-.1C16.86 14.24 20 11.39 20 8.5c0-2-1.5-3.5-3.5-3.5z"
                      opacity=".3"
                    />
                    <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
                  </svg>
                ),
              }}
              selected={this.props.whitelist.favorites}
              onInteraction={() => this.handleChange("favorites", "favorites")}
            />
          </ChipSet>
        </div>
      </div>
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
        {presetMenu}
        <DrawerContent>
          {favorites}
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

DrawerFilter.contextType = UserContext;

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
