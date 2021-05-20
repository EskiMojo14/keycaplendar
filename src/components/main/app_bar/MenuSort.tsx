import React from "react";
import { useAppSelector } from "../../../app/hooks";
import { selectPage } from "../../../app/slices/common/commonSlice";
import { arrayIncludes, capitalise } from "../../../app/slices/common/functions";
import { allSorts, sortBlacklist, sortNames } from "../../../app/slices/main/constants";
import { SortOrderType, SortType } from "../../../app/slices/main/types";
import { Menu, MenuItem } from "@rmwc/menu";
import { ListDivider } from "@rmwc/list";

type MenuSortProps = {
  onClose: () => void;
  setSort: (sort: SortType) => void;
  setSortOrder: (sortOrder: SortOrderType) => void;
  open: boolean;
  sort: SortType;
  sortOrder: SortOrderType;
};

const sortOrders: SortOrderType[] = ["ascending", "descending"];

export const MenuSort = (props: MenuSortProps) => {
  const page = useAppSelector(selectPage);
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onClose={props.onClose}>
      {allSorts.map((key) => {
        return arrayIncludes(sortBlacklist[key], page) ? null : (
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
