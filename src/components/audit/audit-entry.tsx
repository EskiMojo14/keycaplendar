import type { EntityId } from "@reduxjs/toolkit";
import { Button } from "@rmwc/button";
import { Checkbox } from "@rmwc/checkbox";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableContent,
  DataTableHead,
  DataTableHeadCell,
  DataTableRow,
} from "@rmwc/data-table";
import {
  CollapsibleList,
  ListItem,
  ListItemGraphic,
  ListItemMeta,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from "@rmwc/list";
import classNames from "classnames";
import isEqual from "lodash.isequal";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import { useAppSelector } from "~/app/hooks";
import { selectActionById } from "@s/audit";
import { auditProperties } from "@s/audit/constants";
import type { KeysetDoc } from "@s/firebase/types";
import { alphabeticalSortProp, hasKey, ordinal } from "@s/util/functions";
import "./audit-entry.scss";

type AuditEntryProps = {
  actionId: EntityId;
  openDeleteDialog: (action: EntityId) => void;
};

export const AuditEntry = ({ actionId, openDeleteDialog }: AuditEntryProps) => {
  const action = useAppSelector((state) => selectActionById(state, actionId));

  if (action) {
    const timestamp = DateTime.fromISO(action.timestamp);
    const documentRow = (
      <DataTableRow>
        <DataTableCell>documentId</DataTableCell>
        <DataTableCell colSpan={action.action === "created" ? 1 : 2}>
          {action.documentId}
        </DataTableCell>
      </DataTableRow>
    );
    const changelogRow = (
      <DataTableRow>
        <DataTableCell>changelogId</DataTableCell>
        <DataTableCell colSpan={action.action === "created" ? 1 : 2}>
          {action.changelogId}
        </DataTableCell>
      </DataTableRow>
    );
    const emailRow = action.user.email ? (
      <DataTableRow>
        <DataTableCell>userEmail</DataTableCell>
        <DataTableCell colSpan={action.action === "created" ? 1 : 2}>
          {action.user.email}
        </DataTableCell>
      </DataTableRow>
    ) : null;
    const arrayProps: string[] = ["designer"];
    const urlProps: string[] = ["image", "details"];
    const boolProps: string[] = ["gbMonth", "shipped"];
    const icons: Record<string, string> = {
      created: "add_circle_outline",
      deleted: "remove_circle_outline",
      updated: "update",
    };
    return (
      <CollapsibleList
        handle={
          <ListItem>
            <ListItemGraphic icon={icons[action.action]} />
            <ListItemText>
              <div className="overline">{action.action}</div>
              <ListItemPrimaryText>
                {action.action !== "deleted"
                  ? `${action.after.profile} ${action.after.colorway}`
                  : `${action.before.profile} ${action.before.colorway}`}
              </ListItemPrimaryText>
              <ListItemSecondaryText>
                {`${action.user.nickname}, ${timestamp.toFormat(
                  `d'${ordinal(timestamp.day)}' MMM yyyy HH:mm`
                )}`}
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
                <DataTableHeadCell>
                  {action.action === "updated" ? "Before" : "Data"}
                </DataTableHeadCell>
                {action.action === "updated" ? (
                  <DataTableHeadCell>After</DataTableHeadCell>
                ) : null}
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {auditProperties.map((property) => {
                const domain =
                  /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;
                if (
                  action.action === "updated" &&
                  (hasKey(action.before, property) ||
                    hasKey(action.after, property)) &&
                  ((property !== "profile" && property !== "colorway") ||
                    ((property === "profile" || property === "colorway") &&
                      !isEqual(
                        action.before[property],
                        action.after[property]
                      )))
                ) {
                  const beforeProp = action.before[property] ?? "";
                  const afterProp = action.after[property] ?? "";
                  if (
                    !arrayProps.includes(property) &&
                    property !== "vendors" &&
                    property !== "sales" &&
                    !urlProps.includes(property) &&
                    !boolProps.includes(property)
                  ) {
                    return (
                      <DataTableRow key={property}>
                        <DataTableCell>{property}</DataTableCell>
                        <DataTableCell className="before">
                          <span className="highlight">{beforeProp}</span>
                        </DataTableCell>
                        <DataTableCell className="after">
                          <span className="highlight">{afterProp}</span>
                        </DataTableCell>
                      </DataTableRow>
                    );
                  } else if (
                    arrayProps.includes(property) &&
                    is<any[]>(beforeProp) &&
                    is<any[]>(afterProp)
                  ) {
                    return (
                      <DataTableRow key={property}>
                        <DataTableCell>{property}</DataTableCell>
                        <DataTableCell className="before">
                          <span className="highlight">
                            {beforeProp.join(", ")}
                          </span>
                        </DataTableCell>
                        <DataTableCell className="after">
                          <span className="highlight">
                            {afterProp.join(", ")}
                          </span>
                        </DataTableCell>
                      </DataTableRow>
                    );
                  } else if (
                    property === "vendors" &&
                    action.before.vendors &&
                    action.after.vendors
                  ) {
                    const beforeVendors = alphabeticalSortProp(
                      [...action.before.vendors],
                      "region"
                    );

                    const afterVendors = alphabeticalSortProp(
                      [...action.after.vendors],
                      "region"
                    );

                    const moreVendors =
                      afterVendors.length >= beforeVendors.length
                        ? afterVendors
                        : beforeVendors;
                    return moreVendors.map((_vendor, index) => {
                      const beforeVendor = beforeVendors[index]
                        ? beforeVendors[index]
                        : { name: "", region: "", storeLink: "" };
                      const afterVendor = afterVendors[index]
                        ? afterVendors[index]
                        : { name: "", region: "", storeLink: "" };
                      if (!isEqual(afterVendor, beforeVendor)) {
                        return (
                          <DataTableRow key={afterVendor.name}>
                            <DataTableCell>{property + index}</DataTableCell>
                            <DataTableCell className="before">
                              <div>
                                <span
                                  className={classNames({
                                    highlight:
                                      afterVendor.id !== beforeVendor.id,
                                  })}
                                >
                                  ID: {beforeVendor.id}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={classNames({
                                    highlight:
                                      afterVendor.name !== beforeVendor.name,
                                  })}
                                >
                                  Name: {beforeVendor.name}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={classNames({
                                    highlight:
                                      afterVendor.region !==
                                      beforeVendor.region,
                                  })}
                                >
                                  Region: {beforeVendor.region}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={classNames({
                                    highlight:
                                      afterVendor.storeLink !==
                                      beforeVendor.storeLink,
                                  })}
                                >
                                  Link:{" "}
                                  <a
                                    href={beforeVendor.storeLink}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                  >
                                    {beforeVendor.storeLink
                                      ? beforeVendor.storeLink.match(domain)
                                      : null}
                                  </a>
                                </span>
                              </div>
                              {beforeVendor.endDate ? (
                                <div>
                                  <span
                                    className={classNames({
                                      highlight:
                                        afterVendor.endDate !==
                                        beforeVendor.endDate,
                                    })}
                                  >
                                    End date: {beforeVendor.endDate}
                                  </span>
                                </div>
                              ) : null}
                            </DataTableCell>
                            <DataTableCell className="after">
                              <div>
                                <span
                                  className={classNames({
                                    highlight:
                                      afterVendor.id !== beforeVendor.id,
                                  })}
                                >
                                  ID: {afterVendor.id}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={classNames({
                                    highlight:
                                      afterVendor.name !== beforeVendor.name,
                                  })}
                                >
                                  Name: {afterVendor.name}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={classNames({
                                    highlight:
                                      afterVendor.region !==
                                      beforeVendor.region,
                                  })}
                                >
                                  Region: {afterVendor.region}
                                </span>
                              </div>
                              <div>
                                <span
                                  className={classNames({
                                    highlight:
                                      afterVendor.storeLink !==
                                      beforeVendor.storeLink,
                                  })}
                                >
                                  Link:{" "}
                                  <a
                                    href={afterVendor.storeLink}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                  >
                                    {afterVendor.storeLink
                                      ? afterVendor.storeLink.match(domain)
                                      : null}
                                  </a>
                                </span>
                              </div>
                              {afterVendor.endDate ? (
                                <div>
                                  <span
                                    className={classNames({
                                      highlight:
                                        afterVendor.endDate !==
                                        beforeVendor.endDate,
                                    })}
                                  >
                                    End date: {afterVendor.endDate}
                                  </span>
                                </div>
                              ) : null}
                            </DataTableCell>
                          </DataTableRow>
                        );
                      }
                      return null;
                    });
                  } else if (
                    urlProps.includes(property) &&
                    is<string>(beforeProp) &&
                    is<string>(afterProp)
                  ) {
                    return (
                      <DataTableRow key={property}>
                        <DataTableCell>{property}</DataTableCell>
                        <DataTableCell className="before">
                          <span className="highlight">
                            <a
                              href={beforeProp}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {beforeProp.match(domain)}
                            </a>
                          </span>
                        </DataTableCell>
                        <DataTableCell className="after">
                          <span className="highlight">
                            <a
                              href={afterProp}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {afterProp.match(domain)}
                            </a>
                          </span>
                        </DataTableCell>
                      </DataTableRow>
                    );
                  } else if (boolProps.includes(property)) {
                    return (
                      <DataTableRow key={property}>
                        <DataTableCell>{property}</DataTableCell>
                        <DataTableCell className="before" hasFormControl>
                          <Checkbox checked={!!beforeProp} disabled />
                        </DataTableCell>
                        <DataTableCell className="after" hasFormControl>
                          <Checkbox checked={!!afterProp} disabled />
                        </DataTableCell>
                      </DataTableRow>
                    );
                  } else if (
                    property === "sales" &&
                    is<KeysetDoc["sales"]>(beforeProp) &&
                    is<KeysetDoc["sales"]>(afterProp)
                  ) {
                    const beforeSales = !is<string>(beforeProp)
                      ? beforeProp.img
                      : beforeProp;
                    const afterSales = !is<string>(afterProp)
                      ? afterProp.img
                      : afterProp;
                    return (
                      <DataTableRow key={property}>
                        <DataTableCell>{property}</DataTableCell>
                        <DataTableCell className="before">
                          <div>
                            <span
                              className={classNames({
                                highlight: beforeSales !== afterSales,
                              })}
                            >
                              Image:{" "}
                              <a
                                href={beforeSales}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                {beforeSales.match(domain)}
                              </a>
                            </span>
                          </div>
                          {!is<string>(beforeProp) ? (
                            <div className="list-checkbox">
                              Third party:{" "}
                              <Checkbox
                                checked={beforeProp.thirdParty}
                                disabled
                              />
                            </div>
                          ) : null}
                        </DataTableCell>
                        <DataTableCell className="after">
                          <div>
                            <span
                              className={classNames({
                                highlight: beforeSales !== afterSales,
                              })}
                            >
                              Image:{" "}
                              <a
                                href={afterSales}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                {afterSales.match(domain)}
                              </a>
                            </span>
                          </div>
                          {!is<string>(afterProp) ? (
                            <div className="list-checkbox">
                              Third party:{" "}
                              <Checkbox
                                checked={afterProp.thirdParty}
                                disabled
                              />
                            </div>
                          ) : null}
                        </DataTableCell>
                      </DataTableRow>
                    );
                  }
                  return null;
                } else if (
                  action.action === "created" ||
                  action.action === "deleted"
                ) {
                  const docData =
                    action.action === "created" ? action.after : action.before;
                  const prop = docData[property] ?? "";
                  if (
                    !arrayProps.includes(property) &&
                    property !== "vendors" &&
                    property !== "sales" &&
                    !urlProps.includes(property) &&
                    !boolProps.includes(property)
                  ) {
                    return (
                      <DataTableRow key={property}>
                        <DataTableCell>{property}</DataTableCell>
                        <DataTableCell
                          className={
                            action.action === "created" ? "after" : "before"
                          }
                        >
                          <span className="highlight">{prop}</span>
                        </DataTableCell>
                      </DataTableRow>
                    );
                  } else if (arrayProps.includes(property) && is<any[]>(prop)) {
                    return (
                      <DataTableRow key={property}>
                        <DataTableCell>{property}</DataTableCell>
                        <DataTableCell
                          className={
                            action.action === "created" ? "after" : "before"
                          }
                        >
                          <span className="highlight">{prop.join(", ")}</span>
                        </DataTableCell>
                      </DataTableRow>
                    );
                  } else if (property === "vendors" && docData.vendors) {
                    const domain =
                      /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;
                    return docData.vendors.map((vendor, index) => (
                      <DataTableRow key={vendor.name}>
                        <DataTableCell>{property + index}</DataTableCell>
                        <DataTableCell
                          className={
                            action.action === "created" ? "after" : "before"
                          }
                        >
                          <div>
                            <span className="highlight">ID: {vendor.id}</span>
                          </div>
                          <div>
                            <span className="highlight">
                              Name: {vendor.name}
                            </span>
                          </div>
                          <div>
                            <span className="highlight">
                              Region: {vendor.region}
                            </span>
                          </div>
                          <div>
                            <span className="highlight">
                              Link:{" "}
                              {vendor.storeLink ? (
                                <a
                                  href={vendor.storeLink}
                                  rel="noopener noreferrer"
                                  target="_blank"
                                >
                                  {vendor.storeLink.match(domain)}
                                </a>
                              ) : null}
                            </span>
                          </div>
                          {vendor.endDate ? (
                            <div>
                              <span className="highlight">
                                End date: {vendor.endDate}
                              </span>
                            </div>
                          ) : null}
                        </DataTableCell>
                      </DataTableRow>
                    ));
                  } else if (urlProps.includes(property) && is<string>(prop)) {
                    return (
                      <DataTableRow key={property}>
                        <DataTableCell>{property}</DataTableCell>
                        <DataTableCell
                          className={
                            action.action === "created" ? "after" : "before"
                          }
                        >
                          <span className="highlight">
                            <a
                              href={prop}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              {prop.match(domain)}
                            </a>
                          </span>
                        </DataTableCell>
                      </DataTableRow>
                    );
                  } else if (
                    boolProps.includes(property) &&
                    is<boolean>(prop)
                  ) {
                    return (
                      <DataTableRow key={property}>
                        <DataTableCell>{property}</DataTableCell>
                        <DataTableCell
                          className={
                            action.action === "created" ? "after" : "before"
                          }
                        >
                          <Checkbox checked={prop} disabled />
                        </DataTableCell>
                      </DataTableRow>
                    );
                  } else if (
                    property === "sales" &&
                    is<KeysetDoc["sales"]>(prop)
                  ) {
                    const sales = !is<string>(prop) ? prop.img : `${prop}`;
                    return (
                      <DataTableRow key={property}>
                        <DataTableCell>{property}</DataTableCell>
                        <DataTableCell
                          className={
                            action.action === "created" ? "after" : "before"
                          }
                        >
                          <div>
                            <span className="highlight">
                              Image:{" "}
                              <a
                                href={sales}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                {sales.match(domain)}
                              </a>
                            </span>
                          </div>
                          {!is<string>(prop) ? (
                            <div className="list-checkbox">
                              Third party:{" "}
                              <Checkbox checked={prop.thirdParty} disabled />
                            </div>
                          ) : null}
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
            className="delete"
            label="delete"
            onClick={() => openDeleteDialog(actionId)}
          />
        </div>
      </CollapsibleList>
    );
  }
  return null;
};

export default AuditEntry;
