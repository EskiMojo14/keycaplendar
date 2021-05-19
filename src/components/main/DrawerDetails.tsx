import React, { useContext, useEffect } from "react";
import Twemoji from "react-twemoji";
import classNames from "classnames";
import moment from "moment";
import { useAppSelector } from "../../app/hooks";
import { selectDevice } from "../../app/slices/common/commonSlice";
import { selectFavorites, selectHidden, selectUser } from "../../app/slices/user/userSlice";
import { selectMainView } from "../../app/slices/settings/settingsSlice";
import { UserContext } from "../../app/slices/user/contexts";
import { alphabeticalSortProp, hasKey, iconObject } from "../../util/functions";
import { SetType } from "../../util/types";
import { Button } from "@rmwc/button";
import { Chip, ChipSet } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { List, ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, ListItemMeta } from "@rmwc/list";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { ConditionalWrapper } from "../util/ConditionalWrapper";
import "./DrawerDetails.scss";

type DrawerDetailsProps = {
  close: () => void;
  delete?: (set: SetType) => void;
  edit?: (set: SetType) => void;
  open: boolean;
  openSales: (set: SetType) => void;
  search?: string;
  set: SetType;
  setSearch?: (search: string) => void;
  toggleLichTheme?: () => void;
};

export const DrawerDetails = (props: DrawerDetailsProps) => {
  const view = useAppSelector(selectMainView);
  const device = useAppSelector(selectDevice);
  const user = useAppSelector(selectUser);
  const favorites = useAppSelector(selectFavorites);
  const hidden = useAppSelector(selectHidden);
  const { toggleFavorite, toggleHidden } = useContext(UserContext);
  const setScroll = () => {
    const chipSet = document.getElementById("search-chip-set");
    if (chipSet) {
      const selectedChip = chipSet.querySelector(".mdc-chip-set .mdc-chip--selected");
      if (selectedChip && selectedChip instanceof HTMLElement) {
        chipSet.scrollLeft = selectedChip.offsetLeft - 24;
      } else {
        chipSet.scrollLeft = 0;
      }
    }
  };
  useEffect(setScroll, [props.search, JSON.stringify(props.set)]);
  useEffect(() => {
    const drawerContent = document.querySelector(".details-drawer .mdc-drawer__content");
    if (drawerContent) {
      drawerContent.scrollTop = 0;
    }
  }, [JSON.stringify(props.set)]);

  const dismissible = device === "desktop" && view !== "compact";
  const set = { ...props.set };
  if (!set.image) {
    set.image = "";
  }
  const today = moment.utc();
  let gbLaunch;
  let gbEnd;
  let icDate;
  let verb;
  let ic;
  let gb;
  let shippedLine;
  const chips: string[] = [];
  const chipsContent = ["profile", "colorway", "designer", "vendors"];
  const sortedVendors = set.vendors ? alphabeticalSortProp(set.vendors, "region") : [];

  if (set.icDate) {
    gbLaunch = set.gbLaunch
      ? set.gbLaunch.includes("Q")
        ? set.gbLaunch
        : moment.utc(set.gbLaunch, ["YYYY-MM-DD", "YYYY-MM"])
      : null;
    gbEnd = set.gbEnd ? moment.utc(set.gbEnd) : null;
    icDate = moment.utc(set.icDate);
    ic = `IC posted ${icDate.format("Do\xa0MMMM")}${icDate.year() !== today.year() ? icDate.format("\xa0YYYY") : ""}.`;
    if (gbLaunch && gbLaunch <= today && gbEnd && gbEnd >= today) {
      verb = "Running";
    } else if (gbEnd && gbEnd <= today) {
      verb = "Ran";
    } else if (gbLaunch && gbLaunch > today) {
      verb = "Will run";
    } else {
      verb = "Runs";
    }
    if (gbLaunch && moment.isMoment(gbLaunch) && gbEnd) {
      gb = `${verb} from ${gbLaunch.format("Do\xa0MMMM")}${
        gbLaunch.year() !== today.year() && gbLaunch.year() !== gbEnd.year() ? gbLaunch.format("\xa0YYYY") : ""
      } until ${gbEnd.format("Do\xa0MMMM")}${gbEnd.year() !== today.year() ? gbEnd.format("\xa0YYYY") : ""}.`;
    } else if (typeof gbLaunch === "string") {
      gb = "GB expected " + gbLaunch + ".";
    } else if (set.gbMonth && gbLaunch) {
      gb = "Expected " + gbLaunch.format("MMMM") + ".";
    } else if (gbLaunch) {
      gb = `${verb} from ${gbLaunch.format("Do\xa0MMMM")}${
        gbLaunch.year() !== today.year() ? gbLaunch.format("\xa0YYYY") : ""
      }.`;
    } else {
      gb = null;
    }
    chipsContent.forEach((prop) => {
      if (prop === "vendors") {
        sortedVendors.forEach((vendor) => {
          chips.push(vendor.name);
        });
      } else {
        if (hasKey(set, prop)) {
          const val = set[prop];
          if (val && Array.isArray(val)) {
            val.forEach((entry: any) => {
              if (typeof entry === "string") {
                chips.push(entry);
              }
            });
          } else {
            if (typeof val === "string") {
              chips.push(val);
            }
          }
        }
      }
    });
    shippedLine =
      gbEnd && gbEnd <= today ? (
        props.set.shipped ? (
          <Typography use="body2" tag="p">
            This set has shipped.
          </Typography>
        ) : (
          <Typography use="body2" tag="p">
            This set has not shipped.
          </Typography>
        )
      ) : null;
  }
  const gbLine = gb ? (
    <Typography use="body2" tag="p">
      {gb}
    </Typography>
  ) : null;
  const vendorList =
    set.vendors && set.vendors.length > 0 ? (
      <div className="details-list">
        <Typography className="subheader" use="caption" tag="h4">
          Vendors
        </Typography>
        <List twoLine>
          {sortedVendors.map((vendor) => {
            let differentDate;
            if (vendor.endDate) {
              const dateObject = moment.utc(vendor.endDate);
              const todayObject = moment().utc();
              const yesterdayObject = moment()
                .utc()
                .date(todayObject.date() - 1);
              const dateVerb = yesterdayObject > dateObject ? "Ended" : "Ends";
              differentDate = (
                <div className="caption">
                  <Typography use="caption">
                    {`${dateVerb} ${dateObject.format("Do MMMM")} ${
                      dateObject.year() !== todayObject.year() ? dateObject.format(" YYYY") : ""
                    }`}
                  </Typography>
                </div>
              );
            }
            return (
              <ConditionalWrapper
                key={vendor.name}
                condition={!!vendor.storeLink}
                wrapper={(children) => (
                  <a href={vendor.storeLink} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                )}
              >
                <ListItem disabled={!vendor.storeLink} className={classNames({ "three-line": !!differentDate })}>
                  <ListItemText>
                    <ListItemPrimaryText>{vendor.name}</ListItemPrimaryText>
                    <ListItemSecondaryText>{vendor.region}</ListItemSecondaryText>
                    {differentDate}
                  </ListItemText>
                  {vendor.storeLink ? <ListItemMeta icon="launch" /> : null}
                </ListItem>
              </ConditionalWrapper>
            );
          })}
        </List>
      </div>
    ) : null;
  const edit = props.edit;
  const deleteSet = props.delete;
  const editorButtons =
    (user.isEditor || (user.isDesigner && set.designer && set.designer.includes(user.nickname))) &&
    edit &&
    deleteSet ? (
      <div className="editor-buttons">
        <Button
          className="edit"
          outlined
          label="Edit"
          onClick={() => edit(set)}
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" />
              <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" />
            </svg>
          )}
        />
        {user.isEditor ? (
          <Button
            className="delete"
            outlined
            danger
            label="Delete"
            icon={iconObject(
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M8 9h8v10H8z" opacity=".3" />
                <path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z" />
              </svg>
            )}
            onClick={() => deleteSet(props.set)}
          />
        ) : null}
      </div>
    ) : null;
  const lichButton =
    props.set.colorway === "Lich" ? (
      <IconButton
        onClick={props.toggleLichTheme}
        icon={iconObject(
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5 0-.16-.08-.28-.14-.35-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 10 6.5 10s1.5.67 1.5 1.5S7.33 13 6.5 13zm3-4C8.67 9 8 8.33 8 7.5S8.67 6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zm4.5 2.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"
                opacity=".3"
              />
              <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.21-.64-1.67-.08-.09-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm4 13h-1.77c-1.38 0-2.5 1.12-2.5 2.5 0 .61.22 1.19.63 1.65.06.07.14.19.14.35 0 .28-.22.5-.5.5-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.14 8 7c0 2.21-1.79 4-4 4z" />
              <circle cx="6.5" cy="11.5" r="1.5" />
              <circle cx="9.5" cy="7.5" r="1.5" />
              <circle cx="14.5" cy="7.5" r="1.5" />
              <circle cx="17.5" cy="11.5" r="1.5" />
            </svg>
          </div>
        )}
      />
    ) : null;
  const userButtons = user.email ? (
    <>
      <Tooltip enterDelay={500} content={favorites.includes(props.set.id) ? "Unfavorite" : "Favorite"} align="bottom">
        <IconButton
          icon="favorite_border"
          onIcon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                d="M16.5 5c-1.54 0-3.04.99-3.56 2.36h-1.87C10.54 5.99 9.04 5 7.5 5 5.5 5 4 6.5 4 8.5c0 2.89 3.14 5.74 7.9 10.05l.1.1.1-.1C16.86 14.24 20 11.39 20 8.5c0-2-1.5-3.5-3.5-3.5z"
                opacity=".3"
              />
              <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
            </svg>
          )}
          className="favorite"
          checked={favorites.includes(props.set.id)}
          onClick={() => toggleFavorite(props.set.id)}
        />
      </Tooltip>
      <Tooltip enterDelay={500} content={hidden.includes(props.set.id) ? "Unhide" : "Hide"} align="bottom">
        <IconButton
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                d="M12 6c-3.79 0-7.17 2.13-8.82 5.5C4.83 14.87 8.21 17 12 17s7.17-2.13 8.82-5.5C19.17 8.13 15.79 6 12 6zm0 10c-2.48 0-4.5-2.02-4.5-4.5S9.52 7 12 7s4.5 2.02 4.5 4.5S14.48 16 12 16z"
                opacity=".3"
              />
              <path d="M12 4C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 13c-3.79 0-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6s7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17zm0-10c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7zm0 7c-1.38 0-2.5-1.12-2.5-2.5S10.62 9 12 9s2.5 1.12 2.5 2.5S13.38 14 12 14z" />
            </svg>
          )}
          onIcon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" />
              <path
                d="M12 14c.04 0 .08-.01.12-.01l-2.61-2.61c0 .04-.01.08-.01.12 0 1.38 1.12 2.5 2.5 2.5zm1.01-4.79l1.28 1.28c-.26-.57-.71-1.03-1.28-1.28zm7.81 2.29C19.17 8.13 15.79 6 12 6c-.68 0-1.34.09-1.99.22l.92.92c.35-.09.7-.14 1.07-.14 2.48 0 4.5 2.02 4.5 4.5 0 .37-.06.72-.14 1.07l2.05 2.05c.98-.86 1.81-1.91 2.41-3.12zM12 17c.95 0 1.87-.13 2.75-.39l-.98-.98c-.54.24-1.14.37-1.77.37-2.48 0-4.5-2.02-4.5-4.5 0-.63.13-1.23.36-1.77L6.11 7.97c-1.22.91-2.23 2.1-2.93 3.52C4.83 14.86 8.21 17 12 17z"
                opacity=".3"
              />
              <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.59 1.22-1.42 2.27-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm2.28 4.49l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.06-1.07.14L13 9.21c.58.25 1.03.71 1.28 1.28zM2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02-1.38 0-2.5-1.12-2.5-2.5 0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75c-.23.55-.36 1.15-.36 1.78 0 2.48 2.02 4.5 4.5 4.5.63 0 1.23-.13 1.77-.36l.98.98c-.88.24-1.8.38-2.75.38-3.79 0-7.17-2.13-8.82-5.5.7-1.43 1.72-2.61 2.93-3.53z" />
            </svg>
          )}
          className="hide"
          checked={hidden.includes(props.set.id)}
          onClick={() => toggleHidden(props.set.id)}
        />
      </Tooltip>
    </>
  ) : null;
  const closeIcon = dismissible ? (
    <Tooltip enterDelay={500} content="Close" align="bottom">
      <IconButton className="close-icon" icon="close" onClick={props.close} />
    </Tooltip>
  ) : null;
  const salesButton =
    props.set.sales && props.set.sales.img ? (
      <Button outlined label="Sales" icon="bar_chart" onClick={() => props.openSales(set)} />
    ) : null;
  const notes = props.set.notes ? (
    <Typography use="caption" tag="p" className="multiline">
      {props.set.notes}
    </Typography>
  ) : null;
  const search = props.search;
  const setSearch = props.setSearch;
  const searchChips =
    typeof search === "string" && setSearch ? (
      <div className="search-chips-container">
        <div className="search-chips">
          <ChipSet id="search-chip-set" choice>
            <div className="padding-fix" />
            {chips.map((value, index) => {
              return (
                <Chip
                  icon="search"
                  label={value}
                  key={value.toLowerCase() + index}
                  selected={search.toLowerCase() === value.toLowerCase()}
                  onClick={() => {
                    setSearch(value);
                    if (!dismissible) {
                      props.close();
                    }
                  }}
                />
              );
            })}
          </ChipSet>
        </div>
      </div>
    ) : null;
  return (
    <Drawer
      dismissible={dismissible}
      modal={!dismissible}
      open={props.open}
      onClose={props.close}
      className="details-drawer drawer-right"
    >
      <DrawerHeader>
        <DrawerTitle>Details</DrawerTitle>
        {lichButton}
        {userButtons}
        {closeIcon}
      </DrawerHeader>
      <DrawerContent>
        <div>
          <div
            className="details-image"
            style={{ backgroundImage: "url(" + set.image.replace("keysets", "card") + ")" }}
          ></div>
          <div className="details-text">
            <Typography use="overline" tag="h3">
              Designed by {set.designer ? set.designer.join(" + ") : ""}
            </Typography>
            <Typography use="headline4" tag="h1">
              <Twemoji options={{ className: "twemoji" }}>
                {`${set.profile ? set.profile : ""} ${set.colorway ? set.colorway : ""}`}
              </Twemoji>
            </Typography>
            {gbLine}
            {shippedLine}
            <Typography use="body2" tag="p">
              {ic}
            </Typography>
            {notes}
          </div>
          <div className="details-button">
            <Button
              outlined
              label="Link"
              icon="launch"
              tag="a"
              href={set.details}
              target="_blank"
              rel="noopener noreferrer"
            />
            {salesButton}
          </div>
          {vendorList}
        </div>
      </DrawerContent>
      {editorButtons}
      {searchChips}
    </Drawer>
  );
};

export default DrawerDetails;
