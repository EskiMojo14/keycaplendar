import React from "react";
import PropTypes from "prop-types";
import { whitelistTypes } from "../util/propTypeTemplates";
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
      edited: [false, false, false],
      profiles: {},
      vendors: {},
      shipped: {},
    };
  }
  componentDidMount() {
    const props = ["profiles", "vendors"];
    props.forEach((prop, index) => {
      if (!this.state.edited[index] && this.props[prop].length > 0) {
        let obj = {};
        this.props[prop].forEach((val) => {
          obj[val.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
            name: val,
            checked: this.props.whitelist[prop].includes(val),
          };
        });
        const editedCopy = [].concat(this.state.edited);
        editedCopy[index] = true;
        this.setState({
          edited: editedCopy,
          [prop]: obj,
        });
      }
    });
    if (!this.state.edited[2]) {
      const editedCopy = [].concat(this.state.edited);
      editedCopy[2] = true;
      this.setState({
        edited: editedCopy,
        shipped: {
          shipped: { name: "Shipped", checked: this.props.whitelist.shipped.includes("Shipped") },
          notShipped: { name: "Not shipped", checked: this.props.whitelist.shipped.includes("Not shipped") },
        },
      });
    }
  }
  componentDidUpdate(prevProps) {
    const props = ["profiles", "vendors"];
    props.forEach((prop, index) => {
      if (this.props[prop] !== prevProps[prop] && !this.state.edited[index] && prevProps[prop].length > 0) {
        let obj = {};
        this.props[prop].forEach((val) => {
          obj[val.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
            name: val,
            checked: this.props.whitelist[prop].includes(val),
          };
        });
        const editedCopy = [].concat(this.state.edited);
        editedCopy[index] = true;
        this.setState({
          edited: editedCopy,
          [prop]: obj,
        });
      }
    });
    if (!this.state.edited[2]) {
      const editedCopy = [].concat(this.state.edited);
      editedCopy[2] = true;
      this.setState({
        edited: editedCopy,
        shipped: {
          shipped: { name: "Shipped", checked: this.props.whitelist.shipped.includes("Shipped") },
          notShipped: { name: "Not shipped", checked: this.props.whitelist.shipped.includes("Not shipped") },
        },
      });
    }
  }
  handleChange = (name, prop) => {
    const propCopy = this.state[prop];
    propCopy[name].checked = !propCopy[name].checked;
    this.setState({
      [prop]: propCopy,
    });
    this.setWhitelist(prop);
  };
  setWhitelist = (prop) => {
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
    this.setWhitelist(prop);
  };
  uncheckAll = (prop) => {
    const propCopy = this.state[prop];
    Object.keys(propCopy).forEach((key) => {
      propCopy[key].checked = false;
    });
    this.setState({
      [prop]: propCopy,
    });
    this.setWhitelist(prop);
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
                {Object.keys(this.state.shipped).map((key) => {
                  const shipped = this.state.shipped[key];
                  return (
                    <Chip
                      key={"shipped-" + shipped.name}
                      label={shipped.name}
                      selected={shipped.checked}
                      checkmark
                      onInteraction={() => this.handleChange(key, "shipped")}
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
