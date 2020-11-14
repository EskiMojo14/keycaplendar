import React from "react";
import PropTypes from "prop-types";
import { Card } from "@rmwc/card";
import { List } from "@rmwc/list";
import { ElementCompact } from "./ElementCompact";
import "./ViewCompact.scss";

export const ViewCompact = (props) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const nth = function (d) {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  return (
    <Card>
      <List twoLine>
        {props.sets.map((set, index) => {
          const gbLaunch = set.gbLaunch.includes("Q") ? set.gbLaunch : new Date(set.gbLaunch);
          const gbEnd = new Date(set.gbEnd);
          const icDate = new Date(set.icDate);
          const title = set.profile + " " + set.colorway;
          let subtitle;
          if (set.gbLaunch !== "" && set.gbEnd) {
            subtitle =
              gbLaunch.getUTCDate() +
              nth(gbLaunch.getUTCDate()) +
              "\xa0" +
              month[gbLaunch.getUTCMonth()] +
              ((gbLaunch.getUTCFullYear() !== today.getUTCFullYear() &&
                gbLaunch.getUTCFullYear() !== gbEnd.getUTCFullYear()) ||
              gbLaunch.getUTCFullYear() !== gbEnd.getUTCFullYear()
                ? " " + gbLaunch.getUTCFullYear().toString().slice(-2)
                : "") +
              " until " +
              gbEnd.getUTCDate() +
              nth(gbEnd.getUTCDate()) +
              "\xa0" +
              month[gbEnd.getUTCMonth()] +
              (gbEnd.getUTCFullYear() !== today.getUTCFullYear() || gbLaunch.getUTCFullYear() !== gbEnd.getUTCFullYear()
                ? " " + gbEnd.getUTCFullYear().toString().slice(-2)
                : "");
          } else if (set.gbLaunch.includes("Q")) {
            subtitle = "GB expected " + gbLaunch;
          } else if (set.gbMonth && set.gbLaunch !== "") {
            subtitle =
              "GB expected " +
              month[gbLaunch.getUTCMonth()] +
              (gbLaunch.getUTCFullYear() !== today.getUTCFullYear()
                ? " " + gbLaunch.getUTCFullYear().toString().slice(-2)
                : "");
          } else if (set.gbLaunch !== "") {
            subtitle =
              gbLaunch.getUTCDate() +
              nth(gbLaunch.getUTCDate()) +
              "\xa0" +
              month[gbLaunch.getUTCMonth()] +
              (gbLaunch.getUTCFullYear() !== today.getUTCFullYear()
                ? " " + gbLaunch.getUTCFullYear().toString().slice(-2)
                : "");
          } else {
            subtitle =
              "IC posted " +
              icDate.getUTCDate() +
              nth(icDate.getUTCDate()) +
              "\xa0" +
              month[icDate.getUTCMonth()] +
              (icDate.getUTCFullYear() !== today.getUTCFullYear()
                ? " " + icDate.getUTCFullYear().toString().slice(-2)
                : "");
          }
          let live = false;
          if (Object.prototype.toString.call(gbLaunch) === "[object Date]") {
            live = gbLaunch.getTime() < today.getTime() && (gbEnd.getTime() > yesterday.getTime() || set.gbEnd === "");
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
  detailSet: PropTypes.object,
  details: PropTypes.func,
  page: PropTypes.string,
  sets: PropTypes.arrayOf(PropTypes.object),
};
