import React from "react";
import { Menu, MenuItem } from "@rmwc/menu";

export const MenuView = (props) => {
  return (
    <Menu
      anchorCorner="bottomLeft"
      open={props.open}
      onSelect={props.onSelect}
      onClose={props.onClose}
      onMouseLeave={
        props.cascading
          ? props.onClose
          : () => {
              return;
            }
      }
    >
      <MenuItem selected={props.view === "card"}>Card</MenuItem>
      <MenuItem selected={props.view === "list"}>List</MenuItem>
      <MenuItem selected={props.view === "imageList"}>Image List</MenuItem>
      <MenuItem selected={props.view === "compact"}>Compact</MenuItem>
    </Menu>
  );
};
export default MenuView;
