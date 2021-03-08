import React from "react";
import PropTypes from "prop-types";
import { Menu, MenuItem } from "@rmwc/menu";
import { viewNames } from "../../../util/constants";

export const MenuView = (props) => {
  const onSelect = (e) => {
    props.setView(Object.keys(viewNames)[e.detail.index]);
  };
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onSelect={onSelect} onClose={props.onClose}>
      {Object.keys(viewNames).map((key) => {
        return (
          <MenuItem key={key} selected={props.view === key}>
            {viewNames[key]}
          </MenuItem>
        );
      })}
    </Menu>
  );
};
export default MenuView;

MenuView.propTypes = {
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  open: PropTypes.bool,
  setView: PropTypes.func,
  view: PropTypes.string,
};
