import React from "react";
import { Menu, MenuItem } from "@rmwc/menu";
import { viewNames } from "../../../util/constants";

type MenuViewProps = {
  onClose: () => void;
  open: boolean;
  setView: (view: string) => void;
  view: string;
};

export const MenuView = (props: MenuViewProps) => {
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onClose={props.onClose}>
      {Object.keys(viewNames).map((key) => {
        return (
          <MenuItem key={key} selected={props.view === key} onClick={() => props.setView(key)}>
            {viewNames[key]}
          </MenuItem>
        );
      })}
    </Menu>
  );
};
export default MenuView;
