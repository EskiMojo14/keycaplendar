import type { HTMLAttributes } from "react";
import { List, ListItem } from "@rmwc/list";
import { Menu, MenuItem } from "@rmwc/menu";
import classNames from "classnames";
import reactStringReplace from "react-string-replace";
import BEMHelper from "@s/common/bem-helper";
import "./autocomplete.scss";

type AutocompleteProps = HTMLAttributes<HTMLElement> & {
  array: string[];
  minChars: number;
  open: boolean;
  prop: string;
  query: string;
  select: (prop: string, item: string) => void;
  listSplit?: boolean;
};

export const Autocomplete = ({
  array,
  className,
  minChars,
  open,
  prop,
  query,
  listSplit,
  select,
  ...filteredProps
}: AutocompleteProps) => {
  const splitQuery = query.split(", ");
  const { [splitQuery.length - 1]: lastItem } = splitQuery;
  const useQuery = listSplit ? lastItem : query;
  const matchingItems = array.filter((item) => item.toLowerCase().includes(useQuery.toLowerCase()));
  const firstFour = matchingItems.slice(0, 4);
  return (
    <Menu
      {...filteredProps}
      className={classNames("autocomplete", className)}
      focusOnOpen={false}
      open={open && useQuery.length >= minChars && matchingItems.length > 0}
      anchorCorner="bottomLeft"
      onSelect={(e) => {
        select(prop, matchingItems[e.detail.index]);
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }}
    >
      {useQuery.length >= minChars
        ? open
          ? matchingItems.map((item) => (
              <MenuItem key={item}>
                {useQuery.length > 0
                  ? reactStringReplace(item, useQuery, (match, i) => (
                      <span key={match + i} className="highlight">
                        {match}
                      </span>
                    ))
                  : item}
              </MenuItem>
            ))
          : firstFour.map((item) => (
              <MenuItem key={item}>
                {useQuery.length > 0
                  ? reactStringReplace(item, useQuery, (match, i) => (
                      <span key={match + i} className="highlight">
                        {match}
                      </span>
                    ))
                  : item}
              </MenuItem>
            ))
        : null}
    </Menu>
  );
};

const bemClasses = new BEMHelper("autocomplete-mobile");

export const AutocompleteMobile = ({
  array,
  className,
  minChars,
  open,
  prop,
  query,
  listSplit,
  select,
  ...filteredProps
}: AutocompleteProps) => {
  const splitQuery = query.split(", ");
  const { [splitQuery.length - 1]: lastItem } = splitQuery;
  const useQuery = listSplit ? lastItem : query;
  const matchingItems = array.filter((item) => item.toLowerCase().includes(useQuery.toLowerCase()));
  return (
    <div {...filteredProps} className={bemClasses({ modifiers: { open }, extra: className })}>
      <List>
        {useQuery.length >= minChars
          ? matchingItems.map((item) => (
              <ListItem key={item} onClick={() => select(prop, item)}>
                {useQuery.length > 0
                  ? reactStringReplace(item, useQuery, (match, i) => (
                      <span key={match + i} className="highlight">
                        {match}
                      </span>
                    ))
                  : item}
              </ListItem>
            ))
          : null}
      </List>
    </div>
  );
};

export default Autocomplete;
