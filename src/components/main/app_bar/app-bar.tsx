import { useState } from "react";
import { LinearProgress } from "@rmwc/linear-progress";
import { Menu, MenuItem, MenuSurfaceAnchor } from "@rmwc/menu";
import {
  TopAppBar,
  TopAppBarActionItem,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import classNames from "classnames";
import { AppBarIndent } from "@c/util/app-bar-indent";
import { withTooltip } from "@c/util/hocs";
import { useAppSelector } from "@h";
import useBottomNav from "@h/use-bottom-nav";
import useDevice from "@h/use-device";
import { selectPage } from "@s/common";
import { pageTitle } from "@s/common/constants";
import { selectLinkedFavorites, selectLoading } from "@s/main";
import { selectView } from "@s/settings";
import { viewIcons } from "@s/settings/constants";
import { selectUser } from "@s/user";
import { iconObject, useBoolStates } from "@s/util/functions";
import { Share } from "@i";
import { MenuSort } from "./menu-sort";
import { MenuView } from "./menu-view";
import {
  SearchAppBar,
  SearchBarModal,
  SearchBarPersistent,
} from "./search-bar";
import "./app-bar.scss";

type AppBarProps = {
  indent: boolean;
  openFilter: () => void;
  openNav: () => void;
  openShare: () => void;
};

export const AppBar = ({
  indent,
  openFilter,
  openNav,
  openShare,
}: AppBarProps) => {
  const device = useDevice();
  const view = useAppSelector(selectView);
  const bottomNav = useBottomNav();

  const page = useAppSelector(selectPage);

  const user = useAppSelector(selectUser);

  const loading = useAppSelector(selectLoading);

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
    page === "favorites" &&
    user.email &&
    linkedFavorites.array.length === 0 &&
    withTooltip(
      <TopAppBarActionItem
        icon={iconObject(<Share />)}
        onClick={openShare}
        style={{ "--animation-delay": 4 }}
      />,
      "Share",
      { align: tooltipAlign }
    );

  const indentEl = indent && bottomNav && <AppBarIndent />;

  const searchBar = indentEl && (
    <SearchAppBar close={closeSearch} open={searchOpen} openBar={openSearch} />
  );
  const buttons = (
    <>
      {device === "desktop" && <SearchBarPersistent />}
      <MenuSurfaceAnchor
        className={classNames({ hidden: page === "calendar" })}
      >
        <MenuSort onClose={closeSort} open={sortOpen} />
        {withTooltip(
          <TopAppBarActionItem
            icon="sort"
            onClick={openSort}
            style={{ "--animation-delay": 1 }}
          />,
          "Sort",
          {
            align: tooltipAlign,
            className: classNames({ hidden: page === "calendar" }),
          }
        )}
      </MenuSurfaceAnchor>
      {withTooltip(
        <TopAppBarActionItem
          icon="filter_list"
          onClick={openFilter}
          style={{ "--animation-delay": 2 }}
        />,
        "Filter",
        {
          align: tooltipAlign,
        }
      )}
      <MenuSurfaceAnchor>
        <MenuView onClose={closeView} open={viewOpen} />
        {withTooltip(
          <TopAppBarActionItem
            icon={viewIcons[view]}
            onClick={openView}
            style={{ "--animation-delay": 3 }}
          />,
          "View",
          {
            align: tooltipAlign,
          }
        )}
      </MenuSurfaceAnchor>
      {device === "desktop" && shareButton}
      {device !== "desktop" && !indentEl && (
        <div>
          <SearchBarModal close={closeSearch} open={searchOpen} />
          {page === "favorites" &&
          user.email &&
          linkedFavorites.array.length === 0 ? (
            <MenuSurfaceAnchor>
              <Menu
                anchorCorner="bottomLeft"
                onClose={closeMore}
                open={moreOpen}
              >
                <MenuItem onClick={openSearch}>Search</MenuItem>
                <MenuItem onClick={openShare}>Share</MenuItem>
              </Menu>
              <TopAppBarActionItem
                icon="more_vert"
                onClick={openMore}
                style={{ "--animation-delay": 4 }}
              />
            </MenuSurfaceAnchor>
          ) : (
            withTooltip(
              <TopAppBarActionItem
                icon="search"
                onClick={openSearch}
                style={{ "--animation-delay": 4 }}
              />,
              "Search"
            )
          )}
        </div>
      )}
      {indentEl &&
        (page === "favorites" &&
        user.email &&
        linkedFavorites.array.length === 0 ? (
          <MenuSurfaceAnchor>
            <Menu anchorCorner="bottomLeft" onClose={closeMore} open={moreOpen}>
              <MenuItem onClick={openSearch}>Search</MenuItem>
              <MenuItem onClick={openShare}>Share</MenuItem>
            </Menu>
            <TopAppBarActionItem
              icon="more_vert"
              onClick={openMore}
              style={{ "--animation-delay": 4 }}
            />
          </MenuSurfaceAnchor>
        ) : (
          withTooltip(
            <TopAppBarActionItem
              icon="search"
              onClick={openSearch}
              style={{ "--animation-delay": 4 }}
            />,
            "Search"
          )
        ))}
    </>
  );
  const leftButtons = !indentEl ? (
    <TopAppBarTitle>
      {pageTitle[page] +
        (page === "favorites" && linkedFavorites.displayName
          ? `: ${linkedFavorites.displayName}`
          : "")}
    </TopAppBarTitle>
  ) : (
    buttons
  );
  const rightButtons = !indentEl && (
    <TopAppBarSection alignEnd>{buttons}</TopAppBarSection>
  );
  return (
    <>
      {searchBar}
      <TopAppBar
        className={classNames({
          "bottom-app-bar": bottomNav,
          "bottom-app-bar--indent": indentEl,
          "search-open": searchOpen && device !== "desktop" && !bottomNav,
        })}
        fixed
      >
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={openNav} />
            {leftButtons}
          </TopAppBarSection>
          {indentEl}
          {rightButtons}
        </TopAppBarRow>
        <LinearProgress closed={!loading} />
      </TopAppBar>
    </>
  );
};

export default AppBar;
