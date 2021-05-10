import React from "react";
import { sortNames, sortBlacklist, allSorts } from "../../../util/constants";
import { arrayIncludes, capitalise } from "../../../util/functions";
import { Page, SortOrderType, SortType } from "../../../util/types";
import { Menu, MenuItem } from "@rmwc/menu";
import { ListDivider } from "@rmwc/list";

type MenuSortProps = {
  onClose: () => void;
  setSort: (sort: SortType) => void;
  setSortOrder: (sortOrder: SortOrderType) => void;
  open: boolean;
  page: Page;
  sort: SortType;
  sortOrder: SortOrderType;
};

const sortOrders: SortOrderType[] = ["ascending", "descending"];

export const MenuSort = (props: MenuSortProps) => {
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onClose={props.onClose}>
      {allSorts.map((key) => {
        return arrayIncludes(sortBlacklist[key], props.page) ? null : (
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
