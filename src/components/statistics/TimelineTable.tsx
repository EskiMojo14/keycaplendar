import React from "react";
import { camelise, hasKey } from "../../util/functions";
import { StatisticsType } from "../../util/types";
import {
  DataTable,
  DataTableContent,
  DataTableHead,
  DataTableRow,
  DataTableHeadCell,
  DataTableBody,
  DataTableCell,
} from "@rmwc/data-table";
import { Ripple } from "@rmwc/ripple";
import "./TimelineTable.scss";

const letters = "abcdefghijklmnopqrstuvwxyz".split("");

type TimelineTableProps = {
  monthData: {
    gbLaunch: { [key: string]: { [key: string]: string | number } };
    icDate: { [key: string]: { [key: string]: string | number } };
  };
  months: {
    gbLaunch: string[];
    icDate: string[];
  };
  profiles: string[];
  setFocus: (id: string) => void;
  statistics: StatisticsType;
};

export const TimelineTable = (props: TimelineTableProps) => {
  return (
    <DataTable className="timeline-table">
      <DataTableContent>
        <DataTableHead>
          <DataTableRow>
            <DataTableHeadCell className="right-border">Month</DataTableHeadCell>
            <DataTableHeadCell className="right-border" isNumeric>
              Sets
            </DataTableHeadCell>
            {props.profiles.map((profile, index) => {
              return (
                <Ripple key={profile}>
                  <DataTableHeadCell
                    isNumeric
                    className={"profile-title title-" + letters[index]}
                    sort={1}
                    onClick={() => {
                      props.setFocus(letters[index]);
                    }}
                  >
                    {profile}
                    <div className="profile-indicator"></div>
                  </DataTableHeadCell>
                </Ripple>
              );
            })}
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {hasKey(props.months, props.statistics.timeline)
            ? props.months[props.statistics.timeline].map((month) => {
                if (hasKey(props.monthData, props.statistics.timeline)) {
                  return (
                    <DataTableRow key={month}>
                      <DataTableCell className="right-border">{month}</DataTableCell>
                      <DataTableCell className="right-border" isNumeric>
                        {props.monthData[props.statistics.timeline][month].count}
                      </DataTableCell>
                      {props.profiles.map((profile, index) => {
                        if (hasKey(props.monthData, props.statistics.timeline)) {
                          return (
                            <DataTableCell isNumeric key={profile} className={"cell-" + letters[index]}>
                              {props.monthData[props.statistics.timeline][month][camelise(profile)]}
                            </DataTableCell>
                          );
                        }
                      })}
                    </DataTableRow>
                  );
                }
              })
            : null}
        </DataTableBody>
      </DataTableContent>
    </DataTable>
  );
};

export default TimelineTable;
