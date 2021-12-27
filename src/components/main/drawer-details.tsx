import { useEffect } from "react";
import type { ReactNode } from "react";
import { Button } from "@rmwc/button";
import { Chip, ChipSet } from "@rmwc/chip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { List, ListItem, ListItemMeta, ListItemPrimaryText, ListItemSecondaryText, ListItemText } from "@rmwc/list";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { DateTime } from "luxon";
import Twemoji from "react-twemoji";
import { is } from "typescript-is";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { ConditionalWrapper } from "@c/util/conditional-wrapper";
import { withTooltip } from "@c/util/hocs";
import { selectDevice, selectPage } from "@s/common";
import { mainPages } from "@s/common/constants";
import { selectSearch } from "@s/main";
import { setSearch } from "@s/main/functions";
import type { SetType } from "@s/main/types";
import { selectView } from "@s/settings";
import { toggleLichTheme } from "@s/settings/functions";
import { selectBought, selectFavorites, selectHidden, selectUser } from "@s/user";
import { toggleBought, toggleFavorite, toggleHidden } from "@s/user/functions";
import { alphabeticalSortProp, arrayIncludes, hasKey, iconObject, ordinal } from "@s/util/functions";
import {
  Delete,
  Edit,
  Favorite,
  Palette,
  Share,
  ShoppingBasket,
  ShoppingBasketOff,
  Visibility,
  VisibilityOff,
} from "@i";
import "./drawer-details.scss";

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
  let gbLaunch: DateTime | string = "";
  let gbEnd: DateTime | null = null;
  let icDate: DateTime;
  let verb = "";
  let ic = "";
  let gb: string | null = "";
  let shippedLine: ReactNode | null = "";
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
          const { [prop]: val } = set;
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
  const { edit, delete: deleteSet } = props;
  const editorButtons =
    (user.isEditor || (user.isDesigner && set.designer && set.designer.includes(user.nickname))) &&
    edit &&
    deleteSet ? (
      <div className="editor-buttons">
        <Button className="edit" outlined label="Edit" onClick={() => edit(set)} icon={iconObject(<Edit />)} />
        {user.isEditor ? (
          <Button
            className="delete"
            outlined
            danger
            label="Delete"
            icon={iconObject(<Delete />)}
            onClick={() => deleteSet(props.set)}
          />
        ) : null}
      </div>
    ) : null;
  const lichButton =
    props.set.colorway === "Lich" ? <IconButton onClick={toggleLichTheme} icon={iconObject(<Palette />)} /> : null;
  const userButtons = user.email ? (
    <>
      {withTooltip(
        <IconButton
          icon="favorite_border"
          onIcon={iconObject(<Favorite />)}
          className="favorite"
          checked={favorites.includes(props.set.id)}
          onClick={() => toggleFavorite(props.set.id)}
        />,
        favorites.includes(props.set.id) ? "Unfavorite" : "Favorite"
      )}
      {withTooltip(
        <IconButton
          icon={iconObject(<ShoppingBasketOff />)}
          onIcon={iconObject(<ShoppingBasket />)}
          className="bought"
          checked={bought.includes(props.set.id)}
          onClick={() => toggleBought(props.set.id)}
        />,
        bought.includes(props.set.id) ? "Bought" : "Not bought"
      )}
      {withTooltip(
        <IconButton
          icon={iconObject(<Visibility />)}
          onIcon={iconObject(<VisibilityOff />)}
          className="hide"
          checked={hidden.includes(props.set.id)}
          onClick={() => toggleHidden(props.set.id)}
        />,
        hidden.includes(props.set.id) ? "Unhide" : "Hide"
      )}
    </>
  ) : null;
  const closeIcon = dismissible
    ? withTooltip(<IconButton className="close-icon" icon="close" onClick={props.close} />, "Close")
    : null;
  const salesButton = props.set.sales?.img ? (
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
            <Button outlined label="Share" icon={iconObject(<Share />)} onClick={copyLink} />
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
