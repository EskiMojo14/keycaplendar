import { Fragment, useEffect } from "react";
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
  selectEntries,
  selectFilteredTag,
  setFilteredTag,
} from "@s/guides";
import {
  formattedVisibility,
  visibilityIcons,
  visibilityVals,
} from "@s/guides/constants";
import type { GuideEntryType } from "@s/guides/types";
import { iconObject } from "@s/util/functions";
import { Article } from "@i";
import "./entries-list.scss";

type EntriesDrawerProps = {
  openEntry: (entry: GuideEntryType) => void;
  detailEntry: GuideEntryType;
};

export const EntriesList = ({ openEntry, detailEntry }: EntriesDrawerProps) => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);

  const entries = useAppSelector(selectEntries);
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
        {visibilityVals.map((visibility) => {
          const filteredEntries = entries.filter(
            (entry) =>
              entry.visibility === visibility &&
              (filteredTag === "" || entry.tags.includes(filteredTag))
          );
          const { [visibility]: icon } = visibilityIcons;
          if (filteredEntries.length > 0) {
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
                  {filteredEntries.map((entry) => (
                    <ListItem
                      key={entry.id}
                      onClick={() => {
                        openEntry(entry);
                      }}
                      selected={detailEntry.id === entry.id}
                    >
                      <ListItemGraphic icon={iconObject(<Article />)} />
                      <ListItemText>
                        <ListItemPrimaryText>{entry.title}</ListItemPrimaryText>
                        {entry.description ? (
                          <ListItemSecondaryText>
                            {entry.description}
                          </ListItemSecondaryText>
                        ) : null}
                      </ListItemText>
                    </ListItem>
                  ))}
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
