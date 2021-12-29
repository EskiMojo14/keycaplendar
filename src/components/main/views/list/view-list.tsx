import { List, ListDivider } from "@rmwc/list";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import type { SetType } from "@s/main/types";
import { ordinal } from "@s/util/functions";
import { ElementList } from "./element-list";
import { SkeletonList } from "./skeleton-list";
import "./view-list.scss";

type ViewListProps = {
  closeDetails: () => void;
  detailSet: SetType;
  details: (set: SetType) => void;
  sets: SetType[];
  loading?: boolean;
};

export const ViewList = ({ closeDetails, detailSet, details, sets, loading }: ViewListProps) => {
  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });
  const oneDay = 24 * 60 * 60 * 1000;
  return (
    <List twoLine nonInteractive={loading} className="view-list three-line">
      {sets.map((set, index) => {
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
        const title = `${set.profile} ${set.colorway}`;
        const designer = set.designer.join(" + ");
        return loading ? (
          <SkeletonList {...{ title, subtitle, designer }} />
        ) : (
          <ElementList
            key={set.details + index}
            selected={detailSet === set}
            title={`${set.profile} ${set.colorway}`}
            image={set.image.replace("keysets", "list")}
            thisWeek={
              gbEnd ? gbEnd.valueOf() - 7 * oneDay < today.valueOf() && gbEnd.valueOf() > today.valueOf() : false
            }
            daysLeft={gbEnd ? Math.ceil(Math.abs((gbEnd.valueOf() - today.valueOf()) / oneDay)) : 0}
            live={
              gbLaunch instanceof DateTime && gbEnd
                ? gbLaunch.valueOf() < today.valueOf() && (gbEnd.valueOf() > yesterday.valueOf() || !set.gbEnd)
                : false
            }
            {...{ set, subtitle, details, closeDetails, designer }}
          />
        );
      })}
      <ListDivider />
    </List>
  );
};
export default ViewList;
