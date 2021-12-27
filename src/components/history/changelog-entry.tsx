import { ReactNode } from "react";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import { auditProperties, auditPropertiesFormatted } from "@s/audit/constants";
import { ActionSetType } from "@s/audit/types";
import { KeysetDoc } from "@s/firebase/types";
import { ProcessedPublicActionType } from "@s/history/types";
import { VendorType } from "@s/main/types";
import { arrayIncludes, hasKey, objectKeys, ordinal } from "@s/util/functions";
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
import "./changelog-entry.scss";

type ChangelogEntryProps = {
  action: ProcessedPublicActionType;
};

type DataObject = {
  before?: Omit<ActionSetType, "latestEditor">;
  after?: Omit<ActionSetType, "latestEditor">;
  data?: Omit<ActionSetType, "latestEditor">;
};

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

  const timestamp = DateTime.fromISO(props.action.timestamp, { zone: "utc" });
  const formattedTimestamp = timestamp.toFormat(`d'${ordinal(timestamp.day)}' MMM yyyy HH:mm`);

  const constructRows = (dataObj = data, properties = auditProperties): ReactNode => {
    if (dataObj.data) {
      return objectKeys(dataObj.data)
        .sort(
          (a, b) =>
            properties.indexOf(a as keyof Omit<ActionSetType, "latestEditor">) -
            properties.indexOf(b as keyof Omit<ActionSetType, "latestEditor">)
        )
        .map((prop) => {
          if (dataObj.data) {
            const {
              data: { [prop]: useData },
            } = dataObj;
            let contents: ReactNode;
            if (is<string>(useData)) {
              const domain = useData.match(domainRegex);
              contents = (
                <span className="highlight">
                  {arrayIncludes(urlProps, prop) && domain ? (
                    <a href={useData} target="_blank" rel="noreferrer">
                      {domain[0]}
                    </a>
                  ) : arrayIncludes(dateProps, prop) ? (
                    DateTime.fromISO(useData, { zone: "utc" }).toFormat(
                      `d'${ordinal(DateTime.fromISO(useData, { zone: "utc" }).day)}' MMM yyyy`
                    )
                  ) : prop === "image" ? (
                    "<link>"
                  ) : (
                    useData
                  )}
                </span>
              );
            } else if (arrayIncludes(arrayProps, prop) && is<string[]>(useData)) {
              contents = <span className="highlight">{useData.join(", ")}</span>;
            } else if (arrayIncludes(boolProps, prop) && is<boolean>(useData)) {
              contents = <Checkbox checked={useData} disabled />;
            } else if (prop === "sales" && is<KeysetDoc["sales"]>(useData)) {
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
            } else if (prop === "vendors" && is<VendorType[]>(useData)) {
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
                  hasFormControl={arrayIncludes(boolProps, prop) && is<boolean>(useData)}
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
          const {
            before: { [prop]: beforeData },
            after: { [prop]: afterData },
          } = dataObj;
          let contents: { before: ReactNode; after: ReactNode } = { before: null, after: null };
          if (is<string>(beforeData) && is<string>(afterData)) {
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
                      DateTime.fromISO(beforeData, { zone: "utc" }).toFormat(
                        `d'${ordinal(DateTime.fromISO(beforeData, { zone: "utc" }).day)}' MMM yyyy`
                      )
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
                    DateTime.fromISO(afterData, { zone: "utc" }).toFormat(
                      `d'${ordinal(DateTime.fromISO(afterData, { zone: "utc" }).day)}' MMM yyyy`
                    )
                  ) : prop === "image" ? (
                    "<link>"
                  ) : (
                    afterData
                  )}
                </span>
              ),
            };
          } else if (arrayIncludes(arrayProps, prop) && is<string[]>(beforeData) && is<string[]>(afterData)) {
            contents = {
              before: <span className="highlight">{beforeData.join(", ")}</span>,
              after: <span className="highlight">{afterData.join(", ")}</span>,
            };
          } else if (arrayIncludes(boolProps, prop) && is<boolean>(beforeData) && is<boolean>(afterData)) {
            contents = {
              before: <Checkbox checked={beforeData} disabled />,
              after: <Checkbox checked={afterData} disabled />,
            };
          } else if (prop === "sales" && is<KeysetDoc["sales"]>(beforeData) && is<KeysetDoc["sales"]>(afterData)) {
            const beforeDomain = (is<string>(beforeData) ? beforeData : beforeData.img).match(domainRegex);
            const afterDomain = (is<string>(afterData) ? afterData : afterData.img).match(domainRegex);
            contents = {
              before: (
                <>
                  <div>
                    <span className="highlight">
                      Image:{" "}
                      <a
                        href={is<string>(afterData) ? afterData : afterData.img}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {beforeDomain ? beforeDomain[0] : null}
                      </a>
                    </span>
                  </div>
                  {is<string>(beforeData) ? null : (
                    <div className="list-checkbox">
                      <span className="highlight">Third party:</span>{" "}
                      <Checkbox checked={beforeData.thirdParty} disabled />
                    </div>
                  )}
                </>
              ),
              after: (
                <>
                  <div>
                    <span className="highlight">
                      Image:{" "}
                      <a
                        href={is<string>(afterData) ? afterData : afterData.img}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {afterDomain ? afterDomain[0] : null}
                      </a>
                    </span>
                  </div>
                  {is<string>(afterData) ? null : (
                    <div className="list-checkbox">
                      <span className="highlight">Third party:</span>{" "}
                      <Checkbox checked={afterData.thirdParty} disabled />
                    </div>
                  )}
                </>
              ),
            };
          } else if (prop === "vendors" && is<VendorType[]>(beforeData) && is<VendorType[]>(afterData)) {
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
                hasFormControl={arrayIncludes(boolProps, prop) && is<boolean>(beforeData)}
                className="before"
              >
                {contents.before}
              </DataTableCell>
              <DataTableCell
                hasFormControl={arrayIncludes(boolProps, prop) && is<boolean>(afterData)}
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
            <ListItemSecondaryText>{formattedTimestamp}</ListItemSecondaryText>
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
