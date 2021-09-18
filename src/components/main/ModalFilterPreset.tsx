import { useEffect, useState, ChangeEvent } from "react";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { editGlobalPreset, editPreset, newGlobalPreset, newPreset } from "@s/main/functions";
import { PresetType } from "@s/main/types";
import { selectUser } from "@s/user";
import { Checkbox } from "@rmwc/checkbox";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerContent, DrawerTitle } from "@rmwc/drawer";
import { TextField } from "@rmwc/textfield";
import { TopAppBarNavigationIcon, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { ConditionalWrapper, BoolWrapper } from "@c/util/ConditionalWrapper";
import { FullScreenDialog, FullScreenDialogAppBar, FullScreenDialogContent } from "@c/util/FullScreenDialog";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/SegmentedButton";
import "./ModalFilterPreset.scss";

type ModalFilterPresetProps = {
  close: () => void;
  open: boolean;
  preset: PresetType;
};

export const ModalFilterPreset = (props: ModalFilterPresetProps) => {
  const device = useAppSelector(selectDevice);
  const user = useAppSelector(selectUser);

  const [name, setName] = useState("");
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    setName(props.preset.name);
    setIsNew(!props.preset.name);
  }, [props.preset.name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === "name") {
      setName(value);
    }
  };

  const savePreset = () => {
    if (name) {
      const preset = {
        ...props.preset,
        name: name,
      };
      if (props.preset.global && user.isAdmin) {
        if (!props.preset.name) {
          newGlobalPreset(preset);
        } else {
          editGlobalPreset(preset);
        }
      } else {
        if (!props.preset.name) {
          newPreset(preset);
        } else {
          editPreset(preset);
        }
      }
      props.close();
    }
  };
  const useDrawer = device !== "mobile";
  return (
    <BoolWrapper
      condition={useDrawer}
      trueWrapper={(children) => (
        <Drawer modal open={props.open} onClose={props.close} className="drawer-right filter-preset-modal">
          {children}
        </Drawer>
      )}
      falseWrapper={(children) => (
        <FullScreenDialog open={props.open} onClose={props.close} className="filter-preset-modal">
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
              <TopAppBarNavigationIcon icon="close" onClick={props.close} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
        >
          {isNew ? "Create" : "Modify"}
          {props.preset.global && user.isAdmin ? " global" : ""} filter preset
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
              <SegmentedButtonSegment
                disabled
                label="Unhidden"
                selected={props.preset.whitelist.hidden === "unhidden"}
              />
              <SegmentedButtonSegment disabled label="Hidden" selected={props.preset.whitelist.hidden === "hidden"} />
              <SegmentedButtonSegment disabled label="All" selected={props.preset.whitelist.hidden === "all"} />
            </SegmentedButton>
          </div>
        </div>
        <div className="group">
          <div className="subheader">
            <Typography use="caption">Favorites</Typography>
          </div>
          <div className="checkbox-container">
            <Checkbox checked={props.preset.whitelist.favorites} disabled />
          </div>
        </div>
        <div className="group">
          <div className="subheader">
            <Typography use="caption">Bought</Typography>
          </div>
          <div className="checkbox-container">
            <Checkbox checked={props.preset.whitelist.bought} disabled />
          </div>
        </div>
        <div className="group">
          <div className="subheader">
            <Typography use="caption">Profiles</Typography>
          </div>
          <div className="chip-set-container">
            <ChipSet choice>
              {props.preset.whitelist.profiles.map((profile) => (
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
              {props.preset.whitelist.shipped.map((shipped) => (
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
              {props.preset.whitelist.regions.map((region) => (
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
              <SegmentedButtonSegment
                disabled
                label="Include"
                selected={props.preset.whitelist.vendorMode === "include"}
              />
              <SegmentedButtonSegment
                disabled
                label="Exclude"
                selected={props.preset.whitelist.vendorMode === "exclude"}
              />
            </SegmentedButton>
          </div>
          <div className="chip-set-container">
            <ChipSet choice>
              {props.preset.whitelist.vendors.map((vendor) => (
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
