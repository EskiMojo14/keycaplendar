import { useEffect } from "react";
import type { ReactNode } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { Button } from "@rmwc/button";
import { Chip, ChipSet } from "@rmwc/chip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import {
  List,
  ListItem,
  ListItemMeta,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from "@rmwc/list";
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
import { selectSearch, selectSetById } from "@s/main";
import { setSearch } from "@s/main/functions";
import type { SetType } from "@s/main/types";
import { selectView } from "@s/settings";
import { toggleLichTheme } from "@s/settings/functions";
import {
  selectBought,
  selectFavorites,
  selectHidden,
  selectUser,
} from "@s/user";
import { toggleBought, toggleFavorite, toggleHidden } from "@s/user/functions";
import {
  alphabeticalSortProp,
  arrayIncludes,
  clearSearchParams,
  createURL,
  iconObject,
  ordinal,
  removeDuplicates,
} from "@s/util/functions";
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
  open: boolean;
  openSales: (set: EntityId) => void;
  set: EntityId;
  delete?: (set: SetType) => void;
  edit?: (set: EntityId) => void;
};

export const DrawerDetails = ({
  close,
  delete: deleteSet,
  edit,
  open,
  openSales,
  set: setId,
}: DrawerDetailsProps) => {
  const device = useAppSelector(selectDevice);
  const page = useAppSelector(selectPage);

  const view = useAppSelector(selectView);

  const user = useAppSelector(selectUser);
  const favorites = useAppSelector(selectFavorites);
  const bought = useAppSelector(selectBought);
  const hidden = useAppSelector(selectHidden);

  const search = useAppSelector(selectSearch);

  const set = useAppSelector((state) => selectSetById(state, setId));

  const copyLink = async () => {
    if (set) {
      const url = createURL({ pathname: "/" }, (params) => {
        clearSearchParams(params);
        params.set("keysetAlias", set.alias);
      });
      try {
        await navigator.clipboard.writeText(url.href);
        queue.notify({ title: "Copied URL to clipboard." });
      } catch (error) {
        queue.notify({ title: `Error copying to clipboard ${error}` });
      }
    }
  };

  const setScroll = () => {
    const chipSet = document.getElementById("search-chip-set");
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
  useEffect(setScroll, [search, JSON.stringify(set)]);
  useEffect(() => {
    const drawerContent = document.querySelector(
      ".details-drawer .mdc-drawer__content"
    );
    if (drawerContent) {
      drawerContent.scrollTop = 0;
    }
  }, [JSON.stringify(set)]);

  const dismissible =
    device === "desktop" &&
    view !== "compact" &&
    arrayIncludes(mainPages, page);
  const today = DateTime.utc();
  let gbLaunch: DateTime | string = "";
  let gbEnd: DateTime | "" = "";
  let icDate: DateTime;
  let verb = "";
  let ic = "";
  let gb: string | null = "";
  let shippedLine: ReactNode | null = "";
  let chips: string[] = [];
  const chipsContent = ["profile", "colorway", "designer", "vendors"] as const;
  const sortedVendors = set?.vendors
    ? alphabeticalSortProp([...set.vendors], "region")
    : [];

  if (set?.icDate) {
    gbLaunch = set.gbLaunch
      ? set.gbLaunch.includes("Q")
        ? set.gbLaunch
        : DateTime.fromISO(set.gbLaunch, { zone: "utc" })
      : "";
    const gbLaunchOrdinal =
      gbLaunch instanceof DateTime ? ordinal(gbLaunch.day) : "";

    gbEnd = set.gbEnd && DateTime.fromISO(set.gbEnd, { zone: "utc" });
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
        gbLaunch.year !== today.year && gbLaunch.year !== gbEnd.year
          ? gbLaunch.toFormat("\xa0yyyy")
          : ""
      } until ${gbEnd.toFormat(`d'${gbEndOrdinal}'\xa0MMMM`)}${
        gbEnd.year !== today.year ? gbEnd.toFormat("\xa0yyyy") : ""
      }.`;
    } else if (gbLaunch && is<string>(gbLaunch)) {
      gb = `GB expected ${gbLaunch}.`;
    } else if (set.gbMonth && gbLaunch && gbLaunch instanceof DateTime) {
      gb = `Expected ${gbLaunch.toFormat("MMMM")}.`;
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
    });
    chips = removeDuplicates(chips);
    shippedLine =
      gbEnd &&
      gbEnd <= today &&
      (set.shipped ? (
        <Typography tag="p" use="body2">
          This set has shipped.
        </Typography>
      ) : (
        <Typography tag="p" use="body2">
          This set has not shipped.
        </Typography>
      ));
  }
  const gbLine = gb && (
    <Typography tag="p" use="body2">
      {gb}
    </Typography>
  );
  const vendorList = set?.vendors && set.vendors.length > 0 && (
    <div className="details-list">
      <Typography className="subheader" tag="h4" use="caption">
        Vendors
      </Typography>
      <List twoLine>
        {sortedVendors.map((vendor) => {
          let differentDate;
          if (vendor.endDate) {
            const dateObject = DateTime.fromISO(vendor.endDate, {
              zone: "utc",
            });
            const dateOrdinal = ordinal(dateObject.day);
            const todayObject = DateTime.utc();
            const yesterdayObject = todayObject.minus({ days: 1 });
            const dateVerb = yesterdayObject > dateObject ? "Ended" : "Ends";
            differentDate = (
              <div className="caption">
                <Typography use="caption">
                  {`${dateVerb} ${dateObject.toFormat(
                    `d'${dateOrdinal}' MMMM`
                  )} ${
                    dateObject.year !== todayObject.year
                      ? dateObject.toFormat(" yyyy")
                      : ""
                  }`}
                </Typography>
              </div>
            );
          }
          return (
            <ConditionalWrapper
              key={vendor.id}
              condition={!!vendor.storeLink}
              wrapper={(children) => (
                <a
                  href={vendor.storeLink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {children}
                </a>
              )}
            >
              <ListItem
                className={classNames({ "three-line": !!differentDate })}
                disabled={!vendor.storeLink}
              >
                <ListItemText>
                  <ListItemPrimaryText>{vendor.name}</ListItemPrimaryText>
                  <ListItemSecondaryText>{vendor.region}</ListItemSecondaryText>
                  {differentDate}
                </ListItemText>
                {vendor.storeLink && <ListItemMeta icon="launch" />}
              </ListItem>
            </ConditionalWrapper>
          );
        })}
      </List>
    </div>
  );
  const editorButtons = (user.isEditor ||
    (user.isDesigner &&
      set?.designer &&
      set.designer.includes(user.nickname))) &&
    edit &&
    deleteSet && (
      <div className="editor-buttons">
        <Button
          className="edit"
          icon={iconObject(<Edit />)}
          label="Edit"
          onClick={() => edit(setId)}
          outlined
        />
        {user.isEditor && (
          <Button
            className="delete"
            danger
            icon={iconObject(<Delete />)}
            label="Delete"
            onClick={set ? () => deleteSet(set) : undefined}
            outlined
          />
        )}
      </div>
    );
  const lichButton = set?.colorway === "Lich" && (
    <IconButton icon={iconObject(<Palette />)} onClick={toggleLichTheme} />
  );
  const userButtons = user.email && (
    <>
      {withTooltip(
        <IconButton
          checked={arrayIncludes(favorites, setId)}
          className="favorite"
          icon="favorite_border"
          onClick={() => toggleFavorite(setId)}
          onIcon={iconObject(<Favorite />)}
        />,
        arrayIncludes(favorites, setId) ? "Unfavorite" : "Favorite"
      )}
      {withTooltip(
        <IconButton
          checked={arrayIncludes(bought, setId)}
          className="bought"
          icon={iconObject(<ShoppingBasketOff />)}
          onClick={() => toggleBought(setId)}
          onIcon={iconObject(<ShoppingBasket />)}
        />,
        arrayIncludes(bought, setId) ? "Bought" : "Not bought"
      )}
      {withTooltip(
        <IconButton
          checked={arrayIncludes(hidden, setId)}
          className="hide"
          icon={iconObject(<Visibility />)}
          onClick={() => toggleHidden(setId)}
          onIcon={iconObject(<VisibilityOff />)}
        />,
        arrayIncludes(hidden, setId) ? "Unhide" : "Hide"
      )}
    </>
  );
  const closeIcon =
    dismissible &&
    withTooltip(
      <IconButton className="close-icon" icon="close" onClick={close} />,
      "Close"
    );
  const salesButton = set?.sales?.img && (
    <Button
      icon="bar_chart"
      label="Sales"
      onClick={() => openSales(setId)}
      outlined
    />
  );
  const notes = set?.notes && (
    <Typography className="multiline" tag="p" use="caption">
      {set.notes}
    </Typography>
  );
  const searchChips = arrayIncludes(mainPages, page) && (
    <div className="search-chips-container">
      <div className="search-chips">
        <ChipSet choice id="search-chip-set">
          <div className="padding-fix" />
          {chips.map((value) => (
            <Chip
              key={value}
              icon="search"
              label={value}
              onClick={() => {
                setSearch(value);
                if (!dismissible) {
                  close();
                }
              }}
              selected={search.toLowerCase() === value.toLowerCase()}
            />
          ))}
        </ChipSet>
      </div>
    </div>
  );
  return (
    <Drawer
      className="details-drawer drawer-right"
      dismissible={dismissible}
      modal={!dismissible}
      onClose={close}
      open={open}
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
            style={{
              backgroundImage: `url(${
                set?.image?.replace("keysets", "card") ?? ""
              })`,
            }}
          ></div>
          <div className="details-text">
            <Typography tag="h3" use="overline">
              Designed by {set?.designer?.join(" + ")}
            </Typography>
            <Typography tag="h1" use="headline4">
              <Twemoji options={{ className: "twemoji" }}>
                {`${set?.profile ?? ""} ${set?.colorway ?? ""}`}
              </Twemoji>
            </Typography>
            {gbLine}
            {shippedLine}
            <Typography tag="p" use="body2">
              {ic}
            </Typography>
            {notes}
          </div>
          <div className="details-button">
            <Button
              href={set?.details}
              icon="launch"
              label="Link"
              outlined
              rel="noopener noreferrer"
              tag="a"
              target="_blank"
            />
            {salesButton}
          </div>
          <div className="details-button">
            <Button
              icon={iconObject(<Share />)}
              label="Share"
              onClick={copyLink}
              outlined
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
