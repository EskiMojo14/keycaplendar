import React from "react";
import moment from "moment";
import firebase from "./firebase";
import { Link } from "react-router-dom";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
  TopAppBarNavigationIcon,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { IconButton } from "@rmwc/icon-button";
import { CircularProgress } from "@rmwc/circular-progress";
import {
  List,
  CollapsibleList,
  ListItem,
  ListItemMeta,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText,
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
import { Tooltip } from "@rmwc/tooltip";
import "./AuditLog.scss";

export class AuditLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      actions: [],
      loading: false,
    };
  }
  getActions = () => {
    this.setState({ loading: true });
    const db = firebase.firestore();
    db.collection("changelog")
      .get()
      .then((querySnapshot) => {
        let actions = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          actions.push({
            data,
          });
        });

        actions.sort(function (a, b) {
          var x = a.data.timestamp.toLowerCase();
          var y = b.data.timestamp.toLowerCase();
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
        });
        this.setState({ loading: false });
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error getting data: " + error });
        this.setState({ loading: false });
      });
  };
  componentDidMount() {
    this.getActions();
  }
  render() {
    const refreshButton = this.state.loading ? (
      <CircularProgress />
    ) : (
      <IconButton icon="refresh" onClick={this.getActions} />
    );
    const properties = [
      "profile",
      "colorway",
      "designer",
      "icDate",
      "details",
      "gbLaunch",
      "gbEnd",
      "image",
      "shipped",
      "vendors",
    ];
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
          </TopAppBarRow>
        </TopAppBar>
        <TopAppBarFixedAdjust />
        <div className="log-container">
          <div className="log">
            <div className="log-actions">{refreshButton}</div>
            <List twoLine>
              {this.state.actions.map((action, index) => {
                const data = action.data;
                const timestamp = moment.utc(data.timestamp);
                return (
                  <CollapsibleList
                    handle={
                      <ListItem>
                        <ListItemText>
                          <ListItemPrimaryText>{data.after.profile + " " + data.after.colorway}</ListItemPrimaryText>
                          <Tooltip content={data.user.email} align="bottom" showArrow>
                            <ListItemSecondaryText>
                              {data.user.nickname + ", " + timestamp.format("Do MMM YYYY HH:mm")}
                            </ListItemSecondaryText>
                          </Tooltip>
                        </ListItemText>
                        <ListItemMeta icon="expand_more" />
                      </ListItem>
                    }
                    key={index + data.timestamp}
                  >
                    <DataTable>
                      <DataTableContent>
                        <DataTableHead>
                          <DataTableRow>
                            <DataTableHeadCell>Property</DataTableHeadCell>
                            <DataTableHeadCell>Before</DataTableHeadCell>
                            <DataTableHeadCell>After</DataTableHeadCell>
                          </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                          {properties.map((property, index) => {
                            if (data.before[property] !== data.after[property]) {
                              if (property !== "designer" && property !== "vendors") {
                                return (
                                  <DataTableRow key={property + index}>
                                    <DataTableCell>{property}</DataTableCell>
                                    <DataTableCell className="before">
                                      <span className="highlight">{data.before[property]}</span>
                                    </DataTableCell>
                                    <DataTableCell className="after">
                                      <span className="highlight">{data.after[property]}</span>
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
                                if (arrayCompare(data.before[property], data.after[property])) {
                                  return (
                                    <DataTableRow key={property + index}>
                                      <DataTableCell>{property}</DataTableCell>
                                      <DataTableCell className="before">
                                        <span className="highlight">{data.before[property].join(", ")}</span>
                                      </DataTableCell>
                                      <DataTableCell className="after">
                                        <span className="highlight">{data.after[property].join(", ")}</span>
                                      </DataTableCell>
                                    </DataTableRow>
                                  );
                                }
                                return null;
                              } else if (property === "vendors") {
                                const beforeVendors = data.before.vendors;

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

                                const afterVendors = data.after.vendors;

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
                                const buildRows = () => {
                                  let rows = [];
                                  const domain = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;
                                  afterVendors.forEach((vendor, index) => {
                                    if (!objectCompare(vendor, beforeVendors[index])) {
                                      rows.push(
                                        <DataTableRow key={vendor.name + index}>
                                          <DataTableCell>{property + index}</DataTableCell>
                                          <DataTableCell className="before">
                                            <div>
                                              <span
                                                className={vendor.name !== beforeVendors[index].name ? "highlight" : ""}
                                              >
                                                Name: {beforeVendors[index].name}
                                              </span>
                                            </div>
                                            <div>
                                              <span
                                                className={vendor.region !== beforeVendors[index].region ? "highlight" : ""}
                                              >
                                                Region: {beforeVendors[index].region}
                                              </span>
                                            </div>
                                            <div>
                                              <span
                                                className={vendor.storeLink !== beforeVendors[index].storeLink ? "highlight" : ""}
                                              >
                                                Link: <a href={beforeVendors[index].storeLink} target="_blank" rel="noopener noreferrer">{beforeVendors[index].storeLink.match(domain)}</a>
                                              </span>
                                            </div>
                                          </DataTableCell>
                                          <DataTableCell className="after">
                                            <div>
                                              <span
                                                className={vendor.name !== beforeVendors[index].name ? "highlight" : ""}
                                              >
                                                Name: {vendor.name}
                                              </span>
                                            </div>
                                            <div>
                                              <span
                                                className={vendor.region !== beforeVendors[index].region ? "highlight" : ""}
                                              >
                                                Region: {vendor.region}
                                              </span>
                                            </div>
                                            <div>
                                              <span
                                                className={vendor.storeLink !== beforeVendors[index].storeLink ? "highlight" : ""}
                                              >
                                                Link: <a href={vendor.storeLink} target="_blank" rel="noopener noreferrer">{vendor.storeLink.match(domain)}</a>
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
                              }
                              return null;
                            }
                            return null;
                          })}
                        </DataTableBody>
                      </DataTableContent>
                    </DataTable>
                  </CollapsibleList>
                );
              })}
            </List>
          </div>
        </div>
      </div>
    );
  }
}
export default AuditLog;
