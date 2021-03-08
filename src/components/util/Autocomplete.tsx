import React from "react";
import reactStringReplace from "react-string-replace";
import classNames from "classnames";
import BEMHelper from "../../util/bemHelper";
import { List, ListItem } from "@rmwc/list";
import { Menu, MenuItem } from "@rmwc/menu";
import "./Autocomplete.scss";

type AutocompleteProps = React.HTMLAttributes<HTMLElement> & {
  array: string[];
  minChars: number;
  onBlur: () => void;
  onFocus: () => void;
  open: boolean;
  prop: string;
  query: string;
  select: (prop: string, item: string) => void;
};

export const Autocomplete = (props: AutocompleteProps) => {
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
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
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

export const AutocompleteMobile = (props: AutocompleteProps) => {
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
