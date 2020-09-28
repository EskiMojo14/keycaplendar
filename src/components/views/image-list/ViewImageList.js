import React from "react";
import { ImageList } from "@rmwc/image-list";
import { ElementImage } from "./ElementImage";

export const ViewImageList = (props) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fullMonth = [
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
  const oneDay = 24 * 60 * 60 * 1000;
  return (
    <ImageList style={{ margin: -2 }} withTextProtection>
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
            " - " +
            gbEnd.getUTCDate() +
            nth(gbEnd.getUTCDate()) +
            "\xa0" +
            month[gbEnd.getUTCMonth()] +
            (gbEnd.getUTCFullYear() !== today.getUTCFullYear() || gbLaunch.getUTCFullYear() !== gbEnd.getUTCFullYear()
              ? " " + gbEnd.getUTCFullYear().toString().slice(-2)
              : "");
        } else if (set.gbLaunch.includes("Q")) {
          subtitle = "Expected " + gbLaunch;
        } else if (set.gbMonth && set.gbLaunch !== "") {
          subtitle =
            "Expected " +
            fullMonth[gbLaunch.getUTCMonth()] +
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
            "IC " +
            icDate.getUTCDate() +
            nth(icDate.getUTCDate()) +
            "\xa0" +
            month[icDate.getUTCMonth()] +
            (icDate.getUTCFullYear() !== today.getUTCFullYear() ? " " + icDate.getUTCFullYear() : "");
        }
        const thisWeek = gbEnd.getTime() - 7 * oneDay < today.getTime() && gbEnd.getTime() > today.getTime();
        const daysLeft = Math.ceil(Math.abs((gbEnd - today) / oneDay));
        let live = false;
        if (Object.prototype.toString.call(gbLaunch) === "[object Date]") {
          live = gbLaunch.getTime() < today.getTime() && (gbEnd.getTime() > yesterday.getTime() || set.gbEnd === "");
        }
        return (
          <ElementImage
            page={props.page}
            selected={props.detailSet === set || props.editSet === set}
            title={title}
            subtitle={subtitle}
            image={set.image.replace("keysets", "image-list")}
            link={set.details}
            set={set}
            details={props.details}
            closeDetails={props.closeDetails}
            thisWeek={thisWeek}
            daysLeft={daysLeft}
            live={live}
            key={index}
          />
        );
      })}
    </ImageList>
  );
};
export default ViewImageList;
