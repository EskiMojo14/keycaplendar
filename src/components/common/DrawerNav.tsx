import React, { useEffect, useState } from "react";
import classNames from "classnames";
import moment from "moment";
import firebase from "../../firebase";
import { useAppSelector } from "../../app/hooks";
import { selectDevice } from "../../app/slices/commonSlice";
import { selectFavorites, selectHidden, selectUser } from "../../app/slices/userSlice";
import { selectBottomNav } from "../../app/slices/settingsSlice";
import { standardPages, userPages, adminPages, pageIcons, pageTitle } from "../../util/constants";
import { hasKey, iconObject } from "../../util/functions";
import { Page } from "../../util/types";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { List, ListItem, ListItemGraphic, ListItemMeta, ListDivider } from "@rmwc/list";
import { IconButton } from "@rmwc/icon-button";
import "./DrawerNav.scss";
import logo from "../../media/logo.svg";

const db = firebase.firestore();

type DrawerNavProps = {
  close: () => void;
  open: boolean;
  page: Page;
  setPage: (page: Page) => void;
};

export const DrawerNav = (props: DrawerNavProps) => {
  const device = useAppSelector(selectDevice);
  const dismissible = device === "desktop";

  const bottomNav = useAppSelector(selectBottomNav);

  const user = useAppSelector(selectUser);
  const favorites = useAppSelector(selectFavorites);
  const hidden = useAppSelector(selectHidden);

  const setPage = (page: Page) => {
    props.setPage(page);
    if (!dismissible) {
      props.close();
    }
  };

  const quantities: {
    [key: string]: number;
  } = {
    favorites: favorites.length,
    hidden: hidden.length,
  };

  const [newUpdate, setNewUpdate] = useState(false);

  const checkForUpdates = () => {
    const lastWeek = moment.utc().days(-7);
    db.collection("updates")
      .orderBy("date", "desc")
      .limit(1)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const date = moment.utc(doc.data().date);
          if (date >= lastWeek) {
            setNewUpdate(true);
          }
        });
      });
  };

  useEffect(checkForUpdates, []);

  const newUpdateIcon = newUpdate ? (
    <ListItemMeta
      icon={iconObject(
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M9.12 14.47V9.53H8.09v2.88L6.03 9.53H5v4.94h1.03v-2.88l2.1 2.88zm4.12-3.9V9.53h-3.3v4.94h3.3v-1.03h-2.06v-.91h2.06v-1.04h-2.06v-.92zm.82-1.04v4.12c0 .45.37.82.82.82h3.29c.45 0 .82-.37.82-.82V9.53h-1.03v3.71h-.92v-2.89h-1.03v2.9h-.93V9.53h-1.02z" />
          <path d="M4 6h16v12H4z" opacity=".3" />
          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12z" />
        </svg>
      )}
    />
  ) : null;

  const userOptions = user.email ? (
    <>
      {userPages.map((page) => {
        return (
          <ListItem key={page} onClick={() => setPage(page)} activated={props.page === page}>
            <ListItemGraphic icon={pageIcons[page]} />
            {pageTitle[page]}
            {hasKey(quantities, page) ? <ListItemMeta>{quantities[page]}</ListItemMeta> : null}
          </ListItem>
        );
      })}
    </>
  ) : null;

  const adminOptions = user.isAdmin ? (
    <>
      <ListDivider />
      {adminPages.map((page) => {
        return (
          <ListItem key={page} onClick={() => setPage(page)} activated={props.page === page}>
            <ListItemGraphic icon={pageIcons[page]} />
            {pageTitle[page]}
          </ListItem>
        );
      })}
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
              <ListItem key={page} onClick={() => setPage(page)} activated={props.page === page}>
                <ListItemGraphic icon={pageIcons[page]} />
                {pageTitle[page]}
              </ListItem>
            );
          })}
          {userOptions}
          <ListDivider />
          <ListItem onClick={() => setPage("statistics")} activated={props.page === "statistics"}>
            <ListItemGraphic icon={pageIcons.statistics} />
            Statistics
          </ListItem>
          <ListItem onClick={() => setPage("history")} activated={props.page === "history"}>
            <ListItemGraphic icon={pageIcons.history} />
            History
          </ListItem>
          {adminOptions}
          <ListDivider />
          <ListItem onClick={() => setPage("updates")} activated={props.page === "updates"}>
            <ListItemGraphic icon={pageIcons.updates} />
            Updates
            {newUpdateIcon}
          </ListItem>
          <ListItem onClick={() => setPage("settings")} activated={props.page === "settings"}>
            <ListItemGraphic icon={pageIcons.settings} />
            Settings
          </ListItem>
        </List>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerNav;
