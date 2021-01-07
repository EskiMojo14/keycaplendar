import React from "react";
import PropTypes from "prop-types";
import { statisticsTypes } from "../../util/propTypeTemplates";
import { camelise } from "../../util/functions";
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

export const TimelineTable = (props) => {
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
          {props.months[props.statistics.timeline].map((month) => {
            return (
              <DataTableRow key={month}>
                <DataTableCell className="right-border">{month}</DataTableCell>
                <DataTableCell className="right-border" isNumeric>
                  {props.monthData[props.statistics.timeline][month].count}
                </DataTableCell>
                {props.profiles.map((profile, index) => {
                  return (
                    <DataTableCell isNumeric key={profile} className={"cell-" + letters[index]}>
                      {props.monthData[props.statistics.timeline][month][camelise(profile)]}
                    </DataTableCell>
                  );
                })}
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTableContent>
    </DataTable>
  );
};

export default TimelineTable;

TimelineTable.propTypes = {
  monthData: PropTypes.shape({
    gbLaunch: PropTypes.objectOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))),
    icDate: PropTypes.objectOf(PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))),
  }),
  months: PropTypes.shape({
    gbLaunch: PropTypes.arrayOf(PropTypes.string),
    icDate: PropTypes.arrayOf(PropTypes.string),
  }),
  profiles: PropTypes.arrayOf(PropTypes.string),
  setFocus: PropTypes.func,
  statistics: PropTypes.shape(statisticsTypes),
};
