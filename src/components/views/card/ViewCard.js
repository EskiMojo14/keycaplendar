import React from "react";
import PropTypes from "prop-types";
import { format, isThisYear, isSameYear, isPast, isAfter } from "date-fns";
import { setTypes } from "../../../util/propTypeTemplates";
import { ElementCard } from "./ElementCard";
import "./ViewCard.scss";

export const ViewCard = (props) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setUTCDate(today.getUTCDate() - 1);
  const oneDay = 24 * 60 * 60 * 1000;
  return (
    <div className="group-container">
      {props.sets.map((set, index) => {
        const gbLaunch = set.gbLaunch.includes("Q") || !set.gbLaunch ? set.gbLaunch : new Date(set.gbLaunch);
        const gbEnd = new Date(set.gbEnd);
        gbEnd.setUTCHours(23, 59, 59, 999);
        const icDate = new Date(set.icDate);
        const title = `${set.profile} ${set.colorway}`;
        let subtitle;
        if (set.gbLaunch && set.gbEnd) {
          subtitle = `${format(gbLaunch, "do\xa0MMMM")}${
            (!isThisYear(gbLaunch) && !isSameYear(gbLaunch, gbEnd)) || !isSameYear(gbLaunch, gbEnd)
              ? format(gbLaunch, "\xa0yyyy")
              : ""
          } until ${format(gbEnd, "do\xa0MMMM")}${
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
        const designer = set.designer.join(" + ");
        const thisWeek = gbEnd.valueOf() - 7 * oneDay < today.valueOf() && gbEnd.valueOf() > today.valueOf();
        const daysLeft = Math.ceil(Math.abs((gbEnd - today) / oneDay));
        let live = false;
        if (gbLaunch) {
          live = isPast(gbLaunch) && (isAfter(gbEnd, yesterday) || !set.gbEnd);
        }
        return (
          <ElementCard
            page={props.page}
            selected={props.detailSet === set}
            set={set}
            title={title}
            subtitle={subtitle}
            designer={designer}
            image={set.image.replace("keysets", "card")}
            link={set.details}
            details={props.details}
            closeDetails={props.closeDetails}
            edit={props.edit}
            thisWeek={thisWeek}
            daysLeft={daysLeft}
            live={live}
            key={set.details + index}
          />
        );
      })}
    </div>
  );
};
export default ViewCard;

ViewCard.propTypes = {
  closeDetails: PropTypes.func,
  detailset: PropTypes.shape(setTypes()),
  details: PropTypes.func,
  edit: PropTypes.func,
  page: PropTypes.string,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
};
