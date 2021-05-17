import React from "react";
import { useAppSelector } from "../../../app/hooks";
import { selectMainView } from "../../settings/settingsSlice";
import { allViews, viewNames } from "../../../util/constants";
import { ViewType } from "../../../util/types";
import { Menu, MenuItem } from "@rmwc/menu";

type MenuViewProps = {
  onClose: () => void;
  open: boolean;
  setView: (view: ViewType) => void;
};

export const MenuView = (props: MenuViewProps) => {
  const view = useAppSelector(selectMainView);
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onClose={props.onClose}>
      {allViews.map((key) => {
        return (
          <MenuItem key={key} selected={view === key} onClick={() => props.setView(key)}>
            {viewNames[key]}
          </MenuItem>
        );
      })}
    </Menu>
  );
};
export default MenuView;
