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
import { BoolWrapper } from "@c/util/conditional-wrapper";
import { useAppDispatch, useAppSelector } from "@h";
import useDevice from "@h/use-device";
import {
  selectAllTags,
  selectEntryMap,
  selectFilteredTag,
  selectFilteredVisibilityMap,
  setFilteredTag,
} from "@s/guides";
import { formattedVisibility, visibilityIcons } from "@s/guides/constants";
import { iconObject, objectEntries } from "@s/util/functions";
import { Article } from "@i";
import "./entries-list.scss";

type EntriesDrawerProps = {
  detailEntry: EntityId | undefined;
  openEntry: (entry: EntityId) => void;
};

export const EntriesList = ({ detailEntry, openEntry }: EntriesDrawerProps) => {
  const dispatch = useAppDispatch();

  const device = useDevice();

  const entriesMap = useAppSelector(selectEntryMap);
  const allTags = useAppSelector(selectAllTags);
  const filteredTag = useAppSelector(selectFilteredTag);
  const filteredVisibilityMap = useAppSelector(selectFilteredVisibilityMap);

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

  const setFilter = (tag: string) =>
    dispatch(setFilteredTag(filteredTag === tag ? "" : tag));

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
        {objectEntries(filteredVisibilityMap).map(([visibility, entryIds]) => {
          const { [visibility]: icon } = visibilityIcons;
          if (entryIds.length > 0) {
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
                  {entryIds.map(
                    (entryId) =>
                      entriesMap[entryId] && (
                        <ListItem
                          key={entryId}
                          onClick={() => openEntry(entryId)}
                          selected={detailEntry === entryId}
                        >
                          <ListItemGraphic icon={iconObject(<Article />)} />
                          <ListItemText>
                            <ListItemPrimaryText>
                              {entriesMap[entryId]?.title}
                            </ListItemPrimaryText>
                            {entriesMap[entryId]?.description && (
                              <ListItemSecondaryText>
                                {entriesMap[entryId]?.description}
                              </ListItemSecondaryText>
                            )}
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
