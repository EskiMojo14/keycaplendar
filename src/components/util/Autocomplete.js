import React from "react";
import PropTypes from "prop-types";
import reactStringReplace from "react-string-replace";
import classNames from "classnames";
import BEMHelper from "../../util/bemHelper";
import { List, ListItem } from "@rmwc/list";
import { Menu, MenuItem } from "@rmwc/menu";
import "./Autocomplete.scss";

export const Autocomplete = (props) => {
  const { array, className, minChars, open, prop, query, select, ...filteredProps } = props;
  const matchingItems = array.filter((item) => {
    return item.toLowerCase().includes(query.toLowerCase());
  });
  const firstFour = matchingItems.slice(0, 4);
  return (
    <Menu
      {...filteredProps}
      className={classNames("autocomplete", className)}
      focusOnOpen={false}
      open={open && query.length >= minChars && matchingItems.length > 0}
      anchorCorner="bottomLeft"
      onSelect={(e) => {
        select(prop, matchingItems[e.detail.index]);
        document.activeElement.blur();
      }}
    >
      {query.length >= minChars
        ? open
          ? matchingItems.map((item) => {
              return (
                <MenuItem key={item}>
                  {query.length > 0
                    ? reactStringReplace(item, query, (match, i) => (
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
                  {query.length > 0
                    ? reactStringReplace(item, query, (match, i) => (
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

const bemClasses = new BEMHelper("autocomplete-mobile");

export const AutocompleteMobile = (props) => {
  const { array, className, minChars, open, prop, query, select, ...filteredProps } = props;
  const matchingItems = array.filter((item) => {
    return item.toLowerCase().includes(query.toLowerCase());
  });
  return (
    <div {...filteredProps} className={bemClasses({ modifiers: { open: open }, extra: className })}>
      <List>
        {query.length >= minChars
          ? matchingItems.map((item) => {
              return (
                <ListItem key={item} onClick={() => select(prop, item)}>
                  {query.length > 0
                    ? reactStringReplace(item, query, (match, i) => (
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

Autocomplete.propTypes = {
  array: PropTypes.arrayOf(PropTypes.string),
  minChars: PropTypes.number,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  open: PropTypes.bool,
  prop: PropTypes.string,
  query: PropTypes.string,
  select: PropTypes.func,
};

AutocompleteMobile.propTypes = {
  ...Autocomplete.propTypes,
};
