import { Fragment, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { selectAllTags, selectEntries, selectFilteredTag, setFilteredTag } from "@s/guides";
import { formattedVisibility, visibilityIcons, visibilityVals } from "@s/guides/constants";
import { GuideEntryType } from "@s/guides/types";
import { iconObject } from "@s/util/functions";
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
import "./entries-list.scss";

type EntriesDrawerProps = {
  openEntry: (entry: GuideEntryType) => void;
  detailEntry: GuideEntryType;
};

export const EntriesList = (props: EntriesDrawerProps) => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);

  const entries = useAppSelector(selectEntries);
  const allTags = useAppSelector(selectAllTags);
  const filteredTag = useAppSelector(selectFilteredTag);

  const setScroll = () => {
    const chipSet = document.getElementById("filter-chip-set");
    if (chipSet) {
      const selectedChip = chipSet.querySelector(".mdc-chip-set .mdc-chip--selected");
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
        <ChipSet id="filter-chip-set" choice>
          <div className="padding-fix" />
          {allTags.map((value) => (
            <Chip
              label={value}
              key={value}
              selected={value === filteredTag}
              onClick={() => {
                setFilter(value);
              }}
            />
          ))}
        </ChipSet>
      </div>
    </div>
  );

  return (
    <BoolWrapper
      condition={device === "desktop"}
      trueWrapper={(children) => (
        <Drawer className="entries-drawer">
          {filterChips}
          <DrawerContent>{children}</DrawerContent>
        </Drawer>
      )}
      falseWrapper={(children) => (
        <div className="entries-list-container">
          {filterChips}
          {children}
        </div>
      )}
    >
      <List twoLine className="entries-list three-line">
        {visibilityVals.map((visibility) => {
          const filteredEntries = entries.filter(
            (entry) => entry.visibility === visibility && (filteredTag === "" || entry.tags.includes(filteredTag))
          );
          const icon = visibilityIcons[visibility];
          if (filteredEntries.length > 0) {
            return (
              <Fragment key={visibility}>
                <ListGroup>
                  <ListGroupSubheader>
                    {typeof icon === "object" ? (
                      <Icon icon={{ ...icon, size: "xsmall" }} />
                    ) : (
                      <Icon icon={{ icon: icon, size: "xsmall" }} />
                    )}
                    {formattedVisibility[visibility]}
                  </ListGroupSubheader>
                  {filteredEntries.map((entry) => (
                    <ListItem
                      key={entry.id}
                      onClick={() => {
                        props.openEntry(entry);
                      }}
                      selected={props.detailEntry.id === entry.id}
                    >
                      <ListItemGraphic
                        icon={iconObject(
                          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                            <g>
                              <rect fill="none" height="24" width="24" y="0" />
                              <path
                                d="M5,5v14h14V5H5z M14,17H7v-2h7V17z M17,13H7v-2h10V13z M17,9H7V7h10V9z"
                                opacity=".3"
                              />
                              <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M19,19H5V5h14V19z M17,13H7v-2h10 V13z M17,9H7V7h10V9z M14,17H7v-2h7V17z" />
                            </g>
                          </svg>
                        )}
                      />
                      <ListItemText>
                        <ListItemPrimaryText>{entry.title}</ListItemPrimaryText>
                        {entry.description ? <ListItemSecondaryText>{entry.description}</ListItemSecondaryText> : null}
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
