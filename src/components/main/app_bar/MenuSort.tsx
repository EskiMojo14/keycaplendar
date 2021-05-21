import React from "react";
import { useAppSelector } from "../../../app/hooks";
import { selectPage } from "../../../app/slices/common/commonSlice";
import { arrayIncludes, capitalise } from "../../../app/slices/common/functions";
import { selectSort, selectSortOrder } from "../../../app/slices/main/mainSlice";
import { allSorts, sortBlacklist, sortNames } from "../../../app/slices/main/constants";
import { setSort, setSortOrder } from "../../../app/slices/main/functions";
import { SortOrderType } from "../../../app/slices/main/types";
import { Menu, MenuItem } from "@rmwc/menu";
import { ListDivider } from "@rmwc/list";

type MenuSortProps = {
  onClose: () => void;
  open: boolean;
};

const sortOrders: SortOrderType[] = ["ascending", "descending"];

export const MenuSort = (props: MenuSortProps) => {
  const page = useAppSelector(selectPage);
  const sort = useAppSelector(selectSort);
  const sortOrder = useAppSelector(selectSortOrder);
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onClose={props.onClose}>
      {allSorts.map((key) => {
        return arrayIncludes(sortBlacklist[key], page) ? null : (
          <MenuItem selected={sort === key} onClick={() => setSort(key)} key={key}>
            {sortNames[key]}
          </MenuItem>
        );
      })}
      <ListDivider />
      {sortOrders.map((item) => (
        <MenuItem selected={sortOrder === item} onClick={() => setSortOrder(item)} key={item}>
          {capitalise(item)}
        </MenuItem>
      ))}
    </Menu>
  );
};
export default MenuSort;
