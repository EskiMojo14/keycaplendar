import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import isEqual from "lodash.isequal";
import { actionTypes } from "../../util/propTypeTemplates";
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
  const documentRow = (
    <DataTableRow>
      <DataTableCell>documentId</DataTableCell>
      <DataTableCell colSpan={props.action.action === "created" ? 1 : 2}>{props.action.documentId}</DataTableCell>
    </DataTableRow>
  );
  const changelogRow = (
    <DataTableRow>
      <DataTableCell>changelogId</DataTableCell>
      <DataTableCell colSpan={props.action.action === "created" ? 1 : 2}>{props.action.changelogId}</DataTableCell>
    </DataTableRow>
  );
  const emailRow = props.action.user.email ? (
    <DataTableRow>
      <DataTableCell>userEmail</DataTableCell>
      <DataTableCell colSpan={props.action.action === "created" ? 1 : 2}>{props.action.user.email}</DataTableCell>
    </DataTableRow>
  ) : null;
  const arrayProps = ["designer"];
  const urlProps = ["image", "details", "sales"];
  const boolProps = ["gbMonth", "shipped"];
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
                ? `${props.action.after.profile} ${props.action.after.colorway}`
                : `${props.action.before.profile} ${props.action.before.colorway}`}
            </ListItemPrimaryText>
            <ListItemSecondaryText>
              {`${props.action.user.nickname}, ${props.timestamp.format("Do MMM YYYY HH:mm")}`}
            </ListItemSecondaryText>
          </ListItemText>
          <ListItemMeta icon="expand_more" />
        </ListItem>
      }
    >
      <DataTable className="rounded">
        <DataTableContent>
          <DataTableHead>
            <DataTableRow>
              <DataTableHeadCell>Property</DataTableHeadCell>
              <DataTableHeadCell>{props.action.action === "updated" ? "Before" : "Data"}</DataTableHeadCell>
              {props.action.action === "updated" ? <DataTableHeadCell>After</DataTableHeadCell> : null}
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {props.properties.map((property, index) => {
              const domain = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;
              if (
                props.action.action === "updated" &&
                isEqual(props.action.before[property], props.action.after[property])
              ) {
                const beforeProp = props.action.before[property] ? props.action.before[property] : "";
                const afterProp = props.action.after[property] ? props.action.after[property] : "";
                if (
                  !arrayProps.includes(property) &&
                  property !== "vendors" &&
                  !urlProps.includes(property) &&
                  !boolProps.includes(property)
                ) {
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className="before">
                        <span className="highlight">{beforeProp}</span>
                      </DataTableCell>
                      <DataTableCell className="after">
                        <span className="highlight">{afterProp}</span>
                      </DataTableCell>
                    </DataTableRow>
                  );
                } else if (arrayProps.includes(property) && beforeProp && afterProp) {
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className="before">
                        <span className="highlight">{beforeProp.join(", ")}</span>
                      </DataTableCell>
                      <DataTableCell className="after">
                        <span className="highlight">{afterProp.join(", ")}</span>
                      </DataTableCell>
                    </DataTableRow>
                  );
                } else if (property === "vendors" && props.action.before.vendors && props.action.after.vendors) {
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
                                <span className={classNames({ highlight: afterVendor.id !== beforeVendor.id })}>
                                  ID: {beforeVendor.id}
                                </span>
                              </div>
                              <div>
                                <span className={classNames({ highlight: afterVendor.name !== beforeVendor.name })}>
                                  Name: {beforeVendor.name}
                                </span>
                              </div>
                              <div>
                                <span className={classNames({ highlight: afterVendor.region !== beforeVendor.region })}>
                                  Region: {beforeVendor.region}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={classNames({
                                    highlight: afterVendor.storeLink !== beforeVendor.storeLink,
                                  })}
                                >
                                  Link:{" "}
                                  <a href={beforeVendor.storeLink} target="_blank" rel="noopener noreferrer">
                                    {beforeVendor.storeLink.match(domain)}
                                  </a>
                                </span>
                              </div>
                              {beforeVendor.endDate ? (
                                <div>
                                  <span
                                    className={classNames({ highlight: afterVendor.endDate !== beforeVendor.endDate })}
                                  >
                                    End date: {beforeVendor.endDate}
                                  </span>
                                </div>
                              ) : null}
                            </DataTableCell>
                            <DataTableCell className="after">
                              <div>
                                <span className={classNames({ highlight: afterVendor.id !== beforeVendor.id })}>
                                  ID: {afterVendor.id}
                                </span>
                              </div>
                              <div>
                                <span className={classNames({ highlight: afterVendor.name !== beforeVendor.name })}>
                                  Name: {afterVendor.name}
                                </span>
                              </div>
                              <div>
                                <span className={classNames({ highlight: afterVendor.region !== beforeVendor.region })}>
                                  Region: {afterVendor.region}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={classNames({
                                    highlight: afterVendor.storeLink !== beforeVendor.storeLink,
                                  })}
                                >
                                  Link:{" "}
                                  <a href={afterVendor.storeLink} target="_blank" rel="noopener noreferrer">
                                    {afterVendor.storeLink.match(domain)}
                                  </a>
                                </span>
                              </div>
                              {afterVendor.endDate ? (
                                <div>
                                  <span
                                    className={classNames({ highlight: afterVendor.endDate !== beforeVendor.endDate })}
                                  >
                                    End date: {afterVendor.endDate}
                                  </span>
                                </div>
                              ) : null}
                            </DataTableCell>
                          </DataTableRow>
                        );
                      }
                    });
                    return rows;
                  };
                  return buildRows();
                } else if (urlProps.includes(property)) {
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className="before">
                        <span className="highlight">
                          <a href={beforeProp} target="_blank" rel="noopener noreferrer">
                            {beforeProp.match(domain)}
                          </a>
                        </span>
                      </DataTableCell>
                      <DataTableCell className="after">
                        <span className="highlight">
                          <a href={afterProp} target="_blank" rel="noopener noreferrer">
                            {afterProp.match(domain)}
                          </a>
                        </span>
                      </DataTableCell>
                    </DataTableRow>
                  );
                } else if (boolProps.includes(property)) {
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell hasFormControl className="before">
                        <Checkbox checked={beforeProp} disabled />
                      </DataTableCell>
                      <DataTableCell hasFormControl className="after">
                        <Checkbox checked={afterProp} disabled />
                      </DataTableCell>
                    </DataTableRow>
                  );
                }
                return null;
              } else if (props.action.action === "created" || props.action.action === "deleted") {
                const docData = props.action.action === "created" ? props.action.after : props.action.before;
                const prop = docData[property] ? docData[property] : "";
                if (
                  !arrayProps.includes(property) &&
                  property !== "vendors" &&
                  !urlProps.includes(property) &&
                  !boolProps.includes(property)
                ) {
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
                        <span className="highlight">{prop}</span>
                      </DataTableCell>
                    </DataTableRow>
                  );
                } else if (arrayProps.includes(property) && prop) {
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
                        <span className="highlight">{prop.join(", ")}</span>
                      </DataTableCell>
                    </DataTableRow>
                  );
                } else if (property === "vendors" && docData.vendors) {
                  const buildRows = () => {
                    let rows = [];
                    const domain = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;
                    docData.vendors.forEach((vendor, index) => {
                      rows.push(
                        <DataTableRow key={vendor.name + index}>
                          <DataTableCell>{property + index}</DataTableCell>
                          <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
                            <div>
                              <span className="highlight">ID: {docData.vendors[index].id}</span>
                            </div>
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
                            {docData.vendors[index].endDate ? (
                              <div>
                                <span className="highlight">End date: {docData.vendors[index].endDate}</span>
                              </div>
                            ) : null}
                          </DataTableCell>
                        </DataTableRow>
                      );
                    });
                    return rows;
                  };
                  return buildRows();
                } else if (urlProps.includes(property)) {
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
                        <span className="highlight">
                          <a href={prop} target="_blank" rel="noopener noreferrer">
                            {prop.match(domain)}
                          </a>
                        </span>
                      </DataTableCell>
                    </DataTableRow>
                  );
                } else if (boolProps.includes(property)) {
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
                        <Checkbox checked={prop} disabled />
                      </DataTableCell>
                    </DataTableRow>
                  );
                }
              }
              return null;
            })}
            {documentRow}
            {changelogRow}
            {emailRow}
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

AuditEntry.propTypes = {
  action: PropTypes.shape(actionTypes),
  openDeleteDialog: PropTypes.func,
  properties: PropTypes.arrayOf(PropTypes.string),
  timestamp: PropTypes.shape({
    format: PropTypes.func.isRequired,
  }),
};
