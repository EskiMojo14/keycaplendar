import React from "react";
import PropTypes from "prop-types";
import { UserContext } from "../../util/contexts";
import { presetTypes } from "../../util/propTypeTemplates";
import { Checkbox } from "@rmwc/checkbox";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { TextField } from "@rmwc/textfield";
import { TopAppBarRow, TopAppBarSection, TopAppBarTitle, TopAppBarNavigationIcon } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import { FullScreenDialog, FullScreenDialogAppBar, FullScreenDialogContent } from "../util/FullScreenDialog";
import "./DialogFilterPreset.scss";

export class DialogFilterPreset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      new: true,
    };
  }
  componentDidUpdate = (prevProps) => {
    if (this.props.preset.name !== prevProps.preset.name) {
      this.setState({ name: this.props.preset.name, new: !this.props.preset.name });
    }
  };
  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  savePreset = () => {
    if (this.state.name) {
      const preset = {
        ...this.props.preset,
        name: this.state.name,
      };
      if (!this.props.preset.name) {
        this.context.newPreset(preset);
      } else {
        this.context.editPreset(preset);
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
              <TopAppBarTitle>{this.state.new ? "Create" : "Overwrite"} filter preset</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
              <Button label="Save" onClick={this.savePreset} disabled={!this.state.name} />
            </TopAppBarSection>
          </TopAppBarRow>
        </FullScreenDialogAppBar>
        <div className="field-container">
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
        </FullScreenDialogContent>
      </FullScreenDialog>
    );
  }
}

DialogFilterPreset.contextType = UserContext;

DialogFilterPreset.propTypes = {
  close: PropTypes.func,
  open: PropTypes.bool,
  preset: PropTypes.shape(presetTypes),
};

export default DialogFilterPreset;
