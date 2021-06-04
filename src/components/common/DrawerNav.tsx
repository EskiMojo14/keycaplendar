import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { DateTime } from "luxon";
import { typedFirestore } from "../../app/slices/firebase/firestore";
import { useAppSelector } from "../../app/hooks";
import { selectDevice, selectPage } from "../../app/slices/common/commonSlice";
import { adminPages, pageIcons, pageTitle, standardPages, userPages } from "../../app/slices/common/constants";
import { setPage as setMainPage } from "../../app/slices/common/coreFunctions";
import { hasKey, iconObject } from "../../app/slices/common/functions";
import { Page } from "../../app/slices/common/types";
import { selectBottomNav } from "../../app/slices/settings/settingsSlice";
import { selectBought, selectFavorites, selectHidden, selectUser } from "../../app/slices/user/userSlice";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { List, ListItem, ListItemGraphic, ListItemMeta, ListDivider, CollapsibleList } from "@rmwc/list";
import { IconButton } from "@rmwc/icon-button";
import { Typography } from "@rmwc/typography";
import "./DrawerNav.scss";
import logo from "../../media/logo.svg";

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
    favorites: favorites.length,
    bought: bought.length,
    hidden: hidden.length,
  };

  const [newUpdate, setNewUpdate] = useState(false);

  const checkForUpdates = () => {
    const lastWeek = DateTime.utc().minus({ days: 7 });
    typedFirestore
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
      <ListDivider />
      <CollapsibleList
        defaultOpen
        handle={
          <ListItem className={classNames({ "contains-activated": userPages.includes(appPage) })}>
            <ListItemGraphic
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M12 16c-2.69 0-5.77 1.28-6 2h12c-.2-.71-3.3-2-6-2z" opacity=".3" />
                  <circle cx="12" cy="8" opacity=".3" r="2" />
                  <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm-6 4c.22-.72 3.31-2 6-2 2.7 0 5.8 1.29 6 2H6zm6-6c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" />
                </svg>
              )}
            />
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
              <ListItemGraphic icon={pageIcons[page]} />
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
            <ListItemGraphic
              icon={iconObject(
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  enableBackground="new 0 0 24 24"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <g>
                    <rect fill="none" height="24" width="24" />
                  </g>
                  <g>
                    <g>
                      <path
                        d="M16,7.58l-5.5-2.4L5,7.58v3.6c0,3.5,2.33,6.74,5.5,7.74c0.25-0.08,0.49-0.2,0.73-0.3 C11.08,18.11,11,17.56,11,17c0-2.97,2.16-5.43,5-5.91V7.58z"
                        opacity=".3"
                      />
                      <path
                        d="M17,13c-2.21,0-4,1.79-4,4c0,2.21,1.79,4,4,4s4-1.79,4-4C21,14.79,19.21,13,17,13z M17,14.38 c0.62,0,1.12,0.51,1.12,1.12s-0.51,1.12-1.12,1.12s-1.12-0.51-1.12-1.12S16.38,14.38,17,14.38z M17,19.75 c-0.93,0-1.74-0.46-2.24-1.17c0.05-0.72,1.51-1.08,2.24-1.08s2.19,0.36,2.24,1.08C18.74,19.29,17.93,19.75,17,19.75z"
                        opacity=".3"
                      />
                      <circle cx="17" cy="15.5" r="1.12" />
                      <path d="M18,11.09V6.27L10.5,3L3,6.27v4.91c0,4.54,3.2,8.79,7.5,9.82c0.55-0.13,1.08-0.32,1.6-0.55C13.18,21.99,14.97,23,17,23 c3.31,0,6-2.69,6-6C23,14.03,20.84,11.57,18,11.09z M11,17c0,0.56,0.08,1.11,0.23,1.62c-0.24,0.11-0.48,0.22-0.73,0.3 c-3.17-1-5.5-4.24-5.5-7.74v-3.6l5.5-2.4l5.5,2.4v3.51C13.16,11.57,11,14.03,11,17z M17,21c-2.21,0-4-1.79-4-4c0-2.21,1.79-4,4-4 s4,1.79,4,4C21,19.21,19.21,21,17,21z" />
                      <path d="M17,17.5c-0.73,0-2.19,0.36-2.24,1.08c0.5,0.71,1.32,1.17,2.24,1.17s1.74-0.46,2.24-1.17C19.19,17.86,17.73,17.5,17,17.5z" />
                    </g>
                  </g>
                </svg>
              )}
            />
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
