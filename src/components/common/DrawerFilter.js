import React, { useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import isEqual from "lodash.isequal";
import { Preset } from "../../util/constructors";
import { UserContext, DeviceContext } from "../../util/contexts";
import { addOrRemove } from "../../util/functions";
import { whitelistTypes, queueTypes } from "../../util/propTypeTemplates";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { CollapsibleList, ListItem, ListItemMeta } from "@rmwc/list";
import { Select } from "@rmwc/select";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./DrawerFilter.scss";

const shippedArray = ["Shipped", "Not shipped"];

export const DrawerFilter = (props) => {
  const { user, preset, presets, selectPreset } = useContext(UserContext);
  const device = useContext(DeviceContext);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    const { edited, ...whitelist } = props.whitelist;
    const equal = isEqual(preset.whitelist, whitelist);
    setModified(!equal);
  }, [preset.whitelist, props.whitelist]);

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
      prop === "favorites" || prop === "hidden"
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
    if (prop === "favorites" && edited && props.whitelist.hidden) {
      setWhitelist("all", { ...props.whitelist, hidden: false, favorites: edited });
    } else if (prop === "hidden" && edited && props.whitelist.favorites) {
      setWhitelist("all", { ...props.whitelist, favorites: false, hidden: edited });
    } else {
      setWhitelist(prop, edited);
    }
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
          enhanced={{ fixed: true }}
          value={preset.name}
          options={presets.map((preset) => ({
            label: preset.name,
            key: preset.id,
            value: preset.name,
          }))}
          onChange={selectPresetFn}
          className={modified ? "modified" : ""}
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
    <CollapsibleList
      defaultOpen
      handle={
        <ListItem>
          <Typography use="caption" className="subheader">
            Preset
          </Typography>
          <ListItemMeta icon="expand_more" />
        </ListItem>
      }
      className="preset-collapsible"
    >
      <div className="preset-group">
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
    </CollapsibleList>
  ) : null;
  const userOptions = user.email ? (
    <div className="group">
      <div className="subheader">
        <Typography use="caption">User</Typography>
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
          <Chip
            label="Hidden"
            icon={{
              strategy: "component",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" />
                  <path
                    d="M12 14c.04 0 .08-.01.12-.01l-2.61-2.61c0 .04-.01.08-.01.12 0 1.38 1.12 2.5 2.5 2.5zm1.01-4.79l1.28 1.28c-.26-.57-.71-1.03-1.28-1.28zm7.81 2.29C19.17 8.13 15.79 6 12 6c-.68 0-1.34.09-1.99.22l.92.92c.35-.09.7-.14 1.07-.14 2.48 0 4.5 2.02 4.5 4.5 0 .37-.06.72-.14 1.07l2.05 2.05c.98-.86 1.81-1.91 2.41-3.12zM12 17c.95 0 1.87-.13 2.75-.39l-.98-.98c-.54.24-1.14.37-1.77.37-2.48 0-4.5-2.02-4.5-4.5 0-.63.13-1.23.36-1.77L6.11 7.97c-1.22.91-2.23 2.1-2.93 3.52C4.83 14.86 8.21 17 12 17z"
                    opacity=".3"
                  />
                  <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.59 1.22-1.42 2.27-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm2.28 4.49l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.06-1.07.14L13 9.21c.58.25 1.03.71 1.28 1.28zM2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02-1.38 0-2.5-1.12-2.5-2.5 0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75c-.23.55-.36 1.15-.36 1.78 0 2.48 2.02 4.5 4.5 4.5.63 0 1.23-.13 1.77-.36l.98.98c-.88.24-1.8.38-2.75.38-3.79 0-7.17-2.13-8.82-5.5.7-1.43 1.72-2.61 2.93-3.53z" />
                </svg>
              ),
            }}
            selected={props.whitelist.hidden}
            onInteraction={() => handleChange("hidden", "hidden")}
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
        {userOptions}
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
  deletePreset: PropTypes.func,
  open: PropTypes.bool,
  openPreset: PropTypes.func,
  profiles: PropTypes.arrayOf(PropTypes.string),
  setWhitelist: PropTypes.func,
  snackbarQueue: PropTypes.shape(queueTypes),
  vendors: PropTypes.arrayOf(PropTypes.string),
  view: PropTypes.string,
  whitelist: PropTypes.shape(whitelistTypes),
};
