import React from "react";
import moment from "moment";
import { SetType } from "../../../app/slices/main/types";
import { ImageList } from "@rmwc/image-list";
import { ElementImage } from "./ElementImage";

type ViewImageListProps = {
  closeDetails: () => void;
  detailSet: SetType;
  details: (set: SetType) => void;
  sets: SetType[];
};

export const ViewImageList = (props: ViewImageListProps) => {
  const today = moment.utc();
  const yesterday = moment.utc().date(today.date() - 1);
  const oneDay = 24 * 60 * 60 * 1000;
  return (
    <ImageList style={{ margin: -2 }} withTextProtection>
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
        const thisWeek = gbEnd
          ? gbEnd.valueOf() - 7 * oneDay < today.valueOf() && gbEnd.valueOf() > today.valueOf()
          : false;
        const daysLeft = gbEnd ? Math.ceil(Math.abs((gbEnd.valueOf() - today.valueOf()) / oneDay)) : 0;
        let live = false;
        if (gbLaunch instanceof moment && gbEnd) {
          live = gbLaunch.valueOf() < today.valueOf() && (gbEnd.valueOf() > yesterday.valueOf() || !set.gbEnd);
        }
        return (
          <ElementImage
            selected={props.detailSet === set}
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
            key={set.details + index}
          />
        );
      })}
    </ImageList>
  );
};
export default ViewImageList;
