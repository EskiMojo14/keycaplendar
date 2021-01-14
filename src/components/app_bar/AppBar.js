import React, { useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { pageTitle, noButtonPages, viewIcons, mainPages } from "../../util/constants";
import { boolFunctions } from "../../util/functions";
import { setTypes, statisticsTypes, statisticsSortTypes } from "../../util/propTypeTemplates";
import { LinearProgress } from "@rmwc/linear-progress";
import { MenuSurfaceAnchor } from "@rmwc/menu";
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
import { ConditionalWrapper } from "../util/ConditionalWrapper";
import "./AppBar.scss";

export const DesktopAppBar = (props) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [closeSortMenu, openSortMenu] = boolFunctions(setSortMenuOpen);
  const [closeViewMenu, openViewMenu] = boolFunctions(setViewMenuOpen);
  const mainButtons = mainPages.includes(props.page) ? (
    <>
      <SearchBarPersistent search={props.search} setSearch={props.setSearch} sets={props.sets} />
      <MenuSurfaceAnchor className={classNames({ hidden: props.page === "calendar" })}>
        <MenuSort
          page={props.page}
          sort={props.sort}
          open={sortMenuOpen}
          onSelect={props.setSort}
          onClose={closeSortMenu}
        />
        <Tooltip
          enterDelay={500}
          content="Sort"
          align="bottom"
          className={classNames({ hidden: props.page === "calendar" })}
        >
          <TopAppBarActionItem icon="sort" style={{ "--animation-delay": 1 }} onClick={openSortMenu} />
        </Tooltip>
      </MenuSurfaceAnchor>
      <Tooltip enterDelay={500} content="Filter" align="bottom">
        <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.toggleFilter} />
      </Tooltip>
      <MenuSurfaceAnchor>
        <MenuView view={props.view} open={viewMenuOpen} setView={props.setView} onClose={closeViewMenu} />
        <Tooltip enterDelay={500} content="View" align="bottom">
          <TopAppBarActionItem onClick={openViewMenu} style={{ "--animation-delay": 3 }} icon={viewIcons[props.view]} />
        </Tooltip>
      </MenuSurfaceAnchor>
    </>
  ) : null;
  return (
    <>
      <TopAppBar fixed>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>{pageTitle[props.page]}</TopAppBarTitle>
          </TopAppBarSection>
          <ConditionalWrapper
            condition={!noButtonPages.includes(props.page)}
            wrapper={(children) => <TopAppBarSection alignEnd>{children}</TopAppBarSection>}
          >
            {mainButtons}
          </ConditionalWrapper>
        </TopAppBarRow>
        <LinearProgress closed={!props.loading} />
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};

export const TabletAppBar = (props) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [closeSortMenu, openSortMenu] = boolFunctions(setSortMenuOpen);
  const [closeViewMenu, openViewMenu] = boolFunctions(setViewMenuOpen);
  const openSearch = () => {
    setSearchOpen(true);
    document.documentElement.scrollTop = 0;
  };
  const closeSearch = () => {
    setSearchOpen(false);
  };
  const mainButtons = mainPages.includes(props.page) ? (
    <>
      <MenuSurfaceAnchor className={classNames({ hidden: props.page === "calendar" })}>
        <MenuSort
          page={props.page}
          sort={props.sort}
          open={sortMenuOpen}
          onSelect={props.setSort}
          onClose={closeSortMenu}
        />
        <Tooltip
          enterDelay={500}
          content="Sort"
          align="bottom"
          className={classNames({ hidden: props.page === "calendar" })}
        >
          <TopAppBarActionItem style={{ "--animation-delay": 1 }} icon="sort" onClick={openSortMenu} />
        </Tooltip>
      </MenuSurfaceAnchor>
      <Tooltip enterDelay={500} content="Filter" align="bottom">
        <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openFilter} />
      </Tooltip>
      <MenuSurfaceAnchor>
        <MenuView view={props.view} open={viewMenuOpen} setView={props.setView} onClose={closeViewMenu} />
        <Tooltip enterDelay={500} content="View" align="bottom">
          <TopAppBarActionItem onClick={openViewMenu} style={{ "--animation-delay": 3 }} icon={viewIcons[props.view]} />
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
    </>
  ) : null;
  return (
    <>
      <TopAppBar fixed>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>{pageTitle[props.page]}</TopAppBarTitle>
          </TopAppBarSection>
          <ConditionalWrapper
            condition={!noButtonPages.includes(props.page)}
            wrapper={(children) => <TopAppBarSection alignEnd>{children}</TopAppBarSection>}
          >
            {mainButtons}
          </ConditionalWrapper>
        </TopAppBarRow>
        <LinearProgress closed={!props.loading} />
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};

export const MobileAppBar = (props) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [closeSortMenu, openSortMenu] = boolFunctions(setSortMenuOpen);
  const [closeViewMenu, openViewMenu] = boolFunctions(setViewMenuOpen);
  const openSearch = () => {
    setSearchOpen(true);
    document.documentElement.scrollTop = 0;
  };
  const closeSearch = () => {
    setSearchOpen(false);
  };
  const title = {
    ...pageTitle,
    statistics: props.statisticsTab !== "duration" ? "Statistics" : "",
  };
  const mainButtons = mainPages.includes(props.page) ? (
    <>
      <MenuSurfaceAnchor className={classNames({ hidden: props.page === "calendar" })}>
        <MenuSort
          page={props.page}
          sort={props.sort}
          open={sortMenuOpen}
          onSelect={props.setSort}
          onClose={closeSortMenu}
        />
        <Tooltip
          enterDelay={500}
          className={classNames({ hidden: props.page === "calendar" })}
          content="Sort"
          align="bottom"
        >
          <TopAppBarActionItem style={{ "--animation-delay": 1 }} icon="sort" onClick={openSortMenu} />
        </Tooltip>
      </MenuSurfaceAnchor>
      <Tooltip enterDelay={500} content="Filter" align="bottom">
        <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openFilter} />
      </Tooltip>
      <MenuSurfaceAnchor>
        <MenuView view={props.view} open={viewMenuOpen} setView={props.setView} onClose={closeViewMenu} />
        <Tooltip enterDelay={500} content="View" align="bottom">
          <TopAppBarActionItem onClick={openViewMenu} style={{ "--animation-delay": 3 }} icon={viewIcons[props.view]} />
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
    </>
  ) : null;
  return (
    <>
      <TopAppBar fixed>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>{title[props.page]}</TopAppBarTitle>
          </TopAppBarSection>
          <ConditionalWrapper
            condition={!noButtonPages.includes(props.page)}
            wrapper={(children) => <TopAppBarSection alignEnd>{children}</TopAppBarSection>}
          >
            {mainButtons}
          </ConditionalWrapper>
        </TopAppBarRow>
        <LinearProgress closed={!props.loading} />
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};

export const BottomAppBar = (props) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [closeSortMenu, openSortMenu] = boolFunctions(setSortMenuOpen);
  const [closeViewMenu, openViewMenu] = boolFunctions(setViewMenuOpen);
  const openSearch = () => {
    setSearchOpen(true);
    document.documentElement.scrollTop = 0;
  };
  const closeSearch = () => {
    setSearchOpen(false);
  };
  const mainButtons = mainPages.includes(props.page) ? (
    <>
      <MenuSurfaceAnchor className={classNames({ hidden: props.page === "calendar" })}>
        <MenuSort
          page={props.page}
          sort={props.sort}
          open={sortMenuOpen}
          onSelect={props.setSort}
          onClose={closeSortMenu}
        />
        <Tooltip
          enterDelay={500}
          className={classNames({ hidden: props.page === "calendar" })}
          content="Sort"
          align="top"
        >
          <TopAppBarActionItem style={{ "--animation-delay": 1 }} icon="sort" onClick={openSortMenu} />
        </Tooltip>
      </MenuSurfaceAnchor>
      <Tooltip enterDelay={500} content="Filter" align="top">
        <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openFilter} />
      </Tooltip>
      <MenuSurfaceAnchor>
        <MenuView view={props.view} open={viewMenuOpen} setView={props.setView} onClose={closeViewMenu} />
        <Tooltip enterDelay={500} content="View" align="top">
          <TopAppBarActionItem onClick={openViewMenu} style={{ "--animation-delay": 3 }} icon={viewIcons[props.view]} />
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
    </>
  ) : null;
  return (
    <>
      <TopAppBar className="bottom-app-bar">
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
          </TopAppBarSection>
          <ConditionalWrapper
            condition={!noButtonPages.includes(props.page)}
            wrapper={(children) => <TopAppBarSection alignEnd>{children}</TopAppBarSection>}
          >
            {mainButtons}
          </ConditionalWrapper>
        </TopAppBarRow>
        <LinearProgress closed={!props.loading} />
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};
export const BottomAppBarIndent = (props) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [closeSortMenu, openSortMenu] = boolFunctions(setSortMenuOpen);
  const [closeViewMenu, openViewMenu] = boolFunctions(setViewMenuOpen);
  const buttons = (
    <div className="actions">
      <MenuSurfaceAnchor className={classNames({ hidden: props.page === "calendar" })}>
        <MenuSort
          page={props.page}
          sort={props.sort}
          open={sortMenuOpen}
          onSelect={props.setSort}
          onClose={closeSortMenu}
        />
        <Tooltip
          enterDelay={500}
          className={classNames({ hidden: props.page === "calendar" })}
          content="Sort"
          align="top"
        >
          <TopAppBarActionItem style={{ "--animation-delay": 1 }} icon="sort" onClick={openSortMenu} />
        </Tooltip>
      </MenuSurfaceAnchor>
      <Tooltip enterDelay={500} content="Filter" align="top">
        <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openFilter} />
      </Tooltip>
      <MenuSurfaceAnchor>
        <MenuView view={props.view} open={viewMenuOpen} setView={props.setView} onClose={closeViewMenu} />
        <Tooltip enterDelay={500} content="View" align="top">
          <TopAppBarActionItem onClick={openViewMenu} style={{ "--animation-delay": 3 }} icon={viewIcons[props.view]} />
        </Tooltip>
      </MenuSurfaceAnchor>
      <Tooltip enterDelay={500} content="Search" align="top">
        <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="search" onClick={props.openSearch} />
      </Tooltip>
    </div>
  );
  return (
    <>
      <TopAppBar className="bottom-app-bar bottom-app-bar--indent">
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
      </TopAppBar>
      <TopAppBarFixedAdjust />
    </>
  );
};

export default DesktopAppBar;

DesktopAppBar.propTypes = {
  getActions: PropTypes.func,
  loading: PropTypes.bool,
  openNav: PropTypes.func,
  openStatisticsFilter: PropTypes.func,
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
  openStatisticsFilter: PropTypes.func,
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
  openStatisticsFilter: PropTypes.func,
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
  openStatisticsFilter: PropTypes.func,
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
