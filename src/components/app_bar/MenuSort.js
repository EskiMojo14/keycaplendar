import React from "react";
import PropTypes from "prop-types";
import { Menu, MenuItem } from "@rmwc/menu";

export const MenuSort = (props) => {
  const icDate = (
    <MenuItem selected={props.sort === "icDate"} onClick={() => props.onSelect("icDate")}>
      IC date
    </MenuItem>
  );
  const launchDate =
    props.page !== "ic" && props.page !== "archive" && props.page !== "favorites" && props.page !== "hidden" ? (
      <MenuItem selected={props.sort === "gbLaunch"} onClick={() => props.onSelect("gbLaunch")}>
        Start date
      </MenuItem>
    ) : null;
  const endDate =
    props.page !== "ic" &&
    props.page !== "timeline" &&
    props.page !== "archive" &&
    props.page !== "favorites" &&
    props.page !== "hidden" ? (
      <MenuItem selected={props.sort === "gbEnd"} onClick={() => props.onSelect("gbEnd")}>
        End date
      </MenuItem>
    ) : null;
  const vendorOption =
    props.page !== "ic" && props.page !== "archive" && props.page !== "favorites" && props.page !== "hidden" ? (
      <MenuItem selected={props.sort === "vendor"} onClick={() => props.onSelect("vendor")}>
        Vendor
      </MenuItem>
    ) : null;
  return (
    <Menu anchorCorner="bottomLeft" open={props.open} onClose={props.onClose}>
      <MenuItem selected={props.sort === "profile"} onClick={() => props.onSelect("profile")}>
        Profile
      </MenuItem>
      <MenuItem selected={props.sort === "designer"} onClick={() => props.onSelect("designer")}>
        Designer
      </MenuItem>
      {vendorOption}
      {icDate}
      {launchDate}
      {endDate}
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
