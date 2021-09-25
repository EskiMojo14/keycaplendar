import { useState, useEffect, ChangeEvent } from "react";
import isEqual from "lodash.isequal";
import classNames from "classnames";
import { is } from "typescript-is";
import { queue } from "~/app/snackbar-queue";
import { useAppSelector } from "~/app/hooks";
import { selectDevice, selectPage } from "@s/common";
import {
  selectAllProfiles,
  selectAllRegions,
  selectAllVendors,
  selectAppPresets,
  selectCurrentPreset,
  selectWhitelist,
} from "@s/main";
import { showAllPages, whitelistParams, whitelistShipped } from "@s/main/constants";
import { Preset, Whitelist } from "@s/main/constructors";
import { selectPreset, setWhitelist } from "@s/main/functions";
import { PresetType } from "@s/main/types";
import { selectView } from "@s/settings";
import { selectUser, selectUserPresets } from "@s/user";
import { addOrRemove, alphabeticalSort, hasKey, iconObject } from "@s/util/functions";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { Icon } from "@rmwc/icon";
import { IconButton } from "@rmwc/icon-button";
import { CollapsibleList, ListItem, ListItemMeta } from "@rmwc/list";
import { Select } from "@rmwc/select";
import { Typography } from "@rmwc/typography";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import { withTooltip } from "@c/util/HOCs";
import "./drawer-filter.scss";

type DrawerFilterProps = {
  close: () => void;
  deletePreset: (preset: PresetType) => void;
  open: boolean;
  openPreset: (preset: PresetType) => void;
};

export const DrawerFilter = (props: DrawerFilterProps) => {
  const device = useAppSelector(selectDevice);
  const page = useAppSelector(selectPage);

  const view = useAppSelector(selectView);

  const user = useAppSelector(selectUser);
  const userPresets = useAppSelector(selectUserPresets);

  const profiles = useAppSelector(selectAllProfiles);
  const vendors = useAppSelector(selectAllVendors);
  const regions = useAppSelector(selectAllRegions);
  const lists = { profiles, vendors, regions };

  const preset = useAppSelector(selectCurrentPreset);
  const appPresets = useAppSelector(selectAppPresets);
  const mainWhitelist = useAppSelector(selectWhitelist);

  const [modified, setModified] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { edited, ...whitelist } = mainWhitelist;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { edited: presetEdited, ...presetWhitelist } = preset.whitelist;
    const equal = isEqual(presetWhitelist, whitelist);
    setModified(!equal);
  }, [preset.whitelist, mainWhitelist]);

  const selectPresetFn = (e: ChangeEvent<HTMLSelectElement>) => {
    selectPreset(e.target.value);
  };

  const newPreset = (global = false) => {
    const { favorites, bought, hidden, profiles, shipped, regions, vendorMode, vendors } = mainWhitelist;
    const newWhitelist = {
      ...new Whitelist(favorites, bought, hidden, profiles, shipped, regions, vendorMode, vendors),
    };
    const newPreset = { ...new Preset("", global, newWhitelist) };
    props.openPreset(newPreset);
  };

  const savePreset = () => {
    const { favorites, bought, hidden, profiles, shipped, regions, vendorMode, vendors } = mainWhitelist;
    const modifiedPreset = {
      ...preset,
      whitelist: {
        favorites,
        bought,
        hidden,
        profiles,
        shipped,
        regions,
        vendorMode,
        vendors,
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
    if (hasKey(mainWhitelist, prop)) {
      const original = mainWhitelist[prop];
      let edited = original;
      if (is<boolean>(original)) {
        edited = !original;
      } else if (is<string[]>(original)) {
        edited = alphabeticalSort(addOrRemove(original, name));
      } else if (original === "include" || original === "exclude") {
        edited = original === "include" ? "exclude" : "include";
      } else if (name === "unhidden" || name === "hidden" || name === "all") {
        edited = name;
      }
      setWhitelist(prop, edited);
    }
  };

  const checkAll = (prop: string) => {
    if (hasKey(lists, prop)) {
      const all = lists[prop];
      setWhitelist(prop, all);
    } else if (prop === "shipped") {
      setWhitelist(prop, [...whitelistShipped]);
    }
  };

  const uncheckAll = (prop: string) => {
    if (hasKey(lists, prop) && hasKey(mainWhitelist, prop)) {
      setWhitelist(prop, []);
    } else if (prop === "shipped") {
      setWhitelist(prop, []);
    }
  };

  const invertAll = (prop: string) => {
    if (hasKey(lists, prop)) {
      const all = lists[prop];
      const inverted = all.filter((value) => !mainWhitelist[prop].includes(value));
      setWhitelist(prop, inverted);
    } else if (prop === "shipped") {
      const inverted = whitelistShipped.filter((value) => !mainWhitelist[prop].includes(value));
      setWhitelist(prop, inverted);
    }
  };

  const copyLink = () => {
    const params = new URLSearchParams(window.location.search);
    whitelistParams.forEach((param) => {
      if (param === "profile" || param === "region" || param === "vendor") {
        const plural = param + "s";
        const whitelist = mainWhitelist;
        if (hasKey(whitelist, plural)) {
          const array = whitelist[plural];
          if (is<string[]>(array) && array.length === 1) {
            params.set(param, array.map((item: string) => item.replace(" ", "-")).join(" "));
          } else {
            params.delete(param);
          }
        }
      } else if (param === "vendorMode") {
        if (mainWhitelist.vendorMode !== "exclude") {
          params.set(param, mainWhitelist[param]);
        } else {
          params.delete(param);
        }
      } else if (param === "profiles" || param === "shipped" || param === "regions" || param === "vendors") {
        const lengths = {
          profiles: profiles.length,
          shipped: 2,
          vendors: 0,
          regions: regions.length,
        };
        if (param === "profiles" || param === "regions" || param === "vendors") {
          if (mainWhitelist[param].length > 1 && mainWhitelist[param].length !== lengths[param]) {
            params.set(param, mainWhitelist[param].map((profile) => profile.replace(" ", "-")).join(" "));
          } else {
            params.delete(param);
          }
        } else {
          if (mainWhitelist[param].length !== lengths[param]) {
            params.set(param, mainWhitelist[param].map((item) => item.replace(" ", "-")).join(" "));
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

  const closeIcon = dismissible
    ? withTooltip(<IconButton className="close-icon" icon="close" onClick={props.close} />, "Close")
    : null;

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
            (!user.isAdmin && appPresets.map((preset) => preset.id).includes(preset.id))
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
            (!user.isAdmin && appPresets.map((preset) => preset.id).includes(preset.id))
          }
          className="delete"
          onClick={deletePreset}
        />
      </div>
    </>
  ) : null;

  const disableHiddenButtons = showAllPages.includes(page) || page === "hidden";

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
        <div className="filter-segmented-button-container">
          <SegmentedButton toggle>
            <SegmentedButtonSegment
              label="Unhidden"
              selected={mainWhitelist.hidden === "unhidden" && !showAllPages.includes(page) && !(page === "hidden")}
              onClick={() => handleChange("unhidden", "hidden")}
              disabled={disableHiddenButtons}
            />
            <SegmentedButtonSegment
              label="Hidden"
              selected={(mainWhitelist.hidden === "hidden" && !showAllPages.includes(page)) || page == "hidden"}
              onClick={() => handleChange("hidden", "hidden")}
              disabled={disableHiddenButtons}
            />
            <SegmentedButtonSegment
              label="All"
              selected={mainWhitelist.hidden === "all" || (showAllPages.includes(page) && !(page === "hidden"))}
              onClick={() => handleChange("all", "hidden")}
              disabled={disableHiddenButtons}
            />
          </SegmentedButton>
        </div>
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
              selected={mainWhitelist.favorites || page === "favorites"}
              onInteraction={() => handleChange("favorites", "favorites")}
              disabled={page === "favorites"}
            />
            <Chip
              label="Bought"
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path
                    d="M3.31 11l2.2 8.01L18.5 19l2.2-8H3.31zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
                    opacity=".3"
                  />
                  <path d="M22 9h-4.79l-4.38-6.56c-.19-.28-.51-.42-.83-.42s-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1zM12 4.8L14.8 9H9.2L12 4.8zM18.5 19l-12.99.01L3.31 11H20.7l-2.2 8zM12 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              )}
              selected={mainWhitelist.bought || page === "bought"}
              onInteraction={() => handleChange("bought", "bought")}
              disabled={page === "bought"}
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
        className="group-collapsible preset-collapsible"
      >
        <div className="preset-group">
          <Select
            outlined
            icon={
              userPresets.length > 0
                ? userPresets.map((preset) => preset.id).includes(preset.id)
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
              userPresets.length > 0
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
                      options: [
                        { label: "Default", key: "default", value: "default" },
                        ...appPresets.map((preset) => ({
                          label: preset.name,
                          key: preset.id,
                          value: preset.id,
                        })),
                      ],
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
                      options: userPresets.map((preset) => ({
                        label: preset.name,
                        key: preset.id,
                        value: preset.id,
                      })),
                    },
                  ]
                : [
                    { label: "Default", key: "default", value: "default" },
                    ...appPresets.map((preset) => ({
                      label: preset.name,
                      key: preset.id,
                      value: preset.id,
                    })),
                  ]
            }
            onChange={selectPresetFn}
            className={classNames({ modified: modified })}
            disabled={[...appPresets, ...userPresets].length === 1}
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
                {profiles.map((profile) => {
                  return (
                    <Chip
                      key={"profile-" + profile}
                      label={profile}
                      selected={mainWhitelist.profiles.includes(profile)}
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
                      selected={mainWhitelist.shipped.includes(prop)}
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
                {regions.map((region) => {
                  return (
                    <Chip
                      key={"regions-" + region}
                      label={region}
                      selected={mainWhitelist.regions.includes(region)}
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
                    setWhitelist("vendorMode", "include");
                  }}
                  selected={mainWhitelist.vendorMode === "include"}
                />
                <SegmentedButtonSegment
                  label="Exclude"
                  onClick={() => {
                    setWhitelist("vendorMode", "exclude");
                  }}
                  selected={mainWhitelist.vendorMode === "exclude"}
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
                {vendors.map((vendor) => {
                  return (
                    <Chip
                      key={"profile-" + vendor}
                      label={vendor}
                      selected={mainWhitelist.vendors.includes(vendor)}
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
