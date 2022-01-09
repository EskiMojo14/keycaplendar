import { Fragment, useEffect } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { Chip, ChipSet } from "@rmwc/chip";
import { Drawer, DrawerContent } from "@rmwc/drawer";
import { Icon } from "@rmwc/icon";
import {
  List,
  ListDivider,
  ListGroup,
  ListGroupSubheader,
  ListItem,
  ListItemGraphic,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from "@rmwc/list";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { BoolWrapper } from "@c/util/conditional-wrapper";
import { selectDevice } from "@s/common";
import {
  selectAllTags,
  selectEntryMap,
  selectFilteredTag,
  selectVisibilityMap,
  setFilteredTag,
} from "@s/guides";
import { formattedVisibility, visibilityIcons } from "@s/guides/constants";
import { iconObject, objectEntries } from "@s/util/functions";
import { Article } from "@i";
import "./entries-list.scss";

type EntriesDrawerProps = {
  detailEntry: EntityId;
  openEntry: (entry: EntityId) => void;
};

export const EntriesList = ({ detailEntry, openEntry }: EntriesDrawerProps) => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);

  const entriesMap = useAppSelector(selectEntryMap);
  const visibilityMap = useAppSelector(selectVisibilityMap);
  const allTags = useAppSelector(selectAllTags);
  const filteredTag = useAppSelector(selectFilteredTag);

  const setScroll = () => {
    const chipSet = document.getElementById("filter-chip-set");
    if (chipSet) {
      const selectedChip = chipSet.querySelector(
        ".mdc-chip-set .mdc-chip--selected"
      );
      if (selectedChip && selectedChip instanceof HTMLElement) {
        chipSet.scrollLeft = selectedChip.offsetLeft - 24;
      } else {
        chipSet.scrollLeft = 0;
      }
    }
  };
  useEffect(setScroll, [filteredTag]);

  const setFilter = (tag: string) => {
    if (filteredTag === tag) {
      dispatch(setFilteredTag(""));
    } else {
      dispatch(setFilteredTag(tag));
    }
  };

  const filterChips = (
    <div className="filter-chips-container">
      <div className="filter-chips">
        <ChipSet choice id="filter-chip-set">
          <div className="padding-fix" />
          {allTags.map((value) => (
            <Chip
              key={value}
              label={value}
              onClick={() => {
                setFilter(value);
              }}
              selected={value === filteredTag}
            />
          ))}
        </ChipSet>
      </div>
    </div>
  );

  return (
    <BoolWrapper
      condition={device === "desktop"}
      falseWrapper={(children) => (
        <div className="entries-list-container">
          {filterChips}
          {children}
        </div>
      )}
      trueWrapper={(children) => (
        <Drawer className="entries-drawer">
          {filterChips}
          <DrawerContent>{children}</DrawerContent>
        </Drawer>
      )}
    >
      <List className="entries-list three-line" twoLine>
        {objectEntries(visibilityMap).map(([visibility, entryIds]) => {
          const entries = entryIds
            .map((id) => entriesMap[id])
            .filter(
              (entry) => filteredTag === "" || entry?.tags.includes(filteredTag)
            );
          const { [visibility]: icon } = visibilityIcons;
          if (entries.length > 0) {
            return (
              <Fragment key={visibility}>
                <ListGroup>
                  <ListGroupSubheader>
                    {typeof icon === "object" ? (
                      <Icon icon={{ ...icon, size: "xsmall" }} />
                    ) : (
                      <Icon icon={{ icon, size: "xsmall" }} />
                    )}
                    {formattedVisibility[visibility]}
                  </ListGroupSubheader>
                  {entries.map(
                    (entry) =>
                      entry && (
                        <ListItem
                          key={entry.id}
                          onClick={() => openEntry(entry.id)}
                          selected={detailEntry === entry.id}
                        >
                          <ListItemGraphic icon={iconObject(<Article />)} />
                          <ListItemText>
                            <ListItemPrimaryText>
                              {entry?.title}
                            </ListItemPrimaryText>
                            {entry?.description ? (
                              <ListItemSecondaryText>
                                {entry.description}
                              </ListItemSecondaryText>
                            ) : null}
                          </ListItemText>
                        </ListItem>
                      )
                  )}
                </ListGroup>
                <ListDivider />
              </Fragment>
            );
          }
          return null;
        })}
      </List>
    </BoolWrapper>
  );
};
