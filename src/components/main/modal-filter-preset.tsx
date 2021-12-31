import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Button } from "@rmwc/button";
import { Checkbox } from "@rmwc/checkbox";
import { Chip, ChipSet } from "@rmwc/chip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { TextField } from "@rmwc/textfield";
import { TopAppBarNavigationIcon, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import produce from "immer";
import { useAppSelector } from "~/app/hooks";
import { BoolWrapper, ConditionalWrapper } from "@c/util/conditional-wrapper";
import { FullScreenDialog, FullScreenDialogAppBar, FullScreenDialogContent } from "@c/util/full-screen-dialog";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import { selectDevice } from "@s/common";
import { editGlobalPreset, editPreset, newGlobalPreset, newPreset } from "@s/main/functions";
import type { PresetType } from "@s/main/types";
import { selectUser } from "@s/user";
import "./modal-filter-preset.scss";

type ModalFilterPresetProps = {
  close: () => void;
  open: boolean;
  preset: PresetType;
};

export const ModalFilterPreset = ({ close, open, preset }: ModalFilterPresetProps) => {
  const device = useAppSelector(selectDevice);
  const user = useAppSelector(selectUser);

  const [name, setName] = useState("");
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    setName(preset.name);
    setIsNew(!preset.name);
  }, [preset.name]);

  const handleChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    if (name === "name") {
      setName(value);
    }
  };

  const savePreset = () => {
    if (name) {
      const savedPreset = produce(preset, (draftPreset) => {
        draftPreset.name = name;
      });
      if (preset.global && user.isAdmin) {
        if (!preset.name) {
          newGlobalPreset(savedPreset);
        } else {
          editGlobalPreset(savedPreset);
        }
      } else {
        if (!preset.name) {
          newPreset(savedPreset);
        } else {
          editPreset(savedPreset);
        }
      }
      close();
    }
  };
  const useDrawer = device !== "mobile";
  return (
    <BoolWrapper
      condition={useDrawer}
      trueWrapper={(children) => (
        <Drawer modal open={open} onClose={close} className="drawer-right filter-preset-modal">
          {children}
        </Drawer>
      )}
      falseWrapper={(children) => (
        <FullScreenDialog open={open} onClose={close} className="filter-preset-modal">
          {children}
        </FullScreenDialog>
      )}
    >
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerHeader>{children}</DrawerHeader>}
        falseWrapper={(children) => (
          <FullScreenDialogAppBar>
            <TopAppBarRow>{children}</TopAppBarRow>
          </FullScreenDialogAppBar>
        )}
      >
        <BoolWrapper
          condition={useDrawer}
          trueWrapper={(children) => <DrawerTitle>{children}</DrawerTitle>}
          falseWrapper={(children) => (
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={close} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
        >
          {isNew ? "Create" : "Modify"}
          {preset.global && user.isAdmin ? " global" : ""} filter preset
        </BoolWrapper>

        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => <TopAppBarSection alignEnd>{children}</TopAppBarSection>}
        >
          <Button label="Save" disabled={!name} outlined={useDrawer} onClick={savePreset} />
        </ConditionalWrapper>
      </BoolWrapper>
      <div className="form-container">
        <TextField outlined label="Name" name="name" value={name} onChange={handleChange} autoComplete="off" required />
      </div>
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerContent>{children}</DrawerContent>}
        falseWrapper={(children) => <FullScreenDialogContent>{children}</FullScreenDialogContent>}
      >
        <div className="group">
          <div className="subheader">
            <Typography use="caption">Hidden</Typography>
          </div>
          <div className="toggle-container">
            <SegmentedButton toggle>
              <SegmentedButtonSegment disabled label="Unhidden" selected={preset.whitelist.hidden === "unhidden"} />
              <SegmentedButtonSegment disabled label="Hidden" selected={preset.whitelist.hidden === "hidden"} />
              <SegmentedButtonSegment disabled label="All" selected={preset.whitelist.hidden === "all"} />
            </SegmentedButton>
          </div>
        </div>
        <div className="group">
          <div className="subheader">
            <Typography use="caption">Favorites</Typography>
          </div>
          <div className="checkbox-container">
            <Checkbox checked={preset.whitelist.favorites} disabled />
          </div>
        </div>
        <div className="group">
          <div className="subheader">
            <Typography use="caption">Bought</Typography>
          </div>
          <div className="checkbox-container">
            <Checkbox checked={preset.whitelist.bought} disabled />
          </div>
        </div>
        <div className="group">
          <div className="subheader">
            <Typography use="caption">Profiles</Typography>
          </div>
          <div className="chip-set-container">
            <ChipSet choice>
              {preset.whitelist.profiles.map((profile) => (
                <Chip key={profile} label={profile} disabled />
              ))}
            </ChipSet>
          </div>
        </div>
        <div className="group">
          <div className="subheader">
            <Typography use="caption">Shipped</Typography>
          </div>
          <div className="chip-set-container">
            <ChipSet choice>
              {preset.whitelist.shipped.map((shipped) => (
                <Chip key={shipped} label={shipped} disabled />
              ))}
            </ChipSet>
          </div>
        </div>
        <div className="group">
          <div className="subheader">
            <Typography use="caption">Region</Typography>
          </div>
          <div className="chip-set-container">
            <ChipSet choice>
              {preset.whitelist.regions.map((region) => (
                <Chip key={region} label={region} disabled />
              ))}
            </ChipSet>
          </div>
        </div>
        <div className="group">
          <div className="subheader">
            <Typography use="caption">Vendors</Typography>
          </div>
          <div className="toggle-container">
            <SegmentedButton toggle>
              <SegmentedButtonSegment disabled label="Include" selected={preset.whitelist.vendorMode === "include"} />
              <SegmentedButtonSegment disabled label="Exclude" selected={preset.whitelist.vendorMode === "exclude"} />
            </SegmentedButton>
          </div>
          <div className="chip-set-container">
            <ChipSet choice>
              {preset.whitelist.vendors.map((vendor) => (
                <Chip key={vendor} label={vendor} disabled />
              ))}
            </ChipSet>
          </div>
        </div>
      </BoolWrapper>
    </BoolWrapper>
  );
};

export default ModalFilterPreset;
