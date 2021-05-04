import React from "react";
import { UserContext } from "../../util/contexts";
import { PresetType } from "../../util/types";
import { Checkbox } from "@rmwc/checkbox";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { TextField } from "@rmwc/textfield";
import { TopAppBarRow, TopAppBarSection, TopAppBarTitle, TopAppBarNavigationIcon } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { SegmentedButton, SegmentedButtonSegment } from "../util/SegmentedButton";
import { FullScreenDialog, FullScreenDialogAppBar, FullScreenDialogContent } from "../util/FullScreenDialog";
import "./DialogFilterPreset.scss";

type DialogFilterPresetProps = {
  close: () => void;
  open: boolean;
  preset: PresetType;
};

type DialogFilterPresetState = {
  name: string;
  new: boolean;
};

export class DialogFilterPreset extends React.Component<DialogFilterPresetProps, DialogFilterPresetState> {
  state: DialogFilterPresetState = {
    name: "",
    new: true,
  };
  componentDidUpdate = (prevProps: DialogFilterPresetProps) => {
    if (this.props.preset.name !== prevProps.preset.name) {
      this.setState({ name: this.props.preset.name, new: !this.props.preset.name });
    }
  };
  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState<never>({ [e.target.name]: e.target.value });
  };
  savePreset = () => {
    if (this.state.name) {
      const preset = {
        ...this.props.preset,
        name: this.state.name,
      };
      if (this.props.preset.global && this.context.user.isAdmin) {
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
    return (
      <FullScreenDialog open={this.props.open} onClose={this.props.close} className="filter-preset-dialog">
        <FullScreenDialogAppBar>
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={this.props.close} />
              <TopAppBarTitle>
                {this.state.new ? "Create" : "Modify"}
                {this.props.preset.global && this.context.user.isAdmin ? " global" : ""} filter preset
              </TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
              <Button label="Save" onClick={this.savePreset} disabled={!this.state.name} />
            </TopAppBarSection>
          </TopAppBarRow>
        </FullScreenDialogAppBar>
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
        </div>
        <FullScreenDialogContent>
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
              <Typography use="caption">Region</Typography>
            </div>
            <div className="chip-set-container">
              <ChipSet choice>
                {this.props.preset.whitelist.regions.map((region) => (
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
                  selected={this.props.preset.whitelist.vendorMode === "include"}
                />
                <SegmentedButtonSegment
                  disabled
                  label="Exclude"
                  selected={this.props.preset.whitelist.vendorMode === "exclude"}
                />
              </SegmentedButton>
            </div>
            <div className="chip-set-container">
              <ChipSet choice>
                {this.props.preset.whitelist.vendors.map((vendor) => (
                  <Chip key={vendor} label={vendor} disabled />
                ))}
              </ChipSet>
            </div>
          </div>
        </FullScreenDialogContent>
      </FullScreenDialog>
    );
  }
}

DialogFilterPreset.contextType = UserContext;

export default DialogFilterPreset;
