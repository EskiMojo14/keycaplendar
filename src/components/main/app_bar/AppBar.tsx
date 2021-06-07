import React, { useState } from "react";
import classNames from "classnames";
import { useAppSelector } from "../../../app/hooks";
import { selectDevice, selectPage } from "../../../app/slices/common/commonSlice";
import { pageTitle } from "../../../app/slices/common/constants";
import { iconObject, useBoolStates } from "../../../app/slices/common/functions";
import { selectLoading, selectSearch, selectLinkedFavorites } from "../../../app/slices/main/mainSlice";
import { setSearch } from "../../../app/slices/main/functions";
import { selectBottomNav, selectView } from "../../../app/slices/settings/settingsSlice";
import { viewIcons } from "../../../app/slices/settings/constants";
import { LinearProgress } from "@rmwc/linear-progress";
import { Menu, MenuItem, MenuSurfaceAnchor } from "@rmwc/menu";
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
  openShare: () => void;
};

export const AppBar = (props: AppBarProps) => {
  const device = useAppSelector(selectDevice);
  const view = useAppSelector(selectView);
  const bottomNav = useAppSelector(selectBottomNav);

  const page = useAppSelector(selectPage);

  const loading = useAppSelector(selectLoading);

  const search = useAppSelector(selectSearch);
  const linkedFavorites = useAppSelector(selectLinkedFavorites);

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

  const [moreOpen, setMoreOpen] = useState(false);
  const [closeMore, openMore] = useBoolStates(setMoreOpen);

  const tooltipAlign = bottomNav ? "top" : "bottom";

  const shareButton =
    page === "favorites" ? (
      <Tooltip enterDelay={500} content="Share" align={tooltipAlign}>
        <TopAppBarActionItem
          style={{ "--animation-delay": 4 }}
          icon={iconObject(
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <circle cx="18" cy="5" opacity=".3" r="1" />
                <circle cx="6" cy="12" opacity=".3" r="1" />
                <circle cx="18" cy="19.02" opacity=".3" r="1" />
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
            </div>
          )}
          onClick={props.openShare}
        />
      </Tooltip>
    ) : null;

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
      {device === "desktop" ? shareButton : null}
      {device !== "desktop" && !indent ? (
        <div>
          <SearchBarModal open={searchOpen} close={closeSearch} search={search} setSearch={setSearch} />
          {page === "favorites" ? (
            <MenuSurfaceAnchor>
              <Menu anchorCorner="bottomLeft" open={moreOpen} onClose={closeMore}>
                <MenuItem onClick={openSearch}>Search</MenuItem>
                <MenuItem onClick={props.openShare}>Share</MenuItem>
              </Menu>
              <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="more_vert" onClick={openMore} />
            </MenuSurfaceAnchor>
          ) : (
            <Tooltip enterDelay={500} content="Search" align="bottom">
              <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="search" onClick={openSearch} />
            </Tooltip>
          )}
        </div>
      ) : null}
      {indent ? (
        page === "favorites" ? (
          <MenuSurfaceAnchor>
            <Menu anchorCorner="bottomLeft" open={moreOpen} onClose={closeMore}>
              <MenuItem onClick={openSearch}>Search</MenuItem>
              <MenuItem onClick={props.openShare}>Share</MenuItem>
            </Menu>
            <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="more_vert" onClick={openMore} />
          </MenuSurfaceAnchor>
        ) : (
          <Tooltip enterDelay={500} content="Search" align="bottom">
            <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="search" onClick={openSearch} />
          </Tooltip>
        )
      ) : null}
    </>
  );
  const leftButtons = !indent ? (
    <TopAppBarTitle>
      {pageTitle[page] +
        (page === "favorites" && linkedFavorites.displayName ? `: ${linkedFavorites.displayName}` : "")}
    </TopAppBarTitle>
  ) : (
    buttons
  );
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
