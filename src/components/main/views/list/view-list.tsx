import { DateTime } from "luxon";
import { is } from "typescript-is";
import { SetType } from "@s/main/types";
import { ordinal } from "@s/util/functions";
import { List, ListDivider } from "@rmwc/list";
import { ElementList } from "./element-list";
import "./view-list.scss";

type ViewListProps = {
  closeDetails: () => void;
  detailSet: SetType;
  details: (set: SetType) => void;
  sets: SetType[];
};

export const ViewList = (props: ViewListProps) => {
  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });
  const oneDay = 24 * 60 * 60 * 1000;
  return (
    <List twoLine className="view-list three-line">
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
          subtitle = `${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0MMMM`)}${
            (gbLaunch.year !== today.year && gbLaunch.year !== gbEnd.year) || gbLaunch.year !== gbEnd.year
              ? gbLaunch.toFormat("\xa0yyyy")
              : ""
          } until ${gbEnd.toFormat(`d'${gbEndOrdinal}'\xa0MMMM`)}${
            gbEnd.year !== today.year || gbLaunch.year !== gbEnd.year ? gbEnd.toFormat("\xa0yyyy") : ""
          }`;
        } else if (gbLaunch && is<string>(gbLaunch)) {
          subtitle = "GB expected " + gbLaunch;
        } else if (set.gbMonth && gbLaunch && gbLaunch instanceof DateTime) {
          subtitle = `GB expected ${
            gbLaunch.toFormat("MMMM") + (gbLaunch.year !== today.year ? gbLaunch.toFormat("\xa0yyyy") : "")
          }`;
        } else if (gbLaunch && gbLaunch instanceof DateTime) {
          subtitle = `${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0MMMM`)}${
            gbLaunch.year !== today.year ? gbLaunch.toFormat("\xa0yyyy") : ""
          }`;
        } else if (icDate) {
          subtitle = `IC posted ${icDate.toFormat(`d'${icDateOrdinal}'\xa0MMMM`)}${
            icDate.year !== today.year ? icDate.toFormat("\xa0yyyy") : ""
          }`;
        }
        const thisWeek = gbEnd
          ? gbEnd.valueOf() - 7 * oneDay < today.valueOf() && gbEnd.valueOf() > today.valueOf()
          : false;
        const daysLeft = gbEnd ? Math.ceil(Math.abs((gbEnd.valueOf() - today.valueOf()) / oneDay)) : 0;
        let live = false;
        if (gbLaunch instanceof DateTime && gbEnd) {
          live = gbLaunch.valueOf() < today.valueOf() && (gbEnd.valueOf() > yesterday.valueOf() || !set.gbEnd);
        }
        return (
          <ElementList
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
