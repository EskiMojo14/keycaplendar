import React, { useContext } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { standardPages, userPages, adminPages, pageIcons, pageTitle } from "../../util/constants";
import { UserContext, DeviceContext } from "../../util/contexts";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { List, ListItem, ListItemGraphic, ListItemMeta, ListDivider } from "@rmwc/list";
import { IconButton } from "@rmwc/icon-button";
import "./DrawerNav.scss";
import logo from "../../media/logo.svg";

export const DrawerNav = (props) => {
  const { user, favorites, hidden } = useContext(UserContext);
  const quantities = {
    favorites: favorites.length,
    hidden: hidden.length,
  };
  const device = useContext(DeviceContext);
  const dismissible = device === "desktop";
  const setPage = (page) => {
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
            {Object.keys(quantities).includes(page) ? <ListItemMeta>{quantities[page]}</ListItemMeta> : null}
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
          <ListItem onClick={(e) => setPage("statistics")} activated={props.page === "statistics"}>
            <ListItemGraphic icon={pageIcons.statistics} />
            Statistics
          </ListItem>
          {adminOptions}
          <ListDivider />
          <ListItem onClick={(e) => setPage("settings")} activated={props.page === "settings"}>
            <ListItemGraphic icon={pageIcons.settings} />
            Settings
          </ListItem>
        </List>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerNav;

DrawerNav.propTypes = {
  setPage: PropTypes.func,
  close: PropTypes.func,
  device: PropTypes.string,
  open: PropTypes.bool,
  page: PropTypes.string,
  view: PropTypes.string,
};
