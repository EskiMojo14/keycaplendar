import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@rmwc/button";
import { Chip, ChipSet } from "@rmwc/chip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { Icon } from "@rmwc/icon";
import { IconButton } from "@rmwc/icon-button";
import { CollapsibleList, ListItem, ListItemMeta } from "@rmwc/list";
import { Select } from "@rmwc/select";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import isEqual from "lodash.isequal";
import { is } from "typescript-is";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import { selectDevice, selectPage } from "@s/common";
import {
  selectAllProfiles,
  selectAllRegions,
  selectAllVendors,
  selectAppPresets,
  selectCurrentPreset,
  selectWhitelist,
} from "@s/main";
import {
  showAllPages,
  whitelistParams,
  whitelistShipped,
} from "@s/main/constants";
import { Preset, Whitelist } from "@s/main/constructors";
import { selectPreset, setWhitelist } from "@s/main/functions";
import type { PresetType } from "@s/main/types";
import { selectView } from "@s/settings";
import { selectUser, selectUserPresets } from "@s/user";
import {
  addOrRemove,
  alphabeticalSort,
  hasKey,
  iconObject,
} from "@s/util/functions";
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

export const DrawerFilter = ({
  close,
  deletePreset: deleteFn,
  open,
  openPreset,
}: DrawerFilterProps) => {
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
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whitelist: { edited: presetEdited, ...presetWhitelist },
    } = preset;
    const equal = isEqual(presetWhitelist, whitelist);
    setModified(!equal);
  }, [preset.whitelist, mainWhitelist]);

  const selectPresetFn = (e: ChangeEvent<HTMLSelectElement>) => {
    selectPreset(e.target.value);
  };

  const newPreset = (global = false) => {
    const {
      favorites,
      bought,
      hidden,
      profiles,
      shipped,
      regions,
      vendorMode,
      vendors,
    } = mainWhitelist;
    const newWhitelist = {
      ...new Whitelist(
        favorites,
        bought,
        hidden,
        profiles,
        shipped,
        regions,
        vendorMode,
        vendors
      ),
    };
    const newPreset = { ...new Preset("", global, newWhitelist) };
    openPreset(newPreset);
  };

  const savePreset = () => {
    const {
      favorites,
      bought,
      hidden,
      profiles,
      shipped,
      regions,
      vendorMode,
      vendors,
    } = mainWhitelist;
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
    openPreset(modifiedPreset);
  };

  const deletePreset = () => {
    if (preset.id !== "default") {
      deleteFn(preset);
    }
  };

  const handleChange = (name: string, prop: string) => {
    if (hasKey(mainWhitelist, prop)) {
      const { [prop]: original } = mainWhitelist;
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
      const { [prop]: all } = lists;
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
      const { [prop]: all } = lists;
      const inverted = all.filter(
        (value) => !mainWhitelist[prop].includes(value)
      );
      setWhitelist(prop, inverted);
    } else if (prop === "shipped") {
      const inverted = whitelistShipped.filter(
        (value) => !mainWhitelist[prop].includes(value)
      );
      setWhitelist(prop, inverted);
    }
  };

  const copyLink = () => {
    const params = new URLSearchParams(window.location.search);
    whitelistParams.forEach((param) => {
      if (param === "profile" || param === "region" || param === "vendor") {
        const plural = `${param}s` as const;
        const whitelist = mainWhitelist;
        const { [plural]: array } = whitelist;
        if (is<string[]>(array) && array.length === 1) {
          params.set(
            param,
            array.map((item: string) => item.replace(" ", "-")).join(" ")
          );
        } else {
          params.delete(param);
        }
      } else if (param === "vendorMode") {
        if (mainWhitelist.vendorMode !== "exclude") {
          params.set(param, mainWhitelist[param]);
        } else {
          params.delete(param);
        }
      } else if (
        param === "profiles" ||
        param === "shipped" ||
        param === "regions" ||
        param === "vendors"
      ) {
        const lengths = {
          profiles: profiles.length,
          shipped: 2,
          vendors: 0,
          regions: regions.length,
        };
        if (
          param === "profiles" ||
          param === "regions" ||
          param === "vendors"
        ) {
          if (
            mainWhitelist[param].length > 1 &&
            mainWhitelist[param].length !== lengths[param]
          ) {
            params.set(
              param,
              mainWhitelist[param]
                .map((profile) => profile.replace(" ", "-"))
                .join(" ")
            );
          } else {
            params.delete(param);
          }
        } else {
          if (mainWhitelist[param].length !== lengths[param]) {
            params.set(
              param,
              mainWhitelist[param]
                .map((item) => item.replace(" ", "-"))
                .join(" ")
            );
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
    ? withTooltip(
        <IconButton className="close-icon" icon="close" onClick={close} />,
        "Close"
      )
    : null;

  const newPresetButton = user.isAdmin ? (
    <div className="preset-buttons">
      <Button
        icon={iconObject(<FilterVariantPlus />)}
        label="New"
        onClick={() => {
          newPreset();
        }}
        outlined
      />
      <Button
        icon={iconObject(<PublicAdd />)}
        label="New"
        onClick={() => {
          newPreset(true);
        }}
        outlined
      />
    </div>
  ) : (
    <div className="preset-button">
      <Button
        icon={iconObject(<FilterVariantPlus />)}
        label="New"
        onClick={() => {
          newPreset();
        }}
        outlined
      />
    </div>
  );

  const userPresetOptions = user.email ? (
    <>
      {newPresetButton}
      <div className="preset-buttons">
        <Button
          disabled={
            (user.isAdmin && preset.id === "default") ||
            (!user.isAdmin &&
              appPresets.map((preset) => preset.id).includes(preset.id))
          }
          icon={iconObject(<FilterEdit />)}
          label="Save"
          onClick={savePreset}
          outlined
        />
        <Button
          className="delete"
          disabled={
            (user.isAdmin && preset.id === "default") ||
            (!user.isAdmin &&
              appPresets.map((preset) => preset.id).includes(preset.id))
          }
          icon={iconObject(<FilterVariantRemove />)}
          label="Delete"
          onClick={deletePreset}
          outlined
        />
      </div>
    </>
  ) : null;

  const disableHiddenButtons = showAllPages.includes(page) || page === "hidden";

  const userFilterOptions = user.email ? (
    <div className="group">
      <CollapsibleList
        className="group-collapsible"
        defaultOpen
        handle={
          <ListItem>
            <Typography className="subheader" use="caption">
              User
            </Typography>
            <ListItemMeta icon="expand_more" />
          </ListItem>
        }
      >
        <div className="filter-segmented-button-container">
          <SegmentedButton toggle>
            <SegmentedButtonSegment
              disabled={disableHiddenButtons}
              label="Unhidden"
              onClick={() => handleChange("unhidden", "hidden")}
              selected={
                mainWhitelist.hidden === "unhidden" &&
                !showAllPages.includes(page) &&
                !(page === "hidden")
              }
            />
            <SegmentedButtonSegment
              disabled={disableHiddenButtons}
              label="Hidden"
              onClick={() => handleChange("hidden", "hidden")}
              selected={
                (mainWhitelist.hidden === "hidden" &&
                  !showAllPages.includes(page)) ||
                page == "hidden"
              }
            />
            <SegmentedButtonSegment
              disabled={disableHiddenButtons}
              label="All"
              onClick={() => handleChange("all", "hidden")}
              selected={
                mainWhitelist.hidden === "all" ||
                (showAllPages.includes(page) && !(page === "hidden"))
              }
            />
          </SegmentedButton>
        </div>
        <div className="filter-chip-container">
          <ChipSet choice>
            <Chip
              disabled={page === "favorites"}
              icon={iconObject(<Favorite />)}
              label="Favorites"
              onInteraction={() => handleChange("favorites", "favorites")}
              selected={mainWhitelist.favorites || page === "favorites"}
            />
            <Chip
              disabled={page === "bought"}
              icon={iconObject(<ShoppingBasket />)}
              label="Bought"
              onInteraction={() => handleChange("bought", "bought")}
              selected={mainWhitelist.bought || page === "bought"}
            />
          </ChipSet>
        </div>
      </CollapsibleList>
    </div>
  ) : null;

  return (
    <Drawer
      className="filter-drawer drawer-right"
      dismissible={dismissible}
      modal={!dismissible}
      onClose={close}
      open={open}
    >
      <DrawerHeader>
        <DrawerTitle>Filters</DrawerTitle>
        {closeIcon}
      </DrawerHeader>
      <CollapsibleList
        className="group-collapsible preset-collapsible"
        defaultOpen
        handle={
          <ListItem>
            <Typography className="subheader" use="caption">
              Preset
            </Typography>
            <ListItemMeta icon="expand_more" />
          </ListItem>
        }
      >
        <div className="preset-group">
          <Select
            className={classNames({ modified })}
            disabled={[...appPresets, ...userPresets].length === 1}
            enhanced={{ fixed: true }}
            icon={
              userPresets.length > 0
                ? userPresets.findIndex(
                    (userPreset) => userPreset.id === preset.id
                  ) >= 0
                  ? iconObject(<Person />)
                  : iconObject(<Public />)
                : null
            }
            onChange={selectPresetFn}
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
            outlined
            value={preset.id}
          />
          {userPresetOptions}
        </div>
      </CollapsibleList>
      <div className="top-buttons">
        <Button
          disabled={!modified}
          icon="restore"
          label="Reset"
          onClick={() => {
            selectPreset(preset.id);
          }}
          outlined
        />
        <Button
          disabled={preset.id === "default" && !modified}
          icon="link"
          label="Copy"
          onClick={copyLink}
          outlined
        />
      </div>
      <DrawerContent>
        {userFilterOptions}
        <div className="group">
          <CollapsibleList
            className="group-collapsible"
            defaultOpen
            handle={
              <ListItem>
                <Typography className="subheader" use="caption">
                  Profile
                </Typography>
                <ListItemMeta icon="expand_more" />
              </ListItem>
            }
          >
            <div className="filter-segmented-button-container">
              <SegmentedButton>
                <SegmentedButtonSegment
                  icon="done_all"
                  label="All"
                  onClick={() => {
                    checkAll("profiles");
                  }}
                />
                <SegmentedButtonSegment
                  icon="remove_done"
                  label="None"
                  onClick={() => {
                    uncheckAll("profiles");
                  }}
                />
                <SegmentedButtonSegment
                  icon="published_with_changes"
                  label="Invert"
                  onClick={() => {
                    invertAll("profiles");
                  }}
                />
              </SegmentedButton>
            </div>
            <div className="filter-chip-container">
              <ChipSet filter>
                {profiles.map((profile) => (
                  <Chip
                    key={"profile-" + profile}
                    checkmark
                    label={profile}
                    onInteraction={() => handleChange(profile, "profiles")}
                    selected={mainWhitelist.profiles.includes(profile)}
                  />
                ))}
              </ChipSet>
            </div>
          </CollapsibleList>
        </div>

        <div className="group">
          <CollapsibleList
            className="group-collapsible"
            defaultOpen
            handle={
              <ListItem>
                <Typography className="subheader" use="caption">
                  Shipped
                </Typography>
                <ListItemMeta icon="expand_more" />
              </ListItem>
            }
          >
            <div className="filter-segmented-button-container">
              <SegmentedButton>
                <SegmentedButtonSegment
                  icon="done_all"
                  label="All"
                  onClick={() => {
                    checkAll("shipped");
                  }}
                />
                <SegmentedButtonSegment
                  icon="remove_done"
                  label="None"
                  onClick={() => {
                    uncheckAll("shipped");
                  }}
                />
                <SegmentedButtonSegment
                  icon="published_with_changes"
                  label="Invert"
                  onClick={() => {
                    invertAll("shipped");
                  }}
                />
              </SegmentedButton>
            </div>
            <div className="filter-chip-container">
              <ChipSet filter>
                {whitelistShipped.map((prop) => (
                  <Chip
                    key={"shipped-" + prop}
                    checkmark
                    label={prop}
                    onInteraction={() => handleChange(prop, "shipped")}
                    selected={mainWhitelist.shipped.includes(prop)}
                  />
                ))}
              </ChipSet>
            </div>
          </CollapsibleList>
        </div>

        <div className="group">
          <CollapsibleList
            className="group-collapsible"
            defaultOpen
            handle={
              <ListItem>
                <Typography className="subheader" use="caption">
                  Regional vendors
                </Typography>
                <ListItemMeta icon="expand_more" />
              </ListItem>
            }
          >
            <div className="filter-segmented-button-container">
              <SegmentedButton>
                <SegmentedButtonSegment
                  icon="done_all"
                  label="All"
                  onClick={() => {
                    checkAll("regions");
                  }}
                />
                <SegmentedButtonSegment
                  icon="remove_done"
                  label="None"
                  onClick={() => {
                    uncheckAll("regions");
                  }}
                />
                <SegmentedButtonSegment
                  icon="published_with_changes"
                  label="Invert"
                  onClick={() => {
                    invertAll("regions");
                  }}
                />
              </SegmentedButton>
            </div>
            <div className="filter-chip-container">
              <ChipSet filter>
                {regions.map((region) => (
                  <Chip
                    key={"regions-" + region}
                    checkmark
                    label={region}
                    onInteraction={() => handleChange(region, "regions")}
                    selected={mainWhitelist.regions.includes(region)}
                  />
                ))}
              </ChipSet>
            </div>
          </CollapsibleList>
        </div>
        <div className="group">
          <CollapsibleList
            className="group-collapsible"
            defaultOpen
            handle={
              <ListItem>
                <Typography className="subheader" use="caption">
                  Vendor
                </Typography>
                <ListItemMeta icon="expand_more" />
              </ListItem>
            }
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
                  icon="done_all"
                  label="All"
                  onClick={() => {
                    checkAll("vendors");
                  }}
                />
                <SegmentedButtonSegment
                  icon="remove_done"
                  label="None"
                  onClick={() => {
                    uncheckAll("vendors");
                  }}
                />
                <SegmentedButtonSegment
                  icon="published_with_changes"
                  label="Invert"
                  onClick={() => {
                    invertAll("vendors");
                  }}
                />
              </SegmentedButton>
            </div>
            <div className="filter-chip-container">
              <ChipSet filter>
                {vendors.map((vendor) => (
                  <Chip
                    key={"profile-" + vendor}
                    checkmark
                    label={vendor}
                    onInteraction={() => handleChange(vendor, "vendors")}
                    selected={mainWhitelist.vendors.includes(vendor)}
                  />
                ))}
              </ChipSet>
            </div>
          </CollapsibleList>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerFilter;
