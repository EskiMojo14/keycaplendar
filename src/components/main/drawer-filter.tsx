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
import { withTooltip } from "@c/util/hocs";
import {
  Favorite,
  FilterEdit,
  FilterVariantPlus,
  FilterVariantRemove,
  Person,
  Public,
  PublicAdd,
  ShoppingBasket,
} from "@i";
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
        edited = alphabeticalSort(addOrRemove([...original], name));
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
        icon={iconObject(<FilterVariantPlus />)}
        outlined
        onClick={() => {
          newPreset();
        }}
      />
      <Button
        label="New"
        icon={iconObject(<PublicAdd />)}
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
        icon={iconObject(<FilterVariantPlus />)}
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
          icon={iconObject(<FilterEdit />)}
          outlined
          disabled={
            (user.isAdmin && preset.id === "default") ||
            (!user.isAdmin && appPresets.map((preset) => preset.id).includes(preset.id))
          }
          onClick={savePreset}
        />
        <Button
          label="Delete"
          icon={iconObject(<FilterVariantRemove />)}
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
              icon={iconObject(<Favorite />)}
              selected={mainWhitelist.favorites || page === "favorites"}
              onInteraction={() => handleChange("favorites", "favorites")}
              disabled={page === "favorites"}
            />
            <Chip
              label="Bought"
              icon={iconObject(<ShoppingBasket />)}
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
                ? userPresets.findIndex((userPreset) => userPreset.id === preset.id) >= 0
                  ? iconObject(<Person />)
                  : iconObject(<Public />)
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
                            icon={iconObject(<Public />, {
                              size: "xsmall",
                            })}
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
                            icon={iconObject(<Person />, {
                              size: "xsmall",
                            })}
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
