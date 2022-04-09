import type { EntityId } from "@reduxjs/toolkit";
import { List, ListDivider } from "@rmwc/list";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import { useAppSelector } from "~/app/hooks";
import type { Page } from "@s/common/types";
import { selectSetMap } from "@s/main";
import { ordinal } from "@s/util/functions";
import { ElementList } from "./element-list";
import { SkeletonList } from "./skeleton-list";
import "./view-list.scss";

type ViewListProps = {
  closeDetails: () => void;
  details: (set: EntityId) => void;
  detailSet: EntityId;
  sets: EntityId[];
  loading?: boolean;
  page?: Page;
};

export const ViewList = ({
  closeDetails,
  details,
  detailSet,
  loading,
  page,
  sets,
}: ViewListProps) => {
  const setMap = useAppSelector(selectSetMap);
  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });
  const oneDay = 24 * 60 * 60 * 1000;
  return (
    <List className="view-list three-line" nonInteractive={loading} twoLine>
      {sets.map((setId) => {
        const { [setId]: set } = setMap;
        if (!set) {
          return null;
        }
        const gbLaunch =
          set.gbLaunch?.includes("Q") || !set.gbLaunch
            ? set.gbLaunch
            : DateTime.fromISO(set.gbLaunch, { zone: "utc" });
        const gbLaunchOrdinal =
          gbLaunch instanceof DateTime ? ordinal(gbLaunch.day) : "";

        const gbEnd =
          set.gbEnd &&
          DateTime.fromISO(set.gbEnd, { zone: "utc" }).set({
            hour: 23,
            millisecond: 999,
            minute: 59,
            second: 59,
          });
        const gbEndOrdinal =
          gbEnd instanceof DateTime ? ordinal(gbEnd.day) : "";

        const icDate =
          set.icDate && DateTime.fromISO(set.icDate, { zone: "utc" });
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
        const title = `${set.profile} ${set.colorway}`;
        const designer = set.designer.join(" + ");
        const live =
          page !== "live" && gbLaunch instanceof DateTime && gbEnd
            ? gbLaunch.valueOf() < today.valueOf() &&
              (gbEnd.valueOf() > yesterday.valueOf() || !set.gbEnd)
            : false;
        return loading ? (
          <SkeletonList
            key={set.id}
            icon={set.shipped || live}
            {...{ designer, subtitle, title }}
          />
        ) : (
          <ElementList
            key={set.id}
            daysLeft={
              gbEnd
                ? Math.ceil(
                    Math.abs((gbEnd.valueOf() - today.valueOf()) / oneDay)
                  )
                : 0
            }
            image={set.image.replace("keysets", "list")}
            selected={detailSet === set.id}
            thisWeek={
              gbEnd
                ? gbEnd.valueOf() - 7 * oneDay < today.valueOf() &&
                  gbEnd.valueOf() > today.valueOf()
                : false
            }
            title={`${set.profile} ${set.colorway}`}
            {...{ closeDetails, designer, details, live, set, subtitle }}
          />
        );
      })}
      <ListDivider />
    </List>
  );
};
export default ViewList;
