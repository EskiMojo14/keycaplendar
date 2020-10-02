import React from "react";
import moment from "moment";
import firebase from "../../firebase";
import { Link } from "react-router-dom";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
  TopAppBarNavigationIcon,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { CircularProgress } from "@rmwc/circular-progress";
import { List } from "@rmwc/list";
import { Select } from "@rmwc/select";
import { IconButton } from "@rmwc/icon-button";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerAppContent } from "@rmwc/drawer";
import { ContentEmpty } from "../../content/ContentEmpty";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import { AuditEntry } from "./AuditEntry.js";
import "./AuditLog.scss";

export class AuditLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      actions: [],
      actionsFiltered: [],
      loading: false,
      filterAction: "none",
      filterUser: "all",
      filterDrawerOpen: false,
      filterLength: 25,
      deleteDialogOpen: false,
      deleteAction: {
        changelogId: "",
      },
      users: [{ label: "All", value: "all" }],
    };
  }
  openDeleteDialog = (action) => {
    this.setState({
      deleteDialogOpen: true,
      deleteAction: action,
    });
  };
  closeDeleteDialog = () => {
    this.setState({
      deleteDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        deleteAction: {
          changelogId: "",
        },
      });
    }, 100);
  };
  toggleFilterDrawer = () => {
    this.setState({
      filterDrawerOpen: !this.state.filterDrawerOpen,
    });
  };
  closeFilterDrawer = () => {
    this.setState({
      filterDrawerOpen: false,
    });
  };
  handleFilterChange = (e, prop) => {
    this.setState({
      [prop]: e.target.value,
    });

    this.filterActions(
      this.state.action,
      prop === "filterAction" ? e.target.value : this.state.filterAction,
      prop === "filterUser" ? e.target.value : this.state.filterUser
    );
  };
  getActions = (num = this.state.filterLength) => {
    this.setState({ loading: true, filterLength: num });
    const db = firebase.firestore();
    db.collection("changelog")
      .orderBy("timestamp", "desc")
      .limit(parseInt(num))
      .get()
      .then((querySnapshot) => {
        let actions = [];
        let users = [{ label: "All", value: "all" }];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          data.action = data.before ? (data.after.profile ? "updated" : "deleted") : "created";
          data.changelogId = doc.id;
          actions.push(data);
          if (users.filter((e) => e.value === data.user.nickname).length === 0) {
            users.push({ label: data.user.nickname, value: data.user.nickname });
          }
        });

        actions.sort(function (a, b) {
          var x = a.timestamp.toLowerCase();
          var y = b.timestamp.toLowerCase();
          if (x < y) {
            return 1;
          }
          if (x > y) {
            return -1;
          }
          return 0;
        });
        this.setState({
          actions: actions,
          users: users,
        });

        this.filterActions(actions);
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error getting data: " + error });
        this.setState({ loading: false });
      });
  };

  filterActions = (
    actions = this.state.actions,
    filterAction = this.state.filterAction,
    filterUser = this.state.filterUser
  ) => {
    let filteredActions = actions;

    if (filterAction !== "none") {
      filteredActions = filteredActions.filter((action) => {
        return action.action === filterAction;
      });
    }

    if (filterUser !== "all") {
      filteredActions = filteredActions.filter((action) => {
        return action.user.nickname === filterUser;
      });
    }

    this.setState({
      actionsFiltered: filteredActions,
      loading: false,
    });
  };
  deleteAction = (action) => {
    const db = firebase.firestore();
    db.collection("changelog")
      .doc(action.changelogId)
      .delete()
      .then(() => {
        this.props.snackbarQueue.notify({ title: "Successfully deleted changelog entry." });
        this.getActions();
        this.closeDeleteDialog();
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error deleting changelog entry: " + error });
        this.closeDeleteDialog();
      });
  };
  componentDidMount() {
    this.getActions(25);
    document.body.classList.add("audit");
  }
  componentWillUnmount() {
    document.body.classList.remove("audit");
  }
  render() {
    const refreshButton = this.state.loading ? (
      <CircularProgress />
    ) : (
      <TopAppBarActionItem
        icon="refresh"
        onClick={() => {
          this.getActions(this.state.filterLength);
        }}
      />
    );
    const properties = [
      "profile",
      "colorway",
      "designer",
      "icDate",
      "details",
      "gbMonth",
      "gbLaunch",
      "gbEnd",
      "image",
      "shipped",
      "vendors",
    ];
    const closeButton =
      this.props.device === "desktop" ? (
        <IconButton className="close-icon" icon="close" onClick={this.closeFilterDrawer} />
      ) : null;
    return (
      <div>
        <TopAppBar fixed>
          <TopAppBarRow>
            <TopAppBarSection>
              <Link to="/">
                <TopAppBarNavigationIcon icon="arrow_back" />
              </Link>
              <TopAppBarTitle>Audit Log</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
              <TopAppBarActionItem icon="filter_list" onClick={this.toggleFilterDrawer} />
              {refreshButton}
            </TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        <TopAppBarFixedAdjust />
        <div className="content-container">
          <Drawer
            open={this.state.filterDrawerOpen}
            dismissible={this.props.device === "desktop"}
            modal={this.props.device !== "desktop"}
            className="drawer-right filter-drawer"
            onClose={this.closeFilterDrawer}
          >
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
              {closeButton}
            </DrawerHeader>
            <DrawerContent>
              <Select
                outlined
                enhanced={{ fixed: true }}
                label="Action"
                options={[
                  { label: "None", value: "none" },
                  { label: "Created", value: "created" },
                  { label: "Updated", value: "updated" },
                  { label: "Deleted", value: "deleted" },
                ]}
                value={this.state.filterAction}
                className="action-select"
                onChange={(e) => {
                  this.handleFilterChange(e, "filterAction");
                }}
              />
              <Select
                outlined
                enhanced={{ fixed: true }}
                label="User"
                options={this.state.users}
                value={this.state.filterUser}
                className="user-select"
                onChange={(e) => {
                  this.handleFilterChange(e, "filterUser");
                }}
              />
              <Select
                outlined
                enhanced={{ fixed: true }}
                label="Length"
                options={[
                  { label: "25", value: 25 },
                  { label: "50", value: 50 },
                  { label: "100", value: 100 },
                  { label: "200", value: 200 },
                ]}
                value={this.state.filterLength}
                className="action-select"
                onChange={(e) => {
                  this.getActions(e.currentTarget.value);
                }}
              />
            </DrawerContent>
          </Drawer>
          <DrawerAppContent>
            {this.state.actionsFiltered.length > 0 || this.state.loading ? (
              <div
                className={
                  "log-container" + (this.state.filterDrawerOpen && this.props.device === "desktop" ? "" : " extended")
                }
              >
                <div
                  className={
                    "log" + (this.state.actionsFiltered.length === 0 && this.state.loading ? " placeholder" : "")
                  }
                >
                  <List twoLine>
                    {this.state.actionsFiltered.map((action, index) => {
                      const timestamp = moment.utc(action.timestamp);
                      return (
                        <AuditEntry
                          key={index}
                          action={action}
                          timestamp={timestamp}
                          openDeleteDialog={this.openDeleteDialog}
                          properties={properties}
                        />
                      );
                    })}
                  </List>
                </div>
              </div>
            ) : (
              <ContentEmpty />
            )}
            <Dialog open={this.state.deleteDialogOpen}>
              <DialogTitle>Delete Action</DialogTitle>
              <DialogContent>
                Are you sure you want to delete the changelog entry with the ID {this.state.deleteAction.changelogId}?
              </DialogContent>
              <DialogActions>
                <DialogButton action="close" onClick={this.closeDeleteDialog} isDefaultAction>
                  Cancel
                </DialogButton>
                <DialogButton
                  action="accept"
                  className="delete"
                  onClick={() => {
                    this.deleteAction(this.state.deleteAction);
                  }}
                >
                  Delete
                </DialogButton>
              </DialogActions>
            </Dialog>
          </DrawerAppContent>
        </div>
      </div>
    );
  }
}
export default AuditLog;
