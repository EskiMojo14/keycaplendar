import classNames from "classnames";
import isEqual from "lodash.isequal";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import { auditProperties } from "@s/audit/constants";
import { ActionType } from "@s/audit/types";
import { KeysetDoc } from "@s/firebase/types";
import { alphabeticalSortProp, hasKey, ordinal } from "@s/util/functions";
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

type AuditEntryProps = {
  action: ActionType;
  openDeleteDialog: (action: ActionType) => void;
  timestamp: DateTime;
};

export const AuditEntry = (props: AuditEntryProps) => {
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
  const arrayProps: string[] = ["designer"];
  const urlProps: string[] = ["image", "details"];
  const boolProps: string[] = ["gbMonth", "shipped"];
  const icons: { [key: string]: string } = {
    created: "add_circle_outline",
    updated: "update",
    deleted: "remove_circle_outline",
  };
  return (
    <CollapsibleList
      handle={
        <ListItem>
          <ListItemGraphic icon={icons[props.action.action]} />
          <ListItemText>
            <div className="overline">{props.action.action}</div>
            <ListItemPrimaryText>
              {props.action.action !== "deleted"
                ? `${props.action.after.profile} ${props.action.after.colorway}`
                : `${props.action.before.profile} ${props.action.before.colorway}`}
            </ListItemPrimaryText>
            <ListItemSecondaryText>
              {`${props.action.user.nickname}, ${props.timestamp.toFormat(
                `d'${ordinal(props.timestamp.day)}' MMM yyyy HH:mm`
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
              <DataTableHeadCell>{props.action.action === "updated" ? "Before" : "Data"}</DataTableHeadCell>
              {props.action.action === "updated" ? <DataTableHeadCell>After</DataTableHeadCell> : null}
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>
            {auditProperties.map((property, index) => {
              const domain = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;
              if (
                props.action.action === "updated" &&
                hasKey(props.action.before, property) &&
                hasKey(props.action.after, property) &&
                ((property !== "profile" && property !== "colorway") ||
                  ((property === "profile" || property === "colorway") &&
                    !isEqual(props.action.before[property], props.action.after[property])))
              ) {
                const beforeProp: Partial<KeysetDoc>[keyof KeysetDoc] = props.action.before[property]
                  ? props.action.before[property]
                  : "";
                const afterProp: Partial<KeysetDoc>[keyof KeysetDoc] = props.action.after[property]
                  ? props.action.after[property]
                  : "";
                if (
                  !arrayProps.includes(property) &&
                  property !== "vendors" &&
                  property !== "sales" &&
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
                } else if (arrayProps.includes(property) && is<any[]>(beforeProp) && is<any[]>(afterProp)) {
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
                  const beforeVendors = alphabeticalSortProp([...props.action.before.vendors], "region");

                  const afterVendors = alphabeticalSortProp([...props.action.after.vendors], "region");

                  const moreVendors = afterVendors.length >= beforeVendors.length ? afterVendors : beforeVendors;
                  return moreVendors.map((_vendor, index) => {
                    const beforeVendor = beforeVendors[index]
                      ? beforeVendors[index]
                      : { name: "", region: "", storeLink: "" };
                    const afterVendor = afterVendors[index]
                      ? afterVendors[index]
                      : { name: "", region: "", storeLink: "" };
                    if (!isEqual(afterVendor, beforeVendor)) {
                      return (
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
                                  {beforeVendor.storeLink ? beforeVendor.storeLink.match(domain) : null}
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
                                  {afterVendor.storeLink ? afterVendor.storeLink.match(domain) : null}
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
                    return null;
                  });
                } else if (urlProps.includes(property) && is<string>(beforeProp) && is<string>(afterProp)) {
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
                        <Checkbox checked={!!beforeProp} disabled />
                      </DataTableCell>
                      <DataTableCell hasFormControl className="after">
                        <Checkbox checked={!!afterProp} disabled />
                      </DataTableCell>
                    </DataTableRow>
                  );
                } else if (
                  property === "sales" &&
                  is<KeysetDoc["sales"]>(beforeProp) &&
                  is<KeysetDoc["sales"]>(afterProp)
                ) {
                  const beforeSales = !is<string>(beforeProp) ? beforeProp.img : beforeProp;
                  const afterSales = !is<string>(afterProp) ? afterProp.img : afterProp;
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className="before">
                        <div>
                          <span
                            className={classNames({
                              highlight: beforeSales !== afterSales,
                            })}
                          >
                            Image:{" "}
                            <a href={beforeSales} target="_blank" rel="noopener noreferrer">
                              {beforeSales.match(domain)}
                            </a>
                          </span>
                        </div>
                        {!is<string>(beforeProp) ? (
                          <div className="list-checkbox">
                            Third party: <Checkbox checked={beforeProp.thirdParty} disabled />
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
                            <a href={afterSales} target="_blank" rel="noopener noreferrer">
                              {afterSales.match(domain)}
                            </a>
                          </span>
                        </div>
                        {!is<string>(afterProp) ? (
                          <div className="list-checkbox">
                            Third party: <Checkbox checked={afterProp.thirdParty} disabled />
                          </div>
                        ) : null}
                      </DataTableCell>
                    </DataTableRow>
                  );
                }
                return null;
              } else if (props.action.action === "created" || props.action.action === "deleted") {
                const docData = props.action.action === "created" ? props.action.after : props.action.before;
                const prop = hasKey(docData, property) && docData[property] ? docData[property] : "";
                if (
                  !arrayProps.includes(property) &&
                  property !== "vendors" &&
                  property !== "sales" &&
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
                } else if (arrayProps.includes(property) && is<any[]>(prop)) {
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
                        <span className="highlight">{prop.join(", ")}</span>
                      </DataTableCell>
                    </DataTableRow>
                  );
                } else if (property === "vendors" && docData.vendors) {
                  const domain = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;
                  return docData.vendors.map((vendor, index) => {
                    return (
                      <DataTableRow key={vendor.name + index}>
                        <DataTableCell>{property + index}</DataTableCell>
                        <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
                          <div>
                            <span className="highlight">ID: {vendor.id}</span>
                          </div>
                          <div>
                            <span className="highlight">Name: {vendor.name}</span>
                          </div>
                          <div>
                            <span className="highlight">Region: {vendor.region}</span>
                          </div>
                          <div>
                            <span className="highlight">
                              Link:{" "}
                              {vendor.storeLink ? (
                                <a href={vendor.storeLink} target="_blank" rel="noopener noreferrer">
                                  {vendor.storeLink.match(domain)}
                                </a>
                              ) : null}
                            </span>
                          </div>
                          {vendor.endDate ? (
                            <div>
                              <span className="highlight">End date: {vendor.endDate}</span>
                            </div>
                          ) : null}
                        </DataTableCell>
                      </DataTableRow>
                    );
                  });
                } else if (urlProps.includes(property) && is<string>(prop)) {
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
                } else if (boolProps.includes(property) && is<boolean>(prop)) {
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
                        <Checkbox checked={prop} disabled />
                      </DataTableCell>
                    </DataTableRow>
                  );
                } else if (property === "sales" && is<KeysetDoc["sales"]>(prop)) {
                  const sales = !is<string>(prop) ? prop.img : `${prop}`;
                  return (
                    <DataTableRow key={property + index}>
                      <DataTableCell>{property}</DataTableCell>
                      <DataTableCell className={props.action.action === "created" ? "after" : "before"}>
                        <div>
                          <span className="highlight">
                            Image:{" "}
                            <a href={sales} target="_blank" rel="noopener noreferrer">
                              {sales.match(domain)}
                            </a>
                          </span>
                        </div>
                        {!is<string>(prop) ? (
                          <div className="list-checkbox">
                            Third party: <Checkbox checked={prop.thirdParty} disabled />
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
