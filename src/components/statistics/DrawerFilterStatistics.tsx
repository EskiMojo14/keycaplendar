import React from "react";
import { whitelistShipped } from "../../util/constants";
import { addOrRemove, hasKey } from "../../util/functions";
import { QueueType, WhitelistType } from "../../util/types";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { Typography } from "@rmwc/typography";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";

type DrawerFilterStatisticsProps = {
  close: () => void;
  open: boolean;
  profiles: string[];
  setWhitelist: (prop: string, whitelist: WhitelistType | WhitelistType[keyof WhitelistType]) => void;
  snackbarQueue: QueueType;
  vendors: string[];
  whitelist: WhitelistType;
};

type checkAllType = "profiles" | "vendors" | "shipped";

export const DrawerFilterStatistics = (props: DrawerFilterStatisticsProps) => {
  const whitelist = props.whitelist;
  const handleChange = (name: string, prop: string) => {
    if (hasKey(whitelist, prop)) {
      const original = whitelist[prop];
      if (original instanceof Array) {
        const edited: string[] = addOrRemove(original, name).sort(function (a, b) {
          const x = a.toLowerCase();
          const y = b.toLowerCase();
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });
        setWhitelist(prop, edited);
      }
    }
  };

  const setWhitelist = (prop: string, whitelist: any) => {
    props.setWhitelist(prop, whitelist);
  };

  const checkAll = (prop: checkAllType) => {
    const array = prop === "shipped" ? whitelistShipped : props[prop];
    setWhitelist(prop, array);
  };

  const uncheckAll = (prop: checkAllType) => {
    setWhitelist(prop, []);
  };
  return (
    <Drawer modal open={props.open} onClose={props.close} className="filter-drawer drawer-right">
      <DrawerHeader>
        <DrawerTitle>Filters</DrawerTitle>
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
              {whitelistShipped.map((prop) => {
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
