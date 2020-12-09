import React from "react";
import PropTypes from "prop-types";
import firebase from "../firebase";
import { queueTypes } from "../util/propTypeTemplates";
import {
  DataTable,
  DataTableContent,
  DataTableHead,
  DataTableRow,
  DataTableHeadCell,
  DataTableBody,
} from "@rmwc/data-table";
import { Card } from "@rmwc/card";
import { LinearProgress } from "@rmwc/linear-progress";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import { UserRow } from "../admin/users/UserRow";
import { UserCard } from "../admin/users/UserCard";
import "./ContentUsers.scss";
export class ContentUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      deleteDialogOpen: false,
      deletedUser: { displayName: "" },
    };
  }
  getUsers = () => {
    if (!this.props.loading) {
      this.props.toggleLoading();
    }
    const listUsersFn = firebase.functions().httpsCallable("listUsers");
    listUsersFn()
      .then((result) => {
        if (result) {
          if (result.data.error) {
            this.props.snackbarQueue.notify({ title: result.data.error });
            if (this.props.loading) {
              this.props.toggleLoading();
            }
          } else {
            if (this.props.loading) {
              this.props.toggleLoading();
            }
            this.sortUsers(result.data);
          }
        }
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error listing users: " + error });
        if (this.props.loading) {
          this.props.toggleLoading();
        }
      });
  };
  sortUsers = (users = this.state.users, sort = this.props.sort, reverseSort = this.props.reverseSort) => {
    users.sort((a, b) => {
      if (typeof a[sort] === "string") {
        const x = a[sort].toLowerCase();
        const y = b[sort].toLowerCase();
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
    });
    this.setState({
      users: users,
    });
    if (this.props.loading) {
      this.props.toggleLoading();
    }
  };
  openDeleteDialog = (user) => {
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
        deletedUser: { displayName: "" },
      });
    }, 75);
  };
  deleteUser = (user) => {
    this.closeDeleteDialog();
    if (!this.props.loading) {
      this.props.toggleLoading();
    }
    const deleteUser = firebase.functions().httpsCallable("deleteUser");
    deleteUser(user)
      .then((result) => {
        if (result.data.error) {
          this.props.snackbarQueue.notify({ title: result.data.error });
          if (this.props.loading) {
            this.props.toggleLoading();
          }
        } else {
          this.props.snackbarQueue.notify({ title: "User " + user.displayName + " successfully deleted." });
          this.getUsers();
        }
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error deleting user: " + error });
        if (this.props.loading) {
          this.props.toggleLoading();
        }
      });
  };
  componentDidMount() {
    this.getUsers();
  }
  componentDidUpdate(prevProps) {
    if (this.props.sort !== prevProps.sort || this.props.reverseSort !== prevProps.reverseSort) {
      this.sortUsers();
    }
  }
  render() {
    return (
      <div className="admin-main">
        <div className="users-container-container">
          <div className="users-container">
            {this.props.view === "table" && this.props.device === "desktop" ? (
              <Card className="users">
                <DataTable>
                  <DataTableContent>
                    <DataTableHead>
                      <DataTableRow>
                        <DataTableHeadCell></DataTableHeadCell>
                        <DataTableHeadCell
                          sort={this.props.sort === "displayName" ? (this.props.reverseSort ? -1 : 1) : null}
                          onClick={() => {
                            this.props.setSort("displayName");
                          }}
                        >
                          User
                        </DataTableHeadCell>
                        <DataTableHeadCell
                          sort={this.props.sort === "email" ? (this.props.reverseSort ? -1 : 1) : null}
                          onClick={() => {
                            this.props.setSort("email");
                          }}
                        >
                          Email
                        </DataTableHeadCell>
                        <DataTableHeadCell
                          sort={this.props.sort === "nickname" ? (this.props.reverseSort ? -1 : 1) : null}
                          onClick={() => {
                            this.props.setSort("nickname");
                          }}
                        >
                          Nickname
                        </DataTableHeadCell>
                        <DataTableHeadCell
                          sort={this.props.sort === "designer" ? (this.props.reverseSort ? -1 : 1) : null}
                          onClick={() => {
                            this.props.setSort("designer");
                          }}
                        >
                          Designer
                        </DataTableHeadCell>
                        <DataTableHeadCell
                          sort={this.props.sort === "editor" ? (this.props.reverseSort ? -1 : 1) : null}
                          onClick={() => {
                            this.props.setSort("editor");
                          }}
                        >
                          Editor
                        </DataTableHeadCell>
                        <DataTableHeadCell
                          sort={this.props.sort === "admin" ? (this.props.reverseSort ? -1 : 1) : null}
                          onClick={() => {
                            this.props.setSort("admin");
                          }}
                        >
                          Admin
                        </DataTableHeadCell>
                        <DataTableHeadCell>Save</DataTableHeadCell>
                        <DataTableHeadCell>Delete</DataTableHeadCell>
                      </DataTableRow>
                      <DataTableRow className={"progress-row" + (this.state.loading ? " loading" : "")}>
                        <DataTableHeadCell colSpan={9}>
                          <LinearProgress />
                        </DataTableHeadCell>
                      </DataTableRow>
                    </DataTableHead>
                    <DataTableBody>
                      {this.state.users.map((user, index) => {
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
                </DataTable>
              </Card>
            ) : (
              <div className="user-container">
                {this.state.users.map((user, index) => {
                  return (
                    <UserCard
                      user={user}
                      key={user.email}
                      delete={this.openDeleteDialog}
                      getUsers={this.getUsers}
                      snackbarQueue={this.props.snackbarQueue}
                      allDesigners={this.props.allDesigners}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <Dialog open={this.state.deleteDialogOpen}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>Are you sure you want to delete the user {this.state.deletedUser.displayName}?</DialogContent>
          <DialogActions>
            <DialogButton action="close" onClick={this.closeDeleteDialog} isDefaultAction>
              Cancel
            </DialogButton>
            <DialogButton action="accept" className="delete" onClick={() => this.deleteUser(this.state.deletedUser)}>
              Delete
            </DialogButton>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
export default ContentUsers;

ContentUsers.propTypes = {
  allDesigners: PropTypes.arrayOf(PropTypes.string),
  device: PropTypes.string,
  loading: PropTypes.bool,
  reverseSort: PropTypes.bool,
  setSort: PropTypes.func,
  snackbarQueue: PropTypes.shape(queueTypes),
  sort: PropTypes.string,
  toggleLoading: PropTypes.func,
  view: PropTypes.string,
};
