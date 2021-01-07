import React from "react";
import PropTypes from "prop-types";
import { Menu, MenuItem } from "@rmwc/menu";
import { sortNames, sortBlacklist } from "../../util/constants";

export const MenuSort = (props) => {
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onClose={props.onClose}>
      {Object.keys(sortNames).map((key) => {
        return sortBlacklist[key].includes(props.page) ? null : (
          <MenuItem selected={props.sort === key} onClick={() => props.onSelect(key)} key={key}>
            {sortNames[key]}
          </MenuItem>
        );
      })}
    </Menu>
  );
};
export default MenuSort;

MenuSort.propTypes = {
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  open: PropTypes.bool,
  page: PropTypes.string,
  sort: PropTypes.string,
};
