import type { EntityId } from "@reduxjs/toolkit";
import { useAppSelector } from "~/app/hooks";
import { SkeletonCard } from "@c/main/views/card/skeleton-card";
import type { Page } from "@s/common/types";
import { selectSetMap } from "@s/main";
import { getSetDetails } from "@s/main/functions";
import type { CurrentUserType } from "@s/user/types";
import { ElementCard } from "./element-card";
import "./view-card.scss";

type ViewCardProps = {
  closeDetails: () => void;
  details: (set: EntityId) => void;
  detailSet: EntityId;
  edit: (set: EntityId) => void;
  page: Page;
  sets: EntityId[];
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
  const setMap = useAppSelector(selectSetMap);
  return (
    <div className="group-container">
      {sets.map((setId) => {
        const { [setId]: set } = setMap;
        if (!set) {
          return null;
        }
        const { daysLeft, live, subtitle, thisWeek } = getSetDetails(set);
        return loading ? (
          <SkeletonCard
            key={set.id}
            icon={set.shipped || live}
            loggedIn={!!user?.email}
          />
        ) : (
          <ElementCard
            key={set.id}
            designer={set.designer.join(" + ")}
            image={set.image.replace("keysets", "card")}
            live={page !== "live" && live}
            selected={detailSet === set.id}
            title={`${set.profile} ${set.colorway}`}
            {...{
              closeDetails,
              daysLeft,
              details,
              edit,
              set,
              subtitle,
              thisWeek,
              user,
            }}
          />
        );
      })}
    </div>
  );
};
export default ViewCard;
