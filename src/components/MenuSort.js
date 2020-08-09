import React from "react";
import { Menu, MenuItem } from "@rmwc/menu";

export class MenuSort extends React.Component {
  selectSort = (e) => {
    const options = this.props.page !== "ic" ? ["date","profile","designer","vendor"] : ["profile","designer"];
    this.props.onSelect(options[e.detail.index])
  }
  render() {
    const dateOption = this.props.page !== "ic" ? (
      <MenuItem selected={this.props.sort === "date" ? true : false}>Date</MenuItem>
    ) : null;
    const vendorOption =  this.props.page !== "ic" ? (
      <MenuItem selected={this.props.sort === "vendor" ? true : false}>Vendor</MenuItem>
    ) : null;
    return (
      <Menu
        anchorCorner="bottomLeft"
        open={this.props.open}
        onSelect={(e) => this.selectSort(e)}
        onClose={this.props.onClose}
      >
        {dateOption}
        <MenuItem selected={this.props.sort === "profile" ? true : false}>Profile</MenuItem>
        <MenuItem selected={this.props.sort === "designer" ? true : false}>Designer</MenuItem>
        {vendorOption}
      </Menu>
    );
  }
}
export default MenuSort;
