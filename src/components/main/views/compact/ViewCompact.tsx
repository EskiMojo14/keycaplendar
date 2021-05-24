import React from "react";
import moment from "moment";
import { SetType } from "../../../../app/slices/main/types";
import { Card } from "@rmwc/card";
import { List } from "@rmwc/list";
import { ElementCompact } from "./ElementCompact";
import "./ViewCompact.scss";

type ViewCompactProps = {
  closeDetails: () => void;
  detailSet: SetType;
  details: (set: SetType) => void;
  sets: SetType[];
};

export const ViewCompact = (props: ViewCompactProps) => {
  const today = moment.utc();
  const yesterday = moment.utc().date(today.date() - 1);
  return (
    <Card>
      <List twoLine>
        {props.sets.map((set, index) => {
          const gbLaunch = set.gbLaunch
            ? set.gbLaunch.includes("Q") || !set.gbLaunch
              ? set.gbLaunch
              : moment.utc(set.gbLaunch, ["YYYY-MM-DD", "YYYY-MM"])
            : null;
          const gbEnd = set.gbEnd ? moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 }) : null;
          const icDate = set.icDate ? moment.utc(set.icDate) : null;
          const title = `${set.profile} ${set.colorway}`;
          let subtitle = "";
          if (gbLaunch && moment.isMoment(gbLaunch) && gbEnd) {
            subtitle = `${gbLaunch.format("Do\xa0MMM")}${
              (gbLaunch.year() !== today.year() && gbLaunch.year() !== gbEnd.year()) || gbLaunch.year() !== gbEnd.year()
                ? gbLaunch.format("\xa0YYYY")
                : ""
            } until ${gbEnd.format("Do\xa0MMM")}${
              gbEnd.year() !== today.year() || gbLaunch.year() !== gbEnd.year() ? gbEnd.format("\xa0YYYY") : ""
            }`;
          } else if (gbLaunch && gbLaunch instanceof String) {
            subtitle = "GB expected " + gbLaunch;
          } else if (set.gbMonth && gbLaunch && moment.isMoment(gbLaunch)) {
            subtitle = `GB expected ${
              gbLaunch.format("MMMM") + (gbLaunch.year() !== today.year() ? gbLaunch.format("\xa0YYYY") : "")
            }`;
          } else if (gbLaunch && moment.isMoment(gbLaunch)) {
            subtitle = `${gbLaunch.format("Do\xa0MMMM")}${
              gbLaunch.year() !== today.year() ? gbLaunch.format("\xa0YYYY") : ""
            }`;
          } else if (icDate) {
            subtitle = `IC posted ${icDate.format("Do\xa0MMMM")}${
              icDate.year() !== today.year() ? icDate.format("\xa0YYYY") : ""
            }`;
          }
          let live = false;
          if (gbLaunch instanceof moment && gbEnd) {
            live = gbLaunch.valueOf() < today.valueOf() && (gbEnd.valueOf() > yesterday.valueOf() || !set.gbEnd);
          }
          return (
            <ElementCompact
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
