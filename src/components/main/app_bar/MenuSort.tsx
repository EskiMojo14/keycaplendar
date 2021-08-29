import React from "react";
import { useAppSelector } from "~/app/hooks";
import { selectPage } from "@s/common";
import { selectSort, selectSortOrder } from "@s/main";
import { allSorts, sortBlacklist, sortNames } from "@s/main/constants";
import { setSort, setSortOrder } from "@s/main/functions";
import { SortOrderType } from "@s/main/types";
import { arrayIncludes, capitalise } from "@s/util/functions";
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
      {allSorts.map((key) => arrayIncludes(sortBlacklist[key], page) ? null : (
          <MenuItem selected={sort === key} onClick={() => setSort(key)} key={key}>
            {sortNames[key]}
          </MenuItem>
        ))}
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
