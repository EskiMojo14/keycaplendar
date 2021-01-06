import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { setTypes } from "../../../util/propTypeTemplates";
import { List, ListDivider } from "@rmwc/list";
import { ElementList } from "./ElementList";
import "./ViewList.scss";

export const ViewList = (props) => {
  const today = moment.utc();
  const yesterday = moment.utc().date(today.date() - 1);
  const oneDay = 24 * 60 * 60 * 1000;
  return (
    <List twoLine className="view-list three-line">
      {props.sets.map((set, index) => {
        const gbLaunch = set.gbLaunch.includes("Q") || set.gbLaunch === "" ? set.gbLaunch : moment.utc(set.gbLaunch);
        const gbEnd = moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
        const icDate = moment.utc(set.icDate);
        const title = `${set.profile} ${set.colorway}`;
        let subtitle;
        if (set.gbLaunch !== "" && set.gbEnd) {
          subtitle = `${gbLaunch.format("Do\xa0MMMM")}${
            (gbLaunch.year() !== today.year() && gbLaunch.year() !== gbEnd.year()) || gbLaunch.year() !== gbEnd.year()
              ? gbLaunch.format("\xa0YYYY")
              : ""
          } until ${gbEnd.format("Do\xa0MMMM")}${
            gbEnd.year() !== today.year() || gbLaunch.year() !== gbEnd.year() ? gbEnd.format("\xa0YYYY") : ""
          }`;
        } else if (set.gbLaunch.includes("Q")) {
          subtitle = "GB expected " + gbLaunch;
        } else if (set.gbMonth && set.gbLaunch !== "") {
          subtitle = `GB expected ${
            gbLaunch.format("MMMM") + (gbLaunch.year() !== today.year() ? gbLaunch.format("\xa0YYYY") : "")
          }`;
        } else if (set.gbLaunch !== "") {
          subtitle = `${gbLaunch.format("Do\xa0MMMM")}${
            gbLaunch.year() !== today.year() ? gbLaunch.format("\xa0YYYY") : ""
          }`;
        } else {
          subtitle = `IC posted ${icDate.format("Do\xa0MMMM")}${
            icDate.year() !== today.year() ? icDate.format("\xa0YYYY") : ""
          }`;
        }
        const thisWeek = gbEnd.valueOf() - 7 * oneDay < today.valueOf() && gbEnd.valueOf() > today.valueOf();
        const daysLeft = Math.ceil(Math.abs((gbEnd - today) / oneDay));
        let live = false;
        if (gbLaunch instanceof moment) {
          live = gbLaunch.valueOf() < today.valueOf() && (gbEnd.valueOf() > yesterday.valueOf() || set.gbEnd === "");
        }
        return (
          <ElementList
            page={props.page}
            selected={props.detailSet === set}
            set={set}
            title={title}
            subtitle={subtitle}
            image={set.image.replace("keysets", "list")}
            link={set.details}
            details={props.details}
            closeDetails={props.closeDetails}
            thisWeek={thisWeek}
            daysLeft={daysLeft}
            live={live}
            key={set.details + index}
          />
        );
      })}
      <ListDivider />
    </List>
  );
};
export default ViewList;

ViewList.propTypes = {
  closeDetails: PropTypes.func,
  detailset: PropTypes.shape(setTypes()),
  details: PropTypes.func,
  page: PropTypes.string,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
};
