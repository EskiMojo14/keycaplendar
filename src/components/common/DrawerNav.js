import React from "react";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { List, ListItem, ListItemGraphic } from "@rmwc/list";
import { IconButton } from "@rmwc/icon-button";
import "./DrawerNav.scss";
import logo from "../../logo.svg";

export class DesktopDrawerNav extends React.Component {
  render() {
    const filledIcons = false;
    return (
      <Drawer className={"nav" + (this.props.open ? "" : " collapsed")} dismissible open={this.props.open}>
        <DrawerHeader>
          <img className="logo" src={logo} alt="logo" />
          <DrawerTitle>KeycapLendar</DrawerTitle>
          <IconButton icon="chevron_left" onClick={this.props.close} />
        </DrawerHeader>
        <DrawerContent>
          <List>
            <ListItem
              onClick={(e) => this.props.changePage("calendar")}
              activated={this.props.page === "calendar" ? true : false}
            >
              <ListItemGraphic
                icon={{
                  strategy: this.props.page === "calendar" && filledIcons ? "ligature" : "component",
                  icon:
                    this.props.page === "calendar" && filledIcons ? (
                      "calendar_today"
                    ) : (
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
            <ListItem
              onClick={(e) => this.props.changePage("live")}
              activated={this.props.page === "live" ? true : false}
            >
              <ListItemGraphic
                icon={{
                  strategy: this.props.page === "live" && filledIcons ? "ligature" : "component",
                  icon:
                    this.props.page === "live" && filledIcons ? (
                      "store"
                    ) : (
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
            <ListItem onClick={(e) => this.props.changePage("ic")} activated={this.props.page === "ic" ? true : false}>
              <ListItemGraphic
                icon={{
                  strategy: this.props.page === "ic" && filledIcons ? "ligature" : "component",
                  icon:
                    this.props.page === "ic" && filledIcons ? (
                      "forum"
                    ) : (
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
            <ListItem
              onClick={(e) => this.props.changePage("previous")}
              activated={this.props.page === "previous" ? true : false}
            >
              <ListItemGraphic icon="history" />
              Previous Sets
            </ListItem>
            <ListItem
              onClick={(e) => this.props.changePage("timeline")}
              activated={this.props.page === "timeline" ? true : false}
            >
              <ListItemGraphic icon="timeline" />
              Timeline
            </ListItem>
            <ListItem
              onClick={(e) => this.props.changePage("statistics")}
              activated={this.props.page === "statistics" ? true : false}
            >
              <ListItemGraphic icon="bar_chart" />
              Statistics
            </ListItem>
          </List>
        </DrawerContent>
        <div className="drawer-footer">
          <List className="drawer-footer-list">
            <ListItem onClick={this.props.openSettings}>
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
        </div>
      </Drawer>
    );
  }
}

export class MobileDrawerNav extends React.Component {

  toggleDrawerIcon = () => {
    this.props.toggle();
  }

  changePage = (newPage) => {
    this.props.changePage(newPage);
    this.props.close();
  }
  render() {
    const filledIcons = false;
    return (
      <Drawer className="nav" modal open={this.props.open} onClose={this.props.close}>
        <DrawerHeader>
          <img className="logo" src={logo} alt="logo" />
          <DrawerTitle>KeycapLendar</DrawerTitle>
        </DrawerHeader>

        <DrawerContent>
          <List>
            <ListItem
              onClick={(e) => {
                this.props.changePage("calendar");
                this.props.close();
              }}
              activated={this.props.page === "calendar" ? true : false}
            >
              <ListItemGraphic
                icon={{
                  strategy: this.props.page === "calendar" && filledIcons ? "ligature" : "component",
                  icon:
                    this.props.page === "calendar" && filledIcons ? (
                      "calendar_today"
                    ) : (
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
            <ListItem
              onClick={(e) => {
                this.props.changePage("live");
                this.props.close();
              }}
              activated={this.props.page === "live" ? true : false}
            >
              <ListItemGraphic
                icon={{
                  strategy: this.props.page === "live" && filledIcons ? "ligature" : "component",
                  icon:
                    this.props.page === "live" && filledIcons ? (
                      "store"
                    ) : (
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
            <ListItem
              onClick={(e) => {
                this.props.changePage("ic");
                this.props.close();
              }}
              activated={this.props.page === "ic" ? true : false}
            >
              <ListItemGraphic
                icon={{
                  strategy: this.props.page === "ic" && filledIcons ? "ligature" : "component",
                  icon:
                    this.props.page === "ic" && filledIcons ? (
                      "forum"
                    ) : (
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
            <ListItem
              onClick={(e) => {
                this.props.changePage("previous");
                this.props.close();
              }}
              activated={this.props.page === "previous" ? true : false}
            >
              <ListItemGraphic icon="history" />
              Previous Sets
            </ListItem>
            <ListItem
              onClick={(e) => {
                this.props.changePage("timeline");
                this.props.close();
              }}
              activated={this.props.page === "timeline" ? true : false}
            >
              <ListItemGraphic icon="timeline" />
              Timeline
            </ListItem>
            <ListItem
              onClick={(e) => {
                this.props.changePage("statistics");
                this.props.close();
              }}
              activated={this.props.page === "statistics" ? true : false}
            >
              <ListItemGraphic icon="bar_chart" />
              Statistics
            </ListItem>
          </List>
        </DrawerContent>
        <div className="drawer-footer">
          <List className="drawer-footer-list">
            <ListItem
              onClick={() => {
                this.props.close();
                this.props.openSettings();
              }}
            >
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
        </div>
      </Drawer>
    );
  }
}
export class BottomDrawerNav extends React.Component {

  toggleDrawerIcon = () => {
    this.props.toggle();
  }

  changePage = (newPage) => {
    this.props.changePage(newPage);
    this.props.close();
  }
  render() {
    const filledIcons = false;
    return (
      <Drawer className="nav bottom" modal open={this.props.open} onClose={this.props.close}>
        <DrawerHeader>
          <img className="logo" src={logo} alt="logo" />
          <DrawerTitle>KeycapLendar</DrawerTitle>
        </DrawerHeader>

        <DrawerContent>
          <List>
            <ListItem
              onClick={(e) => {
                this.props.changePage("calendar");
                this.props.close();
              }}
              activated={this.props.page === "calendar" ? true : false}
            >
              <ListItemGraphic
                icon={{
                  strategy: this.props.page === "calendar" && filledIcons ? "ligature" : "component",
                  icon:
                    this.props.page === "calendar" && filledIcons ? (
                      "calendar_today"
                    ) : (
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
            <ListItem
              onClick={(e) => {
                this.props.changePage("live");
                this.props.close();
              }}
              activated={this.props.page === "live" ? true : false}
            >
              <ListItemGraphic
                icon={{
                  strategy: this.props.page === "live" && filledIcons ? "ligature" : "component",
                  icon:
                    this.props.page === "live" && filledIcons ? (
                      "store"
                    ) : (
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
            <ListItem
              onClick={(e) => {
                this.props.changePage("ic");
                this.props.close();
              }}
              activated={this.props.page === "ic" ? true : false}
            >
              <ListItemGraphic
                icon={{
                  strategy: this.props.page === "ic" && filledIcons ? "ligature" : "component",
                  icon:
                    this.props.page === "ic" && filledIcons ? (
                      "forum"
                    ) : (
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
            <ListItem
              onClick={(e) => {
                this.props.changePage("previous");
                this.props.close();
              }}
              activated={this.props.page === "previous" ? true : false}
            >
              <ListItemGraphic icon="history" />
              Previous Sets
            </ListItem>
            <ListItem
              onClick={(e) => {
                this.props.changePage("timeline");
                this.props.close();
              }}
              activated={this.props.page === "timeline" ? true : false}
            >
              <ListItemGraphic icon="timeline" />
              Timeline
            </ListItem>
            <ListItem
              onClick={(e) => {
                this.props.changePage("statistics");
                this.props.close();
              }}
              activated={this.props.page === "statistics" ? true : false}
            >
              <ListItemGraphic icon="bar_chart" />
              Statistics
            </ListItem>
          </List>
        </DrawerContent>
        <div className="drawer-footer">
          <List className="drawer-footer-list">
            <ListItem
              onClick={() => {
                this.props.close();
                this.props.openSettings();
              }}
            >
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
        </div>
      </Drawer>
    );
  }
}

export default DesktopDrawerNav;
