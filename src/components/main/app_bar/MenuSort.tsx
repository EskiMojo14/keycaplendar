import React from "react";
import { sortNames, sortBlacklist } from "../../../util/constants";
import { capitalise } from "../../../util/functions";
import { SortOrderType } from "../../../util/types";
import { Menu, MenuItem } from "@rmwc/menu";
import { ListDivider } from "@rmwc/list";

type MenuSortProps = {
  onClose: () => void;
  setSort: (sort: string) => void;
  setSortOrder: (sortOrder: SortOrderType) => void;
  open: boolean;
  page: string;
  sort: string;
  sortOrder: SortOrderType;
};

const sortOrders: SortOrderType[] = ["ascending", "descending"];

export const MenuSort = (props: MenuSortProps) => {
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onClose={props.onClose}>
      {Object.keys(sortNames).map((key) => {
        return sortBlacklist[key].includes(props.page) ? null : (
          <MenuItem selected={props.sort === key} onClick={() => props.setSort(key)} key={key}>
            {sortNames[key]}
          </MenuItem>
        );
      })}
      <ListDivider />
      {sortOrders.map((item) => (
        <MenuItem selected={props.sortOrder === item} onClick={() => props.setSortOrder(item)} key={item}>
          {capitalise(item)}
        </MenuItem>
      ))}
    </Menu>
  );
};
export default MenuSort;
