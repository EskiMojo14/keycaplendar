import React from "react";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { List, ListItem, ListItemGraphic, ListDivider } from "@rmwc/list";
import { IconButton } from "@rmwc/icon-button";
import "./DrawerNav.scss";
import logo from "../../logo.svg";

export const DrawerNav = (props) => {
  const dismissible = props.device !== "mobile" && props.view !== "compact";
  const changePage = (newPage) => {
    props.changePage(newPage);
    if (!dismissible) {
      props.close();
    }
  };
  const adminOptions = props.user.isAdmin ? (
    <div>
      <ListDivider />
      <ListItem onClick={(e) => changePage("audit")} activated={props.page === "audit"}>
        <ListItemGraphic
          icon={{
            strategy: "component",
            icon: (
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
                    <g opacity=".3">
                      <path d="M11.34,9.76L9.93,8.34C8.98,7.4,7.73,6.88,6.39,6.88C5.76,6.88,5.14,7,4.57,7.22l1.04,1.04h2.28v2.14 c0.4,0.23,0.86,0.35,1.33,0.35c0.73,0,1.41-0.28,1.92-0.8L11.34,9.76z" />
                    </g>
                    <g opacity=".3">
                      <path d="M11,6.62l6,5.97V14h-1.41l-2.83-2.83l-0.2,0.2c-0.46,0.46-0.99,0.8-1.56,1.03V15h6v2c0,0.55,0.45,1,1,1s1-0.45,1-1V6h-8 V6.62z" />
                    </g>
                    <g>
                      <path d="M9,4v1.38c-0.83-0.33-1.72-0.5-2.61-0.5c-1.79,0-3.58,0.68-4.95,2.05l3.33,3.33h1.11v1.11c0.86,0.86,1.98,1.31,3.11,1.36 V15H6v3c0,1.1,0.9,2,2,2h10c1.66,0,3-1.34,3-3V4H9z M7.89,10.41V8.26H5.61L4.57,7.22C5.14,7,5.76,6.88,6.39,6.88 c1.34,0,2.59,0.52,3.54,1.46l1.41,1.41l-0.2,0.2c-0.51,0.51-1.19,0.8-1.92,0.8C8.75,10.75,8.29,10.63,7.89,10.41z M19,17 c0,0.55-0.45,1-1,1s-1-0.45-1-1v-2h-6v-2.59c0.57-0.23,1.1-0.57,1.56-1.03l0.2-0.2L15.59,14H17v-1.41l-6-5.97V6h8V17z" />
                    </g>
                  </g>
                </g>
              </svg>
            ),
          }}
        />
        Audit Log
      </ListItem>
      <ListItem onClick={(e) => changePage("users")} activated={props.page === "users"}>
        <ListItemGraphic
          icon={{
            strategy: "component",
            icon: (
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
            ),
          }}
        />
        Users
      </ListItem>
    </div>
  ) : null;
  const closeIcon = dismissible ? <IconButton className="rtl-flip" icon="chevron_left" onClick={props.close} /> : null;
  return (
    <Drawer
      className={"nav" + (dismissible ? (props.open ? "" : " collapsed") : "") + (props.bottomNav ? " bottom" : "")}
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
          <ListItem onClick={(e) => changePage("calendar")} activated={props.page === "calendar"}>
            <ListItemGraphic
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" />
                    <path d="M4 5.01h16V8H4z" opacity=".3" />
                  </svg>
                ),
              }}
            />
            Calendar
          </ListItem>
          <ListItem onClick={(e) => changePage("live")} activated={props.page === "live"}>
            <ListItemGraphic
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" />
                    <path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" />
                  </svg>
                ),
              }}
            />
            Live GBs
          </ListItem>
          <ListItem onClick={(e) => changePage("ic")} activated={props.page === "ic"}>
            <ListItemGraphic
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M15 11V4H4v8.17L5.17 11H6z" opacity=".3" />
                    <path d="M16 13c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10zm-12-.83V4h11v7H5.17L4 12.17zM22 7c0-.55-.45-1-1-1h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7z" />
                  </svg>
                ),
              }}
            />
            IC Tracker
          </ListItem>
          <ListItem onClick={(e) => changePage("previous")} activated={props.page === "previous"}>
            <ListItemGraphic icon="history" />
            Previous Sets
          </ListItem>
          <ListItem onClick={(e) => changePage("timeline")} activated={props.page === "timeline"}>
            <ListItemGraphic icon="timeline" />
            Timeline
          </ListItem>
          <ListItem onClick={(e) => changePage("statistics")} activated={props.page === "statistics"}>
            <ListItemGraphic icon="bar_chart" />
            Statistics
          </ListItem>
          {adminOptions}
          <ListDivider />
          <ListItem onClick={(e) => changePage("settings")} activated={props.page === "settings"}>
            <ListItemGraphic
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path
                      d="M19.28 8.6l-.7-1.21-1.27.51-1.06.43-.91-.7c-.39-.3-.8-.54-1.23-.71l-1.06-.43-.16-1.13L12.7 4h-1.4l-.19 1.35-.16 1.13-1.06.44c-.41.17-.82.41-1.25.73l-.9.68-1.05-.42-1.27-.52-.7 1.21 1.08.84.89.7-.14 1.13c-.03.3-.05.53-.05.73s.02.43.05.73l.14 1.13-.89.7-1.08.84.7 1.21 1.27-.51 1.06-.43.91.7c.39.3.8.54 1.23.71l1.06.43.16 1.13.19 1.36h1.39l.19-1.35.16-1.13 1.06-.43c.41-.17.82-.41 1.25-.73l.9-.68 1.04.42 1.27.51.7-1.21-1.08-.84-.89-.7.14-1.13c.04-.31.05-.52.05-.73 0-.21-.02-.43-.05-.73l-.14-1.13.89-.7 1.1-.84zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                      opacity=".3"
                    />
                    <path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                  </svg>
                ),
              }}
            />
            Settings
          </ListItem>
        </List>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerNav;
