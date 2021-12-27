import { useState } from "react";
import { LinearProgress } from "@rmwc/linear-progress";
import { Menu, MenuItem, MenuSurfaceAnchor } from "@rmwc/menu";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarActionItem,
} from "@rmwc/top-app-bar";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { AppBarIndent } from "@c/util/app-bar-indent";
import { withTooltip } from "@c/util/hocs";
import { selectDevice, selectPage } from "@s/common";
import { pageTitle } from "@s/common/constants";
import { selectLoading, selectSearch, selectLinkedFavorites } from "@s/main";
import { setSearch } from "@s/main/functions";
import { selectBottomNav, selectView } from "@s/settings";
import { viewIcons } from "@s/settings/constants";
import { selectUser } from "@s/user";
import { iconObject, useBoolStates } from "@s/util/functions";
import { Share } from "@i";
import { MenuSort } from "./menu-sort";
import { MenuView } from "./menu-view";
import { SearchBarPersistent, SearchBarModal, SearchAppBar } from "./search-bar";
import "./app-bar.scss";

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

  const user = useAppSelector(selectUser);

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
    page === "favorites" && user.email && linkedFavorites.array.length === 0
      ? withTooltip(
          <TopAppBarActionItem
            style={{ "--animation-delay": 4 }}
            icon={iconObject(<Share />)}
            onClick={props.openShare}
          />,
          "Share",
          { align: tooltipAlign }
        )
      : null;

  const indent = props.indent && bottomNav ? <AppBarIndent /> : null;

  const searchBar = indent ? (
    <SearchAppBar open={searchOpen} openBar={openSearch} close={closeSearch} search={search} setSearch={setSearch} />
  ) : null;
  const buttons = (
    <>
      {device === "desktop" ? <SearchBarPersistent search={search} setSearch={setSearch} /> : null}
      <MenuSurfaceAnchor className={classNames({ hidden: page === "calendar" })}>
        <MenuSort open={sortOpen} onClose={closeSort} />
        {withTooltip(
          <TopAppBarActionItem style={{ "--animation-delay": 1 }} icon="sort" onClick={openSort} />,
          "Sort",
          { align: tooltipAlign, className: classNames({ hidden: page === "calendar" }) }
        )}
      </MenuSurfaceAnchor>
      {withTooltip(
        <TopAppBarActionItem style={{ "--animation-delay": 2 }} icon="filter_list" onClick={props.openFilter} />,
        "Filter",
        {
          align: tooltipAlign,
        }
      )}
      <MenuSurfaceAnchor>
        <MenuView open={viewOpen} onClose={closeView} />
        {withTooltip(
          <TopAppBarActionItem onClick={openView} style={{ "--animation-delay": 3 }} icon={viewIcons[view]} />,
          "View",
          {
            align: tooltipAlign,
          }
        )}
      </MenuSurfaceAnchor>
      {device === "desktop" ? shareButton : null}
      {device !== "desktop" && !indent ? (
        <div>
          <SearchBarModal open={searchOpen} close={closeSearch} search={search} setSearch={setSearch} />
          {page === "favorites" && user.email && linkedFavorites.array.length === 0 ? (
            <MenuSurfaceAnchor>
              <Menu anchorCorner="bottomLeft" open={moreOpen} onClose={closeMore}>
                <MenuItem onClick={openSearch}>Search</MenuItem>
                <MenuItem onClick={props.openShare}>Share</MenuItem>
              </Menu>
              <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="more_vert" onClick={openMore} />
            </MenuSurfaceAnchor>
          ) : (
            withTooltip(
              <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="search" onClick={openSearch} />,
              "Search"
            )
          )}
        </div>
      ) : null}
      {indent ? (
        page === "favorites" && user.email && linkedFavorites.array.length === 0 ? (
          <MenuSurfaceAnchor>
            <Menu anchorCorner="bottomLeft" open={moreOpen} onClose={closeMore}>
              <MenuItem onClick={openSearch}>Search</MenuItem>
              <MenuItem onClick={props.openShare}>Share</MenuItem>
            </Menu>
            <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="more_vert" onClick={openMore} />
          </MenuSurfaceAnchor>
        ) : (
          withTooltip(
            <TopAppBarActionItem style={{ "--animation-delay": 4 }} icon="search" onClick={openSearch} />,
            "Search"
          )
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
      <TopAppBar
        fixed
        className={classNames({
          "bottom-app-bar": bottomNav,
          "bottom-app-bar--indent": indent,
          "search-open": searchOpen && device !== "desktop" && !bottomNav,
        })}
      >
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
