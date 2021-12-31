import { ListDivider } from "@rmwc/list";
import { Menu, MenuItem } from "@rmwc/menu";
import { useAppSelector } from "~/app/hooks";
import { selectPage } from "@s/common";
import { selectSort, selectSortOrder } from "@s/main";
import { allSorts, sortBlacklist, sortNames } from "@s/main/constants";
import { setSort, setSortOrder } from "@s/main/functions";
import type { SortOrderType } from "@s/main/types";
import { arrayIncludes, capitalise } from "@s/util/functions";

type MenuSortProps = {
  onClose: () => void;
  open: boolean;
};

const sortOrders: SortOrderType[] = ["ascending", "descending"];

export const MenuSort = ({ onClose, open }: MenuSortProps) => {
  const page = useAppSelector(selectPage);
  const sort = useAppSelector(selectSort);
  const sortOrder = useAppSelector(selectSortOrder);
  return (
    <Menu anchorCorner="bottomLeft" open={open} onClose={onClose}>
      {allSorts.map((key) =>
        arrayIncludes(sortBlacklist[key], page) ? null : (
          <MenuItem selected={sort === key} onClick={() => setSort(key)} key={key}>
            {sortNames[key]}
          </MenuItem>
        )
      )}
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
