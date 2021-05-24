import React, { useState } from "react";
import classNames from "classnames";
import { useAppSelector } from "../../../app/hooks";
import { selectDevice, selectPage } from "../../../app/slices/common/commonSlice";
import { pageTitle } from "../../../app/slices/common/constants";
import { useBoolStates } from "../../../app/slices/common/functions";
import { selectLoading, selectSearch } from "../../../app/slices/main/mainSlice";
import { setSearch } from "../../../app/slices/main/functions";
import { selectBottomNav, selectView } from "../../../app/slices/settings/settingsSlice";
import { viewIcons } from "../../../app/slices/settings/constants";
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
} from "@rmwc/top-app-bar";
import { MenuView } from "./MenuView";
import { MenuSort } from "./MenuSort";
import { SearchBarPersistent, SearchBarModal, SearchAppBar } from "./SearchBar";
import "./AppBar.scss";

type AppBarProps = {
  indent: boolean;
  openFilter: () => void;
  openNav: () => void;
};

export const AppBar = (props: AppBarProps) => {
  const device = useAppSelector(selectDevice);
  const view = useAppSelector(selectView);
  const bottomNav = useAppSelector(selectBottomNav);

  const page = useAppSelector(selectPage);

  const loading = useAppSelector(selectLoading);

  const search = useAppSelector(selectSearch);

  const [sortOpen, setSortOpen] = useState(false);
  const [closeSort, openSort] = useBoolStates(setSortOpen);

  const [viewOpen, setViewOpen] = useState(false);
  const [closeView, openView] = useBoolStates(setViewOpen);

  const [searchOpen, setSearchOpen] = useState(false);
  const openSearch = () => {
    setSearchOpen(true);
    document.documentElement.scrollTop = 0;
  };
  const closeSearch = () => {
    setSearchOpen(false);
  };

  const tooltipAlign = bottomNav ? "top" : "bottom";

  const indent =
    props.indent && bottomNav ? (
      <TopAppBarSection className="indent" alignEnd>
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="56" viewBox="0 0 128 56">
          <path
            d="M107.3,0a8.042,8.042,0,0,0-7.9,6.6A36.067,36.067,0,0,1,64,36,36.067,36.067,0,0,1,28.6,6.6,8.042,8.042,0,0,0,20.7,0H0V56H128V0Z"
            fill="inherit"
          />
        </svg>
        <div className="fill"></div>
      </TopAppBarSection>
    ) : null;

  const searchBar = indent ? (
    <SearchAppBar open={searchOpen} openBar={openSearch} close={closeSearch} search={search} setSearch={setSearch} />
  ) : null;
  const buttons = (
    <>
      {device === "desktop" ? <SearchBarPersistent search={search} setSearch={setSearch} /> : null}
      <MenuSurfaceAnchor className={classNames({ hidden: page === "calendar" })}>
        <MenuSort open={sortOpen} onClose={closeSort} />
        <Tooltip
          enterDelay={500}
          content="Sort"
          align={tooltipAlign}
          className={classNames({ hidden: page === "calendar" })}
        >
          <TopAppBarActionItem style={{ "--animation-delay": 1 }} icon="sort" onClick={openSort} />
        </Tooltip>
      </MenuSurfaceAnchor>
      <Tooltip enterDelay={500} content="Filter" align={tooltipAlign}>
        <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openFilter} />
      </Tooltip>
      <MenuSurfaceAnchor>
        <MenuView open={viewOpen} onClose={closeView} />
        <Tooltip enterDelay={500} content="View" align={tooltipAlign}>
          <TopAppBarActionItem onClick={openView} style={{ "--animation-delay": 3 }} icon={viewIcons[view]} />
        </Tooltip>
      </MenuSurfaceAnchor>
      {device !== "desktop" && !indent ? (
        <div>
          <SearchBarModal open={searchOpen} close={closeSearch} search={search} setSearch={setSearch} />
          <Tooltip enterDelay={500} content="Search" align="bottom">
            <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="search" onClick={openSearch} />
          </Tooltip>
        </div>
      ) : null}
      {indent ? (
        <Tooltip enterDelay={500} content="Search" align="bottom">
          <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="search" onClick={openSearch} />
        </Tooltip>
      ) : null}
    </>
  );
  const leftButtons = !indent ? <TopAppBarTitle>{pageTitle[page]}</TopAppBarTitle> : buttons;
  const rightButtons = !indent ? <TopAppBarSection alignEnd>{buttons}</TopAppBarSection> : null;
  return (
    <>
      {searchBar}
      <TopAppBar fixed className={classNames({ "bottom-app-bar": bottomNav, "bottom-app-bar--indent": indent })}>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            {leftButtons}
          </TopAppBarSection>
          {indent}
          {rightButtons}
        </TopAppBarRow>
        <LinearProgress closed={!loading} />
      </TopAppBar>
    </>
  );
};

export default AppBar;
