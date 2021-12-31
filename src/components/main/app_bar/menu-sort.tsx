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
    <Menu anchorCorner="bottomLeft" onClose={onClose} open={open}>
      {allSorts.map((key) =>
        arrayIncludes(sortBlacklist[key], page) ? null : (
          <MenuItem
            key={key}
            onClick={() => setSort(key)}
            selected={sort === key}
          >
            {sortNames[key]}
          </MenuItem>
        )
      )}
      <ListDivider />
      {sortOrders.map((item) => (
        <MenuItem
          key={item}
          onClick={() => setSortOrder(item)}
          selected={sortOrder === item}
        >
          {capitalise(item)}
        </MenuItem>
      ))}
    </Menu>
  );
};
export default MenuSort;
