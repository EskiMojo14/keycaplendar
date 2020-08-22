import React from "react";
import { Menu, MenuItem } from "@rmwc/menu";

export class MenuSort extends React.Component {
  render() {
    const icDate = (
      <MenuItem selected={this.props.sort === "icDate" ? true : false} onClick={() => this.props.onSelect("icDate")}>
        IC date
      </MenuItem>
    );
    const launchDate =
      this.props.page !== "ic" ? (
        <MenuItem
          selected={this.props.sort === "gbLaunch" ? true : false}
          onClick={() => this.props.onSelect("gbLaunch")}
        >
          Start date
        </MenuItem>
      ) : null;
    const endDate =
      this.props.page !== "ic" && this.props.page !== "timeline" ? (
        <MenuItem selected={this.props.sort === "gbEnd" ? true : false} onClick={() => this.props.onSelect("gbEnd")}>
          End date
        </MenuItem>
      ) : null;
    const vendorOption =
      this.props.page !== "ic" ? (
        <MenuItem selected={this.props.sort === "vendor" ? true : false} onClick={() => this.props.onSelect("vendor")}>
          Vendor
        </MenuItem>
      ) : null;
    return (
      <Menu anchorCorner="bottomLeft" open={this.props.open} onClose={this.props.onClose}>
        <MenuItem
          selected={this.props.sort === "profile" ? true : false}
          onClick={() => this.props.onSelect("profile")}
        >
          Profile
        </MenuItem>
        <MenuItem
          selected={this.props.sort === "designer" ? true : false}
          onClick={() => this.props.onSelect("designer")}
        >
          Designer
        </MenuItem>
        {vendorOption}
        {icDate}
        {launchDate}
        {endDate}
      </Menu>
    );
  }
}
export default MenuSort;
