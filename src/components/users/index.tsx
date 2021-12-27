import { useEffect, useState } from "react";
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
import { Dialog, DialogActions, DialogButton, DialogContent, DialogTitle } from "@rmwc/dialog";
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
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { Footer } from "@c/common/footer";
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
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
import firebase from "@s/firebase";
import { selectBottomNav } from "@s/settings";
import {
  selectIndices,
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
} from "@s/users";
import { sortLabels, sortProps, viewIcons, viewLabels, views } from "@s/users/constants";
import { User } from "@s/users/constructors";
import { getUsers, setPage, setRowsPerPage, setSort, setSortIndex, setViewIndex } from "@s/users/functions";
import type { UserType } from "@s/users/types";
import { useBoolStates } from "@s/util/functions";
import { UserCard } from "./user-card";
import { UserRow } from "./user-row";
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
  const { first: firstIndex, last: lastIndex } = useAppSelector(selectIndices);

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
          {sortProps.map((prop) => (
            <MenuItem key={prop} selected={userSort === prop}>
              {sortLabels[prop]}
            </MenuItem>
          ))}
        </Menu>
        {withTooltip(<TopAppBarActionItem icon="sort" onClick={openSortMenu} />, "Sort")}
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
          {views.map((viewType) => (
            <MenuItem key={viewType} selected={view === viewType}>
              {viewLabels[viewType]}
            </MenuItem>
          ))}
        </Menu>
        {withTooltip(<TopAppBarActionItem onClick={openViewMenu} icon={viewIcons[view]} />, "View")}
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
                        <DataTableRow className={classNames("progress-row", { loading })}>
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
                            onChange={(e) => setRowsPerPage(parseInt(e.currentTarget.value))}
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
