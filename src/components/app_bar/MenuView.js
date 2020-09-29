import React from "react";
import { Menu, MenuItem } from "@rmwc/menu";

export class MenuView extends React.Component {
  render() {
    return (
      <Menu
        anchorCorner="bottomLeft"
        open={this.props.open}
        onSelect={this.props.onSelect}
        onClose={this.props.onClose}
      >
        <MenuItem selected={this.props.view === "card"}>Card</MenuItem>
        <MenuItem selected={this.props.view === "list"}>List</MenuItem>
        <MenuItem selected={this.props.view === "imageList"}>Image List</MenuItem>
        <MenuItem selected={this.props.view === "compact"}>Compact</MenuItem>
      </Menu>
    );
  }
}
export default MenuView;
