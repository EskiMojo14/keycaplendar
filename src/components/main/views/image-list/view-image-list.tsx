import type { EntityId } from "@reduxjs/toolkit";
import { ImageList } from "@rmwc/image-list";
import { useAppSelector } from "~/app/hooks";
import type { Page } from "@s/common/types";
import { selectSetMap } from "@s/main";
import { getSetDetails } from "@s/main/functions";
import { ElementImage } from "./element-image";
import { SkeletonImage } from "./skeleton-image";

type ViewImageListProps = {
  closeDetails: () => void;
  details: (set: EntityId) => void;
  detailSet: EntityId;
  sets: EntityId[];
  loading?: boolean;
  page?: Page;
};

export const ViewImageList = ({
  closeDetails,
  details,
  detailSet,
  loading,
  page,
  sets,
}: ViewImageListProps) => {
  const setMap = useAppSelector(selectSetMap);
  return (
    <ImageList style={{ margin: -2 }} withTextProtection>
      {sets.map((setId) => {
        const { [setId]: set } = setMap;
        if (!set) {
          return null;
        }
        const { daysLeft, live, subtitle, thisWeek } = getSetDetails(set, {
          month: "MMM",
        });
        return loading ? (
          <SkeletonImage key={set.id} icon={set.shipped || live} />
        ) : (
          <ElementImage
            key={set.id}
            image={set.image.replace("keysets", "image-list")}
            link={set.details}
            live={page !== "live" && live}
            selected={detailSet === set.id}
            title={`${set.profile} ${set.colorway}`}
            {...{ closeDetails, daysLeft, details, set, subtitle, thisWeek }}
          />
        );
      })}
    </ImageList>
  );
};
export default ViewImageList;
