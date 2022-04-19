import { ListDivider } from "@rmwc/list";
import { Menu, MenuItem } from "@rmwc/menu";
import { useAppDispatch, useAppSelector } from "@h";
import usePage from "@h/use-page";
import { selectSort, selectSortOrder } from "@s/main";
import { allSorts, sortBlacklist, sortNames } from "@s/main/constants";
import { setSort, setSortOrder } from "@s/main/thunks";
import type { SortOrderType } from "@s/main/types";
import { arrayIncludes, capitalise } from "@s/util/functions";

type MenuSortProps = {
  onClose: () => void;
  open: boolean;
};

const sortOrders: SortOrderType[] = ["ascending", "descending"];

export const MenuSort = ({ onClose, open }: MenuSortProps) => {
  const dispatch = useAppDispatch();

  const page = usePage();

  const sort = useAppSelector(selectSort);
  const sortOrder = useAppSelector(selectSortOrder);
  return (
    <Menu anchorCorner="bottomLeft" onClose={onClose} open={open}>
      {allSorts.map((key) =>
        arrayIncludes(sortBlacklist[key], page) ? null : (
          <MenuItem
            key={key}
            onClick={() => dispatch(setSort(key))}
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
          onClick={() => dispatch(setSortOrder(item))}
          selected={sortOrder === item}
        >
          {capitalise(item)}
        </MenuItem>
      ))}
    </Menu>
  );
};
export default MenuSort;
