import React from "react";
import moment from "moment";
import { auditProperties, auditPropertiesFormatted } from "../../util/constants";
import { arrayIncludes, hasKey } from "../../util/functions";
import { ActionSetType, ProcessedPublicActionType, VendorType } from "../../util/types";
import { Checkbox } from "@rmwc/checkbox";
import {
  DataTable,
  DataTableContent,
  DataTableHead,
  DataTableRow,
  DataTableHeadCell,
  DataTableCell,
  DataTableBody,
} from "@rmwc/data-table";
import {
  CollapsibleList,
  ListItem,
  ListItemGraphic,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemMeta,
} from "@rmwc/list";
import { Typography } from "@rmwc/typography";
import "./ChangelogEntry.scss";

type ChangelogEntryProps = {
  action: ProcessedPublicActionType;
};

type DataObject = { before?: ActionSetType; after?: ActionSetType; data?: ActionSetType };

const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;

export const ChangelogEntry = (props: ChangelogEntryProps) => {
  const icons = {
    created: "add_circle_outline",
    updated: "update",
    deleted: "remove_circle_outline",
  } as const;
  const arrayProps = ["designer"] as const;
  const urlProps = ["details"] as const;
  const boolProps = ["gbMonth", "shipped"] as const;
  const dateProps = ["icDate", "gbLaunch", "gbEnd"] as const;

  const data: DataObject =
    props.action.action === "updated"
      ? { before: props.action.before, after: props.action.after }
      : { data: props.action.action === "deleted" ? props.action.before : props.action.after };

  const timestamp = moment(props.action.timestamp, moment.ISO_8601).format("Do MMM YYYY HH:mm");

  const constructRows = (dataObj = data, properties = auditProperties): React.ReactNode => {
    if (dataObj.data) {
      return Object.keys(dataObj.data)
        .sort((a, b) => properties.indexOf(a as keyof ActionSetType) - properties.indexOf(b as keyof ActionSetType))
        .map((prop) => {
          if (dataObj.data && hasKey(dataObj.data, prop)) {
            const useData = dataObj.data[prop];
            let contents: React.ReactNode;
            if (typeof useData === "string") {
              const domain = useData.match(domainRegex);
              contents = (
                <span className="highlight">
                  {arrayIncludes(urlProps, prop) && domain ? (
                    <a href={useData} target="_blank" rel="noreferrer">
                      {domain[0]}
                    </a>
                  ) : arrayIncludes(dateProps, prop) ? (
                    moment.utc(useData, ["YYYY-MM-DD", "YYYY-MM"]).format("Do MMM YYYY")
                  ) : prop === "image" ? (
                    "<link>"
                  ) : (
                    useData
                  )}
                </span>
              );
            } else if (arrayIncludes(arrayProps, prop) && useData instanceof Array) {
              contents = <span className="highlight">{useData.join(", ")}</span>;
            } else if (arrayIncludes(boolProps, prop) && typeof useData === "boolean") {
              contents = <Checkbox checked={useData} disabled />;
            } else if (prop === "sales" && typeof useData === "object" && !(useData instanceof Array)) {
              const domain = useData.img.match(domainRegex);
              contents = (
                <>
                  <div>
                    <span className="highlight">
                      Image:{" "}
                      <a href={useData.img} target="_blank" rel="noopener noreferrer">
                        {domain ? domain[0] : null}
                      </a>
                    </span>
                  </div>
                  <div className="list-checkbox">
                    <span className="highlight">Third party:</span> <Checkbox checked={useData.thirdParty} disabled />
                  </div>
                </>
              );
            } else if (prop === "vendors" && useData instanceof Array && useData === dataObj.data.vendors) {
              contents = useData.map((vendor, index) => {
                const domain = vendor.storeLink ? vendor.storeLink.match(domainRegex) : null;
                return (
                  <div className="vendor-container" key={vendor.name + vendor.id}>
                    <Typography use="subtitle2">Vendor {index + 1}</Typography>
                    <br />
                    <span className="highlight">Name: {vendor.name}</span>
                    <br />
                    <span className="highlight">Region: {vendor.region}</span>
                    <br />
                    {vendor.storeLink ? (
                      <>
                        <span className="highlight">
                          Link:
                          <a href={vendor.storeLink} target="_blank" rel="noopener noreferrer">
                            {domain ? domain[0] : null}
                          </a>
                        </span>
                        <br />
                      </>
                    ) : null}
                    {vendor.endDate ? (
                      <>
                        <span className="highlight">End date: {vendor.endDate}</span>
                        <br />
                      </>
                    ) : null}
                  </div>
                );
              });
            }
            return (
              <DataTableRow key={prop}>
                <DataTableCell>{auditPropertiesFormatted[prop]}</DataTableCell>
                <DataTableCell
                  hasFormControl={arrayIncludes(boolProps, prop) && typeof useData === "boolean"}
                  className={props.action.action === "created" ? "after" : "before"}
                >
                  {contents}
                </DataTableCell>
              </DataTableRow>
            );
          }
          return null;
        });
    } else if (dataObj.before && dataObj.after) {
      return properties.map((prop) => {
        if (dataObj.before && dataObj.after && hasKey(dataObj.before, prop) && hasKey(dataObj.after, prop)) {
          const beforeData = dataObj.before[prop];
          const afterData = dataObj.after[prop];
          let contents: { before: React.ReactNode; after: React.ReactNode } = { before: null, after: null };
          if (typeof beforeData === "string" && typeof afterData === "string") {
            const beforeDomain = beforeData.match(domainRegex);
            const afterDomain = afterData.match(domainRegex);
            contents = {
              before: (
                <span className="highlight">
                  {arrayIncludes(urlProps, prop) && beforeDomain ? (
                    <a href={beforeData} target="_blank" rel="noreferrer">
                      {beforeDomain[0]}
                    </a>
                  ) : arrayIncludes(dateProps, prop) ? (
                    beforeData ? (
                      moment.utc(beforeData, ["YYYY-MM-DD", "YYYY-MM"]).format("Do MMM YYYY")
                    ) : null
                  ) : prop === "image" ? (
                    "<link>"
                  ) : (
                    beforeData
                  )}
                </span>
              ),
              after: (
                <span className="highlight">
                  {arrayIncludes(urlProps, prop) && afterDomain ? (
                    <a href={afterData} target="_blank" rel="noreferrer">
                      {afterDomain[0]}
                    </a>
                  ) : arrayIncludes(dateProps, prop) ? (
                    moment.utc(afterData, ["YYYY-MM-DD", "YYYY-MM"]).format("Do MMM YYYY")
                  ) : prop === "image" ? (
                    "<link>"
                  ) : (
                    afterData
                  )}
                </span>
              ),
            };
          } else if (arrayIncludes(arrayProps, prop) && beforeData instanceof Array && afterData instanceof Array) {
            contents = {
              before: <span className="highlight">{beforeData.join(", ")}</span>,
              after: <span className="highlight">{afterData.join(", ")}</span>,
            };
          } else if (
            arrayIncludes(boolProps, prop) &&
            typeof beforeData === "boolean" &&
            typeof afterData === "boolean"
          ) {
            contents = {
              before: <Checkbox checked={beforeData} disabled />,
              after: <Checkbox checked={afterData} disabled />,
            };
          } else if (
            prop === "sales" &&
            typeof beforeData === "object" &&
            !(beforeData instanceof Array) &&
            typeof afterData === "object" &&
            !(afterData instanceof Array)
          ) {
            const beforeDomain = beforeData.img.match(domainRegex);
            const afterDomain = afterData.img.match(domainRegex);
            contents = {
              before: (
                <>
                  <div>
                    <span className="highlight">
                      Image:{" "}
                      <a href={beforeData.img} target="_blank" rel="noopener noreferrer">
                        {beforeDomain ? beforeDomain[0] : null}
                      </a>
                    </span>
                  </div>
                  <div className="list-checkbox">
                    <span className="highlight">Third party:</span>{" "}
                    <Checkbox checked={beforeData.thirdParty} disabled />
                  </div>
                </>
              ),
              after: (
                <>
                  <div>
                    <span className="highlight">
                      Image:{" "}
                      <a href={afterData.img} target="_blank" rel="noopener noreferrer">
                        {afterDomain ? afterDomain[0] : null}
                      </a>
                    </span>
                  </div>
                  <div className="list-checkbox">
                    <span className="highlight">Third party:</span> <Checkbox checked={afterData.thirdParty} disabled />
                  </div>
                </>
              ),
            };
          } else if (
            prop === "vendors" &&
            beforeData instanceof Array &&
            beforeData === dataObj.before.vendors &&
            afterData instanceof Array &&
            afterData === dataObj.after.vendors
          ) {
            const displayVendor = (vendor: VendorType, index: number) => {
              const domain = vendor.storeLink ? vendor.storeLink.match(domainRegex) : null;
              return (
                <div className="vendor-container" key={vendor.name + vendor.id}>
                  <Typography use="subtitle2">Vendor {index + 1}</Typography>
                  <br />
                  <span className="highlight">Name: {vendor.name}</span>
                  <br />
                  <span className="highlight">Region: {vendor.region}</span>
                  <br />
                  {vendor.storeLink ? (
                    <>
                      <span className="highlight">
                        Link:
                        <a href={vendor.storeLink} target="_blank" rel="noopener noreferrer">
                          {domain ? domain[0] : null}
                        </a>
                      </span>
                      <br />
                    </>
                  ) : null}
                  {vendor.endDate ? (
                    <>
                      <span className="highlight">End date: {vendor.endDate}</span>
                      <br />
                    </>
                  ) : null}
                </div>
              );
            };
            contents = {
              before: beforeData.map((vendor, index) => displayVendor(vendor, index)),
              after: afterData.map((vendor, index) => displayVendor(vendor, index)),
            };
          }
          return (
            <DataTableRow key={prop}>
              <DataTableCell>{auditPropertiesFormatted[prop]}</DataTableCell>
              <DataTableCell
                hasFormControl={arrayIncludes(boolProps, prop) && typeof beforeData === "boolean"}
                className="before"
              >
                {contents.before}
              </DataTableCell>
              <DataTableCell
                hasFormControl={arrayIncludes(boolProps, prop) && typeof afterData === "boolean"}
                className="after"
              >
                {contents.after}
              </DataTableCell>
            </DataTableRow>
          );
        }
        return null;
      });
    }
  };
  return (
    <CollapsibleList
      className="changelog-entry"
      handle={
        <ListItem>
          <ListItemGraphic icon={icons[props.action.action]} />
          <ListItemText>
            <div className="overline">{props.action.action}</div>
            <ListItemPrimaryText>{props.action.title}</ListItemPrimaryText>
            <ListItemSecondaryText>{`${props.action.user}, ${timestamp}`}</ListItemSecondaryText>
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
          <DataTableBody>{constructRows()}</DataTableBody>
        </DataTableContent>
      </DataTable>
    </CollapsibleList>
  );
};
