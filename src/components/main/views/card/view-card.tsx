import { DateTime } from "luxon";
import { is } from "typescript-is";
import { SkeletonCard } from "@c/main/views/card/skeleton-card";
import type { SetType } from "@s/main/types";
import type { CurrentUserType } from "@s/user/types";
import { ordinal } from "@s/util/functions";
import { ElementCard } from "./element-card";
import "./view-card.scss";

type ViewCardProps = {
  closeDetails: () => void;
  detailSet: SetType;
  details: (set: SetType) => void;
  edit: (set: SetType) => void;
  sets: SetType[];
  loading?: boolean;
  user: CurrentUserType;
};

export const ViewCard = ({ closeDetails, detailSet, details, edit, sets, loading, user }: ViewCardProps) => {
  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });
  const oneDay = 24 * 60 * 60 * 1000;
  return (
    <div className="group-container">
      {sets.map((set) => {
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
        return loading ? (
          <SkeletonCard
            key={set.id}
            designer={set.designer.join(" + ")}
            title={`${set.profile} ${set.colorway}`}
            loggedIn={!!user?.email}
            {...{ subtitle }}
          />
        ) : (
          <ElementCard
            key={set.id}
            selected={detailSet === set}
            designer={set.designer.join(" + ")}
            image={set.image.replace("keysets", "card")}
            title={`${set.profile} ${set.colorway}`}
            live={
              gbLaunch instanceof DateTime && gbEnd
                ? gbLaunch.valueOf() < today.valueOf() && (gbEnd.valueOf() > yesterday.valueOf() || !set.gbEnd)
                : false
            }
            daysLeft={gbEnd ? Math.ceil(Math.abs((gbEnd.valueOf() - today.valueOf()) / oneDay)) : 0}
            thisWeek={
              gbEnd ? gbEnd.valueOf() - 7 * oneDay < today.valueOf() && gbEnd.valueOf() > today.valueOf() : false
            }
            {...{ set, subtitle, details, closeDetails, edit, user }}
          />
        );
      })}
    </div>
  );
};
export default ViewCard;
