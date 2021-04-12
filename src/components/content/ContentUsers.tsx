import React from "react";
import firebase from "../../firebase";
import classNames from "classnames";
import { QueueType, UserType } from "../../util/types";
import { DeviceContext } from "../../util/contexts";
import { User } from "../../util/constructors";
import { hasKey, iconObject } from "../../util/functions";
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
import { UserRow } from "../users/UserRow";
import { UserCard } from "../users/UserCard";
import {
  DataTablePagination,
  DataTablePaginationTrailing,
  DataTablePaginationRowsPerPage,
  DataTablePaginationRowsPerPageLabel,
  DataTablePaginationRowsPerPageSelect,
  DataTablePaginationNavigation,
  DataTablePaginationTotal,
  DataTablePaginationButton,
} from "../util/DataTablePagination";
import { Footer } from "../common/Footer";
import "./ContentUsers.scss";

const length = 1000;
const rows = 25;

type ContentUsersProps = {
  allDesigners: string[];
  bottomNav: boolean;
  device: string;
  openNav: () => void;
  snackbarQueue: QueueType;
};

type ContentUsersState = {
  users: UserType[];
  sortedUsers: UserType[];
  paginatedUsers: UserType[];
  deleteDialogOpen: boolean;
  deletedUser: UserType;
  nextPageToken: null;
  rowsPerPage: number;
  page: number;
  firstIndex: number;
  lastIndex: number;
  view: string;
  sort: string;
  reverseSort: boolean;
  loading: boolean;
  viewMenuOpen: boolean;
  sortMenuOpen: boolean;
};

export class ContentUsers extends React.Component<ContentUsersProps, ContentUsersState> {
  state: ContentUsersState = {
    users: [],
    sortedUsers: [],
    paginatedUsers: [],
    deleteDialogOpen: false,
    deletedUser: new User(),
    nextPageToken: null,
    rowsPerPage: rows,
    page: 1,
    firstIndex: 0,
    lastIndex: 0,
    view: "table",
    sort: "editor",
    reverseSort: false,
    loading: false,
    viewMenuOpen: false,
    sortMenuOpen: false,
  };
  getUsers = () => {
    if (!this.state.loading) {
      this.toggleLoading();
    }
    const listUsersFn = firebase.functions().httpsCallable("listUsers");
    listUsersFn({ length: length, nextPageToken: this.state.nextPageToken })
      .then((result) => {
        if (result) {
          if (result.data.error) {
            this.props.snackbarQueue.notify({ title: result.data.error });
            if (this.state.loading) {
              this.toggleLoading();
            }
          } else {
            if (this.state.loading) {
              this.toggleLoading();
            }
            const users = [...this.state.users, ...result.data.users];
            this.sortUsers(users);
            this.setState({ users: users, nextPageToken: result.data.nextPageToken });
          }
        }
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error listing users: " + error });
        if (this.state.loading) {
          this.toggleLoading();
        }
      });
  };
  sortUsers = (
    users = this.state.users,
    sort = this.state.sort,
    reverseSort = this.state.reverseSort,
    page = this.state.page
  ) => {
    users.sort((a, b) => {
      if (hasKey(a, sort) && hasKey(b, sort)) {
        const aVal = a[sort];
        const bVal = b[sort];
        if (typeof aVal === "string" && typeof bVal === "string") {
          const x = aVal.toLowerCase();
          const y = bVal.toLowerCase();
          if (x < y) {
            return reverseSort ? 1 : -1;
          }
          if (x > y) {
            return reverseSort ? -1 : 1;
          }
          if (a.nickname.toLowerCase() > b.nickname.toLowerCase()) {
            return 1;
          }
          if (a.nickname.toLowerCase() < b.nickname.toLowerCase()) {
            return -1;
          }
          if (a.email.toLowerCase() > b.email.toLowerCase()) {
            return 1;
          }
          if (a.email.toLowerCase() < b.email.toLowerCase()) {
            return -1;
          }
          return 0;
        } else {
          const x = a[sort];
          const y = b[sort];
          if (x < y) {
            return reverseSort ? -1 : 1;
          }
          if (x > y) {
            return reverseSort ? 1 : -1;
          }
          if (a.nickname.toLowerCase() > b.nickname.toLowerCase()) {
            return 1;
          }
          if (a.nickname.toLowerCase() < b.nickname.toLowerCase()) {
            return -1;
          }
          if (a.email.toLowerCase() > b.email.toLowerCase()) {
            return 1;
          }
          if (a.email.toLowerCase() < b.email.toLowerCase()) {
            return -1;
          }
          return 0;
        }
      } else {
        return 0;
      }
    });
    this.setState({ sortedUsers: users });
    this.paginateUsers(users, page);
    if (this.state.loading) {
      this.toggleLoading();
    }
  };
  paginateUsers = (users = this.state.sortedUsers, page = this.state.page, rowsPerPage = this.state.rowsPerPage) => {
    const paginatedUsers = users.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const firstIndex = users.indexOf(paginatedUsers[0]);
    const lastIndex = users.indexOf(paginatedUsers[paginatedUsers.length - 1]);
    this.setState({ paginatedUsers: paginatedUsers, firstIndex: firstIndex, lastIndex: lastIndex });
  };
  openDeleteDialog = (user: UserType) => {
    this.setState({
      deleteDialogOpen: true,
      deletedUser: user,
    });
  };
  closeDeleteDialog = () => {
    this.setState({
      deleteDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        deletedUser: new User(),
      });
    }, 75);
  };
  openSortMenu = () => {
    this.setState({
      sortMenuOpen: true,
    });
  };
  closeSortMenu = () => {
    this.setState({
      sortMenuOpen: false,
    });
  };
  openViewMenu = () => {
    this.setState({
      viewMenuOpen: true,
    });
  };
  closeViewMenu = () => {
    this.setState({
      viewMenuOpen: false,
    });
  };
  deleteUser = (user: UserType) => {
    this.closeDeleteDialog();
    if (!this.state.loading) {
      this.toggleLoading();
    }
    const deleteUser = firebase.functions().httpsCallable("deleteUser");
    deleteUser(user)
      .then((result) => {
        if (result.data.error) {
          this.props.snackbarQueue.notify({ title: result.data.error });
          if (this.state.loading) {
            this.toggleLoading();
          }
        } else {
          this.props.snackbarQueue.notify({ title: "User " + user.displayName + " successfully deleted." });
          this.getUsers();
        }
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error deleting user: " + error });
        if (this.state.loading) {
          this.toggleLoading();
        }
      });
  };
  setRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    this.setState({ rowsPerPage: val, page: 1 });
    this.paginateUsers(this.state.sortedUsers, 1, val);
  };
  setPage = (num: number) => {
    this.setState({ page: num });
    this.paginateUsers(this.state.sortedUsers, num);
  };
  setView = (index: number) => {
    const views = ["card", "table"];
    this.setState({
      view: views[index],
    });
  };
  setSort = (sort: string) => {
    let reverseSort;
    if (sort === this.state.sort) {
      reverseSort = !this.state.reverseSort;
    } else {
      reverseSort = false;
    }
    this.setState({
      sort: sort,
      reverseSort: reverseSort,
    });
    this.sortUsers(this.state.users, sort, reverseSort, 1);
  };
  setSortIndex = (index: number) => {
    const props = ["displayName", "email", "nickname", "designer", "editor", "admin"];
    this.setState({
      sort: props[index],
      reverseSort: false,
    });
    this.sortUsers(this.state.users, props[index], false, 1);
  };
  toggleLoading = () => {
    this.setState((prevState) => ({ loading: !prevState.loading }));
  };
  componentDidMount() {
    this.getUsers();
  }
  render() {
    const sortMenu =
      this.state.sort === "card" || this.context !== "desktop" ? (
        <MenuSurfaceAnchor>
          <Menu
            open={this.state.sortMenuOpen}
            anchorCorner="bottomLeft"
            onClose={this.closeSortMenu}
            onSelect={(e) => this.setSortIndex(e.detail.index)}
          >
            <MenuItem selected={this.state.sort === "displayName"}>Name</MenuItem>
            <MenuItem selected={this.state.sort === "email"}>Email</MenuItem>
            <MenuItem selected={this.state.sort === "nickname"}>Nickname</MenuItem>
            <MenuItem selected={this.state.sort === "designer"}>Designer</MenuItem>
            <MenuItem selected={this.state.sort === "editor"}>Editor</MenuItem>
            <MenuItem selected={this.state.sort === "admin"}>Admin</MenuItem>
          </Menu>
          <Tooltip enterDelay={500} content="Sort" align="bottom">
            <TopAppBarActionItem icon="sort" onClick={this.openSortMenu} />
          </Tooltip>
        </MenuSurfaceAnchor>
      ) : null;
    const viewMenu =
      this.context === "desktop" ? (
        <MenuSurfaceAnchor>
          <Menu
            open={this.state.viewMenuOpen}
            anchorCorner="bottomLeft"
            onClose={this.closeViewMenu}
            onSelect={(e) => this.setView(e.detail.index)}
          >
            <MenuItem selected={this.state.view === "card"}>Card</MenuItem>
            <MenuItem selected={this.state.view === "table"}>Table</MenuItem>
          </Menu>
          <Tooltip enterDelay={500} content="View" align="bottom">
            <TopAppBarActionItem
              onClick={this.openViewMenu}
              icon={iconObject(
                <div>
                  {this.state.view === "card" ? (
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
        <TopAppBar fixed className={classNames({ "bottom-app-bar": this.props.bottomNav })}>
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="menu" onClick={this.props.openNav} />
              <TopAppBarTitle>Users</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
              {sortMenu}
              {viewMenu}
            </TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        {this.props.bottomNav ? null : <TopAppBarFixedAdjust />}
        <div className="main">
          <div className="admin-main">
            <div className="users-container-container">
              <div className="users-container">
                {this.state.view === "table" && this.context === "desktop" ? (
                  <Card className="users">
                    <DataTable>
                      <DataTableContent>
                        <DataTableHead>
                          <DataTableRow>
                            <DataTableHeadCell></DataTableHeadCell>
                            <DataTableHeadCell
                              sort={this.state.sort === "displayName" ? (this.state.reverseSort ? -1 : 1) : null}
                              onClick={() => {
                                this.setSort("displayName");
                              }}
                            >
                              User
                            </DataTableHeadCell>
                            <DataTableHeadCell
                              sort={this.state.sort === "email" ? (this.state.reverseSort ? -1 : 1) : null}
                              onClick={() => {
                                this.setSort("email");
                              }}
                            >
                              Email
                            </DataTableHeadCell>
                            <DataTableHeadCell
                              sort={this.state.sort === "nickname" ? (this.state.reverseSort ? -1 : 1) : null}
                              onClick={() => {
                                this.setSort("nickname");
                              }}
                            >
                              Nickname
                            </DataTableHeadCell>
                            <DataTableHeadCell
                              sort={this.state.sort === "designer" ? (this.state.reverseSort ? -1 : 1) : null}
                              onClick={() => {
                                this.setSort("designer");
                              }}
                            >
                              Designer
                            </DataTableHeadCell>
                            <DataTableHeadCell
                              sort={this.state.sort === "editor" ? (this.state.reverseSort ? -1 : 1) : null}
                              onClick={() => {
                                this.setSort("editor");
                              }}
                            >
                              Editor
                            </DataTableHeadCell>
                            <DataTableHeadCell
                              sort={this.state.sort === "admin" ? (this.state.reverseSort ? -1 : 1) : null}
                              onClick={() => {
                                this.setSort("admin");
                              }}
                            >
                              Admin
                            </DataTableHeadCell>
                            <DataTableHeadCell>Save</DataTableHeadCell>
                            <DataTableHeadCell>Delete</DataTableHeadCell>
                          </DataTableRow>
                          <DataTableRow className={classNames("progress-row", { loading: this.state.loading })}>
                            <DataTableHeadCell colSpan={9}>
                              <LinearProgress />
                            </DataTableHeadCell>
                          </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                          {this.state.paginatedUsers.map((user) => {
                            return (
                              <UserRow
                                user={user}
                                delete={this.openDeleteDialog}
                                getUsers={this.getUsers}
                                snackbarQueue={this.props.snackbarQueue}
                                key={user.email}
                                allDesigners={this.props.allDesigners}
                              />
                            );
                          })}
                        </DataTableBody>
                      </DataTableContent>
                      <DataTablePagination>
                        <div className="button-container">
                          <Button
                            label={"Next " + length}
                            outlined
                            disabled={!this.state.nextPageToken}
                            onClick={this.getUsers}
                          />
                        </div>
                        <DataTablePaginationTrailing>
                          <DataTablePaginationRowsPerPage>
                            <DataTablePaginationRowsPerPageLabel>Rows per page</DataTablePaginationRowsPerPageLabel>
                            <DataTablePaginationRowsPerPageSelect
                              value={this.state.rowsPerPage.toString()}
                              options={Array(3)
                                .fill(rows)
                                .map((number, index) => (number * (index + 1)).toString())}
                              onChange={this.setRowsPerPage}
                              enhanced
                            />
                          </DataTablePaginationRowsPerPage>
                          <DataTablePaginationNavigation>
                            <DataTablePaginationTotal>
                              {`${this.state.firstIndex + 1}-${this.state.lastIndex + 1} of ${
                                this.state.sortedUsers.length
                              }`}
                            </DataTablePaginationTotal>
                            <DataTablePaginationButton
                              className="rtl-flip"
                              icon="first_page"
                              disabled={this.state.firstIndex === 0}
                              onClick={() => {
                                this.setPage(1);
                              }}
                            />
                            <DataTablePaginationButton
                              className="rtl-flip"
                              icon="chevron_left"
                              disabled={this.state.firstIndex === 0}
                              onClick={() => {
                                this.setPage(this.state.page - 1);
                              }}
                            />
                            <DataTablePaginationButton
                              className="rtl-flip"
                              icon="chevron_right"
                              disabled={this.state.lastIndex === this.state.sortedUsers.length - 1}
                              onClick={() => {
                                this.setPage(this.state.page + 1);
                              }}
                            />
                            <DataTablePaginationButton
                              className="rtl-flip"
                              icon="last_page"
                              disabled={this.state.lastIndex === this.state.sortedUsers.length - 1}
                              onClick={() => {
                                this.setPage(Math.ceil(this.state.sortedUsers.length / this.state.rowsPerPage));
                              }}
                            />
                          </DataTablePaginationNavigation>
                        </DataTablePaginationTrailing>
                      </DataTablePagination>
                    </DataTable>
                  </Card>
                ) : (
                  <div className="user-container">
                    {this.state.sortedUsers.map((user) => {
                      return (
                        <UserCard
                          user={user}
                          key={user.email}
                          delete={this.openDeleteDialog}
                          getUsers={this.getUsers}
                          snackbarQueue={this.props.snackbarQueue}
                          allDesigners={this.props.allDesigners}
                          device={this.context}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <Dialog open={this.state.deleteDialogOpen}>
              <DialogTitle>Delete User</DialogTitle>
              <DialogContent>
                Are you sure you want to delete the user {this.state.deletedUser.displayName}?
              </DialogContent>
              <DialogActions>
                <DialogButton action="close" onClick={this.closeDeleteDialog} isDefaultAction>
                  Cancel
                </DialogButton>
                <DialogButton
                  action="accept"
                  className="delete"
                  onClick={() => this.deleteUser(this.state.deletedUser)}
                >
                  Delete
                </DialogButton>
              </DialogActions>
            </Dialog>
          </div>
          <Footer />
        </div>
        {this.props.bottomNav ? <TopAppBarFixedAdjust /> : null}
      </>
    );
  }
}
export default ContentUsers;

ContentUsers.contextType = DeviceContext;
