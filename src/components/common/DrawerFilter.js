import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Preset } from "../../util/constructors";
import { UserContext, DeviceContext } from "../../util/contexts";
import { addOrRemove } from "../../util/functions";
import { whitelistTypes } from "../../util/propTypeTemplates";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { Select } from "@rmwc/select";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./DrawerFilter.scss";

const shippedArray = ["Shipped", "Not shipped"];

export const DrawerFilter = (props) => {
  const { user, preset, presets, selectPreset } = useContext(UserContext);
  const device = useContext(DeviceContext);
  const selectPresetFn = (e) => {
    selectPreset(e.detail.value);
  };

  const newPreset = () => {
    const { favorites, profiles, shipped, vendorMode, vendors } = props.whitelist;
    const newPreset = new Preset("", favorites, profiles, shipped, vendorMode, vendors);
    props.openPreset(newPreset);
  };

  const savePreset = () => {
    if (preset.name !== "Default") {
      const { favorites, profiles, shipped, vendorMode, vendors } = props.whitelist;
      const modifiedPreset = {
        ...preset,
        whitelist: {
          favorites: favorites,
          profiles: profiles,
          shipped: shipped,
          vendorMode: vendorMode,
          vendors: vendors,
        },
      };
      props.openPreset(modifiedPreset);
    }
  };

  const deletePreset = () => {
    if (preset.name !== "Default") {
      props.deletePreset(preset);
    }
  };

  const handleChange = (name, prop) => {
    const original = props.whitelist[prop];
    const edited =
      prop === "favorites"
        ? !original
        : addOrRemove(original, name).sort(function (a, b) {
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

  const copyLink = () => {
    const params = new URLSearchParams(window.location.search);
    const editedArray = props.whitelist.profiles.map((profile) => profile.replace(" ", "-"));
    if (editedArray.length === props.profiles.length) {
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
        props.snackbarQueue.notify({ title: "Copied filtered URL to clipboard." });
      })
      .catch((error) => {
        props.snackbarQueue.notify({ title: "Error copying to clipboard" + error });
      });
  };

  const dismissible = device === "desktop" && props.view !== "compact";

  const closeIcon = dismissible ? (
    <Tooltip enterDelay={500} content="Close" align="bottom">
      <IconButton className="close-icon" icon="close" onClick={props.close} />
    </Tooltip>
  ) : null;

  const presetSelect =
    presets.length > 1 ? (
      <>
        <Select
          outlined
          enhanced
          value={preset.name}
          options={presets.map((preset) => ({
            label: preset.name,
            key: preset.id,
            value: preset.name,
          }))}
          onChange={selectPresetFn}
        />
        <div className="preset-buttons">
          <Button
            label="Save"
            icon={{
              strategy: "component",
              icon: (
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path fill="none" d="M0,0h24v24H0V0z" />
                  <path
                    d="M21,8H3V6h18V8z M18,11H6v2h12V11z M14,17.116V16h-4v2h3.115L14,17.116z M21.04,13.13c0.14,0,0.27,0.06,0.38,0.17l1.28,1.28
	c0.22,0.21,0.22,0.56,0,0.77l-1,1l-2.05-2.05l1-1C20.76,13.19,20.9,13.13,21.04,13.13 M19.07,14.88l2.05,2.05L15.06,23H13v-2.06
	L19.07,14.88"
                  />
                </svg>
              ),
            }}
            outlined
            disabled={preset.name === "Default"}
            onClick={savePreset}
          />
          <Button
            label="Delete"
            icon={{
              strategy: "component",
              icon: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path fill="none" d="M0,0h24v24H0V0z" />
                  <path d="M21 8H3V6H21V8M13.81 16H10V18H13.09C13.21 17.28 13.46 16.61 13.81 16M18 11H6V13H18V11M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z" />
                </svg>
              ),
            }}
            outlined
            disabled={preset.name === "Default"}
            className="delete"
            onClick={deletePreset}
          />
        </div>
      </>
    ) : null;
  const presetMenu = user.email ? (
    <div className="preset-group">
      <div className="subheader">
        <Typography use="caption">Preset</Typography>
      </div>
      <div className="preset-button">
        <Button
          label="New"
          icon={{
            strategy: "component",
            icon: (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                version="1.1"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path fill="none" d="M0,0h24v24H0V0z" />
                <path d="M21 8H3V6H21V8M13.81 16H10V18H13.09C13.21 17.28 13.46 16.61 13.81 16M18 11H6V13H18V11M18 15V18H15V20H18V23H20V20H23V18H20V15H18Z" />
              </svg>
            ),
          }}
          outlined
          onClick={newPreset}
        />
      </div>
      {presetSelect}
    </div>
  ) : null;
  const favorites = user.email ? (
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
            selected={props.whitelist.favorites}
            onInteraction={() => handleChange("favorites", "favorites")}
          />
        </ChipSet>
      </div>
    </div>
  ) : null;
  return (
    <Drawer
      dismissible={dismissible}
      modal={!dismissible}
      open={props.open}
      onClose={props.close}
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
                checkAll("profiles");
              }}
            />
            <Button
              label="None"
              onClick={() => {
                uncheckAll("profiles");
              }}
            />
            <Button
              disabled={
                props.whitelist.profiles.length === props.profiles.length || props.whitelist.profiles.length === 0
              }
              label="Copy link"
              onClick={() => {
                if (
                  props.whitelist.profiles.length !== props.profiles.length &&
                  props.whitelist.profiles.length !== 0
                ) {
                  copyLink();
                }
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
                    selected={props.whitelist.profiles.includes(profile)}
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
                    selected={props.whitelist.shipped.includes(prop)}
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
                selected={props.whitelist.vendorMode === "include"}
              />
              <ToggleGroupButton
                label="Exclude"
                onClick={() => {
                  props.setWhitelist("vendorMode", "exclude");
                }}
                selected={props.whitelist.vendorMode === "exclude"}
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
                    selected={props.whitelist.vendors.includes(vendor)}
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

export default DrawerFilter;

DrawerFilter.propTypes = {
  close: PropTypes.func,
  open: PropTypes.bool,
  profiles: PropTypes.arrayOf(PropTypes.string),
  setWhitelist: PropTypes.func,
  vendors: PropTypes.arrayOf(PropTypes.string),
  view: PropTypes.string,
  whitelist: PropTypes.shape(whitelistTypes),
};
