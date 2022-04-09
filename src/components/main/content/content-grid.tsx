import type { EntityId } from "@reduxjs/toolkit";
import { Typography } from "@rmwc/typography";
import { useAppSelector } from "~/app/hooks";
import { ViewCard } from "@c/main/views/card/view-card";
import { ViewCompact } from "@c/main/views/compact/view-compact";
import { ViewImageList } from "@c/main/views/image-list/view-image-list";
import { ViewList } from "@c/main/views/list/view-list";
import { SkeletonBlock } from "@c/util/skeleton-block";
import { selectPage } from "@s/common";
import { selectAllSetGroups, selectLoading } from "@s/main";
import { selectView } from "@s/settings";
import { selectUser } from "@s/user";
import "./content-grid.scss";

type ContentGridProps = {
  closeDetails: () => void;
  details: (set: EntityId) => void;
  detailSet: EntityId;
  edit: (set: EntityId) => void;
};

export const ContentGrid = ({
  closeDetails,
  details,
  detailSet,
  edit,
}: ContentGridProps) => {
  const view = useAppSelector(selectView);

  const setGroups = useAppSelector(selectAllSetGroups);
  const loading = useAppSelector(selectLoading);

  const user = useAppSelector(selectUser);
  const page = useAppSelector(selectPage);

  const createGroup = (sets: EntityId[]) => {
    switch (view) {
      case "card": {
        return (
          <ViewCard
            {...{
              closeDetails,
              details,
              detailSet,
              edit,
              loading,
              page,
              sets,
              user,
            }}
          />
        );
      }
      case "list": {
        return (
          <ViewList
            {...{ closeDetails, details, detailSet, edit, loading, page, sets }}
          />
        );
      }
      case "imageList": {
        return (
          <ViewImageList
            {...{ closeDetails, details, detailSet, edit, loading, page, sets }}
          />
        );
      }
      case "compact": {
        return (
          <ViewCompact
            {...{ closeDetails, details, detailSet, edit, loading, page, sets }}
          />
        );
      }
      default:
        return null;
    }
  };
  return (
    <div className="content-grid">
      {setGroups.map((group) => (
        <div key={group.title} className="outer-container">
          <div className="subheader">
            {loading ? (
              <SkeletonBlock
                content={`${group.title} (${group.sets.length})`}
                typography="caption"
              />
            ) : (
              <Typography use="caption">
                {group.title} <b>{`(${group.sets.length})`}</b>
              </Typography>
            )}
          </div>
          {createGroup(group.sets)}
        </div>
      ))}
    </div>
  );
};

export default ContentGrid;
