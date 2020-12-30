import React from "react";
import PropTypes from "prop-types";
import { whitelistTypes, queueTypes } from "../../util/propTypeTemplates";
import { addOrRemove } from "../../util/functions";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";

const shippedArray = ["Shipped", "Not shipped"];

export const DrawerFilterStatistics = (props) => {
  const whitelist = props.statistics.timelineWhitelist;
  const handleChange = (name, prop) => {
    const original = whitelist[prop];
    const edited = addOrRemove(original, name).sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });
    setWhitelist(prop, edited);
  };

  const setWhitelist = (prop, whitelist) => {
    props.setWhitelist(prop, whitelist);
  };

  const checkAll = (prop) => {
    const array = prop === "shipped" ? shippedArray : props[prop];
    setWhitelist(prop, array);
  };

  const uncheckAll = (prop) => {
    setWhitelist(prop, []);
  };
  return (
    <Drawer modal open={props.open} onClose={props.close} className="filter-drawer drawer-right">
      <DrawerHeader>
        <DrawerTitle>Filters</DrawerTitle>
        <Tooltip enterDelay={500} content="Close" align="bottom">
          <IconButton className="close-icon" icon="close" onClick={props.close} />
        </Tooltip>
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
                checkAll("profiles");
              }}
            />
            <Button
              label="None"
              onClick={() => {
                uncheckAll("profiles");
              }}
            />
          </div>
          <div className="filter-chip-container">
            <ChipSet filter>
              {props.profiles.map((profile) => {
                return (
                  <Chip
                    key={"profile-" + profile}
                    label={profile}
                    selected={whitelist.profiles.includes(profile)}
                    checkmark
                    onInteraction={() => handleChange(profile, "profiles")}
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
                checkAll("shipped");
              }}
            />
            <Button
              label="None"
              onClick={() => {
                uncheckAll("shipped");
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
                    selected={whitelist.shipped.includes(prop)}
                    checkmark
                    onInteraction={() => handleChange(prop, "shipped")}
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
                  props.setWhitelist("vendorMode", "include");
                }}
                selected={whitelist.vendorMode === "include"}
              />
              <ToggleGroupButton
                label="Exclude"
                onClick={() => {
                  props.setWhitelist("vendorMode", "exclude");
                }}
                selected={whitelist.vendorMode === "exclude"}
              />
            </ToggleGroup>
          </div>
          <div className="filter-button-container">
            <Button
              label="All"
              onClick={() => {
                checkAll("vendors");
              }}
            />
            <Button
              label="None"
              onClick={() => {
                uncheckAll("vendors");
              }}
            />
          </div>
          <div className="filter-chip-container">
            <ChipSet filter>
              {props.vendors.map((vendor) => {
                return (
                  <Chip
                    key={"profile-" + vendor}
                    label={vendor}
                    selected={whitelist.vendors.includes(vendor)}
                    checkmark
                    onInteraction={() => handleChange(vendor, "vendors")}
                  />
                );
              })}
            </ChipSet>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerFilterStatistics;

DrawerFilterStatistics.propTypes = {
  close: PropTypes.func,
  open: PropTypes.bool,
  profiles: PropTypes.arrayOf(PropTypes.string),
  setWhitelist: PropTypes.func,
  snackbarQueue: PropTypes.shape(queueTypes),
  vendors: PropTypes.arrayOf(PropTypes.string),
  whitelist: PropTypes.shape(whitelistTypes),
};
