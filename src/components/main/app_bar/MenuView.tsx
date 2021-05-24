import React from "react";
import { useAppSelector } from "../../../app/hooks";
import { selectView } from "../../../app/slices/settings/settingsSlice";
import { allViews, viewNames } from "../../../app/slices/settings/constants";
import { setView } from "../../../app/slices/settings/functions";
import { Menu, MenuItem } from "@rmwc/menu";

type MenuViewProps = {
  onClose: () => void;
  open: boolean;
};

export const MenuView = (props: MenuViewProps) => {
  const view = useAppSelector(selectView);
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onClose={props.onClose}>
      {allViews.map((key) => {
        return (
          <MenuItem key={key} selected={view === key} onClick={() => setView(key)}>
            {viewNames[key]}
          </MenuItem>
        );
      })}
    </Menu>
  );
};
export default MenuView;
