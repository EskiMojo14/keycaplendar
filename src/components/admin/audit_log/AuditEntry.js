import React from "react";
import { Button } from "@rmwc/button";
import {
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
import "./AuditEntry.scss";

export const AuditEntry = (props) => {
  return (
    <CollapsibleList
      handle={
        <ListItem>
          <ListItemGraphic
            icon={
              props.action.action !== "created"
                ? props.action.action === "updated"
                  ? "update"
                  : "remove_circle_outline"
                : "add_circle_outline"
            }
          />
          <ListItemText>
            <div className="overline">{props.action.action}</div>
            <ListItemPrimaryText>
              {props.action.action !== "deleted"
                ? props.action.after.profile + " " + props.action.after.colorway
                : props.action.before.profile + " " + props.action.before.colorway}
            </ListItemPrimaryText>
            <ListItemSecondaryText>
              {props.action.user.nickname + ", " + props.timestamp.format("Do MMM YYYY HH:mm")}
            </ListItemSecondaryText>
          </ListItemText>
          <ListItemMeta icon="expand_more" />
        </ListItem>
      }
    >
      <DataTable>
        <DataTableContent>
          <DataTableHead>
            <DataTableRow>
              <DataTableHeadCell>Property</DataTableHeadCell>
              {props.action.action === "updated" ? (
                <DataTableHeadCell>Before</DataTableHeadCell>
              ) : (
                <DataTableHeadCell>Data</DataTableHeadCell>
              )}
              {props.action.action === "updated" ? <DataTableHeadCell>After</DataTableHeadCell> : null}
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {props.properties.map((property, index) => {
              const domain = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;
              if (props.action.action === "updated" && props.action.before[property] !== props.action.after[property]) {
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
                        <span className="highlight">{props.action.before[property]}</span>
                      </DataTableCell>
                      <DataTableCell className="after">
                        <span className="highlight">{props.action.after[property]}</span>
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
                  if (arrayCompare(props.action.before[property], props.action.after[property])) {
                    return (
                      <DataTableRow key={property + index}>
                        <DataTableCell>{property}</DataTableCell>
                        <DataTableCell className="before">
                          <span className="highlight">{props.action.before[property].join(", ")}</span>
                        </DataTableCell>
                        <DataTableCell className="after">
                          <span className="highlight">{props.action.after[property].join(", ")}</span>
                        </DataTableCell>
                      </DataTableRow>
                    );
                  }
                  return null;
                } else if (property === "vendors") {
                  const beforeVendors = props.action.before.vendors;

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

                  const afterVendors = props.action.after.vendors;

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
                  const moreVendors = afterVendors.length >= beforeVendors.length ? afterVendors : beforeVendors;
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
                                <span className={afterVendor.name !== beforeVendor.name ? "highlight" : ""}>
                                  Name: {beforeVendor.name}
                                </span>
                              </div>
                              <div>
                                <span className={afterVendor.region !== beforeVendor.region ? "highlight" : ""}>
                                  Region: {beforeVendor.region}
                                </span>
                              </div>
                              <div>
                                <span className={afterVendor.storeLink !== beforeVendor.storeLink ? "highlight" : ""}>
                                  Link:{" "}
                                  <a href={beforeVendor.storeLink} target="_blank" rel="noopener noreferrer">
                                    {beforeVendor.storeLink.match(domain)}
                                  </a>
                                </span>
                              </div>
                            </DataTableCell>
                            <DataTableCell className="after">
                              <div>
                                <span className={afterVendor.name !== beforeVendor.name ? "highlight" : ""}>
                                  Name: {afterVendor.name}
                                </span>
                              </div>
                              <div>
                                <span className={afterVendor.region !== beforeVendor.region ? "highlight" : ""}>
                                  Region: {afterVendor.region}
                                </span>
                              </div>
                              <div>
                                <span className={afterVendor.storeLink !== beforeVendor.storeLink ? "highlight" : ""}>
                                  Link:{" "}
                                  <a href={afterVendor.storeLink} target="_blank" rel="noopener noreferrer">
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
                          <a href={props.action.before[property]} target="_blank" rel="noopener noreferrer">
                            {props.action.before[property].match(domain)}
                          </a>
                        </span>
                      </DataTableCell>
                      <DataTableCell className="after">
                        <span className="highlight">
                          <a href={props.action.after[property]} target="_blank" rel="noopener noreferrer">
                            {props.action.after[property].match(domain)}
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
                        <Checkbox checked={props.action.before[property]} disabled />
                      </DataTableCell>
                      <DataTableCell className="after">
                        <Checkbox checked={props.action.after[property]} disabled />
                      </DataTableCell>
                    </DataTableRow>
                  );
                }
                return null;
              } else if (props.action.action === "created" || props.action.action === "deleted") {
                const docData = props.action.action === "created" ? props.action.after : props.action.before;
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
                      <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
                        <span className="highlight">{docData[property]}</span>
                      </DataTableCell>
                    </DataTableRow>
                  );
                } else if (property === "designer") {
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
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
                          <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
                            <div>
                              <span className="highlight">Name: {docData.vendors[index].name}</span>
                            </div>
                            <div>
                              <span className="highlight">Region: {docData.vendors[index].region}</span>
                            </div>
                            <div>
                              <span className="highlight">
                                Link:{" "}
                                <a href={docData.vendors[index].storeLink} target="_blank" rel="noopener noreferrer">
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
                      <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
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
                      <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
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
              <DataTableCell colSpan={2}>{props.action.documentId}</DataTableCell>
            </DataTableRow>
            <DataTableRow>
              <DataTableCell>changelogId</DataTableCell>
              <DataTableCell colSpan={2}>{props.action.changelogId}</DataTableCell>
            </DataTableRow>
            <DataTableRow>
              <DataTableCell>userEmail</DataTableCell>
              <DataTableCell colSpan={2}>{props.action.user.email}</DataTableCell>
            </DataTableRow>
          </DataTableBody>
        </DataTableContent>
      </DataTable>
      <div className="button-list">
        <Button
          label="delete"
          className="delete"
          onClick={() => {
            props.openDeleteDialog(props.action);
          }}
        />
      </div>
    </CollapsibleList>
  );
};

export default AuditEntry;
