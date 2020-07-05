import React from "react";
import { List, ListDivider } from "@rmwc/list";
import { ElementList } from "./ElementList";
import "./ViewList.scss";

export class ViewList extends React.Component {
  render() {
    return (
      <List twoLine className="view-list">
        {this.props.sets.map((set, index) => {
          const gbLaunch = set.gbLaunch.includes("Q") ? set.gbLaunch : new Date(set.gbLaunch);
          const gbEnd = new Date(set.gbEnd);
          const icDate = new Date(set.icDate);
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
          const title = set.profile + " " + set.colorway;
          let subtitle;
          if (set.gbLaunch !== "" && set.gbEnd) {
            subtitle =
              gbLaunch.getUTCDate() +
              nth(gbLaunch.getUTCDate()) +
              "\xa0" +
              month[gbLaunch.getUTCMonth()] +
              " until " +
              gbEnd.getUTCDate() +
              nth(gbEnd.getUTCDate()) +
              "\xa0" +
              month[gbEnd.getUTCMonth()];
          } else if (set.gbLaunch.includes("Q")) {
            subtitle = "GB expected " + gbLaunch;
          } else if (set.gbMonth && set.gbLaunch !== "") {
            subtitle = "GB expected " + month[gbLaunch.getUTCMonth()];
          } else if (set.gbLaunch !== "") {
            subtitle = gbLaunch.getUTCDate() + nth(gbLaunch.getUTCDate()) + "\xa0" + month[gbLaunch.getUTCMonth()];
          } else {
            subtitle =
              "IC posted " +
              icDate.getUTCDate() +
              nth(icDate.getUTCDate()) +
              "\xa0" +
              month[icDate.getUTCMonth()] +
              (icDate.getUTCFullYear() !== today.getUTCFullYear() ? " " + icDate.getUTCFullYear() : "");
          }
          const oneDay = 24 * 60 * 60 * 1000;
          const thisWeek = gbEnd.getTime() - 7 * oneDay < today.getTime() && gbEnd.getTime() > today.getTime();
          const daysLeft = Math.ceil(Math.abs((gbEnd - today) / oneDay));
          let live = false;
          if (Object.prototype.toString.call(gbLaunch) === "[object Date]") {
            live = gbLaunch.getTime() < today.getTime() && (gbEnd.getTime() > yesterday.getTime() || set.gbEnd === "");
          }
          return (
            <ElementList
              page={this.props.page}
              selected={this.props.detailSet === set || this.props.editSet === set}
              set={set}
              title={title}
              subtitle={subtitle}
              image={set.image}
              link={set.details}
              details={this.props.details}
              closeDetails={this.props.closeDetails}
              store={set.storeLink}
              thisWeek={thisWeek}
              daysLeft={daysLeft}
              live={live}
              key={index}
            />
          );
        })}
        <ListDivider />
      </List>
    );
  }
}
export default ViewList;
