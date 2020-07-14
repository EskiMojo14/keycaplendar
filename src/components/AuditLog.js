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
      "gbMonth",
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
                        <ListItemGraphic
                          icon={
                            data.before
                              ? data.after.profile
                                ? "update"
                                : "remove_circle_outline"
                              : "add_circle_outline"
                          }
                        />
                        <ListItemText>
                          <div className="overline">
                            {data.before ? (data.after.profile ? "Updated" : "Deleted") : "Created"}
                          </div>
                          <ListItemPrimaryText>
                            {data.after.profile
                              ? data.after.profile + " " + data.after.colorway
                              : data.before.profile + " " + data.before.colorway}
                          </ListItemPrimaryText>
                          <ListItemSecondaryText>
                            {data.user.nickname + ", " + timestamp.format("Do MMM YYYY HH:mm")}
                          </ListItemSecondaryText>
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
                            {data.before && data.after.profile ? (
                              <DataTableHeadCell>Before</DataTableHeadCell>
                            ) : (
                              <DataTableHeadCell>Data</DataTableHeadCell>
                            )}
                            {data.before && data.after.profile ? <DataTableHeadCell>After</DataTableHeadCell> : null}
                          </DataTableRow>
                        </DataTableHead>
                        <DataTableBody>
                          {properties.map((property, index) => {
                            const domain = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;
                            if (data.before && data.after.profile && data.before[property] !== data.after[property]) {
                              // updated
                              if (
                                property !== "designer" &&
                                property !== "vendors" &&
                                property !== "image" &&
                                property !== "gbMonth" &&
                                property !== "shipped"
                              ) {
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
                                                className={afterVendor.name !== beforeVendor.name ? "highlight" : ""}
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
                                                  afterVendor.storeLink !== beforeVendor.storeLink ? "highlight" : ""
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
                                                className={afterVendor.name !== beforeVendor.name ? "highlight" : ""}
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
                                                  afterVendor.storeLink !== beforeVendor.storeLink ? "highlight" : ""
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
                              } else if (property === "image") {
                                return (
                                  <DataTableRow key={property + index} className="image-row">
                                    <DataTableCell>{property}</DataTableCell>
                                    <DataTableCell className="before">
                                      <span className="highlight">{data.before.image.match(domain)}</span>
                                    </DataTableCell>
                                    <DataTableCell className="after">
                                      <span className="highlight">{data.before.image.match(domain)}</span>
                                    </DataTableCell>
                                  </DataTableRow>
                                );
                              } else if (property === "gbMonth" || property === "shipped") {
                                return (
                                  <DataTableRow key={property + index} className="image-row">
                                    <DataTableCell>{property}</DataTableCell>
                                    <DataTableCell className="before">
                                      <Checkbox checked={data.before[property]} disabled />
                                    </DataTableCell>
                                    <DataTableCell className="after">
                                      <Checkbox checked={data.after[property]} disabled />
                                    </DataTableCell>
                                  </DataTableRow>
                                );
                              }
                              return null;
                            } else if (!data.before || !data.after.profile) {
                              //created or deleted
                              const docData = !data.before ? data.after : data.before;
                              // updated
                              if (
                                property !== "designer" &&
                                property !== "vendors" &&
                                property !== "image" &&
                                property !== "gbMonth" &&
                                property !== "shipped"
                              ) {
                                return (
                                  <DataTableRow key={property + index}>
                                    <DataTableCell>{property}</DataTableCell>
                                    <DataTableCell className={!data.before ? "after" : "before"}>
                                      <span className="highlight">{docData[property]}</span>
                                    </DataTableCell>
                                  </DataTableRow>
                                );
                              } else if (property === "designer") {
                                return (
                                  <DataTableRow key={property + index}>
                                    <DataTableCell>{property}</DataTableCell>
                                    <DataTableCell className={!data.before ? "after" : "before"}>
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
                                        <DataTableCell className={!data.before ? "after" : "before"}>
                                          <div>
                                            <span className="highlight">Name: {docData.vendors[index].name}</span>
                                          </div>
                                          <div>
                                            <span className="highlight">Region: {docData.vendors[index].region}</span>
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
                              } else if (property === "image") {
                                return (
                                  <DataTableRow key={property + index}>
                                    <DataTableCell>{property}</DataTableCell>
                                    <DataTableCell className={!data.before ? "after" : "before"}>
                                      <span className="highlight">{docData.image.match(domain)}</span>
                                    </DataTableCell>
                                  </DataTableRow>
                                );
                              } else if (property === "gbMonth" || property === "shipped") {
                                return (
                                  <DataTableRow key={property + index} className="image-row">
                                    <DataTableCell>{property}</DataTableCell>
                                    <DataTableCell>
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
                            <DataTableCell colSpan={2}>{data.documentId}</DataTableCell>
                          </DataTableRow>
                          <DataTableRow>
                            <DataTableCell>userEmail</DataTableCell>
                            <DataTableCell colSpan={2}>{data.user.email}</DataTableCell>
                          </DataTableRow>
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
