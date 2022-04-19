import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import {
  CollapsibleList,
  List,
  ListDivider,
  ListItem,
  ListItemGraphic,
  ListItemMeta,
} from "@rmwc/list";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { DateTime } from "luxon";
import { useHistory } from "react-router-dom";
import { useAppSelector } from "@h";
import useBottomNav from "@h/use-bottom-nav";
import useDevice from "@h/use-device";
import usePage from "@h/use-page";
import {
  adminPages,
  pageIcons,
  pageTitle,
  standardPages,
  userPages,
} from "@s/common/constants";
import type { Page } from "@s/common/types";
import firestore from "@s/firebase/firestore";
import { selectLinkedFavorites } from "@s/main";
import {
  selectBought,
  selectFavorites,
  selectHidden,
  selectUser,
} from "@s/user";
import { hasKey, iconObject } from "@s/util/functions";
import { AdminPanelSettings, FiberNew, Person } from "@i";
import logo from "@m/logo.svg";
import "./drawer-nav.scss";

type DrawerNavProps = {
  close: () => void;
  open: boolean;
};

export const DrawerNav = ({ close, open }: DrawerNavProps) => {
  const history = useHistory();

  const device = useDevice();
  const dismissible = device === "desktop";

  const bottomNav = useBottomNav();

  const appPage = usePage();

  const user = useAppSelector(selectUser);
  const favorites = useAppSelector(selectFavorites);
  const bought = useAppSelector(selectBought);
  const hidden = useAppSelector(selectHidden);

  const linkedFavorites = useAppSelector(selectLinkedFavorites);

  const setPage = (page: `/${Page}`) => {
    history.push(page);
    if (!dismissible) {
      close();
    }
  };

  const quantities: Record<string, number> = {
    bought: bought.length,
    favorites:
      linkedFavorites.array.length > 0
        ? linkedFavorites.array.length
        : favorites.length,
    hidden: hidden.length,
  };

  const [newUpdate, setNewUpdate] = useState(false);

  const checkForUpdates = async () => {
    const lastWeek = DateTime.utc().minus({ days: 7 });
    try {
      const querySnapshot = await firestore
        .collection("updates")
        .orderBy("date", "desc")
        .limit(1)
        .get();
      querySnapshot.forEach((doc) => {
        const date = DateTime.fromISO(doc.data().date, { zone: "utc" });
        if (date >= lastWeek) {
          setNewUpdate(true);
        }
      });
    } catch (error) {
      console.log("Failed to check for updates", error);
    }
  };

  useEffect(() => {
    checkForUpdates();
  }, []);

  const newUpdateIcon = newUpdate && (
    <ListItemMeta icon={iconObject(<FiberNew />)} />
  );

  const linkedFavorite = !user.email && linkedFavorites.array.length > 0 && (
    <>
      <ListDivider />
      <ListItem
        activated={appPage === "favorites"}
        onClick={() => setPage("/favorites")}
      >
        <ListItemGraphic
          icon={
            appPage === "favorites" && linkedFavorites.array.length > 0
              ? "link"
              : pageIcons.favorites
          }
        />
        {pageTitle.favorites}
        <ListItemMeta>{quantities.favorites}</ListItemMeta>
      </ListItem>
    </>
  );

  const userOptions = user.email && (
    <>
      <ListDivider />
      <CollapsibleList
        className="group-collapsible"
        defaultOpen
        handle={
          <ListItem
            className={classNames({
              "contains-activated": userPages.includes(appPage),
            })}
          >
            <ListItemGraphic icon={iconObject(<Person />)} />
            <Typography className="subheader" use="caption">
              User
            </Typography>
            <ListItemMeta icon="expand_more" />
          </ListItem>
        }
      >
        {userPages.map((page) => (
          <ListItem
            key={page}
            activated={appPage === page}
            onClick={() => setPage(`/${page}`)}
          >
            <ListItemGraphic
              icon={
                appPage === "favorites" &&
                page === "favorites" &&
                linkedFavorites.array.length > 0
                  ? "link"
                  : pageIcons[page]
              }
            />
            {pageTitle[page]}
            {hasKey(quantities, page) && (
              <ListItemMeta>{quantities[page]}</ListItemMeta>
            )}
          </ListItem>
        ))}
      </CollapsibleList>
    </>
  );

  const adminOptions = user.isAdmin && (
    <>
      <ListDivider />
      <CollapsibleList
        className="group-collapsible"
        handle={
          <ListItem
            className={classNames({
              "contains-activated": adminPages.includes(appPage),
            })}
          >
            <ListItemGraphic icon={iconObject(<AdminPanelSettings />)} />
            <Typography className="subheader" use="caption">
              Admin
            </Typography>
            <ListItemMeta icon="expand_more" />
          </ListItem>
        }
      >
        {adminPages.map((page) => (
          <ListItem
            key={page}
            activated={appPage === page}
            onClick={() => setPage(`/${page}`)}
          >
            <ListItemGraphic icon={pageIcons[page]} />
            {pageTitle[page]}
          </ListItem>
        ))}
      </CollapsibleList>
    </>
  );

  const closeIcon = (dismissible || bottomNav) && (
    <IconButton
      className={classNames({ "rtl-flip": !bottomNav })}
      icon={bottomNav ? "close" : "chevron_left"}
      onClick={close}
    />
  );

  return (
    <Drawer
      className={classNames("nav", {
        "drawer-bottom": bottomNav,
        rail: dismissible,
      })}
      dismissible={dismissible}
      modal={!dismissible}
      onClose={close}
      open={open}
    >
      <DrawerHeader>
        <img alt="logo" className="logo" src={logo} />
        <DrawerTitle>KeycapLendar</DrawerTitle>
        {closeIcon}
      </DrawerHeader>
      <DrawerContent>
        <List>
          {standardPages.map((page) => (
            <ListItem
              key={page}
              activated={appPage === page}
              onClick={() => setPage(`/${page}`)}
            >
              <ListItemGraphic icon={pageIcons[page]} />
              {pageTitle[page]}
            </ListItem>
          ))}
          <ListDivider />
          <ListItem
            activated={appPage === "statistics"}
            onClick={() => setPage("/statistics")}
          >
            <ListItemGraphic icon={pageIcons.statistics} />
            {pageTitle.statistics}
          </ListItem>
          <ListItem
            activated={appPage === "history"}
            onClick={() => setPage("/history")}
          >
            <ListItemGraphic icon={pageIcons.history} />
            {pageTitle.history}
          </ListItem>
          {linkedFavorite}
          {userOptions}
          {adminOptions}
          <ListDivider />
          <ListItem
            activated={appPage === "guides"}
            onClick={() => setPage("/guides")}
          >
            <ListItemGraphic icon={pageIcons.guides} />
            {pageTitle.guides}
          </ListItem>
          <ListItem
            activated={appPage === "updates"}
            onClick={() => setPage("/updates")}
          >
            <ListItemGraphic icon={pageIcons.updates} />
            {pageTitle.updates}
            {newUpdateIcon}
          </ListItem>
          <ListItem
            activated={appPage === "settings"}
            onClick={() => setPage("/settings")}
          >
            <ListItemGraphic icon={pageIcons.settings} />
            {pageTitle.settings}
          </ListItem>
        </List>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerNav;
