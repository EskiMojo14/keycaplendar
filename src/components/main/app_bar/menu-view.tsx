import { Menu, MenuItem } from "@rmwc/menu";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectView } from "@s/settings";
import { allViews, viewNames } from "@s/settings/constants";
import { setView } from "@s/settings/thunks";

type MenuViewProps = {
  onClose: () => void;
  open: boolean;
};

export const MenuView = ({ onClose, open }: MenuViewProps) => {
  const dispatch = useAppDispatch();
  const view = useAppSelector(selectView);
  return (
    <Menu anchorCorner="bottomLeft" onClose={onClose} open={open}>
      {allViews.map((key) => (
        <MenuItem
          key={key}
          onClick={() => dispatch(setView(key))}
          selected={view === key}
        >
          {viewNames[key]}
        </MenuItem>
      ))}
    </Menu>
  );
};
export default MenuView;
