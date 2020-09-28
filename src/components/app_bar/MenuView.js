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
      <MenuItem selected={props.view === "card" ? true : false}>Card</MenuItem>
      <MenuItem selected={props.view === "list" ? true : false}>List</MenuItem>
      <MenuItem selected={props.view === "imageList" ? true : false}>Image List</MenuItem>
      <MenuItem selected={props.view === "compact" ? true : false}>Compact</MenuItem>
    </Menu>
  );
};
export default MenuView;
