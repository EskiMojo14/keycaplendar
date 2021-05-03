import React from "react";
import { UserContext } from "../../util/contexts";
import { PresetType } from "../../util/types";
import { Checkbox } from "@rmwc/checkbox";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerContent, DrawerTitle } from "@rmwc/drawer";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./DrawerFilterPreset.scss";

type DrawerFilterPresetProps = {
  close: () => void;
  open: boolean;
  preset: PresetType;
};

type DrawerFilterPresetState = {
  name: string;
  new: boolean;
  global: boolean;
};

export class DrawerFilterPreset extends React.Component<DrawerFilterPresetProps, DrawerFilterPresetState> {
  state: DrawerFilterPresetState = {
    name: "",
    new: true,
    global: false,
  };
  componentDidUpdate = (prevProps: DrawerFilterPresetProps) => {
    if (this.props.preset.name !== prevProps.preset.name) {
      this.setState({ name: this.props.preset.name, new: !this.props.preset.name });
    }
    if (this.props.preset.global !== prevProps.preset.global) {
      this.setState({ global: !!this.props.preset.global });
    }
  };
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState<never>({ [e.target.name]: e.target.value });
  };
  handleChangeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState<never>({ [e.target.name]: e.target.checked });
  };
  savePreset = () => {
    if (this.state.name) {
      const preset = {
        ...this.props.preset,
        name: this.state.name,
        global: this.state.global,
      };
      if (this.state.global && this.context.user.isAdmin) {
        if (!this.props.preset.name) {
          this.context.newGlobalPreset(preset);
        } else {
          this.context.editGlobalPreset(preset);
        }
      } else {
        if (!this.props.preset.name) {
          this.context.newPreset(preset);
        } else {
          this.context.editPreset(preset);
        }
      }
      this.props.close();
    }
  };
  render() {
    const globalCheckbox = this.context.user.isAdmin ? (
      <Checkbox label="Global" name="global" checked={this.state.global} onChange={this.handleChangeCheckbox} />
    ) : null;
    return (
      <Drawer modal open={this.props.open} onClose={this.props.close} className="filter-preset-drawer drawer-right">
        <DrawerHeader>
          <DrawerTitle>{this.state.new ? "Create" : "Overwrite"} filter preset</DrawerTitle>
          <Button label="Save" disabled={!this.state.name} outlined onClick={this.savePreset} />
        </DrawerHeader>
        <div className="form-container">
          <TextField
            outlined
            label="Name"
            name="name"
            value={this.state.name}
            onChange={this.handleChange}
            autoComplete="off"
            required
          />
          {globalCheckbox}
        </div>
        <DrawerContent>
          <div className="group">
            <div className="subheader">
              <Typography use="caption">Favorites</Typography>
            </div>
            <div className="checkbox-container">
              <Checkbox checked={this.props.preset.whitelist.favorites} disabled />
            </div>
          </div>
          <div className="group">
            <div className="subheader">
              <Typography use="caption">Hidden</Typography>
            </div>
            <div className="checkbox-container">
              <Checkbox checked={this.props.preset.whitelist.hidden} disabled />
            </div>
          </div>
          <div className="group">
            <div className="subheader">
              <Typography use="caption">Profiles</Typography>
            </div>
            <div className="chip-set-container">
              <ChipSet choice>
                {this.props.preset.whitelist.profiles.map((profile) => (
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
                {this.props.preset.whitelist.shipped.map((shipped) => (
                  <Chip key={shipped} label={shipped} disabled />
                ))}
              </ChipSet>
            </div>
          </div>
          <div className="group">
            <div className="subheader">
              <Typography use="caption">Vendors</Typography>
            </div>
            <div className="toggle-container">
              <ToggleGroup>
                <ToggleGroupButton
                  disabled
                  label="Include"
                  selected={this.props.preset.whitelist.vendorMode === "include"}
                />
                <ToggleGroupButton
                  disabled
                  label="Exclude"
                  selected={this.props.preset.whitelist.vendorMode === "exclude"}
                />
              </ToggleGroup>
            </div>
            <div className="chip-set-container">
              <ChipSet choice>
                {this.props.preset.whitelist.vendors.map((vendor) => (
                  <Chip key={vendor} label={vendor} disabled />
                ))}
              </ChipSet>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }
}

DrawerFilterPreset.contextType = UserContext;

export default DrawerFilterPreset;
