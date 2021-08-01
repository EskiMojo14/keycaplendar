import React, { useEffect, useState } from "react";
import firebase from "@s/firebase";
import classNames from "classnames";
import { queue } from "~/app/snackbarQueue";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
import { iconObject, useBoolStates } from "@s/common/functions";
import { selectBottomNav } from "@s/settings";
import {
  selectFirstIndex,
  selectLastIndex,
  selectLoading,
  selectNextPageToken,
  selectPage,
  selectPaginatedUsers,
  selectReverseSort,
  selectRowsPerPage,
  selectSort,
  selectSortedUsers,
  selectView,
  setLoading,
} from "@s/users/usersSlice";
import { User } from "@s/users/constructors";
import { getUsers, setPage, setRowsPerPage, setSort, setSortIndex, setViewIndex } from "@s/users/functions";
import { UserType } from "@s/users/types";
import {
  DataTable,
  DataTableContent,
  DataTableHead,
  DataTableRow,
  DataTableHeadCell,
  DataTableBody,
} from "@rmwc/data-table";
import { Button } from "@rmwc/button";
import { Card } from "@rmwc/card";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import { LinearProgress } from "@rmwc/linear-progress";
import { MenuSurfaceAnchor, Menu, MenuItem } from "@rmwc/menu";
import { Tooltip } from "@rmwc/tooltip";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
  TopAppBarActionItem,
} from "@rmwc/top-app-bar";
import { Footer } from "@c/common/Footer";
import {
  DataTablePagination,
  DataTablePaginationTrailing,
  DataTablePaginationRowsPerPage,
  DataTablePaginationRowsPerPageLabel,
  DataTablePaginationRowsPerPageSelect,
  DataTablePaginationNavigation,
  DataTablePaginationTotal,
  DataTablePaginationButton,
} from "@c/util/DataTablePagination";
import { UserRow } from "./UserRow";
import { UserCard } from "./UserCard";
import "./index.scss";

const length = 1000;
const rows = 25;

type ContentUsersProps = {
  openNav: () => void;
};

export const ContentUsers = (props: ContentUsersProps) => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);

  const view = useAppSelector(selectView);
  const loading = useAppSelector(selectLoading);

  const sortedUsers = useAppSelector(selectSortedUsers);
  const paginatedUsers = useAppSelector(selectPaginatedUsers);

  const userSort = useAppSelector(selectSort);
  const reverseUserSort = useAppSelector(selectReverseSort);

  const nextPageToken = useAppSelector(selectNextPageToken);
  const rowsPerPage = useAppSelector(selectRowsPerPage);
  const page = useAppSelector(selectPage);
  const firstIndex = useAppSelector(selectFirstIndex);
  const lastIndex = useAppSelector(selectLastIndex);

  const blankUser = new User();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletedUser, setDeletedUser] = useState<UserType>(blankUser);

  const [viewMenuOpen, setViewMenuOpen] = useState(false);
  const [closeViewMenu, openViewMenu] = useBoolStates(setViewMenuOpen);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [closeSortMenu, openSortMenu] = useBoolStates(setSortMenuOpen);

  useEffect(() => {
    if (sortedUsers.length === 0) {
      getUsers();
    }
  }, []);

  const openDeleteDialog = (user: UserType) => {
    setDeleteOpen(true);
    setDeletedUser(user);
  };
  const closeDeleteDialog = () => {
    setDeleteOpen(false);
    setTimeout(() => {
      setDeletedUser(blankUser);
    }, 75);
  };
  const deleteUser = (user: UserType) => {
    closeDeleteDialog();
    dispatch(setLoading(true));
    const deleteUser = firebase.functions().httpsCallable("deleteUser");
    deleteUser(user)
      .then((result) => {
        if (result.data.error) {
          queue.notify({ title: result.data.error });
          dispatch(setLoading(false));
        } else {
          queue.notify({ title: "User " + user.displayName + " successfully deleted." });
          getUsers();
        }
      })
      .catch((error) => {
        queue.notify({ title: "Error deleting user: " + error });
        dispatch(setLoading(false));
      });
  };

  const sortMenu =
    view === "card" || device !== "desktop" ? (
      <MenuSurfaceAnchor>
        <Menu
          open={sortMenuOpen}
          anchorCorner="bottomLeft"
          onClose={closeSortMenu}
          onSelect={(e) => setSortIndex(e.detail.index)}
        >
          <MenuItem selected={userSort === "displayName"}>Name</MenuItem>
          <MenuItem selected={userSort === "email"}>Email</MenuItem>
          <MenuItem selected={userSort === "dateCreated"}>Date created</MenuItem>
          <MenuItem selected={userSort === "lastSignIn"}>Last sign in</MenuItem>
          <MenuItem selected={userSort === "lastActive"}>Last active</MenuItem>
          <MenuItem selected={userSort === "nickname"}>Nickname</MenuItem>
          <MenuItem selected={userSort === "designer"}>Designer</MenuItem>
          <MenuItem selected={userSort === "editor"}>Editor</MenuItem>
          <MenuItem selected={userSort === "admin"}>Admin</MenuItem>
        </Menu>
        <Tooltip enterDelay={500} content="Sort" align="bottom">
          <TopAppBarActionItem icon="sort" onClick={openSortMenu} />
        </Tooltip>
      </MenuSurfaceAnchor>
    ) : null;
  const viewMenu =
    device === "desktop" ? (
      <MenuSurfaceAnchor>
        <Menu
          open={viewMenuOpen}
          anchorCorner="bottomLeft"
          onClose={closeViewMenu}
          onSelect={(e) => setViewIndex(e.detail.index)}
        >
          <MenuItem selected={view === "card"}>Card</MenuItem>
          <MenuItem selected={view === "table"}>Table</MenuItem>
        </Menu>
        <Tooltip enterDelay={500} content="View" align="bottom">
          <TopAppBarActionItem
            onClick={openViewMenu}
            icon={iconObject(
              <div>
                {view === "card" ? (
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
            )}
          />
        </Tooltip>
      </MenuSurfaceAnchor>
    ) : null;
  return (
    <>
      <TopAppBar fixed className={classNames({ "bottom-app-bar": bottomNav })}>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>{pageTitle.users}</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>
            {sortMenu}
            {viewMenu}
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
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
                            sort={userSort === "displayName" ? (reverseUserSort ? -1 : 1) : null}
                            onClick={() => {
                              setSort("displayName");
                            }}
                          >
                            User
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            sort={userSort === "email" ? (reverseUserSort ? -1 : 1) : null}
                            onClick={() => {
                              setSort("email");
                            }}
                          >
                            Email
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            sort={userSort === "dateCreated" ? (reverseUserSort ? -1 : 1) : null}
                            onClick={() => {
                              setSort("dateCreated");
                            }}
                          >
                            Date created
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            sort={userSort === "lastSignIn" ? (reverseUserSort ? -1 : 1) : null}
                            onClick={() => {
                              setSort("lastSignIn");
                            }}
                          >
                            Last sign in
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            sort={userSort === "lastActive" ? (reverseUserSort ? -1 : 1) : null}
                            onClick={() => {
                              setSort("lastActive");
                            }}
                          >
                            Last active
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            sort={userSort === "nickname" ? (reverseUserSort ? -1 : 1) : null}
                            onClick={() => {
                              setSort("nickname");
                            }}
                          >
                            Nickname
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            sort={userSort === "designer" ? (reverseUserSort ? -1 : 1) : null}
                            onClick={() => {
                              setSort("designer");
                            }}
                          >
                            Designer
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            sort={userSort === "editor" ? (reverseUserSort ? -1 : 1) : null}
                            onClick={() => {
                              setSort("editor");
                            }}
                          >
                            Editor
                          </DataTableHeadCell>
                          <DataTableHeadCell
                            sort={userSort === "admin" ? (reverseUserSort ? -1 : 1) : null}
                            onClick={() => {
                              setSort("admin");
                            }}
                          >
                            Admin
                          </DataTableHeadCell>
                          <DataTableHeadCell>Save</DataTableHeadCell>
                          <DataTableHeadCell>Delete</DataTableHeadCell>
                        </DataTableRow>
                        <DataTableRow className={classNames("progress-row", { loading: loading })}>
                          <DataTableHeadCell colSpan={12}>
                            <LinearProgress />
                          </DataTableHeadCell>
                        </DataTableRow>
                      </DataTableHead>
                      <DataTableBody>
                        {paginatedUsers.map((user) => {
                          return <UserRow user={user} delete={openDeleteDialog} getUsers={getUsers} key={user.email} />;
                        })}
                      </DataTableBody>
                    </DataTableContent>
                    <DataTablePagination>
                      <div className="button-container">
                        <Button
                          label={"Next " + length}
                          outlined
                          disabled={!nextPageToken}
                          onClick={() => {
                            getUsers(true);
                          }}
                        />
                      </div>
                      <DataTablePaginationTrailing>
                        <DataTablePaginationRowsPerPage>
                          <DataTablePaginationRowsPerPageLabel>Rows per page</DataTablePaginationRowsPerPageLabel>
                          <DataTablePaginationRowsPerPageSelect
                            value={rowsPerPage.toString()}
                            options={Array(3)
                              .fill(rows)
                              .map((number, index) => (number * (index + 1)).toString())}
                            onChange={setRowsPerPage}
                            enhanced
                          />
                        </DataTablePaginationRowsPerPage>
                        <DataTablePaginationNavigation>
                          <DataTablePaginationTotal>
                            {`${firstIndex + 1}-${lastIndex + 1} of ${sortedUsers.length}`}
                          </DataTablePaginationTotal>
                          <DataTablePaginationButton
                            className="rtl-flip"
                            icon="first_page"
                            disabled={firstIndex === 0}
                            onClick={() => {
                              setPage(1);
                            }}
                          />
                          <DataTablePaginationButton
                            className="rtl-flip"
                            icon="chevron_left"
                            disabled={firstIndex === 0}
                            onClick={() => {
                              setPage(page - 1);
                            }}
                          />
                          <DataTablePaginationButton
                            className="rtl-flip"
                            icon="chevron_right"
                            disabled={lastIndex === sortedUsers.length - 1}
                            onClick={() => {
                              setPage(page + 1);
                            }}
                          />
                          <DataTablePaginationButton
                            className="rtl-flip"
                            icon="last_page"
                            disabled={lastIndex === sortedUsers.length - 1}
                            onClick={() => {
                              setPage(Math.ceil(sortedUsers.length / rowsPerPage));
                            }}
                          />
                        </DataTablePaginationNavigation>
                      </DataTablePaginationTrailing>
                    </DataTablePagination>
                  </DataTable>
                </Card>
              ) : (
                <div className="user-container">
                  {sortedUsers.map((user) => {
                    return <UserCard user={user} key={user.email} delete={openDeleteDialog} getUsers={getUsers} />;
                  })}
                </div>
              )}
            </div>
          </div>
          <Dialog open={deleteOpen}>
            <DialogTitle>Delete User</DialogTitle>
            <DialogContent>Are you sure you want to delete the user {deletedUser.displayName}?</DialogContent>
            <DialogActions>
              <DialogButton action="close" onClick={closeDeleteDialog} isDefaultAction>
                Cancel
              </DialogButton>
              <DialogButton action="accept" className="delete" onClick={() => deleteUser(deletedUser)}>
                Delete
              </DialogButton>
            </DialogActions>
          </Dialog>
        </div>
        <Footer />
      </div>
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
export default ContentUsers;
