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
import { Button } from "@rmwc/button";
import {
  List,
  CollapsibleList,
  ListItem,
  ListItemMeta,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemGraphic,
} from "@rmwc/list";
import {
  DataTable,
  DataTableContent,
  DataTableHead,
  DataTableRow,
  DataTableHeadCell,
  DataTableCell,
  DataTableBody,
} from "@rmwc/data-table";
import { Checkbox } from "@rmwc/checkbox";
import { Select } from "@rmwc/select";
import { IconButton } from "@rmwc/icon-button";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerAppContent } from "@rmwc/drawer";
import { ContentEmpty } from "../../ContentEmpty";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
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
      <TopAppBarActionItem icon="refresh" onClick={() => {this.getActions(this.state.filterLength)}} />
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
                        <CollapsibleList
                          handle={
                            <ListItem>
                              <ListItemGraphic
                                icon={
                                  action.action !== "created"
                                    ? action.action === "updated"
                                      ? "update"
                                      : "remove_circle_outline"
                                    : "add_circle_outline"
                                }
                              />
                              <ListItemText>
                                <div className="overline">{action.action}</div>
                                <ListItemPrimaryText>
                                  {action.action !== "deleted"
                                    ? action.after.profile + " " + action.after.colorway
                                    : action.before.profile + " " + action.before.colorway}
                                </ListItemPrimaryText>
                                <ListItemSecondaryText>
                                  {action.user.nickname + ", " + timestamp.format("Do MMM YYYY HH:mm")}
                                </ListItemSecondaryText>
                              </ListItemText>
                              <ListItemMeta icon="expand_more" />
                            </ListItem>
                          }
                          key={index + action.timestamp}
                        >
                          <DataTable>
                            <DataTableContent>
                              <DataTableHead>
                                <DataTableRow>
                                  <DataTableHeadCell>Property</DataTableHeadCell>
                                  {action.action === "updated" ? (
                                    <DataTableHeadCell>Before</DataTableHeadCell>
                                  ) : (
                                    <DataTableHeadCell>Data</DataTableHeadCell>
                                  )}
                                  {action.action === "updated" ? <DataTableHeadCell>After</DataTableHeadCell> : null}
                                </DataTableRow>
                              </DataTableHead>
                              <DataTableBody>
                                {properties.map((property, index) => {
                                  const domain = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;
                                  if (
                                    action.action === "updated" &&
                                    action.before[property] !== action.after[property]
                                  ) {
                                    if (
                                      property !== "designer" &&
                                      property !== "vendors" &&
                                      property !== "image" &&
                                      property !== "details" &&
                                      property !== "gbMonth" &&
                                      property !== "shipped"
                                    ) {
                                      return (
                                        <DataTableRow key={property + index}>
                                          <DataTableCell>{property}</DataTableCell>
                                          <DataTableCell className="before">
                                            <span className="highlight">{action.before[property]}</span>
                                          </DataTableCell>
                                          <DataTableCell className="after">
                                            <span className="highlight">{action.after[property]}</span>
                                          </DataTableCell>
                                        </DataTableRow>
                                      );
                                    } else if (property === "designer") {
                                      const arrayCompare = (before, after) => {
                                        return !(
                                          before.length === after.length &&
                                          before.sort().every(function (value, index) {
                                            return value === after.sort()[index];
                                          })
                                        );
                                      };
                                      if (arrayCompare(action.before[property], action.after[property])) {
                                        return (
                                          <DataTableRow key={property + index}>
                                            <DataTableCell>{property}</DataTableCell>
                                            <DataTableCell className="before">
                                              <span className="highlight">{action.before[property].join(", ")}</span>
                                            </DataTableCell>
                                            <DataTableCell className="after">
                                              <span className="highlight">{action.after[property].join(", ")}</span>
                                            </DataTableCell>
                                          </DataTableRow>
                                        );
                                      }
                                      return null;
                                    } else if (property === "vendors") {
                                      const beforeVendors = action.before.vendors;

                                      beforeVendors.sort(function (a, b) {
                                        var x = a.region.toLowerCase();
                                        var y = b.region.toLowerCase();
                                        if (x < y) {
                                          return -1;
                                        }
                                        if (x > y) {
                                          return 1;
                                        }
                                        return 0;
                                      });

                                      const afterVendors = action.after.vendors;

                                      afterVendors.sort(function (a, b) {
                                        var x = a.region.toLowerCase();
                                        var y = b.region.toLowerCase();
                                        if (x < y) {
                                          return -1;
                                        }
                                        if (x > y) {
                                          return 1;
                                        }
                                        return 0;
                                      });

                                      function objectCompare(object1, object2) {
                                        const keys1 = Object.keys(object1);
                                        const keys2 = Object.keys(object2);

                                        if (keys1.length !== keys2.length) {
                                          return false;
                                        }

                                        for (let key of keys1) {
                                          if (object1[key] !== object2[key]) {
                                            return false;
                                          }
                                        }

                                        return true;
                                      }
                                      const moreVendors =
                                        afterVendors.length >= beforeVendors.length ? afterVendors : beforeVendors;
                                      const buildRows = () => {
                                        let rows = [];
                                        moreVendors.forEach((vendor, index) => {
                                          const beforeVendor = beforeVendors[index]
                                            ? beforeVendors[index]
                                            : { name: "", region: "", storeLink: "" };
                                          const afterVendor = afterVendors[index]
                                            ? afterVendors[index]
                                            : { name: "", region: "", storeLink: "" };
                                          if (!objectCompare(afterVendor, beforeVendor)) {
                                            rows.push(
                                              <DataTableRow key={afterVendor.name + index}>
                                                <DataTableCell>{property + index}</DataTableCell>
                                                <DataTableCell className="before">
                                                  <div>
                                                    <span
                                                      className={
                                                        afterVendor.name !== beforeVendor.name ? "highlight" : ""
                                                      }
                                                    >
                                                      Name: {beforeVendor.name}
                                                    </span>
                                                  </div>
                                                  <div>
                                                    <span
                                                      className={
                                                        afterVendor.region !== beforeVendor.region ? "highlight" : ""
                                                      }
                                                    >
                                                      Region: {beforeVendor.region}
                                                    </span>
                                                  </div>
                                                  <div>
                                                    <span
                                                      className={
                                                        afterVendor.storeLink !== beforeVendor.storeLink
                                                          ? "highlight"
                                                          : ""
                                                      }
                                                    >
                                                      Link:{" "}
                                                      <a
                                                        href={beforeVendor.storeLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                      >
                                                        {beforeVendor.storeLink.match(domain)}
                                                      </a>
                                                    </span>
                                                  </div>
                                                </DataTableCell>
                                                <DataTableCell className="after">
                                                  <div>
                                                    <span
                                                      className={
                                                        afterVendor.name !== beforeVendor.name ? "highlight" : ""
                                                      }
                                                    >
                                                      Name: {afterVendor.name}
                                                    </span>
                                                  </div>
                                                  <div>
                                                    <span
                                                      className={
                                                        afterVendor.region !== beforeVendor.region ? "highlight" : ""
                                                      }
                                                    >
                                                      Region: {afterVendor.region}
                                                    </span>
                                                  </div>
                                                  <div>
                                                    <span
                                                      className={
                                                        afterVendor.storeLink !== beforeVendor.storeLink
                                                          ? "highlight"
                                                          : ""
                                                      }
                                                    >
                                                      Link:{" "}
                                                      <a
                                                        href={afterVendor.storeLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                      >
                                                        {afterVendor.storeLink.match(domain)}
                                                      </a>
                                                    </span>
                                                  </div>
                                                </DataTableCell>
                                              </DataTableRow>
                                            );
                                          }
                                        });
                                        return rows;
                                      };
                                      return buildRows();
                                    } else if (property === "image" || property === "details") {
                                      return (
                                        <DataTableRow key={property + index}>
                                          <DataTableCell>{property}</DataTableCell>
                                          <DataTableCell className="before">
                                            <span className="highlight">
                                              <a
                                                href={action.before[property]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                {action.before[property].match(domain)}
                                              </a>
                                            </span>
                                          </DataTableCell>
                                          <DataTableCell className="after">
                                            <span className="highlight">
                                              <a
                                                href={action.after[property]}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                {action.after[property].match(domain)}
                                              </a>
                                            </span>
                                          </DataTableCell>
                                        </DataTableRow>
                                      );
                                    } else if (property === "gbMonth" || property === "shipped") {
                                      return (
                                        <DataTableRow key={property + index}>
                                          <DataTableCell>{property}</DataTableCell>
                                          <DataTableCell className="before">
                                            <Checkbox checked={action.before[property]} disabled />
                                          </DataTableCell>
                                          <DataTableCell className="after">
                                            <Checkbox checked={action.after[property]} disabled />
                                          </DataTableCell>
                                        </DataTableRow>
                                      );
                                    }
                                    return null;
                                  } else if (action.action === "created" || action.action === "deleted") {
                                    const docData = action.action === "created" ? action.after : action.before;
                                    if (
                                      property !== "designer" &&
                                      property !== "vendors" &&
                                      property !== "image" &&
                                      property !== "details" &&
                                      property !== "gbMonth" &&
                                      property !== "shipped"
                                    ) {
                                      return (
                                        <DataTableRow key={property + index}>
                                          <DataTableCell>{property}</DataTableCell>
                                          <DataTableCell className={action.action === "created" ? "after" : "before"}>
                                            <span className="highlight">{docData[property]}</span>
                                          </DataTableCell>
                                        </DataTableRow>
                                      );
                                    } else if (property === "designer") {
                                      return (
                                        <DataTableRow key={property + index}>
                                          <DataTableCell>{property}</DataTableCell>
                                          <DataTableCell className={action.action === "created" ? "after" : "before"}>
                                            <span className="highlight">{docData[property].join(", ")}</span>
                                          </DataTableCell>
                                        </DataTableRow>
                                      );
                                    } else if (property === "vendors") {
                                      const buildRows = () => {
                                        let rows = [];
                                        const domain = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;
                                        docData.vendors.forEach((vendor, index) => {
                                          rows.push(
                                            <DataTableRow key={vendor.name + index}>
                                              <DataTableCell>{property + index}</DataTableCell>
                                              <DataTableCell
                                                className={action.action === "created" ? "after" : "before"}
                                              >
                                                <div>
                                                  <span className="highlight">Name: {docData.vendors[index].name}</span>
                                                </div>
                                                <div>
                                                  <span className="highlight">
                                                    Region: {docData.vendors[index].region}
                                                  </span>
                                                </div>
                                                <div>
                                                  <span className="highlight">
                                                    Link:{" "}
                                                    <a
                                                      href={docData.vendors[index].storeLink}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                    >
                                                      {docData.vendors[index].storeLink.match(domain)}
                                                    </a>
                                                  </span>
                                                </div>
                                              </DataTableCell>
                                            </DataTableRow>
                                          );
                                        });
                                        return rows;
                                      };
                                      return buildRows();
                                    } else if (property === "image" || property === "details") {
                                      return (
                                        <DataTableRow key={property + index}>
                                          <DataTableCell>{property}</DataTableCell>
                                          <DataTableCell className={action.action === "created" ? "after" : "before"}>
                                            <span className="highlight">
                                              <a href={docData[property]} target="_blank" rel="noopener noreferrer">
                                                {docData[property].match(domain)}
                                              </a>
                                            </span>
                                          </DataTableCell>
                                        </DataTableRow>
                                      );
                                    } else if (property === "gbMonth" || property === "shipped") {
                                      return (
                                        <DataTableRow key={property + index}>
                                          <DataTableCell>{property}</DataTableCell>
                                          <DataTableCell className={action.action === "created" ? "after" : "before"}>
                                            <Checkbox checked={docData[property]} disabled />
                                          </DataTableCell>
                                        </DataTableRow>
                                      );
                                    }
                                  }
                                  return null;
                                })}
                                <DataTableRow>
                                  <DataTableCell>documentId</DataTableCell>
                                  <DataTableCell colSpan={2}>{action.documentId}</DataTableCell>
                                </DataTableRow>
                                <DataTableRow>
                                  <DataTableCell>changelogId</DataTableCell>
                                  <DataTableCell colSpan={2}>{action.changelogId}</DataTableCell>
                                </DataTableRow>
                                <DataTableRow>
                                  <DataTableCell>userEmail</DataTableCell>
                                  <DataTableCell colSpan={2}>{action.user.email}</DataTableCell>
                                </DataTableRow>
                              </DataTableBody>
                            </DataTableContent>
                          </DataTable>
                          <div className="button-list">
                            <Button
                              label="delete"
                              className="delete"
                              onClick={() => {
                                this.openDeleteDialog(action);
                              }}
                            />
                          </div>
                        </CollapsibleList>
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
