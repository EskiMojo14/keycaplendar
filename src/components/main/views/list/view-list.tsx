import type { EntityId } from "@reduxjs/toolkit";
import { List, ListDivider } from "@rmwc/list";
import { useAppSelector } from "~/app/hooks";
import type { Page } from "@s/common/types";
import { selectSetMap } from "@s/main";
import { getSetDetails } from "@s/main/functions";
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
  return (
    <List className="view-list three-line" nonInteractive={loading} twoLine>
      {sets.map((setId) => {
        const { [setId]: set } = setMap;
        if (!set) {
          return null;
        }
        const { daysLeft, live, subtitle, thisWeek } = getSetDetails(set);
        return loading ? (
          <SkeletonList key={set.id} icon={set.shipped || live} />
        ) : (
          <ElementList
            key={set.id}
            designer={set.designer.join(" + ")}
            image={set.image.replace("keysets", "list")}
            live={page !== "live" && live}
            selected={detailSet === set.id}
            title={`${set.profile} ${set.colorway}`}
            {...{
              closeDetails,
              daysLeft,
              details,
              set,
              subtitle,
              thisWeek,
            }}
          />
        );
      })}
      <ListDivider />
    </List>
  );
};
export default ViewList;
