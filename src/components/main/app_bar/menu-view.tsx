import { Menu, MenuItem } from "@rmwc/menu";
import { useAppSelector } from "~/app/hooks";
import { selectView } from "@s/settings";
import { allViews, viewNames } from "@s/settings/constants";
import { setView } from "@s/settings/functions";

type MenuViewProps = {
  onClose: () => void;
  open: boolean;
};

export const MenuView = ({ onClose, open }: MenuViewProps) => {
  const view = useAppSelector(selectView);
  return (
    <Menu anchorCorner="bottomLeft" open={open} onClose={onClose}>
      {allViews.map((key) => (
        <MenuItem key={key} selected={view === key} onClick={() => setView(key)}>
          {viewNames[key]}
        </MenuItem>
      ))}
    </Menu>
  );
};
export default MenuView;
