import React, { useContext } from "react";
import classNames from "classnames";
import { standardPages, userPages, adminPages, pageIcons, pageTitle } from "../../util/constants";
import { UserContext, DeviceContext } from "../../util/contexts";
import { hasKey } from "../../util/functions";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { List, ListItem, ListItemGraphic, ListItemMeta, ListDivider } from "@rmwc/list";
import { IconButton } from "@rmwc/icon-button";
import "./DrawerNav.scss";
import logo from "../../media/logo.svg";

type DrawerNavProps = {
  bottomNav: boolean;
  close: () => void;
  open: boolean;
  page: string;
  setPage: (page: string) => void;
  view: string;
};

export const DrawerNav = (props: DrawerNavProps) => {
  const { user, favorites, hidden } = useContext(UserContext);
  const quantities: {
    [key: string]: number;
  } = {
    favorites: favorites.length,
    hidden: hidden.length,
  };
  const device = useContext(DeviceContext);
  const dismissible = device === "desktop";
  const setPage = (page: string) => {
    props.setPage(page);
    if (!dismissible) {
      props.close();
    }
  };
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
    dismissible || props.bottomNav ? (
      <IconButton
        className={classNames({ "rtl-flip": !props.bottomNav })}
        icon={props.bottomNav ? "close" : "chevron_left"}
        onClick={props.close}
      />
    ) : null;
  return (
    <Drawer
      className={classNames("nav", { rail: dismissible, "drawer-bottom": props.bottomNav })}
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
