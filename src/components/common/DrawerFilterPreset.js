import React from "react";
import { UserContext } from "../../util/contexts";
import { Checkbox } from "@rmwc/checkbox";
import { Button } from "@rmwc/button";
import { ChipSet, Chip } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerContent, DrawerTitle } from "@rmwc/drawer";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./DrawerFilterPreset.scss";

export class DrawerFilterPreset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      new: true,
    };
  }
  componentDidUpdate = (prevProps) => {
    if (
      this.props.filterPreset.name !== prevProps.filterPreset.name &&
      this.props.filterPreset.name !== this.state.name
    ) {
      if (this.props.filterPreset.name === "New") {
        this.setState({ name: "", new: true });
      } else {
        this.setState({ name: this.props.filterPreset.name, new: this.props.filterPreset.name === "" });
      }
    }
  };
  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  addPreset = () => {
    if (this.state.name !== "" && this.state.name !== "New") {
      const preset = {
        ...this.props.filterPreset,
        name: this.state.name,
      };
      this.context.addPreset(preset);
      this.props.close();
    }
  };
  render() {
    return (
      <Drawer modal open={this.props.open} onClose={this.props.close} className="filter-preset-drawer drawer-right">
        <DrawerHeader>
          <DrawerTitle>{this.state.new ? "Create" : "Edit"} filter preset</DrawerTitle>
          <Button
            label="Save"
            disabled={this.state.name === "" || this.state.name === "New"}
            outlined
            onClick={this.addPreset}
          />
        </DrawerHeader>
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
        <DrawerContent>
          <div className="group">
            <div className="subheader">
              <Typography use="caption">Favorites</Typography>
            </div>
            <div className="checkbox-container">
              <Checkbox checked={this.props.filterPreset.whitelist.favorites} disabled />
            </div>
          </div>
          <div className="group">
            <div className="subheader">
              <Typography use="caption">Profiles</Typography>
            </div>
            <div className="chip-set-container">
              <ChipSet choice>
                {this.props.filterPreset.whitelist.profiles.map((profile) => (
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
                {this.props.filterPreset.whitelist.shipped.map((shipped) => (
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
                  selected={this.props.filterPreset.whitelist.vendorMode === "include"}
                />
                <ToggleGroupButton
                  disabled
                  label="Exclude"
                  selected={this.props.filterPreset.whitelist.vendorMode === "exclude"}
                />
              </ToggleGroup>
            </div>
            <div className="chip-set-container">
              <ChipSet choice>
                {this.props.filterPreset.whitelist.vendors.map((vendor) => (
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
