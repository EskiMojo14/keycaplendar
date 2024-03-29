import type { ReactNode } from "react";
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
import { Typography } from "@rmwc/typography";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import { auditProperties, auditPropertiesFormatted } from "@s/audit/constants";
import type { ActionSetType } from "@s/audit/types";
import type { KeysetDoc } from "@s/firebase/types";
import type { ProcessedPublicActionType } from "@s/history/types";
import type { VendorType } from "@s/main/types";
import { arrayIncludes, hasKey, objectKeys, ordinal } from "@s/util/functions";
import "./changelog-entry.scss";

type ChangelogEntryProps = {
  action: ProcessedPublicActionType;
};

type DataObject = {
  after?: Omit<ActionSetType, "latestEditor">;
  before?: Omit<ActionSetType, "latestEditor">;
  data?: Omit<ActionSetType, "latestEditor">;
};

const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim;

export const ChangelogEntry = ({ action }: ChangelogEntryProps) => {
  const icons = {
    created: "add_circle_outline",
    deleted: "remove_circle_outline",
    updated: "update",
  } as const;
  const arrayProps = ["designer"] as const;
  const urlProps = ["details"] as const;
  const boolProps = ["gbMonth", "shipped"] as const;
  const dateProps = ["icDate", "gbLaunch", "gbEnd"] as const;

  const data: DataObject =
    action.action === "updated"
      ? { after: action.after, before: action.before }
      : { data: action.action === "deleted" ? action.before : action.after };

  const timestamp = DateTime.fromISO(action.timestamp, { zone: "utc" });
  const formattedTimestamp = timestamp.toFormat(
    `d'${ordinal(timestamp.day)}' MMM yyyy HH:mm`
  );

  const constructRows = (
    dataObj = data,
    properties = auditProperties
  ): ReactNode => {
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
              const [domain] = useData.match(domainRegex) ?? [];
              contents = (
                <span className="highlight">
                  {arrayIncludes(urlProps, prop) && domain ? (
                    <a href={useData} rel="noreferrer" target="_blank">
                      {domain}
                    </a>
                  ) : arrayIncludes(dateProps, prop) ? (
                    DateTime.fromISO(useData, { zone: "utc" }).toFormat(
                      `d'${ordinal(
                        DateTime.fromISO(useData, { zone: "utc" }).day
                      )}' MMM yyyy`
                    )
                  ) : prop === "image" ? (
                    "<link>"
                  ) : (
                    useData
                  )}
                </span>
              );
            } else if (
              arrayIncludes(arrayProps, prop) &&
              is<string[]>(useData)
            ) {
              contents = (
                <span className="highlight">{useData.join(", ")}</span>
              );
            } else if (arrayIncludes(boolProps, prop) && is<boolean>(useData)) {
              contents = <Checkbox checked={useData} disabled />;
            } else if (prop === "sales" && is<KeysetDoc["sales"]>(useData)) {
              const [domain] = useData?.img.match(domainRegex) ?? [];
              contents = (
                <>
                  <div>
                    <span className="highlight">
                      Image:{" "}
                      <a
                        href={useData?.img}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {domain}
                      </a>
                    </span>
                  </div>
                  <div className="list-checkbox">
                    <span className="highlight">Third party:</span>{" "}
                    <Checkbox checked={useData?.thirdParty} disabled />
                  </div>
                </>
              );
            } else if (prop === "vendors" && is<VendorType[]>(useData)) {
              contents = useData.map((vendor, index) => {
                const [domain] = vendor.storeLink?.match(domainRegex) ?? [];
                return (
                  <div
                    key={vendor.name + vendor.id}
                    className="vendor-container"
                  >
                    <Typography use="subtitle2">Vendor {index + 1}</Typography>
                    <br />
                    <span className="highlight">Name: {vendor.name}</span>
                    <br />
                    <span className="highlight">Region: {vendor.region}</span>
                    <br />
                    {vendor.storeLink ? (
                      <>
                        <span className="highlight">
                          Link:{" "}
                          <a
                            href={vendor.storeLink}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {domain}
                          </a>
                        </span>
                        <br />
                      </>
                    ) : null}
                    {vendor.endDate ? (
                      <>
                        <span className="highlight">
                          End date: {vendor.endDate}
                        </span>
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
                  className={action.action === "created" ? "after" : "before"}
                  hasFormControl={
                    arrayIncludes(boolProps, prop) && is<boolean>(useData)
                  }
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
        if (
          dataObj.before &&
          dataObj.after &&
          hasKey(dataObj.before, prop) &&
          hasKey(dataObj.after, prop)
        ) {
          const {
            after: { [prop]: afterData },
            before: { [prop]: beforeData },
          } = dataObj;
          let contents: { after: ReactNode; before: ReactNode } = {
            after: null,
            before: null,
          };
          if (is<string>(beforeData) && is<string>(afterData)) {
            const [beforeDomain] = beforeData.match(domainRegex) ?? [];
            const [afterDomain] = afterData.match(domainRegex) ?? [];
            contents = {
              after: (
                <span className="highlight">
                  {arrayIncludes(urlProps, prop) && afterDomain ? (
                    <a href={afterData} rel="noreferrer" target="_blank">
                      {afterDomain}
                    </a>
                  ) : arrayIncludes(dateProps, prop) ? (
                    DateTime.fromISO(afterData, { zone: "utc" }).toFormat(
                      `d'${ordinal(
                        DateTime.fromISO(afterData, { zone: "utc" }).day
                      )}' MMM yyyy`
                    )
                  ) : prop === "image" ? (
                    "<link>"
                  ) : (
                    afterData
                  )}
                </span>
              ),
              before: (
                <span className="highlight">
                  {arrayIncludes(urlProps, prop) && beforeDomain ? (
                    <a href={beforeData} rel="noreferrer" target="_blank">
                      {beforeDomain}
                    </a>
                  ) : arrayIncludes(dateProps, prop) ? (
                    beforeData ? (
                      DateTime.fromISO(beforeData, { zone: "utc" }).toFormat(
                        `d'${ordinal(
                          DateTime.fromISO(beforeData, { zone: "utc" }).day
                        )}' MMM yyyy`
                      )
                    ) : null
                  ) : prop === "image" ? (
                    "<link>"
                  ) : (
                    beforeData
                  )}
                </span>
              ),
            };
          } else if (
            arrayIncludes(arrayProps, prop) &&
            is<string[]>(beforeData) &&
            is<string[]>(afterData)
          ) {
            contents = {
              after: <span className="highlight">{afterData.join(", ")}</span>,
              before: (
                <span className="highlight">{beforeData.join(", ")}</span>
              ),
            };
          } else if (
            arrayIncludes(boolProps, prop) &&
            is<boolean>(beforeData) &&
            is<boolean>(afterData)
          ) {
            contents = {
              after: <Checkbox checked={afterData} disabled />,
              before: <Checkbox checked={beforeData} disabled />,
            };
          } else if (
            prop === "sales" &&
            is<KeysetDoc["sales"]>(beforeData) &&
            is<KeysetDoc["sales"]>(afterData)
          ) {
            const [beforeDomain] =
              (is<string>(beforeData)
                ? beforeData
                : beforeData?.img ?? ""
              ).match(domainRegex) ?? [];
            const [afterDomain] =
              (is<string>(afterData) ? afterData : afterData?.img ?? "").match(
                domainRegex
              ) ?? [];
            contents = {
              after: (
                <>
                  <div>
                    <span className="highlight">
                      Image:{" "}
                      <a
                        href={
                          is<string>(afterData) ? afterData : afterData?.img
                        }
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {afterDomain}
                      </a>
                    </span>
                  </div>
                  {is<string>(afterData) ? null : (
                    <div className="list-checkbox">
                      <span className="highlight">Third party:</span>{" "}
                      <Checkbox checked={afterData?.thirdParty} disabled />
                    </div>
                  )}
                </>
              ),
              before: (
                <>
                  <div>
                    <span className="highlight">
                      Image:{" "}
                      <a
                        href={
                          is<string>(afterData) ? afterData : afterData?.img
                        }
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {beforeDomain}
                      </a>
                    </span>
                  </div>
                  {is<string>(beforeData) ? null : (
                    <div className="list-checkbox">
                      <span className="highlight">Third party:</span>{" "}
                      <Checkbox checked={beforeData?.thirdParty} disabled />
                    </div>
                  )}
                </>
              ),
            };
          } else if (
            prop === "vendors" &&
            is<VendorType[]>(beforeData) &&
            is<VendorType[]>(afterData)
          ) {
            const displayVendor = (vendor: VendorType, index: number) => {
              const [domain] = vendor.storeLink?.match(domainRegex) ?? [];
              return (
                <div key={vendor.name + vendor.id} className="vendor-container">
                  <Typography use="subtitle2">Vendor {index + 1}</Typography>
                  <br />
                  <span className="highlight">Name: {vendor.name}</span>
                  <br />
                  <span className="highlight">Region: {vendor.region}</span>
                  <br />
                  {vendor.storeLink ? (
                    <>
                      <span className="highlight">
                        Link:{" "}
                        <a
                          href={vendor.storeLink}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {domain}
                        </a>
                      </span>
                      <br />
                    </>
                  ) : null}
                  {vendor.endDate ? (
                    <>
                      <span className="highlight">
                        End date: {vendor.endDate}
                      </span>
                      <br />
                    </>
                  ) : null}
                </div>
              );
            };
            contents = {
              after: afterData.map((vendor, index) =>
                displayVendor(vendor, index)
              ),
              before: beforeData.map((vendor, index) =>
                displayVendor(vendor, index)
              ),
            };
          }
          return (
            <DataTableRow key={prop}>
              <DataTableCell>{auditPropertiesFormatted[prop]}</DataTableCell>
              <DataTableCell
                className="before"
                hasFormControl={
                  arrayIncludes(boolProps, prop) && is<boolean>(beforeData)
                }
              >
                {contents.before}
              </DataTableCell>
              <DataTableCell
                className="after"
                hasFormControl={
                  arrayIncludes(boolProps, prop) && is<boolean>(afterData)
                }
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
          <ListItemGraphic icon={icons[action.action]} />
          <ListItemText>
            <div className="overline">{action.action}</div>
            <ListItemPrimaryText>{action.title}</ListItemPrimaryText>
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
              <DataTableHeadCell>
                {action.action === "updated" ? "Before" : "Data"}
              </DataTableHeadCell>
              {action.action === "updated" ? (
                <DataTableHeadCell>After</DataTableHeadCell>
              ) : null}
            </DataTableRow>
          </DataTableHead>
          <DataTableBody>{constructRows()}</DataTableBody>
        </DataTableContent>
      </DataTable>
    </CollapsibleList>
  );
};
