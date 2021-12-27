import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { CollapsibleList, List, ListDivider, ListItem, ListItemGraphic, ListItemMeta } from "@rmwc/list";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { DateTime } from "luxon";
import { useAppSelector } from "~/app/hooks";
import { selectDevice, selectPage } from "@s/common";
import { adminPages, pageIcons, pageTitle, standardPages, userPages } from "@s/common/constants";
import { setPage as setMainPage } from "@s/common/functions";
import { Page } from "@s/common/types";
import firestore from "@s/firebase/firestore";
import { selectLinkedFavorites } from "@s/main";
import { selectBottomNav } from "@s/settings";
import { selectBought, selectFavorites, selectHidden, selectUser } from "@s/user";
import { hasKey, iconObject } from "@s/util/functions";
import { AdminPanelSettings, FiberNew, Person } from "@i";
import logo from "@m/logo.svg";
import "./drawer-nav.scss";

type DrawerNavProps = {
  close: () => void;
  open: boolean;
};

export const DrawerNav = (props: DrawerNavProps) => {
  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);

  const appPage = useAppSelector(selectPage);

  const user = useAppSelector(selectUser);
  const favorites = useAppSelector(selectFavorites);
  const bought = useAppSelector(selectBought);
  const hidden = useAppSelector(selectHidden);

  const linkedFavorites = useAppSelector(selectLinkedFavorites);

  const dismissible = device === "desktop";

  const setPage = (page: Page) => {
    setMainPage(page);
    if (!dismissible) {
      props.close();
    }
  };

  const quantities: {
    [key: string]: number;
  } = {
    favorites: linkedFavorites.array.length > 0 ? linkedFavorites.array.length : favorites.length,
    bought: bought.length,
    hidden: hidden.length,
  };

  const [newUpdate, setNewUpdate] = useState(false);

  const checkForUpdates = () => {
    const lastWeek = DateTime.utc().minus({ days: 7 });
    firestore
      .collection("updates")
      .orderBy("date", "desc")
      .limit(1)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const date = DateTime.fromISO(doc.data().date, { zone: "utc" });
          if (date >= lastWeek) {
            setNewUpdate(true);
          }
        });
      });
  };

  useEffect(checkForUpdates, []);

  const newUpdateIcon = newUpdate ? <ListItemMeta icon={iconObject(<FiberNew />)} /> : null;

  const linkedFavorite =
    !user.email && linkedFavorites.array.length > 0 ? (
      <>
        <ListDivider />
        <ListItem onClick={() => setPage("favorites")} activated={appPage === "favorites"}>
          <ListItemGraphic
            icon={appPage === "favorites" && linkedFavorites.array.length > 0 ? "link" : pageIcons.favorites}
          />
          {pageTitle.favorites}
          <ListItemMeta>{quantities.favorites}</ListItemMeta>
        </ListItem>
      </>
    ) : null;

  const userOptions = user.email ? (
    <>
      <ListDivider />
      <CollapsibleList
        defaultOpen
        handle={
          <ListItem className={classNames({ "contains-activated": userPages.includes(appPage) })}>
            <ListItemGraphic icon={iconObject(<Person />)} />
            <Typography use="caption" className="subheader">
              User
            </Typography>
            <ListItemMeta icon="expand_more" />
          </ListItem>
        }
        className="group-collapsible"
      >
        {userPages.map((page) => {
          return (
            <ListItem key={page} onClick={() => setPage(page)} activated={appPage === page}>
              <ListItemGraphic
                icon={
                  appPage === "favorites" && page === "favorites" && linkedFavorites.array.length > 0
                    ? "link"
                    : pageIcons[page]
                }
              />
              {pageTitle[page]}
              {hasKey(quantities, page) ? <ListItemMeta>{quantities[page]}</ListItemMeta> : null}
            </ListItem>
          );
        })}
      </CollapsibleList>
    </>
  ) : null;

  const adminOptions = user.isAdmin ? (
    <>
      <ListDivider />
      <CollapsibleList
        handle={
          <ListItem className={classNames({ "contains-activated": adminPages.includes(appPage) })}>
            <ListItemGraphic icon={iconObject(<AdminPanelSettings />)} />
            <Typography use="caption" className="subheader">
              Admin
            </Typography>
            <ListItemMeta icon="expand_more" />
          </ListItem>
        }
        className="group-collapsible"
      >
        {adminPages.map((page) => {
          return (
            <ListItem key={page} onClick={() => setPage(page)} activated={appPage === page}>
              <ListItemGraphic icon={pageIcons[page]} />
              {pageTitle[page]}
            </ListItem>
          );
        })}
      </CollapsibleList>
    </>
  ) : null;

  const closeIcon =
    dismissible || bottomNav ? (
      <IconButton
        className={classNames({ "rtl-flip": !bottomNav })}
        icon={bottomNav ? "close" : "chevron_left"}
        onClick={props.close}
      />
    ) : null;

  return (
    <Drawer
      className={classNames("nav", { rail: dismissible, "drawer-bottom": bottomNav })}
      dismissible={dismissible}
      modal={!dismissible}
      open={props.open}
      onClose={props.close}
    >
      <DrawerHeader>
        <img className="logo" src={logo} alt="logo" />
        <DrawerTitle>KeycapLendar</DrawerTitle>
        {closeIcon}
      </DrawerHeader>
      <DrawerContent>
        <List>
          {standardPages.map((page) => {
            return (
              <ListItem key={page} onClick={() => setPage(page)} activated={appPage === page}>
                <ListItemGraphic icon={pageIcons[page]} />
                {pageTitle[page]}
              </ListItem>
            );
          })}
          <ListDivider />
          <ListItem onClick={() => setPage("statistics")} activated={appPage === "statistics"}>
            <ListItemGraphic icon={pageIcons.statistics} />
            {pageTitle.statistics}
          </ListItem>
          <ListItem onClick={() => setPage("history")} activated={appPage === "history"}>
            <ListItemGraphic icon={pageIcons.history} />
            {pageTitle.history}
          </ListItem>
          {linkedFavorite}
          {userOptions}
          {adminOptions}
          <ListDivider />
          <ListItem onClick={() => setPage("guides")} activated={appPage === "guides"}>
            <ListItemGraphic icon={pageIcons.guides} />
            {pageTitle.guides}
          </ListItem>
          <ListItem onClick={() => setPage("updates")} activated={appPage === "updates"}>
            <ListItemGraphic icon={pageIcons.updates} />
            {pageTitle.updates}
            {newUpdateIcon}
          </ListItem>
          <ListItem onClick={() => setPage("settings")} activated={appPage === "settings"}>
            <ListItemGraphic icon={pageIcons.settings} />
            {pageTitle.settings}
          </ListItem>
        </List>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerNav;
