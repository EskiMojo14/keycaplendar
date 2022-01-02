import { DateTime } from "luxon";
import { is } from "typescript-is";
import { SkeletonCard } from "@c/main/views/card/skeleton-card";
import type { Page } from "@s/common/types";
import type { SetType } from "@s/main/types";
import type { CurrentUserType } from "@s/user/types";
import { ordinal } from "@s/util/functions";
import { ElementCard } from "./element-card";
import "./view-card.scss";

type ViewCardProps = {
  closeDetails: () => void;
  details: (set: SetType) => void;
  detailSet: SetType;
  edit: (set: SetType) => void;
  page: Page;
  sets: SetType[];
  user: CurrentUserType;
  loading?: boolean;
};

export const ViewCard = ({
  closeDetails,
  details,
  detailSet,
  edit,
  loading,
  page,
  sets,
  user,
}: ViewCardProps) => {
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
        const gbLaunchOrdinal =
          gbLaunch instanceof DateTime ? ordinal(gbLaunch.day) : "";

        const gbEnd = set.gbEnd
          ? DateTime.fromISO(set.gbEnd, { zone: "utc" }).set({
              hour: 23,
              millisecond: 999,
              minute: 59,
              second: 59,
            })
          : null;
        const gbEndOrdinal =
          gbEnd instanceof DateTime ? ordinal(gbEnd.day) : "";

        const icDate = set.icDate
          ? DateTime.fromISO(set.icDate, { zone: "utc" })
          : null;
        const icDateOrdinal =
          icDate instanceof DateTime ? ordinal(icDate.day) : "";
        let subtitle = "";
        if (gbLaunch && gbLaunch instanceof DateTime && gbEnd) {
          subtitle = `${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0MMMM`)}${
            (gbLaunch.year !== today.year && gbLaunch.year !== gbEnd.year) ||
            gbLaunch.year !== gbEnd.year
              ? gbLaunch.toFormat("\xa0yyyy")
              : ""
          } until ${gbEnd.toFormat(`d'${gbEndOrdinal}'\xa0MMMM`)}${
            gbEnd.year !== today.year || gbLaunch.year !== gbEnd.year
              ? gbEnd.toFormat("\xa0yyyy")
              : ""
          }`;
        } else if (gbLaunch && is<string>(gbLaunch)) {
          subtitle = `GB expected ${gbLaunch}`;
        } else if (set.gbMonth && gbLaunch && gbLaunch instanceof DateTime) {
          subtitle = `GB expected ${
            gbLaunch.toFormat("MMMM") +
            (gbLaunch.year !== today.year ? gbLaunch.toFormat("\xa0yyyy") : "")
          }`;
        } else if (gbLaunch && gbLaunch instanceof DateTime) {
          subtitle = `${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0MMMM`)}${
            gbLaunch.year !== today.year ? gbLaunch.toFormat("\xa0yyyy") : ""
          }`;
        } else if (icDate) {
          subtitle = `IC posted ${icDate.toFormat(
            `d'${icDateOrdinal}'\xa0MMMM`
          )}${icDate.year !== today.year ? icDate.toFormat("\xa0yyyy") : ""}`;
        }
        const live =
          page !== "live" && gbLaunch instanceof DateTime && gbEnd
            ? gbLaunch.valueOf() < today.valueOf() &&
              (gbEnd.valueOf() > yesterday.valueOf() || !set.gbEnd)
            : false;
        const title = `${set.profile} ${set.colorway}`;
        const designer = set.designer.join(" + ");
        return loading ? (
          <SkeletonCard
            key={set.id}
            icon={set.shipped || live}
            loggedIn={!!user?.email}
            {...{ designer, subtitle, title }}
          />
        ) : (
          <ElementCard
            key={set.id}
            daysLeft={
              gbEnd
                ? Math.ceil(
                    Math.abs((gbEnd.valueOf() - today.valueOf()) / oneDay)
                  )
                : 0
            }
            image={set.image.replace("keysets", "card")}
            selected={detailSet === set}
            thisWeek={
              gbEnd
                ? gbEnd.valueOf() - 7 * oneDay < today.valueOf() &&
                  gbEnd.valueOf() > today.valueOf()
                : false
            }
            {...{
              closeDetails,
              designer,
              details,
              edit,
              live,
              set,
              subtitle,
              title,
              user,
            }}
          />
        );
      })}
    </div>
  );
};
export default ViewCard;
