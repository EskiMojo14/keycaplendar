import React from "react";
import { Menu, MenuItem } from "@rmwc/menu";
import { sortNames, sortBlacklist } from "../../../util/constants";

type MenuSortProps = {
  onClose: () => void;
  onSelect: (sort: string) => void;
  open: boolean;
  page: string;
  sort: string;
};

export const MenuSort = (props: MenuSortProps) => {
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onClose={props.onClose}>
      {Object.keys(sortNames).map((key) => {
        return sortBlacklist[key].includes(props.page) ? null : (
          <MenuItem selected={props.sort === key} onClick={() => props.onSelect(key)} key={key}>
            {sortNames[key]}
          </MenuItem>
        );
      })}
    </Menu>
  );
};
export default MenuSort;
