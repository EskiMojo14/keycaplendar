import type { EntityId } from "@reduxjs/toolkit";
import { Card } from "@rmwc/card";
import { List } from "@rmwc/list";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import type { Page } from "@s/common/types";
import type { SetType } from "@s/main/types";
import { ordinal } from "@s/util/functions";
import { ElementCompact } from "./element-compact";
import { SkeletonCompact } from "./skeleton-compact";
import "./view-compact.scss";

type ViewCompactProps = {
  closeDetails: () => void;
  details: (set: EntityId) => void;
  detailSet: EntityId;
  page: Page;
  sets: SetType[];
  loading?: boolean;
};

export const ViewCompact = ({
  closeDetails,
  details,
  detailSet,
  loading,
  page,
  sets,
}: ViewCompactProps) => {
  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });
  return (
    <Card>
      <List nonInteractive={loading} twoLine>
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

          const title = `${set.profile} ${set.colorway}`;
          let subtitle = "";
          if (gbLaunch && gbLaunch instanceof DateTime && gbEnd) {
            subtitle = `${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0MMM`)}${
              (gbLaunch.year !== today.year && gbLaunch.year !== gbEnd.year) ||
              gbLaunch.year !== gbEnd.year
                ? gbLaunch.toFormat("\xa0yyyy")
                : ""
            } until ${gbEnd.toFormat(`d'${gbEndOrdinal}'\xa0MMM`)}${
              gbEnd.year !== today.year || gbLaunch.year !== gbEnd.year
                ? gbEnd.toFormat("\xa0yyyy")
                : ""
            }`;
          } else if (gbLaunch && is<string>(gbLaunch)) {
            subtitle = `GB expected ${gbLaunch}`;
          } else if (set.gbMonth && gbLaunch && gbLaunch instanceof DateTime) {
            subtitle = `GB expected ${
              gbLaunch.toFormat("MMM") +
              (gbLaunch.year !== today.year
                ? gbLaunch.toFormat("\xa0yyyy")
                : "")
            }`;
          } else if (gbLaunch && gbLaunch instanceof DateTime) {
            subtitle = `${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0MMM`)}${
              gbLaunch.year !== today.year ? gbLaunch.toFormat("\xa0yyyy") : ""
            }`;
          } else if (icDate) {
            subtitle = `IC posted ${icDate.toFormat(
              `d'${icDateOrdinal}'\xa0MMM`
            )}${icDate.year !== today.year ? icDate.toFormat("\xa0yyyy") : ""}`;
          }
          const live =
            page !== "live" && gbLaunch instanceof DateTime && gbEnd
              ? gbLaunch.valueOf() < today.valueOf() &&
                (gbEnd.valueOf() > yesterday.valueOf() || !set.gbEnd)
              : false;
          return loading ? (
            <SkeletonCompact
              key={set.id}
              icon={set.shipped || live}
              {...{ subtitle, title }}
            />
          ) : (
            <ElementCompact
              key={set.id}
              link={set.details}
              selected={detailSet === set.id}
              {...{ closeDetails, details, live, set, subtitle, title }}
            />
          );
        })}
      </List>
    </Card>
  );
};
export default ViewCompact;
