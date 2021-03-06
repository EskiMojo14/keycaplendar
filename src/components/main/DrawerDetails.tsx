import React, { useEffect } from "react";
import Twemoji from "react-twemoji";
import classNames from "classnames";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import { queue } from "~/app/snackbarQueue";
import { useAppSelector } from "~/app/hooks";
import { selectDevice, selectPage } from "@s/common/commonSlice";
import { mainPages } from "@s/common/constants";
import { alphabeticalSortProp, arrayIncludes, hasKey, iconObject, ordinal } from "@s/common/functions";
import { selectSearch } from "@s/main/mainSlice";
import { setSearch } from "@s/main/functions";
import { SetType } from "@s/main/types";
import { selectView } from "@s/settings/settingsSlice";
import { toggleLichTheme } from "@s/settings/functions";
import { selectBought, selectFavorites, selectHidden, selectUser } from "@s/user/userSlice";
import { toggleBought, toggleFavorite, toggleHidden } from "@s/user/functions";
import { Button } from "@rmwc/button";
import { Chip, ChipSet } from "@rmwc/chip";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { List, ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, ListItemMeta } from "@rmwc/list";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { ConditionalWrapper } from "@c/util/ConditionalWrapper";
import "./DrawerDetails.scss";

type DrawerDetailsProps = {
  close: () => void;
  delete?: (set: SetType) => void;
  edit?: (set: SetType) => void;
  open: boolean;
  openSales: (set: SetType) => void;
  set: SetType;
};

export const DrawerDetails = (props: DrawerDetailsProps) => {
  const device = useAppSelector(selectDevice);
  const page = useAppSelector(selectPage);

  const view = useAppSelector(selectView);

  const user = useAppSelector(selectUser);
  const favorites = useAppSelector(selectFavorites);
  const bought = useAppSelector(selectBought);
  const hidden = useAppSelector(selectHidden);

  const search = useAppSelector(selectSearch);

  const copyLink = () => {
    const arr = window.location.href.split("/");
    const url = arr[0] + "//" + arr[2] + "?keysetAlias=" + props.set.alias;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        queue.notify({ title: "Copied URL to clipboard." });
      })
      .catch((error) => {
        queue.notify({ title: "Error copying to clipboard" + error });
      });
  };

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
  useEffect(setScroll, [search, JSON.stringify(props.set)]);
  useEffect(() => {
    const drawerContent = document.querySelector(".details-drawer .mdc-drawer__content");
    if (drawerContent) {
      drawerContent.scrollTop = 0;
    }
  }, [JSON.stringify(props.set)]);

  const dismissible = device === "desktop" && view !== "compact" && arrayIncludes(mainPages, page);
  const set = { ...props.set };
  if (!set.image) {
    set.image = "";
  }
  const today = DateTime.utc();
  let gbLaunch: string | DateTime = "";
  let gbEnd: DateTime | null = null;
  let icDate: DateTime;
  let verb = "";
  let ic = "";
  let gb: string | null = "";
  let shippedLine: React.ReactNode | null = "";
  const chips: string[] = [];
  const chipsContent = ["profile", "colorway", "designer", "vendors"];
  const sortedVendors = set.vendors ? alphabeticalSortProp([...set.vendors], "region") : [];

  if (set.icDate) {
    gbLaunch = set.gbLaunch
      ? set.gbLaunch.includes("Q")
        ? set.gbLaunch
        : DateTime.fromISO(set.gbLaunch, { zone: "utc" })
      : "";
    const gbLaunchOrdinal = gbLaunch instanceof DateTime ? ordinal(gbLaunch.day) : "";

    gbEnd = set.gbEnd ? DateTime.fromISO(set.gbEnd, { zone: "utc" }) : null;
    const gbEndOrdinal = gbEnd instanceof DateTime ? ordinal(gbEnd.day) : "";

    icDate = DateTime.fromISO(set.icDate, { zone: "utc" });
    const icDateOrdinal = icDate instanceof DateTime ? ordinal(icDate.day) : "";
    ic = `IC posted ${icDate.toFormat(`d'${icDateOrdinal}'\xa0MMMM`)}${
      icDate.year !== today.year ? icDate.toFormat("\xa0yyyy") : ""
    }.`;
    if (gbLaunch && gbLaunch <= today && gbEnd && gbEnd >= today) {
      verb = "Running";
    } else if (gbEnd && gbEnd <= today) {
      verb = "Ran";
    } else if (gbLaunch && gbLaunch > today) {
      verb = "Will run";
    } else {
      verb = "Runs";
    }
    if (gbLaunch && gbLaunch instanceof DateTime && gbEnd) {
      gb = `${verb} from ${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0MMMM`)}${
        gbLaunch.year !== today.year && gbLaunch.year !== gbEnd.year ? gbLaunch.toFormat("\xa0yyyy") : ""
      } until ${gbEnd.toFormat(`d'${gbEndOrdinal}'\xa0MMMM`)}${
        gbEnd.year !== today.year ? gbEnd.toFormat("\xa0yyyy") : ""
      }.`;
    } else if (gbLaunch && is<string>(gbLaunch)) {
      gb = "GB expected " + gbLaunch + ".";
    } else if (set.gbMonth && gbLaunch && gbLaunch instanceof DateTime) {
      gb = "Expected " + gbLaunch.toFormat("MMMM") + ".";
    } else if (gbLaunch && gbLaunch instanceof DateTime) {
      gb = `${verb} from ${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0MMMM`)}${
        gbLaunch.year !== today.year ? gbLaunch.toFormat("\xa0yyyy") : ""
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
              if (is<string>(entry)) {
                chips.push(entry);
              }
            });
          } else {
            if (is<string>(val)) {
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
              const dateObject = DateTime.fromISO(vendor.endDate, { zone: "utc" });
              const dateOrdinal = ordinal(dateObject.day);
              const todayObject = DateTime.utc();
              const yesterdayObject = todayObject.minus({ days: 1 });
              const dateVerb = yesterdayObject > dateObject ? "Ended" : "Ends";
              differentDate = (
                <div className="caption">
                  <Typography use="caption">
                    {`${dateVerb} ${dateObject.toFormat(`d'${dateOrdinal}' MMMM`)} ${
                      dateObject.year !== todayObject.year ? dateObject.toFormat(" yyyy") : ""
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
        onClick={toggleLichTheme}
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
      <Tooltip enterDelay={500} content={bought.includes(props.set.id) ? "Bought" : "Not bought"} align="bottom">
        <IconButton
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
              <path fill="none" d="M0,0h24v24H0V0z" />
              <path
                opacity="0.3"
                d="M20.7,11l-1.4,5.1L14.2,11H20.7z M12,17c-1.1,0-2-0.9-2-2c0-0.8,0.5-1.6,1.3-1.8
	L9.1,11H3.3l2.2,8h11.6l-3.3-3.3C13.6,16.5,12.8,17,12,17z"
              />
              <path
                d="M2.4,1.7L1.1,3l5.8,5.8L6.8,9H2c-0.5,0-1,0.4-1,1c0,0.1,0,0.2,0,0.3l2.5,9.3c0.2,0.8,1,1.5,1.9,1.5h13c0.2,0,0.4,0,0.5-0.1
	l1.8,1.8l1.3-1.3L2.4,1.7 M5.5,19l-2.2-8h5.8l2.2,2.1c-0.8,0.3-1.3,1-1.3,1.9c0,1.1,0.9,2,2,2c0.8,0,1.6-0.5,1.9-1.3l3.3,3.3H5.5
	 M23,10l0,0.3l-2,7.5l-1.6-1.6l1.4-5.1h-6.5l-2-2h2.6L12,4.8l-1.6,2.4L9,5.8l2.2-3.3C11.4,2.2,11.7,2,12,2s0.6,0.2,0.8,0.4L17.2,9
	H22C22.5,9,23,9.4,23,10z"
              />
            </svg>
          )}
          onIcon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                d="M3.31 11l2.2 8.01L18.5 19l2.2-8H3.31zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
                opacity=".3"
              />
              <path d="M22 9h-4.79l-4.38-6.56c-.19-.28-.51-.42-.83-.42s-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1zM12 4.8L14.8 9H9.2L12 4.8zM18.5 19l-12.99.01L3.31 11H20.7l-2.2 8zM12 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          )}
          className="bought"
          checked={bought.includes(props.set.id)}
          onClick={() => toggleBought(props.set.id)}
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
  const searchChips = arrayIncludes(mainPages, page) ? (
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
          <div className="details-button">
            <Button
              outlined
              label="Share"
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <circle cx="18" cy="5" opacity=".3" r="1" />
                  <circle cx="6" cy="12" opacity=".3" r="1" />
                  <circle cx="18" cy="19.02" opacity=".3" r="1" />
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                </svg>
              )}
              onClick={copyLink}
            />
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
