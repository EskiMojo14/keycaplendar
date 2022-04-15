import type { EntityId } from "@reduxjs/toolkit";
import { Card } from "@rmwc/card";
import { List } from "@rmwc/list";
import { useAppSelector } from "~/app/hooks";
import type { Page } from "@s/common/types";
import { selectSetMap } from "@s/main";
import { getSetDetails } from "@s/main/functions";
import { ElementCompact } from "./element-compact";
import { SkeletonCompact } from "./skeleton-compact";
import "./view-compact.scss";

type ViewCompactProps = {
  closeDetails: () => void;
  details: (set: EntityId) => void;
  detailSet: EntityId;
  page: Page;
  sets: EntityId[];
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
  const setMap = useAppSelector(selectSetMap);
  return (
    <Card>
      <List nonInteractive={loading} twoLine>
        {sets.map((setId) => {
          const { [setId]: set } = setMap;
          if (!set) {
            return null;
          }
          const { live, subtitle } = getSetDetails(set, { month: "MMM" });
          return loading ? (
            <SkeletonCompact key={set.id} icon={set.shipped || live} />
          ) : (
            <ElementCompact
              key={set.id}
              link={set.details}
              live={page !== "live" && live}
              selected={detailSet === set.id}
              title={`${set.profile} ${set.colorway}`}
              {...{ closeDetails, details, set, subtitle }}
            />
          );
        })}
      </List>
    </Card>
  );
};

export default ViewCompact;
