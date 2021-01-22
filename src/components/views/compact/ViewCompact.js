import React from "react";
import PropTypes from "prop-types";
import { format, isThisYear, isSameYear, isPast, isBefore } from "date-fns";
import { setTypes } from "../../../util/propTypeTemplates";
import { Card } from "@rmwc/card";
import { List } from "@rmwc/list";
import { ElementCompact } from "./ElementCompact";
import "./ViewCompact.scss";

export const ViewCompact = (props) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setUTCDate(today.getUTCDate() - 1);
  return (
    <Card>
      <List twoLine>
        {props.sets.map((set, index) => {
          const gbLaunch = set.gbLaunch.includes("Q") || !set.gbLaunch ? set.gbLaunch : new Date(set.gbLaunch);
          const gbEnd = new Date(set.gbEnd);
          gbEnd.setUTCHours(23, 59, 59, 999);
          const icDate = new Date(set.icDate);
          const title = `${set.profile} ${set.colorway}`;
          let subtitle;
          if (set.gbLaunch && set.gbEnd) {
            subtitle = `${format(gbLaunch, "do\xa0MMM")}${
              (!isThisYear(gbLaunch) && !isSameYear(gbLaunch, gbEnd)) || !isSameYear(gbLaunch, gbEnd)
                ? format(gbLaunch, "\xa0yyyy")
                : ""
            } until ${format(gbEnd, "do\xa0MMM")}${
              !isThisYear(gbEnd) || !isSameYear(gbLaunch, gbEnd) ? format(gbEnd, "\xa0yyyy") : ""
            }`;
          } else if (set.gbLaunch.includes("Q")) {
            subtitle = "GB expected " + gbLaunch;
          } else if (set.gbMonth && set.gbLaunch) {
            subtitle = `GB expected ${
              format(gbLaunch, "MMMM") + (!isThisYear(gbLaunch) ? format(gbLaunch, "\xa0yyyy") : "")
            }`;
          } else if (set.gbLaunch) {
            subtitle = `${format(gbLaunch, "do\xa0MMMM")}${!isThisYear(gbLaunch) ? format(gbLaunch, "\xa0yyyy") : ""}`;
          } else {
            subtitle = `IC posted ${format(icDate, "do\xa0MMMM")}${
              !isThisYear(icDate) ? format(icDate, "\xa0yyyy") : ""
            }`;
          }
          let live = false;
          if (gbLaunch) {
            live = isPast(gbLaunch) && (isBefore(gbEnd, yesterday) || !set.gbEnd);
          }
          return (
            <ElementCompact
              page={props.page}
              selected={props.detailSet === set}
              set={set}
              title={title}
              subtitle={subtitle}
              details={props.details}
              closeDetails={props.closeDetails}
              link={set.details}
              live={live}
              key={set.details + index}
            />
          );
        })}
      </List>
    </Card>
  );
};
export default ViewCompact;

ViewCompact.propTypes = {
  closeDetails: PropTypes.func,
  detailset: PropTypes.shape(setTypes()),
  details: PropTypes.func,
  page: PropTypes.string,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
};
