import React from "react";
import { List, ListItem } from "@rmwc/list";
import { Menu, MenuItem } from "@rmwc/menu";
import "./Autocomplete.scss";
import reactStringReplace from "react-string-replace";

export class Autocomplete extends React.Component {
  render() {
    const matchingItems = this.props.array.filter((item) => {
      return item.toLowerCase().indexOf(this.props.query.toLowerCase()) > -1;
    });
    const firstFour = matchingItems.slice(0, 4);
    return (
      <Menu
        className="autocomplete"
        focusOnOpen={false}
        open={this.props.open && this.props.query.length >= this.props.minChars && matchingItems.length > 0}
        anchorCorner="bottomLeft"
        onSelect={(e) => this.props.select(this.props.prop, matchingItems[e.detail.index])}
        onFocus={this.props.onFocus}
        onBlur={this.props.onBlur}
      >
        {this.props.query.length >= this.props.minChars
          ? this.props.open
            ? matchingItems.map((item, index) => {
                return (
                  <MenuItem key={index}>
                    {this.props.query.length > 0
                      ? reactStringReplace(item, this.props.query, (match, i) => (
                          <span key={match + i} className="highlight">
                            {match}
                          </span>
                        ))
                      : item}
                  </MenuItem>
                );
              })
            : firstFour.map((item, index) => {
                return (
                  <MenuItem key={index}>
                    {this.props.query.length > 0
                      ? reactStringReplace(item, this.props.query, (match, i) => (
                          <span key={match + i} className="highlight">
                            {match}
                          </span>
                        ))
                      : item}
                  </MenuItem>
                );
              })
          : ""}
      </Menu>
    );
  }
}
export class AutocompleteMobile extends React.Component {
  render() {
    const matchingItems = this.props.array.filter((item) => {
      return item.toLowerCase().indexOf(this.props.query.toLowerCase()) > -1;
    });
    return (
      <div
        className={"autocomplete-mobile" + (this.props.open ? " autocomplete-mobile--open" : "")}
      >
        <List>
          {this.props.query.length >= this.props.minChars
            ? matchingItems.map((item, index) => {
                return (
                  <ListItem key={index} onClick={() => this.props.select(this.props.prop, item)}>
                    {this.props.query.length > 0
                      ? reactStringReplace(item, this.props.query, (match, i) => (
                          <span key={match + i} className="highlight">
                            {match}
                          </span>
                        ))
                      : item}
                  </ListItem>
                );
              })
            : ""}
        </List>
      </div>
    );
  }
}

export default Autocomplete;
