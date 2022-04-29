import { useMemo } from "react";
import type { ChangeEvent } from "react";
import type { EntityId } from "@reduxjs/toolkit";
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
import { notify } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import { useAppDispatch, useAppSelector } from "@h";
import useDevice from "@h/use-device";
import usePage from "@h/use-page";
import {
  selectAllAppPresets,
  selectAllProfiles,
  selectAllRegions,
  selectAllVendors,
  selectCurrentPreset,
  selectDefaultPreset,
  selectWhitelist,
} from "@s/main";
import {
  showAllPages,
  whitelistParams,
  whitelistShipped,
} from "@s/main/constants";
import { partialPreset } from "@s/main/constructors";
import { selectPreset, setWhitelist } from "@s/main/thunks";
import type { PresetType } from "@s/main/types";
import { createURL, setSearchParamArray } from "@s/router/functions";
import { selectView } from "@s/settings";
import { selectAllUserPresets, selectUser } from "@s/user";
import {
  addOrRemove,
  alphabeticalSort,
  arrayIncludes,
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

const sortInternalArrays = <S extends Record<any, any>>(obj: S): S =>
  Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      key,
      typeof val === "object" && val !== null
        ? Array.isArray(val)
          ? [...val].sort()
          : sortInternalArrays(val)
        : val,
    ])
  ) as S;

type DrawerFilterProps = {
  close: () => void;
  deletePreset: (preset: EntityId) => void;
  open: boolean;
  openPreset: (preset: PresetType) => void;
};

export const DrawerFilter = ({
  close,
  deletePreset: deleteFn,
  open,
  openPreset,
}: DrawerFilterProps) => {
  const dispatch = useAppDispatch();

  const device = useDevice();

  const page = usePage();

  const view = useAppSelector(selectView);

  const user = useAppSelector(selectUser);
  const userPresets = useAppSelector(selectAllUserPresets);

  const profiles = useAppSelector(selectAllProfiles);
  const vendors = useAppSelector(selectAllVendors);
  const regions = useAppSelector(selectAllRegions);
  const lists = { profiles, regions, vendors };

  const preset = useAppSelector(selectCurrentPreset);
  const appPresets = useAppSelector(selectAllAppPresets);
  const defaultPreset = useAppSelector(selectDefaultPreset);
  const mainWhitelist = useAppSelector(selectWhitelist);

  const modified = useMemo(() => {
    const equal = isEqual(
      sortInternalArrays({ ...preset.whitelist }),
      sortInternalArrays({ ...mainWhitelist })
    );
    return !equal;
  }, [preset.whitelist, mainWhitelist]);

  const selectPresetFn = (e: ChangeEvent<HTMLSelectElement>) =>
    dispatch(selectPreset(e.target.value));

  const newPreset = (global = false) => {
    const {
      bought,
      favorites,
      hidden,
      profiles,
      regions,
      shipped,
      vendorMode,
      vendors,
    } = mainWhitelist;
    const newPreset = partialPreset({
      global,
      whitelist: {
        bought,
        favorites,
        hidden,
        profiles,
        regions,
        shipped,
        vendorMode,
        vendors,
      },
    });
    openPreset(newPreset);
  };

  const savePreset = () => {
    const {
      bought,
      favorites,
      hidden,
      profiles,
      regions,
      shipped,
      vendorMode,
      vendors,
    } = mainWhitelist;
    const modifiedPreset = {
      ...preset,
      whitelist: {
        bought,
        favorites,
        hidden,
        profiles,
        regions,
        shipped,
        vendorMode,
        vendors,
      },
    };
    openPreset(modifiedPreset);
  };

  const deletePreset = () => {
    if (preset.id !== "default") {
      deleteFn(preset.id);
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
      dispatch(setWhitelist(prop, edited));
    }
  };

  const checkAll = (prop: string) => {
    if (hasKey(lists, prop)) {
      const { [prop]: all } = lists;
      dispatch(setWhitelist(prop, all));
    } else if (prop === "shipped") {
      dispatch(setWhitelist(prop, [...whitelistShipped]));
    }
  };

  const uncheckAll = (prop: string) => {
    if (hasKey(lists, prop) && hasKey(mainWhitelist, prop)) {
      dispatch(setWhitelist(prop, []));
    } else if (prop === "shipped") {
      dispatch(setWhitelist(prop, []));
    }
  };

  const invertAll = (prop: string) => {
    if (hasKey(lists, prop)) {
      const { [prop]: all } = lists;
      const inverted = all.filter(
        (value) => !mainWhitelist[prop].includes(value)
      );
      dispatch(setWhitelist(prop, inverted));
    } else if (prop === "shipped") {
      const inverted = whitelistShipped.filter(
        (value) => !mainWhitelist[prop].includes(value)
      );
      dispatch(setWhitelist(prop, inverted));
    }
  };

  const copyLink = async () => {
    const url = createURL({}, (params) => {
      whitelistParams.forEach((param) => {
        if (arrayIncludes(["profile", "region", "vendor"] as const, param)) {
          const plural = `${param}s` as const;
          if (
            mainWhitelist[plural].length !==
            defaultPreset.whitelist[plural].length
          ) {
            setSearchParamArray(params, param, mainWhitelist[plural]);
          }
        } else if (param === "vendorMode") {
          if (mainWhitelist.vendorMode !== defaultPreset.whitelist.vendorMode) {
            params.set(param, mainWhitelist[param]);
          }
        } else if (param === "shipped") {
          if (
            mainWhitelist[param].length !==
            defaultPreset.whitelist[param].length
          ) {
            setSearchParamArray(params, param, mainWhitelist[param]);
          }
        }
      });
    });
    try {
      await navigator.clipboard.writeText(url.href);
      notify({ title: "Copied filtered URL to clipboard." });
    } catch (error) {
      notify({ title: `Error copying to clipboard ${error}` });
    }
  };

  const dismissible = device === "desktop" && view !== "compact";

  const closeIcon =
    dismissible &&
    withTooltip(
      <IconButton className="close-icon" icon="close" onClick={close} />,
      "Close"
    );
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

  const userPresetOptions = user.email && (
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
  );

  const disableHiddenButtons = showAllPages.includes(page) || page === "hidden";

  const userFilterOptions = user.email && (
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
  );

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
              userPresets.length > 0 &&
              userPresets.find((userPreset) => userPreset.id === preset.id)
                ? iconObject(<Person />)
                : iconObject(<Public />)
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
                        { key: "default", label: "Default", value: "default" },
                        ...appPresets.map((preset) => ({
                          key: preset.id,
                          label: preset.name,
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
                        key: preset.id,
                        label: preset.name,
                        value: preset.id,
                      })),
                    },
                  ]
                : [
                    { key: "default", label: "Default", value: "default" },
                    ...appPresets.map((preset) => ({
                      key: preset.id,
                      label: preset.name,
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
          onClick={() => dispatch(selectPreset(preset.id))}
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
                    key={profile}
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
                    key={`shipped-${prop}`}
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
                    key={region}
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
                  onClick={() =>
                    dispatch(setWhitelist("vendorMode", "include"))
                  }
                  selected={mainWhitelist.vendorMode === "include"}
                />
                <SegmentedButtonSegment
                  label="Exclude"
                  onClick={() =>
                    dispatch(setWhitelist("vendorMode", "exclude"))
                  }
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
                    key={vendor}
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
