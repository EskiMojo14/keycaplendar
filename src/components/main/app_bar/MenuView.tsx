import React from "react";
import { Menu, MenuItem } from "@rmwc/menu";
import { allViews, viewNames } from "../../../util/constants";
import { ViewType } from "../../../util/types";

type MenuViewProps = {
  onClose: () => void;
  open: boolean;
  setView: (view: ViewType) => void;
  view: ViewType;
};

export const MenuView = (props: MenuViewProps) => {
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onClose={props.onClose}>
      {allViews.map((key) => {
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
