import React from "react";
import { DateTime } from "luxon";
import { SetType } from "../../../../app/slices/main/types";
import { ordinal } from "../../../../app/slices/common/functions";
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
  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });
  return (
    <Card>
      <List twoLine>
        {props.sets.map((set, index) => {
          const gbLaunch = set.gbLaunch
            ? set.gbLaunch.includes("Q") || !set.gbLaunch
              ? set.gbLaunch
              : DateTime.fromISO(set.gbLaunch, { zone: "utc" })
            : null;
          const gbLaunchOrdinal = gbLaunch instanceof DateTime ? ordinal(gbLaunch.day) : "";

          const gbEnd = set.gbEnd
            ? DateTime.fromISO(set.gbEnd, { zone: "utc" }).set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
            : null;
          const gbEndOrdinal = gbEnd instanceof DateTime ? ordinal(gbEnd.day) : "";

          const icDate = set.icDate ? DateTime.fromISO(set.icDate, { zone: "utc" }) : null;
          const icDateOrdinal = icDate instanceof DateTime ? ordinal(icDate.day) : "";

          const title = `${set.profile} ${set.colorway}`;
          let subtitle = "";
          if (gbLaunch && gbLaunch instanceof DateTime && gbEnd) {
            subtitle = `${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0MMM`)}${
              (gbLaunch.year !== today.year && gbLaunch.year !== gbEnd.year) || gbLaunch.year !== gbEnd.year
                ? gbLaunch.toFormat("\xa0yyyy")
                : ""
            } until ${gbEnd.toFormat(`d'${gbEndOrdinal}'\xa0MMM`)}${
              gbEnd.year !== today.year || gbLaunch.year !== gbEnd.year ? gbEnd.toFormat("\xa0yyyy") : ""
            }`;
          } else if (gbLaunch && gbLaunch instanceof String) {
            subtitle = "GB expected " + gbLaunch;
          } else if (set.gbMonth && gbLaunch && gbLaunch instanceof DateTime) {
            subtitle = `GB expected ${
              gbLaunch.toFormat("MMM") + (gbLaunch.year !== today.year ? gbLaunch.toFormat("\xa0yyyy") : "")
            }`;
          } else if (gbLaunch && gbLaunch instanceof DateTime) {
            subtitle = `${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0MMM`)}${
              gbLaunch.year !== today.year ? gbLaunch.toFormat("\xa0yyyy") : ""
            }`;
          } else if (icDate) {
            subtitle = `IC posted ${icDate.toFormat(`d'${icDateOrdinal}'\xa0MMM`)}${
              icDate.year !== today.year ? icDate.toFormat("\xa0yyyy") : ""
            }`;
          }
          let live = false;
          if (gbLaunch instanceof DateTime && gbEnd) {
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
