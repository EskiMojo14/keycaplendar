import React from "react";
import { List, ListItem } from "@rmwc/list";
import { Menu, MenuItem } from "@rmwc/menu";
import "./Autocomplete.scss";
import reactStringReplace from "react-string-replace";

export const Autocomplete = (props) => {
  const matchingItems = props.array.filter((item) => {
    return item.toLowerCase().includes(props.query.toLowerCase());
  });
  const firstFour = matchingItems.slice(0, 4);
  return (
    <Menu
      className="autocomplete"
      focusOnOpen={false}
      open={props.open && props.query.length >= props.minChars && matchingItems.length > 0}
      anchorCorner="bottomLeft"
      onSelect={(e) => {
        props.select(props.prop, matchingItems[e.detail.index]);
        document.activeElement.blur();
      }}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      fixed={props.fixed}
    >
      {props.query.length >= props.minChars
        ? props.open
          ? matchingItems.map((item) => {
              return (
                <MenuItem key={item}>
                  {props.query.length > 0
                    ? reactStringReplace(item, props.query, (match, i) => (
                        <span key={match + i} className="highlight">
                          {match}
                        </span>
                      ))
                    : item}
                </MenuItem>
              );
            })
          : firstFour.map((item) => {
              return (
                <MenuItem key={item}>
                  {props.query.length > 0
                    ? reactStringReplace(item, props.query, (match, i) => (
                        <span key={match + i} className="highlight">
                          {match}
                        </span>
                      ))
                    : item}
                </MenuItem>
              );
            })
        : null}
    </Menu>
  );
};
export const AutocompleteMobile = (props) => {
  const matchingItems = props.array.filter((item) => {
    return item.toLowerCase().includes(props.query.toLowerCase());
  });
  return (
    <div className={"autocomplete-mobile" + (props.open ? " autocomplete-mobile--open" : "")}>
      <List>
        {props.query.length >= props.minChars
          ? matchingItems.map((item) => {
              return (
                <ListItem key={item} onClick={() => props.select(props.prop, item)}>
                  {props.query.length > 0
                    ? reactStringReplace(item, props.query, (match, i) => (
                        <span key={match + i} className="highlight">
                          {match}
                        </span>
                      ))
                    : item}
                </ListItem>
              );
            })
          : null}
      </List>
    </div>
  );
};

export default Autocomplete;
