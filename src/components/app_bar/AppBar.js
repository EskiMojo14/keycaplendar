import React, { useState } from "react";
import PropTypes from "prop-types";
import { setTypes, statisticsTypes, statisticsSortTypes } from "../util/propTypeTemplates";
import { CircularProgress } from "@rmwc/circular-progress";
import { LinearProgress } from "@rmwc/linear-progress";
import { MenuSurfaceAnchor, Menu, MenuItem } from "@rmwc/menu";
import { TabBar, Tab } from "@rmwc/tabs";
import { Tooltip } from "@rmwc/tooltip";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { MenuView } from "./MenuView";
import { MenuSort } from "./MenuSort";
import { SearchBarPersistent, SearchBarModal } from "./SearchBar";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import "./AppBar.scss";

export const DesktopAppBar = (props) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [userSortMenuOpen, setUserSortMenuOpen] = useState(false);
  const [userViewMenuOpen, setUserViewMenuOpen] = useState(false);
  const openSortMenu = () => {
    setSortMenuOpen(true);
  };
  const closeSortMenu = () => {
    setSortMenuOpen(false);
  };
  const openViewMenu = () => {
    setViewMenuOpen(true);
  };
  const closeViewMenu = () => {
    setViewMenuOpen(false);
  };
  const openUserSortMenu = () => {
    setUserSortMenuOpen(true);
  };
  const closeUserSortMenu = () => {
    setUserSortMenuOpen(false);
  };
  const openUserViewMenu = () => {
    setUserViewMenuOpen(true);
  };
  const closeUserViewMenu = () => {
    setUserViewMenuOpen(false);
  };
  const setView = (index) => {
    const views = ["card", "list", "imageList", "compact"];
    props.setView(views[index]);
  };
  let viewIcon;
  if (props.view === "card") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M4 5h3v13H4zm14 0h3v13h-3zM8 18h9V5H8v13zm2-11h5v9h-5V7z" />
        <path d="M10 7h5v9h-5z" opacity=".3" />
      </svg>
    );
  } else if (props.view === "list") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
        <path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3" />
        <path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" />
      </svg>
    );
  } else if (props.view === "imageList") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
          d="M11 12.5h3V16h-3zM11 7h3v3.5h-3zm-5 5.5h3V16H6zM6 7h3v3.5H6zm10 0h3v3.5h-3zm0 5.5h3V16h-3z"
          opacity=".3"
        />
        <path d="M4 5v13h17V5H4zm5 11H6v-3.5h3V16zm0-5.5H6V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5z" />
      </svg>
    );
  } else if (props.view === "compact") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M6 7h3v9H6zm5 0h3v9h-3zm5 0h3v9h-3z" opacity=".3" />
        <path d="M4 5v13h17V5H4zm5 11H6V7h3v9zm5 0h-3V7h3v9zm5 0h-3V7h3v9z" />
      </svg>
    );
  } else {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M5 5h15v3H5zm12 5h3v9h-3zm-7 0h5v9h-5zm-5 0h3v9H5z" opacity=".3" />
        <path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-9h3v9zm7 0h-5v-9h5v9zm5 0h-3v-9h3v9zm0-11H5V5h15v3z" />
      </svg>
    );
  }
  const title = {
    calendar: "Calendar",
    live: "Live GBs",
    ic: "IC Tracker",
    previous: "Previous Sets",
    account: "Account",
    timeline: "Timeline",
    archive: "Archive",
    statistics: "Statistics",
    audit: "Audit Log",
    users: "Users",
    settings: "Settings",
  };
  const refreshButton = props.loading ? (
    <CircularProgress />
  ) : (
    <Tooltip enterDelay={500} content="Refresh" align="bottom">
      <TopAppBarActionItem
        icon="refresh"
        onClick={() => {
          props.getActions();
        }}
      />
    </Tooltip>
  );
  const buttons =
    props.page === "statistics" ? (
      props.statisticsTab === "timeline" ? (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statistics.timeline === "icDate"}
              onClick={() => {
                props.setStatistics("timeline", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={props.statistics.timeline === "gbLaunch"}
              onClick={() => {
                props.setStatistics("timeline", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
        </TopAppBarSection>
      ) : props.statisticsTab === "duration" ? (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "alphabetical"}
              onClick={() => {
                props.setStatisticsSort("duration", "alphabetical");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Alphabetical",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "total"}
              onClick={() => {
                props.setStatisticsSort("duration", "total");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Total",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "duration"}
              onClick={() => {
                props.setStatisticsSort("duration", "duration");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M5 8h14V6H5z" opacity=".3" />
                    <path d="M7 11h2v2H7zm12-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-4 3h2v2h-2zm-4 0h2v2h-2z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Duration",
              }}
            />
          </ToggleGroup>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statistics.durationCat === "icDate"}
              onClick={() => {
                props.setStatistics("durationCat", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={props.statistics.durationCat === "gbLaunch"}
              onClick={() => {
                props.setStatistics("durationCat", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statistics.durationGroup === "profile"}
              onClick={() => {
                props.setStatistics("durationGroup", "profile");
              }}
              label="Profile"
            />
            <ToggleGroupButton
              selected={props.statistics.durationGroup === "designer"}
              onClick={() => {
                props.setStatistics("durationGroup", "designer");
              }}
              label="Designer"
            />
            <ToggleGroupButton
              selected={props.statistics.durationGroup === "vendor"}
              onClick={() => {
                props.setStatistics("durationGroup", "vendor");
              }}
              label="Vendor"
            />
          </ToggleGroup>
        </TopAppBarSection>
      ) : (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statisticsSort[props.statisticsTab] === "alphabetical"}
              onClick={() => {
                props.setStatisticsSort(props.statisticsTab, "alphabetical");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Alphabetical",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort[props.statisticsTab] === "total"}
              onClick={() => {
                props.setStatisticsSort(props.statisticsTab, "total");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Total",
              }}
            />
          </ToggleGroup>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statistics[props.statisticsTab] === "profile"}
              onClick={() => {
                props.setStatistics(props.statisticsTab, "profile");
              }}
              label="Profile"
            />
            <ToggleGroupButton
              selected={props.statistics[props.statisticsTab] === "designer"}
              onClick={() => {
                props.setStatistics(props.statisticsTab, "designer");
              }}
              label="Designer"
            />
            <ToggleGroupButton
              selected={props.statistics[props.statisticsTab] === "vendor"}
              onClick={() => {
                props.setStatistics(props.statisticsTab, "vendor");
              }}
              label="Vendor"
            />
          </ToggleGroup>
        </TopAppBarSection>
      )
    ) : props.page === "audit" ? (
      <TopAppBarSection alignEnd>
        <Tooltip enterDelay={500} content="Filter" align="bottom">
          <TopAppBarActionItem
            style={{ "--animation-delay": 2 }}
            icon="filter_list"
            onClick={props.toggleAuditFilter}
          />
        </Tooltip>
        {refreshButton}
      </TopAppBarSection>
    ) : props.page === "users" ? (
      <TopAppBarSection alignEnd>
        <MenuSurfaceAnchor className={props.userView === "table" ? "hidden" : ""}>
          <Menu
            open={userSortMenuOpen}
            anchorCorner="bottomLeft"
            onClose={closeUserSortMenu}
            onSelect={(e) => props.setUserSortIndex(e.detail.index)}
          >
            <MenuItem selected={props.userSort === "displayName"}>Name</MenuItem>
            <MenuItem selected={props.userSort === "email"}>Email</MenuItem>
            <MenuItem selected={props.userSort === "nickname"}>Nickname</MenuItem>
          </Menu>
          <Tooltip
            enterDelay={500}
            content="Sort"
            align="bottom"
            className={props.userView === "table" ? "hidden" : ""}
          >
            <TopAppBarActionItem icon="sort" onClick={openUserSortMenu} />
          </Tooltip>
        </MenuSurfaceAnchor>
        <MenuSurfaceAnchor>
          <Menu
            open={userViewMenuOpen}
            anchorCorner="bottomLeft"
            onClose={closeUserViewMenu}
            onSelect={(e) => props.setUserView(e.detail.index)}
          >
            <MenuItem selected={props.userView === "card"}>Card</MenuItem>
            <MenuItem selected={props.userView === "table"}>Table</MenuItem>
          </Menu>
          <Tooltip enterDelay={500} content="View" align="bottom">
            <TopAppBarActionItem
              onClick={openUserViewMenu}
              style={{ "--animation-delay": 3 }}
              icon={{
                strategy: "component",
                icon: (
                  <div>
                    {props.userView === "card" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M4 5h3v13H4zm14 0h3v13h-3zM8 18h9V5H8v13zm2-11h5v9h-5V7z" />
                        <path d="M10 7h5v9h-5z" opacity=".3" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
                        <path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3" />
                        <path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" />
                      </svg>
                    )}
                  </div>
                ),
              }}
            />
          </Tooltip>
        </MenuSurfaceAnchor>
      </TopAppBarSection>
    ) : props.page === "settings" ? null : (
      <TopAppBarSection alignEnd>
        <SearchBarPersistent search={props.search} setSearch={props.setSearch} sets={props.sets} />
        <MenuSurfaceAnchor className={props.page === "calendar" ? "hidden" : ""}>
          <MenuSort
            page={props.page}
            sort={props.sort}
            open={sortMenuOpen}
            onSelect={props.setSort}
            onClose={closeSortMenu}
          />
          <Tooltip enterDelay={500} content="Sort" align="bottom" className={props.page === "calendar" ? "hidden" : ""}>
            <TopAppBarActionItem icon="sort" style={{ "--animation-delay": 1 }} onClick={openSortMenu} />
          </Tooltip>
        </MenuSurfaceAnchor>
        <Tooltip enterDelay={500} content="Filter" align="bottom">
          <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.toggleFilter} />
        </Tooltip>
        <MenuSurfaceAnchor>
          <MenuView
            view={props.view}
            open={viewMenuOpen}
            onSelect={(evt) => setView(evt.detail.index)}
            onClose={closeViewMenu}
          />
          <Tooltip enterDelay={500} content="View" align="bottom">
            <TopAppBarActionItem
              onClick={openViewMenu}
              style={{ "--animation-delay": 3 }}
              icon={{ strategy: "component", icon: <div>{viewIcon}</div> }}
            />
          </Tooltip>
        </MenuSurfaceAnchor>
      </TopAppBarSection>
    );
  const tabs = ["timeline", "status", "shipped", "duration"];
  const statsTabs =
    props.page === "statistics" ? (
      <TopAppBarRow className="tab-row">
        <TopAppBarSection alignStart>
          <TabBar
            activeTabIndex={tabs.indexOf(props.statisticsTab)}
            onActivate={(e) => props.setStatisticsTab(tabs[e.detail.index])}
          >
            <Tab>Timeline</Tab>
            <Tab>Status</Tab>
            <Tab>Shipped</Tab>
            <Tab>Duration</Tab>
          </TabBar>
        </TopAppBarSection>
      </TopAppBarRow>
    ) : null;
  return [
    <TopAppBar fixed key="AppBar">
      <TopAppBarRow>
        <TopAppBarSection alignStart>
          <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
          <TopAppBarTitle>{title[props.page]}</TopAppBarTitle>
        </TopAppBarSection>
        {buttons}
      </TopAppBarRow>
      {statsTabs}
      <LinearProgress closed={!props.loading} />
    </TopAppBar>,
    <TopAppBarFixedAdjust key="AppBarFixedAdjust" />,
  ];
};

export const TabletAppBar = (props) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userSortMenuOpen, setUserSortMenuOpen] = useState(false);
  const openSortMenu = () => {
    setSortMenuOpen(true);
  };
  const closeSortMenu = () => {
    setSortMenuOpen(false);
  };
  const openViewMenu = () => {
    setViewMenuOpen(true);
  };
  const closeViewMenu = () => {
    setViewMenuOpen(false);
  };
  const setView = (index) => {
    const views = ["card", "list", "imageList", "compact"];
    props.setView(views[index]);
  };
  const openSearch = () => {
    setSearchOpen(true);
    document.documentElement.scrollTop = 0;
  };
  const closeSearch = () => {
    setSearchOpen(false);
  };
  const openUserSortMenu = () => {
    setUserSortMenuOpen(true);
  };
  const closeUserSortMenu = () => {
    setUserSortMenuOpen(false);
  };
  let viewIcon;
  if (props.view === "card") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M4 5h3v13H4zm14 0h3v13h-3zM8 18h9V5H8v13zm2-11h5v9h-5V7z" />
        <path d="M10 7h5v9h-5z" opacity=".3" />
      </svg>
    );
  } else if (props.view === "list") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
        <path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3" />
        <path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" />
      </svg>
    );
  } else if (props.view === "imageList") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
          d="M11 12.5h3V16h-3zM11 7h3v3.5h-3zm-5 5.5h3V16H6zM6 7h3v3.5H6zm10 0h3v3.5h-3zm0 5.5h3V16h-3z"
          opacity=".3"
        />
        <path d="M4 5v13h17V5H4zm5 11H6v-3.5h3V16zm0-5.5H6V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5z" />
      </svg>
    );
  } else if (props.view === "compact") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M6 7h3v9H6zm5 0h3v9h-3zm5 0h3v9h-3z" opacity=".3" />
        <path d="M4 5v13h17V5H4zm5 11H6V7h3v9zm5 0h-3V7h3v9zm5 0h-3V7h3v9z" />
      </svg>
    );
  } else {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M5 5h15v3H5zm12 5h3v9h-3zm-7 0h5v9h-5zm-5 0h3v9H5z" opacity=".3" />
        <path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-9h3v9zm7 0h-5v-9h5v9zm5 0h-3v-9h3v9zm0-11H5V5h15v3z" />
      </svg>
    );
  }
  const title = {
    calendar: "Calendar",
    live: "Live GBs",
    ic: "IC Tracker",
    previous: "Previous Sets",
    account: "Account",
    timeline: "Timeline",
    archive: "Archive",
    statistics: "Statistics",
    audit: "Audit Log",
    users: "Users",
    settings: "Settings",
  };
  const refreshButton = props.loading ? (
    <CircularProgress />
  ) : (
    <Tooltip enterDelay={500} content="Refresh" align="bottom">
      <TopAppBarActionItem
        icon="refresh"
        onClick={() => {
          props.getActions();
        }}
      />
    </Tooltip>
  );
  const buttons =
    props.page === "statistics" ? (
      props.statisticsTab === "timeline" ? (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statistics.timeline === "icDate"}
              onClick={() => {
                props.setStatistics("timeline", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={props.statistics.timeline === "gbLaunch"}
              onClick={() => {
                props.setStatistics("timeline", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
        </TopAppBarSection>
      ) : props.statisticsTab === "duration" ? (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "alphabetical"}
              onClick={() => {
                props.setStatisticsSort("duration", "alphabetical");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Alphabetical",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "total"}
              onClick={() => {
                props.setStatisticsSort("duration", "total");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Total",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "duration"}
              onClick={() => {
                props.setStatisticsSort("duration", "duration");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M5 8h14V6H5z" opacity=".3" />
                    <path d="M7 11h2v2H7zm12-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-4 3h2v2h-2zm-4 0h2v2h-2z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Duration",
              }}
            />
          </ToggleGroup>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statistics.durationCat === "icDate"}
              onClick={() => {
                props.setStatistics("durationCat", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={props.statistics.durationCat === "gbLaunch"}
              onClick={() => {
                props.setStatistics("durationCat", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
          <Tooltip enterDelay={500} content="Category" align="bottom">
            <TopAppBarActionItem
              className="category-button"
              onClick={props.openStatisticsDialog}
              style={{ "--animation-delay": 0 }}
              icon={{
                strategy: "component",
                icon: (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <circle cx="17.5" cy="17.5" opacity=".3" r="2.5" />
                      <path d="M5 15.5h4v4H5zm7-9.66L10.07 9h3.86z" opacity=".3" />
                      <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM11 13.5H3v8h8v-8zm-2 6H5v-4h4v4z" />
                    </svg>
                  </div>
                ),
              }}
            />
          </Tooltip>
        </TopAppBarSection>
      ) : (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statisticsSort[props.statisticsTab] === "alphabetical"}
              onClick={() => {
                props.setStatisticsSort(props.statisticsTab, "alphabetical");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Alphabetical",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort[props.statisticsTab] === "total"}
              onClick={() => {
                props.setStatisticsSort(props.statisticsTab, "total");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Total",
              }}
            />
          </ToggleGroup>
          <Tooltip enterDelay={500} content="Category" align="bottom">
            <TopAppBarActionItem
              className="category-button"
              onClick={props.openStatisticsDialog}
              style={{ "--animation-delay": 0 }}
              icon={{
                strategy: "component",
                icon: (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <circle cx="17.5" cy="17.5" opacity=".3" r="2.5" />
                      <path d="M5 15.5h4v4H5zm7-9.66L10.07 9h3.86z" opacity=".3" />
                      <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM11 13.5H3v8h8v-8zm-2 6H5v-4h4v4z" />
                    </svg>
                  </div>
                ),
              }}
            />
          </Tooltip>
        </TopAppBarSection>
      )
    ) : props.page === "audit" ? (
      <TopAppBarSection alignEnd>
        <Tooltip enterDelay={500} content="Filter" align="bottom">
          <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openAuditFilter} />
        </Tooltip>
        {refreshButton}
      </TopAppBarSection>
    ) : props.page === "users" ? (
      <TopAppBarSection alignEnd>
        <MenuSurfaceAnchor className={props.userView === "table" ? "hidden" : ""}>
          <Menu
            open={userSortMenuOpen}
            anchorCorner="bottomLeft"
            onClose={closeUserSortMenu}
            onSelect={(e) => props.setUserSortIndex(e.detail.index)}
          >
            <MenuItem selected={props.userSort === "displayName"}>Name</MenuItem>
            <MenuItem selected={props.userSort === "email"}>Email</MenuItem>
            <MenuItem selected={props.userSort === "nickname"}>Nickname</MenuItem>
          </Menu>
          <Tooltip
            enterDelay={500}
            content="Sort"
            align="bottom"
            className={props.userView === "table" ? "hidden" : ""}
          >
            <TopAppBarActionItem icon="sort" onClick={openUserSortMenu} />
          </Tooltip>
        </MenuSurfaceAnchor>
      </TopAppBarSection>
    ) : props.page === "settings" ? null : (
      <TopAppBarSection alignEnd>
        <MenuSurfaceAnchor className={props.page === "calendar" ? "hidden" : ""}>
          <MenuSort
            page={props.page}
            sort={props.sort}
            open={sortMenuOpen}
            onSelect={props.setSort}
            onClose={closeSortMenu}
          />
          <Tooltip enterDelay={500} content="Sort" align="bottom" className={props.page === "calendar" ? "hidden" : ""}>
            <TopAppBarActionItem style={{ "--animation-delay": 1 }} icon="sort" onClick={openSortMenu} />
          </Tooltip>
        </MenuSurfaceAnchor>
        <Tooltip enterDelay={500} content="Filter" align="bottom">
          <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openFilter} />
        </Tooltip>
        <MenuSurfaceAnchor>
          <MenuView
            view={props.view}
            open={viewMenuOpen}
            onSelect={(evt) => setView(evt.detail.index)}
            onClose={closeViewMenu}
          />
          <Tooltip enterDelay={500} content="View" align="bottom">
            <TopAppBarActionItem
              onClick={openViewMenu}
              style={{ "--animation-delay": 3 }}
              icon={{ strategy: "component", icon: <div>{viewIcon}</div> }}
            />
          </Tooltip>
        </MenuSurfaceAnchor>
        <div>
          <SearchBarModal
            open={searchOpen}
            close={closeSearch}
            search={props.search}
            setSearch={props.setSearch}
            sets={props.sets}
          />
          <Tooltip enterDelay={500} content="Search" align="bottom">
            <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="search" onClick={openSearch} />
          </Tooltip>
        </div>
      </TopAppBarSection>
    );
  const tabs = ["timeline", "status", "shipped", "duration"];
  const statsTabs =
    props.page === "statistics" ? (
      <TopAppBarRow className="tab-row">
        <TopAppBarSection alignStart>
          <TabBar
            activeTabIndex={tabs.indexOf(props.statisticsTab)}
            onActivate={(e) => props.setStatisticsTab(tabs[e.detail.index])}
          >
            <Tab>Timeline</Tab>
            <Tab>Status</Tab>
            <Tab>Shipped</Tab>
            <Tab>Duration</Tab>
          </TabBar>
        </TopAppBarSection>
      </TopAppBarRow>
    ) : null;
  return [
    <TopAppBar fixed key="AppBar">
      <TopAppBarRow>
        <TopAppBarSection alignStart>
          <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
          <TopAppBarTitle>{title[props.page]}</TopAppBarTitle>
        </TopAppBarSection>
        {buttons}
      </TopAppBarRow>
      {statsTabs}
      <LinearProgress closed={!props.loading} />
    </TopAppBar>,
    <TopAppBarFixedAdjust key="AppBarFixedAdjust" />,
  ];
};

export const MobileAppBar = (props) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userSortMenuOpen, setUserSortMenuOpen] = useState(false);
  const openSortMenu = () => {
    setSortMenuOpen(true);
  };
  const closeSortMenu = () => {
    setSortMenuOpen(false);
  };
  const openViewMenu = () => {
    setViewMenuOpen(true);
  };
  const closeViewMenu = () => {
    setViewMenuOpen(false);
  };
  const setView = (index) => {
    const views = ["card", "list", "imageList", "compact"];
    props.setView(views[index]);
  };
  const openSearch = () => {
    setSearchOpen(true);
    document.documentElement.scrollTop = 0;
  };
  const closeSearch = () => {
    setSearchOpen(false);
  };
  const openUserSortMenu = () => {
    setUserSortMenuOpen(true);
  };
  const closeUserSortMenu = () => {
    setUserSortMenuOpen(false);
  };
  let viewIcon;
  if (props.view === "card") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M4 5h3v13H4zm14 0h3v13h-3zM8 18h9V5H8v13zm2-11h5v9h-5V7z" />
        <path d="M10 7h5v9h-5z" opacity=".3" />
      </svg>
    );
  } else if (props.view === "list") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
        <path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3" />
        <path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" />
      </svg>
    );
  } else if (props.view === "imageList") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
          d="M11 12.5h3V16h-3zM11 7h3v3.5h-3zm-5 5.5h3V16H6zM6 7h3v3.5H6zm10 0h3v3.5h-3zm0 5.5h3V16h-3z"
          opacity=".3"
        />
        <path d="M4 5v13h17V5H4zm5 11H6v-3.5h3V16zm0-5.5H6V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5z" />
      </svg>
    );
  } else if (props.view === "compact") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M6 7h3v9H6zm5 0h3v9h-3zm5 0h3v9h-3z" opacity=".3" />
        <path d="M4 5v13h17V5H4zm5 11H6V7h3v9zm5 0h-3V7h3v9zm5 0h-3V7h3v9z" />
      </svg>
    );
  } else {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M5 5h15v3H5zm12 5h3v9h-3zm-7 0h5v9h-5zm-5 0h3v9H5z" opacity=".3" />
        <path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-9h3v9zm7 0h-5v-9h5v9zm5 0h-3v-9h3v9zm0-11H5V5h15v3z" />
      </svg>
    );
  }
  const title = {
    calendar: "Calendar",
    live: "Live GBs",
    ic: "IC Tracker",
    previous: "Previous Sets",
    account: "Account",
    timeline: "Timeline",
    archive: "Archive",
    statistics: props.statisticsTab !== "duration" ? "Statistics" : "",
    audit: "Audit Log",
    users: "Users",
    settings: "Settings",
  };
  const refreshButton = props.loading ? (
    <CircularProgress />
  ) : (
    <Tooltip enterDelay={500} content="Refresh" align="bottom">
      <TopAppBarActionItem
        icon="refresh"
        onClick={() => {
          props.getActions();
        }}
      />
    </Tooltip>
  );
  const buttons =
    props.page === "statistics" ? (
      props.statisticsTab === "timeline" ? (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statistics.timeline === "icDate"}
              onClick={() => {
                props.setStatistics("timeline", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={props.statistics.timeline === "gbLaunch"}
              onClick={() => {
                props.setStatistics("timeline", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
        </TopAppBarSection>
      ) : props.statisticsTab === "duration" ? (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "alphabetical"}
              onClick={() => {
                props.setStatisticsSort("duration", "alphabetical");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Alphabetical",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "total"}
              onClick={() => {
                props.setStatisticsSort("duration", "total");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Total",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "duration"}
              onClick={() => {
                props.setStatisticsSort("duration", "duration");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M5 8h14V6H5z" opacity=".3" />
                    <path d="M7 11h2v2H7zm12-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-4 3h2v2h-2zm-4 0h2v2h-2z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Duration",
              }}
            />
          </ToggleGroup>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statistics.durationCat === "icDate"}
              onClick={() => {
                props.setStatistics("durationCat", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={props.statistics.durationCat === "gbLaunch"}
              onClick={() => {
                props.setStatistics("durationCat", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
          <Tooltip enterDelay={500} content="Category" align="bottom">
            <TopAppBarActionItem
              className="category-button"
              onClick={props.openStatisticsDialog}
              style={{ "--animation-delay": 0 }}
              icon={{
                strategy: "component",
                icon: (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <circle cx="17.5" cy="17.5" opacity=".3" r="2.5" />
                      <path d="M5 15.5h4v4H5zm7-9.66L10.07 9h3.86z" opacity=".3" />
                      <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM11 13.5H3v8h8v-8zm-2 6H5v-4h4v4z" />
                    </svg>
                  </div>
                ),
              }}
            />
          </Tooltip>
        </TopAppBarSection>
      ) : (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statisticsSort[props.statisticsTab] === "alphabetical"}
              onClick={() => {
                props.setStatisticsSort(props.statisticsTab, "alphabetical");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Alphabetical",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort[props.statisticsTab] === "total"}
              onClick={() => {
                props.setStatisticsSort(props.statisticsTab, "total");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "bottom",
                content: "Total",
              }}
            />
          </ToggleGroup>
          <Tooltip enterDelay={500} content="Category" align="bottom">
            <TopAppBarActionItem
              className="category-button"
              onClick={props.openStatisticsDialog}
              style={{ "--animation-delay": 0 }}
              icon={{
                strategy: "component",
                icon: (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <circle cx="17.5" cy="17.5" opacity=".3" r="2.5" />
                      <path d="M5 15.5h4v4H5zm7-9.66L10.07 9h3.86z" opacity=".3" />
                      <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM11 13.5H3v8h8v-8zm-2 6H5v-4h4v4z" />
                    </svg>
                  </div>
                ),
              }}
            />
          </Tooltip>
        </TopAppBarSection>
      )
    ) : props.page === "audit" ? (
      <TopAppBarSection alignEnd>
        <Tooltip enterDelay={500} content="Filter" align="bottom">
          <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openAuditFilter} />
        </Tooltip>
        {refreshButton}
      </TopAppBarSection>
    ) : props.page === "users" ? (
      <TopAppBarSection alignEnd>
        <MenuSurfaceAnchor className={props.userView === "table" ? "hidden" : ""}>
          <Menu
            open={userSortMenuOpen}
            anchorCorner="bottomLeft"
            onClose={closeUserSortMenu}
            onSelect={(e) => props.setUserSortIndex(e.detail.index)}
          >
            <MenuItem selected={props.userSort === "displayName"}>Name</MenuItem>
            <MenuItem selected={props.userSort === "email"}>Email</MenuItem>
            <MenuItem selected={props.userSort === "nickname"}>Nickname</MenuItem>
          </Menu>
          <Tooltip
            enterDelay={500}
            content="Sort"
            align="bottom"
            className={props.userView === "table" ? "hidden" : ""}
          >
            <TopAppBarActionItem icon="sort" onClick={openUserSortMenu} />
          </Tooltip>
        </MenuSurfaceAnchor>
      </TopAppBarSection>
    ) : props.page === "settings" ? null : (
      <TopAppBarSection alignEnd className="actions">
        <MenuSurfaceAnchor className={props.page === "calendar" ? "hidden" : ""}>
          <MenuSort
            page={props.page}
            sort={props.sort}
            open={sortMenuOpen}
            onSelect={props.setSort}
            onClose={closeSortMenu}
          />
          <Tooltip enterDelay={500} className={props.page === "calendar" ? "hidden" : ""} content="Sort" align="bottom">
            <TopAppBarActionItem style={{ "--animation-delay": 1 }} icon="sort" onClick={openSortMenu} />
          </Tooltip>
        </MenuSurfaceAnchor>
        <Tooltip enterDelay={500} content="Filter" align="bottom">
          <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openFilter} />
        </Tooltip>
        <MenuSurfaceAnchor>
          <MenuView
            view={props.view}
            open={viewMenuOpen}
            onSelect={(evt) => setView(evt.detail.index)}
            onClose={closeViewMenu}
          />
          <Tooltip enterDelay={500} content="View" align="bottom">
            <TopAppBarActionItem
              onClick={openViewMenu}
              style={{ "--animation-delay": 3 }}
              icon={{ strategy: "component", icon: <div>{viewIcon}</div> }}
            />
          </Tooltip>
        </MenuSurfaceAnchor>
        <div>
          <SearchBarModal
            open={searchOpen}
            close={closeSearch}
            search={props.search}
            setSearch={props.setSearch}
            sets={props.sets}
          />
          <Tooltip enterDelay={500} content="Search" align="bottom">
            <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="search" onClick={openSearch} />
          </Tooltip>
        </div>
      </TopAppBarSection>
    );
  const tabs = ["timeline", "status", "shipped", "duration"];
  const statsTabs =
    props.page === "statistics" ? (
      <TopAppBarRow className="tab-row">
        <TopAppBarSection alignStart>
          <TabBar
            activeTabIndex={tabs.indexOf(props.statisticsTab)}
            onActivate={(e) => props.setStatisticsTab(tabs[e.detail.index])}
          >
            <Tab>Timeline</Tab>
            <Tab>Status</Tab>
            <Tab>Shipped</Tab>
            <Tab>Duration</Tab>
          </TabBar>
        </TopAppBarSection>
      </TopAppBarRow>
    ) : null;
  return [
    <TopAppBar fixed key="AppBar">
      <TopAppBarRow>
        <TopAppBarSection alignStart>
          <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
          <TopAppBarTitle>{title[props.page]}</TopAppBarTitle>
        </TopAppBarSection>
        {buttons}
      </TopAppBarRow>
      {statsTabs}
      <LinearProgress closed={!props.loading} />
    </TopAppBar>,
    <TopAppBarFixedAdjust key="AppBarFixedAdjust" />,
  ];
};

export const BottomAppBar = (props) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userSortMenuOpen, setUserSortMenuOpen] = useState(false);
  const openSortMenu = () => {
    setSortMenuOpen(true);
  };
  const closeSortMenu = () => {
    setSortMenuOpen(false);
  };
  const openViewMenu = () => {
    setViewMenuOpen(true);
  };
  const closeViewMenu = () => {
    setViewMenuOpen(false);
  };
  const setView = (index) => {
    const views = ["card", "list", "imageList", "compact"];
    props.setView(views[index]);
  };
  const openSearch = () => {
    setSearchOpen(true);
    document.documentElement.scrollTop = 0;
  };
  const closeSearch = () => {
    setSearchOpen(false);
  };
  const openUserSortMenu = () => {
    setUserSortMenuOpen(true);
  };
  const closeUserSortMenu = () => {
    setUserSortMenuOpen(false);
  };
  let viewIcon;
  if (props.view === "card") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M4 5h3v13H4zm14 0h3v13h-3zM8 18h9V5H8v13zm2-11h5v9h-5V7z" />
        <path d="M10 7h5v9h-5z" opacity=".3" />
      </svg>
    );
  } else if (props.view === "list") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
        <path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3" />
        <path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" />
      </svg>
    );
  } else if (props.view === "imageList") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
          d="M11 12.5h3V16h-3zM11 7h3v3.5h-3zm-5 5.5h3V16H6zM6 7h3v3.5H6zm10 0h3v3.5h-3zm0 5.5h3V16h-3z"
          opacity=".3"
        />
        <path d="M4 5v13h17V5H4zm5 11H6v-3.5h3V16zm0-5.5H6V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5z" />
      </svg>
    );
  } else if (props.view === "compact") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M6 7h3v9H6zm5 0h3v9h-3zm5 0h3v9h-3z" opacity=".3" />
        <path d="M4 5v13h17V5H4zm5 11H6V7h3v9zm5 0h-3V7h3v9zm5 0h-3V7h3v9z" />
      </svg>
    );
  } else {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M5 5h15v3H5zm12 5h3v9h-3zm-7 0h5v9h-5zm-5 0h3v9H5z" opacity=".3" />
        <path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-9h3v9zm7 0h-5v-9h5v9zm5 0h-3v-9h3v9zm0-11H5V5h15v3z" />
      </svg>
    );
  }
  const refreshButton = props.loading ? (
    <CircularProgress />
  ) : (
    <Tooltip enterDelay={500} content="Refresh" align="bottom">
      <TopAppBarActionItem
        icon="refresh"
        onClick={() => {
          props.getActions();
        }}
      />
    </Tooltip>
  );
  const buttons =
    props.page === "statistics" ? (
      props.statisticsTab === "timeline" ? (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statistics.timeline === "icDate"}
              onClick={() => {
                props.setStatistics("timeline", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={props.statistics.timeline === "gbLaunch"}
              onClick={() => {
                props.setStatistics("timeline", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
        </TopAppBarSection>
      ) : props.statisticsTab === "duration" ? (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "alphabetical"}
              onClick={() => {
                props.setStatisticsSort("duration", "alphabetical");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "top",
                content: "Alphabetical",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "total"}
              onClick={() => {
                props.setStatisticsSort("duration", "total");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "top",
                content: "Total",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort.duration === "duration"}
              onClick={() => {
                props.setStatisticsSort("duration", "duration");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M5 8h14V6H5z" opacity=".3" />
                    <path d="M7 11h2v2H7zm12-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-4 3h2v2h-2zm-4 0h2v2h-2z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "top",
                content: "Duration",
              }}
            />
          </ToggleGroup>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statistics.durationCat === "icDate"}
              onClick={() => {
                props.setStatistics("durationCat", "icDate");
              }}
              label="IC"
            />
            <ToggleGroupButton
              selected={props.statistics.durationCat === "gbLaunch"}
              onClick={() => {
                props.setStatistics("durationCat", "gbLaunch");
              }}
              label="GB"
            />
          </ToggleGroup>
          <Tooltip enterDelay={500} content="Category" align="top">
            <div className="category-button" onClick={props.openStatisticsDialog}>
              <TopAppBarActionItem
                className="category-button"
                onClick={props.openStatisticsDialog}
                style={{ "--animation-delay": 0 }}
                icon={{
                  strategy: "component",
                  icon: (
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <circle cx="17.5" cy="17.5" opacity=".3" r="2.5" />
                        <path d="M5 15.5h4v4H5zm7-9.66L10.07 9h3.86z" opacity=".3" />
                        <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM11 13.5H3v8h8v-8zm-2 6H5v-4h4v4z" />
                      </svg>
                    </div>
                  ),
                }}
              />
            </div>
          </Tooltip>
        </TopAppBarSection>
      ) : (
        <TopAppBarSection alignEnd>
          <ToggleGroup>
            <ToggleGroupButton
              selected={props.statisticsSort[props.statisticsTab] === "alphabetical"}
              onClick={() => {
                props.setStatisticsSort(props.statisticsTab, "alphabetical");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "top",
                content: "Alphabetical",
              }}
            />
            <ToggleGroupButton
              selected={props.statisticsSort[props.statisticsTab] === "total"}
              onClick={() => {
                props.setStatisticsSort(props.statisticsTab, "total");
              }}
              icon={{
                strategy: "component",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                  </svg>
                ),
              }}
              tooltip={{
                enterDelay: 500,
                align: "top",
                content: "Total",
              }}
            />
          </ToggleGroup>
          <Tooltip enterDelay={500} content="Category" align="top">
            <TopAppBarActionItem
              className="category-button"
              onClick={props.openStatisticsDialog}
              style={{ "--animation-delay": 0 }}
              icon={{
                strategy: "component",
                icon: (
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <circle cx="17.5" cy="17.5" opacity=".3" r="2.5" />
                      <path d="M5 15.5h4v4H5zm7-9.66L10.07 9h3.86z" opacity=".3" />
                      <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM11 13.5H3v8h8v-8zm-2 6H5v-4h4v4z" />
                    </svg>
                  </div>
                ),
              }}
            />
          </Tooltip>
        </TopAppBarSection>
      )
    ) : props.page === "audit" ? (
      <TopAppBarSection alignEnd>
        <Tooltip enterDelay={500} content="Filter" align="bottom">
          <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openAuditFilter} />
        </Tooltip>
        {refreshButton}
      </TopAppBarSection>
    ) : props.page === "users" ? (
      <TopAppBarSection alignEnd>
        <MenuSurfaceAnchor className={props.userView === "table" ? "hidden" : ""}>
          <Menu
            open={userSortMenuOpen}
            anchorCorner="bottomLeft"
            onClose={closeUserSortMenu}
            onSelect={(e) => props.setUserSortIndex(e.detail.index)}
          >
            <MenuItem selected={props.userSort === "displayName"}>Name</MenuItem>
            <MenuItem selected={props.userSort === "email"}>Email</MenuItem>
            <MenuItem selected={props.userSort === "nickname"}>Nickname</MenuItem>
          </Menu>
          <Tooltip
            enterDelay={500}
            content="Sort"
            align="bottom"
            className={props.userView === "table" ? "hidden" : ""}
          >
            <TopAppBarActionItem icon="sort" onClick={openUserSortMenu} />
          </Tooltip>
        </MenuSurfaceAnchor>
      </TopAppBarSection>
    ) : props.page === "settings" ? null : (
      <TopAppBarSection alignEnd className="actions">
        <MenuSurfaceAnchor className={props.page === "calendar" ? "hidden" : ""}>
          <MenuSort
            page={props.page}
            sort={props.sort}
            open={sortMenuOpen}
            onSelect={props.setSort}
            onClose={closeSortMenu}
          />
          <Tooltip enterDelay={500} className={props.page === "calendar" ? "hidden" : ""} content="Sort" align="top">
            <TopAppBarActionItem style={{ "--animation-delay": 1 }} icon="sort" onClick={openSortMenu} />
          </Tooltip>
        </MenuSurfaceAnchor>
        <Tooltip enterDelay={500} content="Filter" align="top">
          <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openFilter} />
        </Tooltip>
        <MenuSurfaceAnchor>
          <MenuView
            view={props.view}
            open={viewMenuOpen}
            onSelect={(evt) => setView(evt.detail.index)}
            onClose={closeViewMenu}
          />
          <Tooltip enterDelay={500} content="View" align="top">
            <TopAppBarActionItem
              onClick={openViewMenu}
              style={{ "--animation-delay": 3 }}
              icon={{ strategy: "component", icon: <div>{viewIcon}</div> }}
            />
          </Tooltip>
        </MenuSurfaceAnchor>
        <div>
          <SearchBarModal
            open={searchOpen}
            close={closeSearch}
            search={props.search}
            setSearch={props.setSearch}
            sets={props.sets}
          />
          <Tooltip enterDelay={500} content="Search" align="top">
            <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="search" onClick={openSearch} />
          </Tooltip>
        </div>
      </TopAppBarSection>
    );
  const tabs = ["timeline", "status", "shipped", "duration"];
  const statsTabs =
    props.page === "statistics" ? (
      <TopAppBarRow className="tab-row">
        <TopAppBarSection alignStart>
          <TabBar
            activeTabIndex={tabs.indexOf(props.statisticsTab)}
            onActivate={(e) => props.setStatisticsTab(tabs[e.detail.index])}
          >
            <Tab>Timeline</Tab>
            <Tab>Status</Tab>
            <Tab>Shipped</Tab>
            <Tab>Duration</Tab>
          </TabBar>
        </TopAppBarSection>
      </TopAppBarRow>
    ) : null;
  return [
    <TopAppBar className="bottom-app-bar" key="AppBar">
      {statsTabs}
      <TopAppBarRow>
        <TopAppBarSection alignStart>
          <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
        </TopAppBarSection>
        {buttons}
      </TopAppBarRow>
      <LinearProgress closed={!props.loading} />
    </TopAppBar>,
    <TopAppBarFixedAdjust key="AppBarFixedAjust" />,
  ];
};
export const BottomAppBarIndent = (props) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const openSortMenu = () => {
    setSortMenuOpen(true);
  };
  const closeSortMenu = () => {
    setSortMenuOpen(false);
  };
  const openViewMenu = () => {
    setViewMenuOpen(true);
  };
  const closeViewMenu = () => {
    setViewMenuOpen(false);
  };
  const setView = (index) => {
    const views = ["card", "list", "imageList", "compact"];
    props.setView(views[index]);
  };
  let viewIcon;
  if (props.view === "card") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M4 5h3v13H4zm14 0h3v13h-3zM8 18h9V5H8v13zm2-11h5v9h-5V7z" />
        <path d="M10 7h5v9h-5z" opacity=".3" />
      </svg>
    );
  } else if (props.view === "list") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" opacity=".87" />
        <path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3" />
        <path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" />
      </svg>
    );
  } else if (props.view === "imageList") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path
          d="M11 12.5h3V16h-3zM11 7h3v3.5h-3zm-5 5.5h3V16H6zM6 7h3v3.5H6zm10 0h3v3.5h-3zm0 5.5h3V16h-3z"
          opacity=".3"
        />
        <path d="M4 5v13h17V5H4zm5 11H6v-3.5h3V16zm0-5.5H6V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5z" />
      </svg>
    );
  } else if (props.view === "compact") {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M6 7h3v9H6zm5 0h3v9h-3zm5 0h3v9h-3z" opacity=".3" />
        <path d="M4 5v13h17V5H4zm5 11H6V7h3v9zm5 0h-3V7h3v9zm5 0h-3V7h3v9z" />
      </svg>
    );
  } else {
    viewIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
        <path d="M0 0h24v24H0V0z" fill="none" />
        <path d="M5 5h15v3H5zm12 5h3v9h-3zm-7 0h5v9h-5zm-5 0h3v9H5z" opacity=".3" />
        <path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-9h3v9zm7 0h-5v-9h5v9zm5 0h-3v-9h3v9zm0-11H5V5h15v3z" />
      </svg>
    );
  }
  const buttons = (
    <div className="actions">
      <MenuSurfaceAnchor className={props.page === "calendar" ? "hidden" : ""}>
        <MenuSort
          page={props.page}
          sort={props.sort}
          open={sortMenuOpen}
          onSelect={props.setSort}
          onClose={closeSortMenu}
        />
        <Tooltip enterDelay={500} className={props.page === "calendar" ? "hidden" : ""} content="Sort" align="top">
          <TopAppBarActionItem style={{ "--animation-delay": 1 }} icon="sort" onClick={openSortMenu} />
        </Tooltip>
      </MenuSurfaceAnchor>
      <Tooltip enterDelay={500} content="Filter" align="top">
        <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openFilter} />
      </Tooltip>
      <MenuSurfaceAnchor>
        <MenuView
          view={props.view}
          open={viewMenuOpen}
          onSelect={(evt) => setView(evt.detail.index)}
          onClose={closeViewMenu}
        />
        <Tooltip enterDelay={500} content="View" align="top">
          <TopAppBarActionItem
            onClick={openViewMenu}
            style={{ "--animation-delay": 3 }}
            icon={{ strategy: "component", icon: <div>{viewIcon}</div> }}
          />
        </Tooltip>
      </MenuSurfaceAnchor>
      <Tooltip enterDelay={500} content="Search" align="top">
        <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="search" onClick={props.openSearch} />
      </Tooltip>
    </div>
  );
  return [
    <TopAppBar className="bottom-app-bar bottom-app-bar--indent" key="AppBar">
      <TopAppBarRow>
        <TopAppBarSection alignStart>
          <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
          {buttons}
        </TopAppBarSection>
        <TopAppBarSection className="indent" alignEnd>
          <svg xmlns="http://www.w3.org/2000/svg" width="128" height="56" viewBox="0 0 128 56">
            <path
              d="M107.3,0a8.042,8.042,0,0,0-7.9,6.6A36.067,36.067,0,0,1,64,36,36.067,36.067,0,0,1,28.6,6.6,8.042,8.042,0,0,0,20.7,0H0V56H128V0Z"
              fill="inherit"
            />
          </svg>
          <div className="fill"></div>
        </TopAppBarSection>
      </TopAppBarRow>
      <LinearProgress closed={!props.loading} />
    </TopAppBar>,
    <TopAppBarFixedAdjust key="AppBarFixedAdjust" />,
  ];
};

export default DesktopAppBar;

DesktopAppBar.propTypes = {
  getActions: PropTypes.func,
  loading: PropTypes.bool,
  openNav: PropTypes.func,
  page: PropTypes.string,
  search: PropTypes.string,
  setSearch: PropTypes.func,
  setSort: PropTypes.func,
  setStatistics: PropTypes.func,
  setStatisticsSort: PropTypes.func,
  setStatisticsTab: PropTypes.func,
  setUserSort: PropTypes.func,
  setUserSortIndex: PropTypes.func,
  setUserView: PropTypes.func,
  setView: PropTypes.func,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  sort: PropTypes.string,
  statistics: PropTypes.shape(statisticsTypes),
  statisticsSort: PropTypes.shape(statisticsSortTypes),
  statisticsTab: PropTypes.string,
  toggleAuditFilter: PropTypes.func,
  toggleFilter: PropTypes.func,
  userSort: PropTypes.string,
  userView: PropTypes.string,
  view: PropTypes.string,
};

TabletAppBar.propTypes = {
  getActions: PropTypes.func,
  loading: PropTypes.bool,
  openAuditFilter: PropTypes.func,
  openFilter: PropTypes.func,
  openNav: PropTypes.func,
  openStatisticsDialog: PropTypes.func,
  page: PropTypes.string,
  search: PropTypes.string,
  setSearch: PropTypes.func,
  setSort: PropTypes.func,
  setStatistics: PropTypes.func,
  setStatisticsSort: PropTypes.func,
  setStatisticsTab: PropTypes.func,
  setUserSortIndex: PropTypes.func,
  setView: PropTypes.func,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  sort: PropTypes.string,
  statistics: PropTypes.shape(statisticsTypes),
  statisticsSort: PropTypes.shape(statisticsSortTypes),
  statisticsTab: PropTypes.string,
  userSort: PropTypes.string,
  view: PropTypes.string,
};

MobileAppBar.propTypes = {
  getActions: PropTypes.func,
  loading: PropTypes.bool,
  openAuditFilter: PropTypes.func,
  openFilter: PropTypes.func,
  openNav: PropTypes.func,
  openStatisticsDialog: PropTypes.func,
  page: PropTypes.string,
  search: PropTypes.string,
  setSearch: PropTypes.func,
  setSort: PropTypes.func,
  setStatistics: PropTypes.func,
  setStatisticsSort: PropTypes.func,
  setStatisticsTab: PropTypes.func,
  setUserSortIndex: PropTypes.func,
  setView: PropTypes.func,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  sort: PropTypes.string,
  statistics: PropTypes.shape(statisticsTypes),
  statisticsSort: PropTypes.shape(statisticsSortTypes),
  statisticsTab: PropTypes.string,
  userSort: PropTypes.string,
  view: PropTypes.string,
};

BottomAppBar.propTypes = {
  getActions: PropTypes.func,
  loading: PropTypes.bool,
  openAuditFilter: PropTypes.func,
  openFilter: PropTypes.func,
  openNav: PropTypes.func,
  openStatisticsDialog: PropTypes.func,
  page: PropTypes.string,
  search: PropTypes.string,
  setSearch: PropTypes.func,
  setSort: PropTypes.func,
  setStatistics: PropTypes.func,
  setStatisticsSort: PropTypes.func,
  setStatisticsTab: PropTypes.func,
  setUserSortIndex: PropTypes.func,
  setView: PropTypes.func,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  sort: PropTypes.string,
  statistics: PropTypes.shape(statisticsTypes),
  statisticsSort: PropTypes.shape(statisticsSortTypes),
  statisticsTab: PropTypes.string,
  userSort: PropTypes.string,
  view: PropTypes.string,
};

BottomAppBarIndent.propTypes = {
  loading: PropTypes.bool,
  openFilter: PropTypes.func,
  openNav: PropTypes.func,
  openSearch: PropTypes.func,
  page: PropTypes.string,
  setSort: PropTypes.func,
  setView: PropTypes.func,
  sort: PropTypes.string,
  view: PropTypes.string,
};
