import { useEffect, useMemo, useState } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { Button } from "@rmwc/button";
import { Card } from "@rmwc/card";
import {
  DataTable,
  DataTableBody,
  DataTableContent,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
} from "@rmwc/data-table";
import { LinearProgress } from "@rmwc/linear-progress";
import { Menu, MenuItem, MenuSurfaceAnchor } from "@rmwc/menu";
import {
  TopAppBar,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import classNames from "classnames";
import { Footer } from "@c/common/footer";
import { DialogDelete } from "@c/users/dialog-delete";
import {
  DataTablePagination,
  DataTablePaginationButton,
  DataTablePaginationNavigation,
  DataTablePaginationRowsPerPage,
  DataTablePaginationRowsPerPageLabel,
  DataTablePaginationRowsPerPageSelect,
  DataTablePaginationTotal,
  DataTablePaginationTrailing,
} from "@c/util/data-table-pagination";
import { withTooltip } from "@c/util/hocs";
import { useAppDispatch, useAppSelector } from "@h";
import useDevice from "@h/use-device";
import { pageTitle } from "@s/common/constants";
import { selectBottomNav } from "@s/settings";
import {
  selectLoading,
  selectNextPageToken,
  selectPage,
  selectReverseSort,
  selectRowsPerPage,
  selectSort,
  selectUserIds,
  selectUserTotal,
  selectView,
  setPage,
  setRowsPerPage,
  setSort,
  setView,
} from "@s/users";
import {
  sortLabels,
  sortProps,
  viewIcons,
  viewLabels,
  views,
} from "@s/users/constants";
import { paginateUsers } from "@s/users/functions";
import { getUsers } from "@s/users/thunks";
import { useBoolStates } from "@s/util/functions";
import { UserCard } from "./user-card";
import { UserRow } from "./user-row";
import "./index.scss";

const length = 1000;
const rows = 25;

type ContentUsersProps = {
  openNav: () => void;
};

export const ContentUsers = ({ openNav }: ContentUsersProps) => {
  const dispatch = useAppDispatch();

  const device = useDevice();
  const bottomNav = useAppSelector(selectBottomNav);

  const view = useAppSelector(selectView);
  const loading = useAppSelector(selectLoading);

  const userSort = useAppSelector(selectSort);
  const reverseUserSort = useAppSelector(selectReverseSort);

  const total = useAppSelector(selectUserTotal);
  const ids = useAppSelector(selectUserIds);

  const nextPageToken = useAppSelector(selectNextPageToken);
  const rowsPerPage = useAppSelector(selectRowsPerPage);
  const page = useAppSelector(selectPage);

  const {
    first,
    ids: paginatedIds,
    last,
  } = useMemo(
    () => paginateUsers(ids, page, rowsPerPage),
    [ids, page, rowsPerPage]
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletedUser, setDeletedUser] = useState<EntityId>("");

  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [closeViewMenu, openViewMenu] = useBoolStates(setViewMenuOpen);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [closeSortMenu, openSortMenu] = useBoolStates(setSortMenuOpen);

  useEffect(() => {
    if (total === 0) {
      dispatch(getUsers());
    }
  }, []);

  const openDeleteDialog = (user: EntityId) => {
    setDeleteOpen(true);
    setDeletedUser(user);
  };
  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setTimeout(() => {
      setDeletedUser("");
    }, 75);
  };

  const sortMenu = (view === "card" || device !== "desktop") && (
    <MenuSurfaceAnchor>
      <Menu
        anchorCorner="bottomLeft"
        onClose={closeSortMenu}
        onSelect={(e) => dispatch(setSort(sortProps[e.detail.index]))}
        open={sortMenuOpen}
      >
        {sortProps.map((prop) => (
          <MenuItem key={prop} selected={userSort === prop}>
            {sortLabels[prop]}
          </MenuItem>
        ))}
      </Menu>
      {withTooltip(
        <TopAppBarActionItem icon="sort" onClick={openSortMenu} />,
        "Sort"
      )}
    </MenuSurfaceAnchor>
  );
  const viewMenu = device === "desktop" && (
    <MenuSurfaceAnchor>
      <Menu
        anchorCorner="bottomLeft"
        onClose={closeViewMenu}
        onSelect={(e) => dispatch(setView(views[e.detail.index]))}
        open={viewMenuOpen}
      >
        {views.map((viewType) => (
          <MenuItem key={viewType} selected={view === viewType}>
            {viewLabels[viewType]}
          </MenuItem>
        ))}
      </Menu>
      {withTooltip(
        <TopAppBarActionItem icon={viewIcons[view]} onClick={openViewMenu} />,
        "View"
      )}
    </MenuSurfaceAnchor>
  );
  return (
    <>
      <TopAppBar className={classNames({ "bottom-app-bar": bottomNav })} fixed>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={openNav} />
            <TopAppBarTitle>{pageTitle.users}</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>
            {sortMenu}
            {viewMenu}
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      {!bottomNav && <TopAppBarFixedAdjust />}
      <div className="main">
        <div className="admin-main">
          <div className="users-container-container">
            <div className="users-container">
              {view === "table" && device === "desktop" ? (
                <Card className="users">
                  <DataTable>
                    <DataTableContent>
                      <DataTableHead>
                        <DataTableRow>
                          <DataTableHeadCell></DataTableHeadCell>
                          <DataTableHeadCell
                            onClick={() => dispatch(setSort("displayName"))}
                            sort={
                              userSort === "displayName"
                                ? reverseUserSort
                                  ? -1
                                  : 1
                                : null
                            }
                          >
                            User
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            onClick={() => dispatch(setSort("email"))}
                            sort={
                              userSort === "email"
                                ? reverseUserSort
                                  ? -1
                                  : 1
                                : null
                            }
                          >
                            Email
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            onClick={() => dispatch(setSort("dateCreated"))}
                            sort={
                              userSort === "dateCreated"
                                ? reverseUserSort
                                  ? -1
                                  : 1
                                : null
                            }
                          >
                            Date created
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            onClick={() => dispatch(setSort("lastSignIn"))}
                            sort={
                              userSort === "lastSignIn"
                                ? reverseUserSort
                                  ? -1
                                  : 1
                                : null
                            }
                          >
                            Last sign in
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            onClick={() => dispatch(setSort("lastActive"))}
                            sort={
                              userSort === "lastActive"
                                ? reverseUserSort
                                  ? -1
                                  : 1
                                : null
                            }
                          >
                            Last active
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            onClick={() => dispatch(setSort("nickname"))}
                            sort={
                              userSort === "nickname"
                                ? reverseUserSort
                                  ? -1
                                  : 1
                                : null
                            }
                          >
                            Nickname
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            onClick={() => dispatch(setSort("designer"))}
                            sort={
                              userSort === "designer"
                                ? reverseUserSort
                                  ? -1
                                  : 1
                                : null
                            }
                          >
                            Designer
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            onClick={() => dispatch(setSort("editor"))}
                            sort={
                              userSort === "editor"
                                ? reverseUserSort
                                  ? -1
                                  : 1
                                : null
                            }
                          >
                            Editor
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            onClick={() => dispatch(setSort("admin"))}
                            sort={
                              userSort === "admin"
                                ? reverseUserSort
                                  ? -1
                                  : 1
                                : null
                            }
                          >
                            Admin
                          </DataTableHeadCell>
                          <DataTableHeadCell>Save</DataTableHeadCell>
                          <DataTableHeadCell>Delete</DataTableHeadCell>
                        </DataTableRow>
                        <DataTableRow
                          className={classNames("progress-row", { loading })}
                        >
                          <DataTableHeadCell colSpan={12}>
                            <LinearProgress />
                          </DataTableHeadCell>
                        </DataTableRow>
                      </DataTableHead>
                      <DataTableBody>
                        {paginatedIds.map((user) => (
                          <UserRow
                            key={user}
                            delete={openDeleteDialog}
                            userId={user}
                          />
                        ))}
                      </DataTableBody>
                    </DataTableContent>
                    <DataTablePagination>
                      <div className="button-container">
                        <Button
                          disabled={!nextPageToken}
                          label={`Next ${length}`}
                          onClick={() => {
                            dispatch(getUsers(true));
                          }}
                          outlined
                        />
                      </div>
                      <DataTablePaginationTrailing>
                        <DataTablePaginationRowsPerPage>
                          <DataTablePaginationRowsPerPageLabel>
                            Rows per page
                          </DataTablePaginationRowsPerPageLabel>
                          <DataTablePaginationRowsPerPageSelect
                            enhanced
                            onChange={(e) =>
                              dispatch(
                                setRowsPerPage(parseInt(e.currentTarget.value))
                              )
                            }
                            options={Array(3)
                              .fill(rows)
                              .map((number, index) =>
                                (number * (index + 1)).toString()
                              )}
                            value={rowsPerPage.toString()}
                          />
                        </DataTablePaginationRowsPerPage>
                        <DataTablePaginationNavigation>
                          <DataTablePaginationTotal>
                            {`${first + 1}-${last + 1} of ${total}`}
                          </DataTablePaginationTotal>
                          <DataTablePaginationButton
                            className="rtl-flip"
                            disabled={first === 0}
                            icon="first_page"
                            onClick={() => dispatch(setPage(1))}
                          />
                          <DataTablePaginationButton
                            className="rtl-flip"
                            disabled={first === 0}
                            icon="chevron_left"
                            onClick={() => dispatch(setPage(page - 1))}
                          />
                          <DataTablePaginationButton
                            className="rtl-flip"
                            disabled={last === total - 1}
                            icon="chevron_right"
                            onClick={() => dispatch(setPage(page + 1))}
                          />
                          <DataTablePaginationButton
                            className="rtl-flip"
                            disabled={last === total - 1}
                            icon="last_page"
                            onClick={() =>
                              dispatch(setPage(Math.ceil(total / rowsPerPage)))
                            }
                          />
                        </DataTablePaginationNavigation>
                      </DataTablePaginationTrailing>
                    </DataTablePagination>
                  </DataTable>
                </Card>
              ) : (
                <div className="user-container">
                  {ids.map((user) => (
                    <UserCard
                      key={user}
                      delete={openDeleteDialog}
                      userId={user}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogDelete
            onClose={closeDeleteDialog}
            open={deleteOpen}
            userId={deletedUser}
          />
        </div>
        <Footer />
      </div>
      {bottomNav && <TopAppBarFixedAdjust />}
    </>
  );
};
export default ContentUsers;
