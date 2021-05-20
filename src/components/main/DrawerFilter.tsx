import React, { useContext, useState, useEffect } from "react";
import isEqual from "lodash.isequal";
import classNames from "classnames";
import { useAppSelector } from "../../app/hooks";
import { selectDevice } from "../../app/slices/common/commonSlice";
import { addOrRemove, alphabeticalSort, hasKey, iconObject } from "../../app/slices/common/functions";
import { whitelistParams, whitelistShipped } from "../../app/slices/main/constants";
import { Preset, Whitelist } from "../../app/slices/main/constructors";
import { PresetType, SortType, WhitelistType } from "../../app/slices/main/types";
import { selectMainView } from "../../app/slices/settings/settingsSlice";
import { selectUser, selectUserPresets } from "../../app/slices/user/userSlice";
import { UserContext } from "../../app/slices/user/contexts";
import { queue } from "../../app/snackbarQueue";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { Icon } from "@rmwc/icon";
import { IconButton } from "@rmwc/icon-button";
import { CollapsibleList, ListItem, ListItemMeta } from "@rmwc/list";
import { Select } from "@rmwc/select";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { SegmentedButton, SegmentedButtonSegment } from "../util/SegmentedButton";
import "./DrawerFilter.scss";

type DrawerFilterProps = {
  appPresets: PresetType[];
  close: () => void;
  deletePreset: (preset: PresetType) => void;
  open: boolean;
  openPreset: (preset: PresetType) => void;
  profiles: string[];
  setWhitelist: <T extends keyof WhitelistType>(prop: T, whitelist: WhitelistType[T]) => void;
  setWhitelistMerge: (partialWhitelist: Partial<WhitelistType>) => void;
  sort: SortType;
  vendors: string[];
  regions: string[];
  whitelist: WhitelistType;
};

export const DrawerFilter = (props: DrawerFilterProps) => {
  const view = useAppSelector(selectMainView);
  const device = useAppSelector(selectDevice);
  const user = useAppSelector(selectUser);
  const presets = useAppSelector(selectUserPresets);
  const { preset, selectPreset } = useContext(UserContext);
  const [modified, setModified] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { edited, ...whitelist } = props.whitelist;
    const equal = isEqual(preset.whitelist, whitelist);
    setModified(!equal);
  }, [preset.whitelist, props.whitelist]);

  const selectPresetFn = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectPreset(e.target.value);
  };

  const newPreset = (global = false) => {
    const { favorites, hidden, profiles, shipped, regions, vendorMode, vendors } = props.whitelist;
    const newWhitelist = new Whitelist(favorites, hidden, profiles, shipped, regions, vendorMode, vendors);
    const newPreset = new Preset("", global, newWhitelist);
    props.openPreset(newPreset);
  };

  const savePreset = () => {
    const { favorites, hidden, profiles, shipped, regions, vendorMode, vendors } = props.whitelist;
    const modifiedPreset = {
      ...preset,
      whitelist: {
        favorites: favorites,
        hidden: hidden,
        profiles: profiles,
        shipped: shipped,
        regions: regions,
        vendorMode: vendorMode,
        vendors: vendors,
      },
    };
    props.openPreset(modifiedPreset);
  };

  const deletePreset = () => {
    if (preset.id !== "default") {
      props.deletePreset(preset);
    }
  };

  const handleChange = (name: string, prop: string) => {
    if (hasKey(props.whitelist, prop)) {
      const original = props.whitelist[prop];
      const edited =
        typeof original === "boolean"
          ? !original
          : original instanceof Array
          ? alphabeticalSort(addOrRemove(original, name))
          : original === "include"
          ? "exclude"
          : "include";
      if (typeof edited === "boolean") {
        if (prop === "favorites" && edited && props.whitelist.hidden) {
          props.setWhitelistMerge({ hidden: false, favorites: edited });
        } else if (prop === "hidden" && edited && props.whitelist.favorites) {
          props.setWhitelistMerge({ favorites: false, hidden: edited });
        } else {
          props.setWhitelist(prop, edited);
        }
      } else {
        props.setWhitelist(prop, edited);
      }
    }
  };

  const checkAll = (prop: string) => {
    if (hasKey(props, prop) && (prop === "profiles" || prop === "vendors" || prop === "regions")) {
      const all = props[prop];
      props.setWhitelist(prop, all);
    } else if (prop === "shipped") {
      props.setWhitelist(prop, [...whitelistShipped]);
    }
  };

  const uncheckAll = (prop: string) => {
    if (hasKey(props, prop) && hasKey(props.whitelist, prop)) {
      if (props[prop] instanceof Array) {
        props.setWhitelist(prop, []);
      }
    } else if (prop === "shipped") {
      props.setWhitelist(prop, []);
    }
  };

  const invertAll = (prop: string) => {
    if (hasKey(props, prop) && (prop === "profiles" || prop === "vendors" || prop === "regions")) {
      const all = props[prop];
      const inverted = all.filter((value) => !props.whitelist[prop].includes(value));
      props.setWhitelist(prop, inverted);
    } else if (prop === "shipped") {
      const inverted = whitelistShipped.filter((value) => !props.whitelist[prop].includes(value));
      props.setWhitelist(prop, inverted);
    }
  };

  const copyLink = () => {
    const params = new URLSearchParams(window.location.search);
    whitelistParams.forEach((param) => {
      if (param === "profile" || param === "region" || param === "vendor") {
        const plural = param + "s";
        const whitelist = props.whitelist;
        if (hasKey(whitelist, plural)) {
          const array = whitelist[plural];
          if (array instanceof Array && array.length === 1) {
            params.set(param, array.map((item: string) => item.replace(" ", "-")).join(" "));
          } else {
            params.delete(param);
          }
        }
      } else if (param === "vendorMode") {
        if (props.whitelist.vendorMode !== "exclude") {
          params.set(param, props.whitelist[param]);
        } else {
          params.delete(param);
        }
      } else if (param === "profiles" || param === "shipped" || param === "regions" || param === "vendors") {
        const lengths = {
          profiles: props.profiles.length,
          shipped: 2,
          vendors: 0,
          regions: props.regions.length,
        };
        if (param === "profiles" || param === "regions" || param === "vendors") {
          if (props.whitelist[param].length > 1 && props.whitelist[param].length !== lengths[param]) {
            params.set(param, props.whitelist[param].map((profile) => profile.replace(" ", "-")).join(" "));
          } else {
            params.delete(param);
          }
        } else {
          if (props.whitelist[param].length !== lengths[param]) {
            params.set(param, props.whitelist[param].map((item) => item.replace(" ", "-")).join(" "));
          } else {
            params.delete(param);
          }
        }
      }
    });
    const url = window.location.href.split("?")[0] + "?" + params.toString();
    navigator.clipboard
      .writeText(url)
      .then(() => {
        queue.notify({ title: "Copied filtered URL to clipboard." });
      })
      .catch((error) => {
        queue.notify({ title: "Error copying to clipboard" + error });
      });
  };

  const dismissible = device === "desktop" && view !== "compact";

  const closeIcon = dismissible ? (
    <Tooltip enterDelay={500} content="Close" align="bottom">
      <IconButton className="close-icon" icon="close" onClick={props.close} />
    </Tooltip>
  ) : null;

  const newPresetButton = user.isAdmin ? (
    <div className="preset-buttons">
      <Button
        label="New"
        icon={iconObject(
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
        )}
        outlined
        onClick={() => {
          newPreset();
        }}
      />
      <Button
        label="New"
        icon={iconObject(
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            version="1.1"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path fill="none" d="M0,0h24v24H0V0z" />
            <path
              opacity=".3"
              d="M11,18v1.9c-3.9-0.5-7-3.9-7-7.9c0-0.6,0.1-1.2,0.2-1.8L9,15v1C9,17.1,9.9,18,11,18z M15,13v3h0
	c0.9-1.2,2.3-2,4-2c0.2,0,0.5,0,0.7,0.1c0.2-0.7,0.3-1.4,0.3-2.1c0-3.3-2.1-6.2-5-7.4V5c0,1.1-0.9,2-2,2h-2v2c0,0.5-0.5,1-1,1H8v2h6
	C14.5,12,15,12.5,15,13z"
            />
            <path
              d="M14,19c0-1.1,0.4-2.2,1-3h0v-3c0-0.5-0.5-1-1-1H8v-2h2c0.5,0,1-0.5,1-1V7h2c1.1,0,2-0.9,2-2V4.6c2.9,1.2,5,4.1,5,7.4
	c0,0.7-0.1,1.4-0.3,2.1c0.7,0.1,1.3,0.3,1.9,0.7C21.9,13.9,22,13,22,12c0-5.5-4.5-10-10-10S2,6.5,2,12s4.5,10,10,10
	c1,0,1.9-0.1,2.8-0.4C14.3,20.8,14,20,14,19z M11,19.9c-3.9-0.5-7-3.9-7-7.9c0-0.6,0.1-1.2,0.2-1.8L9,15v1c0,1.1,0.9,2,2,2V19.9z
	 M22,20h-2v2h-2v-2h-2v-2h2v-2h2v2h2V20z"
            />
          </svg>
        )}
        outlined
        onClick={() => {
          newPreset(true);
        }}
      />
    </div>
  ) : (
    <div className="preset-button">
      <Button
        label="New"
        icon={iconObject(
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
        )}
        outlined
        onClick={() => {
          newPreset();
        }}
      />
    </div>
  );

  const userPresetOptions = user.email ? (
    <>
      {newPresetButton}
      <div className="preset-buttons">
        <Button
          label="Save"
          icon={iconObject(
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
          )}
          outlined
          disabled={
            (user.isAdmin && preset.id === "default") ||
            (!user.isAdmin && props.appPresets.map((preset) => preset.id).includes(preset.id))
          }
          onClick={savePreset}
        />
        <Button
          label="Delete"
          icon={iconObject(
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
          )}
          outlined
          disabled={
            (user.isAdmin && preset.id === "default") ||
            (!user.isAdmin && props.appPresets.map((preset) => preset.id).includes(preset.id))
          }
          className="delete"
          onClick={deletePreset}
        />
      </div>
    </>
  ) : null;

  const userFilterOptions = user.email ? (
    <div className="group">
      <CollapsibleList
        defaultOpen
        handle={
          <ListItem>
            <Typography use="caption" className="subheader">
              User
            </Typography>
            <ListItemMeta icon="expand_more" />
          </ListItem>
        }
        className="group-collapsible"
      >
        <div className="filter-chip-container">
          <ChipSet choice>
            <Chip
              label="Favorites"
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path
                    d="M16.5 5c-1.54 0-3.04.99-3.56 2.36h-1.87C10.54 5.99 9.04 5 7.5 5 5.5 5 4 6.5 4 8.5c0 2.89 3.14 5.74 7.9 10.05l.1.1.1-.1C16.86 14.24 20 11.39 20 8.5c0-2-1.5-3.5-3.5-3.5z"
                    opacity=".3"
                  />
                  <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
                </svg>
              )}
              selected={props.whitelist.favorites}
              onInteraction={() => handleChange("favorites", "favorites")}
            />
            <Chip
              label="Hidden"
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" />
                  <path
                    d="M12 14c.04 0 .08-.01.12-.01l-2.61-2.61c0 .04-.01.08-.01.12 0 1.38 1.12 2.5 2.5 2.5zm1.01-4.79l1.28 1.28c-.26-.57-.71-1.03-1.28-1.28zm7.81 2.29C19.17 8.13 15.79 6 12 6c-.68 0-1.34.09-1.99.22l.92.92c.35-.09.7-.14 1.07-.14 2.48 0 4.5 2.02 4.5 4.5 0 .37-.06.72-.14 1.07l2.05 2.05c.98-.86 1.81-1.91 2.41-3.12zM12 17c.95 0 1.87-.13 2.75-.39l-.98-.98c-.54.24-1.14.37-1.77.37-2.48 0-4.5-2.02-4.5-4.5 0-.63.13-1.23.36-1.77L6.11 7.97c-1.22.91-2.23 2.1-2.93 3.52C4.83 14.86 8.21 17 12 17z"
                    opacity=".3"
                  />
                  <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.59 1.22-1.42 2.27-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm2.28 4.49l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.06-1.07.14L13 9.21c.58.25 1.03.71 1.28 1.28zM2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02-1.38 0-2.5-1.12-2.5-2.5 0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75c-.23.55-.36 1.15-.36 1.78 0 2.48 2.02 4.5 4.5 4.5.63 0 1.23-.13 1.77-.36l.98.98c-.88.24-1.8.38-2.75.38-3.79 0-7.17-2.13-8.82-5.5.7-1.43 1.72-2.61 2.93-3.53z" />
                </svg>
              )}
              selected={props.whitelist.hidden}
              onInteraction={() => handleChange("hidden", "hidden")}
            />
          </ChipSet>
        </div>
      </CollapsibleList>
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
          <Select
            outlined
            icon={
              presets.length > 0
                ? presets.map((preset) => preset.id).includes(preset.id)
                  ? iconObject(
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M12 16c-2.69 0-5.77 1.28-6 2h12c-.2-.71-3.3-2-6-2z" opacity=".3" />
                        <circle cx="12" cy="8" opacity=".3" r="2" />
                        <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2 2.7 0 5.8 1.29 6 2H6zm6-6c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
                      </svg>
                    )
                  : iconObject(
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path
                          d="M14.99 4.59V5c0 1.1-.9 2-2 2h-2v2c0 .55-.45 1-1 1h-2v2h6c.55 0 1 .45 1 1v3h1c.89 0 1.64.59 1.9 1.4C19.19 15.98 20 14.08 20 12c0-3.35-2.08-6.23-5.01-7.41zM8.99 16v-1l-4.78-4.78C4.08 10.79 4 11.39 4 12c0 4.07 3.06 7.43 6.99 7.93V18c-1.1 0-2-.9-2-2z"
                          opacity=".3"
                        />
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.01 17.93C7.06 19.43 4 16.07 4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z" />
                      </svg>
                    )
                : null
            }
            enhanced={{ fixed: true }}
            value={preset.id}
            options={
              presets.length > 0
                ? [
                    {
                      label: (
                        <>
                          <Icon
                            icon={iconObject(
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path
                                  d="M14.99 4.59V5c0 1.1-.9 2-2 2h-2v2c0 .55-.45 1-1 1h-2v2h6c.55 0 1 .45 1 1v3h1c.89 0 1.64.59 1.9 1.4C19.19 15.98 20 14.08 20 12c0-3.35-2.08-6.23-5.01-7.41zM8.99 16v-1l-4.78-4.78C4.08 10.79 4 11.39 4 12c0 4.07 3.06 7.43 6.99 7.93V18c-1.1 0-2-.9-2-2z"
                                  opacity=".3"
                                />
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.01 17.93C7.06 19.43 4 16.07 4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z" />
                              </svg>,
                              {
                                size: "xsmall",
                              }
                            )}
                          />
                          Global
                        </>
                      ),
                      options: props.appPresets.map((preset) => ({
                        label: preset.name,
                        key: preset.id,
                        value: preset.id,
                      })),
                    },
                    {
                      label: (
                        <>
                          <Icon
                            icon={iconObject(
                              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M12 16c-2.69 0-5.77 1.28-6 2h12c-.2-.71-3.3-2-6-2z" opacity=".3" />
                                <circle cx="12" cy="8" opacity=".3" r="2" />
                                <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2 2.7 0 5.8 1.29 6 2H6zm6-6c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
                              </svg>,
                              {
                                size: "xsmall",
                              }
                            )}
                          />
                          User
                        </>
                      ),
                      options: presets.map((preset) => ({
                        label: preset.name,
                        key: preset.id,
                        value: preset.id,
                      })),
                    },
                  ]
                : props.appPresets.map((preset) => ({
                    label: preset.name,
                    key: preset.id,
                    value: preset.id,
                  }))
            }
            onChange={selectPresetFn}
            className={classNames({ modified: modified })}
            disabled={[...props.appPresets, ...presets].length === 1}
          />
          {userPresetOptions}
        </div>
      </CollapsibleList>
      <div className="top-buttons">
        <Button
          outlined
          label="Reset"
          icon="restore"
          onClick={() => {
            selectPreset(preset.id);
          }}
          disabled={!modified}
        />
        <Button outlined icon="link" label="Copy" onClick={copyLink} disabled={preset.id === "default" && !modified} />
      </div>
      <DrawerContent>
        {userFilterOptions}
        <div className="group">
          <CollapsibleList
            defaultOpen
            handle={
              <ListItem>
                <Typography use="caption" className="subheader">
                  Profile
                </Typography>
                <ListItemMeta icon="expand_more" />
              </ListItem>
            }
            className="group-collapsible"
          >
            <div className="filter-segmented-button-container">
              <SegmentedButton>
                <SegmentedButtonSegment
                  label="All"
                  icon="done_all"
                  onClick={() => {
                    checkAll("profiles");
                  }}
                />
                <SegmentedButtonSegment
                  label="None"
                  icon="remove_done"
                  onClick={() => {
                    uncheckAll("profiles");
                  }}
                />
                <SegmentedButtonSegment
                  label="Invert"
                  icon="published_with_changes"
                  onClick={() => {
                    invertAll("profiles");
                  }}
                />
              </SegmentedButton>
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
          </CollapsibleList>
        </div>

        <div className="group">
          <CollapsibleList
            defaultOpen
            handle={
              <ListItem>
                <Typography use="caption" className="subheader">
                  Shipped
                </Typography>
                <ListItemMeta icon="expand_more" />
              </ListItem>
            }
            className="group-collapsible"
          >
            <div className="filter-segmented-button-container">
              <SegmentedButton>
                <SegmentedButtonSegment
                  label="All"
                  icon="done_all"
                  onClick={() => {
                    checkAll("shipped");
                  }}
                />
                <SegmentedButtonSegment
                  label="None"
                  icon="remove_done"
                  onClick={() => {
                    uncheckAll("shipped");
                  }}
                />
                <SegmentedButtonSegment
                  label="Invert"
                  icon="published_with_changes"
                  onClick={() => {
                    invertAll("shipped");
                  }}
                />
              </SegmentedButton>
            </div>
            <div className="filter-chip-container">
              <ChipSet filter>
                {whitelistShipped.map((prop) => {
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
          </CollapsibleList>
        </div>

        <div className="group">
          <CollapsibleList
            defaultOpen
            handle={
              <ListItem>
                <Typography use="caption" className="subheader">
                  Regional vendors
                </Typography>
                <ListItemMeta icon="expand_more" />
              </ListItem>
            }
            className="group-collapsible"
          >
            <div className="filter-segmented-button-container">
              <SegmentedButton>
                <SegmentedButtonSegment
                  label="All"
                  icon="done_all"
                  onClick={() => {
                    checkAll("regions");
                  }}
                />
                <SegmentedButtonSegment
                  label="None"
                  icon="remove_done"
                  onClick={() => {
                    uncheckAll("regions");
                  }}
                />
                <SegmentedButtonSegment
                  label="Invert"
                  icon="published_with_changes"
                  onClick={() => {
                    invertAll("regions");
                  }}
                />
              </SegmentedButton>
            </div>
            <div className="filter-chip-container">
              <ChipSet filter>
                {props.regions.map((region) => {
                  return (
                    <Chip
                      key={"regions-" + region}
                      label={region}
                      selected={props.whitelist.regions.includes(region)}
                      checkmark
                      onInteraction={() => handleChange(region, "regions")}
                    />
                  );
                })}
              </ChipSet>
            </div>
          </CollapsibleList>
        </div>
        <div className="group">
          <CollapsibleList
            defaultOpen
            handle={
              <ListItem>
                <Typography use="caption" className="subheader">
                  Vendor
                </Typography>
                <ListItemMeta icon="expand_more" />
              </ListItem>
            }
            className="group-collapsible"
          >
            <div className="filter-segmented-button-container">
              <SegmentedButton toggle>
                <SegmentedButtonSegment
                  label="Include"
                  onClick={() => {
                    props.setWhitelist("vendorMode", "include");
                  }}
                  selected={props.whitelist.vendorMode === "include"}
                />
                <SegmentedButtonSegment
                  label="Exclude"
                  onClick={() => {
                    props.setWhitelist("vendorMode", "exclude");
                  }}
                  selected={props.whitelist.vendorMode === "exclude"}
                />
              </SegmentedButton>
            </div>
            <div className="filter-segmented-button-container">
              <SegmentedButton>
                <SegmentedButtonSegment
                  label="All"
                  icon="done_all"
                  onClick={() => {
                    checkAll("vendors");
                  }}
                />
                <SegmentedButtonSegment
                  label="None"
                  icon="remove_done"
                  onClick={() => {
                    uncheckAll("vendors");
                  }}
                />
                <SegmentedButtonSegment
                  label="Invert"
                  icon="published_with_changes"
                  onClick={() => {
                    invertAll("vendors");
                  }}
                />
              </SegmentedButton>
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
          </CollapsibleList>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerFilter;
