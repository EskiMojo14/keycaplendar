import { ImageList } from "@rmwc/image-list";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import type { Page } from "@s/common/types";
import type { SetType } from "@s/main/types";
import { ordinal } from "@s/util/functions";
import { ElementImage } from "./element-image";
import { SkeletonImage } from "./skeleton-image";

type ViewImageListProps = {
  closeDetails: () => void;
  detailSet: SetType;
  details: (set: SetType) => void;
  sets: SetType[];
  loading?: boolean;
  page?: Page;
};

export const ViewImageList = ({ closeDetails, detailSet, details, sets, loading, page }: ViewImageListProps) => {
  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });
  const oneDay = 24 * 60 * 60 * 1000;
  return (
    <ImageList style={{ margin: -2 }} withTextProtection>
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
        } else if (gbLaunch && is<string>(gbLaunch)) {
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
        const live =
          page !== "live" && gbLaunch instanceof DateTime && gbEnd
            ? gbLaunch.valueOf() < today.valueOf() && (gbEnd.valueOf() > yesterday.valueOf() || !set.gbEnd)
            : false;
        return loading ? (
          <SkeletonImage key={set.details} icon={set.shipped || live} {...{ title, subtitle }} />
        ) : (
          <ElementImage
            key={set.details}
            selected={detailSet === set}
            image={set.image.replace("keysets", "image-list")}
            link={set.details}
            thisWeek={
              gbEnd ? gbEnd.valueOf() - 7 * oneDay < today.valueOf() && gbEnd.valueOf() > today.valueOf() : false
            }
            daysLeft={gbEnd ? Math.ceil(Math.abs((gbEnd.valueOf() - today.valueOf()) / oneDay)) : 0}
            {...{ title, subtitle, set, details, closeDetails, live }}
          />
        );
      })}
    </ImageList>
  );
};
export default ViewImageList;
