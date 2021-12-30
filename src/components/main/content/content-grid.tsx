import { Typography } from "@rmwc/typography";
import { useAppSelector } from "~/app/hooks";
import { ViewCard } from "@c/main/views/card/view-card";
import { ViewCompact } from "@c/main/views/compact/view-compact";
import { ViewImageList } from "@c/main/views/image-list/view-image-list";
import { ViewList } from "@c/main/views/list/view-list";
import { SkeletonBlock } from "@c/util/skeleton-block";
import { selectLoading, selectSetGroups } from "@s/main";
import type { SetType } from "@s/main/types";
import { selectView } from "@s/settings";
import { selectUser } from "@s/user";
import "./content-grid.scss";

type ContentGridProps = {
  closeDetails: () => void;
  detailSet: SetType;
  details: (set: SetType) => void;
  edit: (set: SetType) => void;
};

export const ContentGrid = ({ details, closeDetails, detailSet, edit }: ContentGridProps) => {
  const view = useAppSelector(selectView);

  const setGroups = useAppSelector(selectSetGroups);
  const loading = useAppSelector(selectLoading);

  const user = useAppSelector(selectUser);

  const createGroup = (sets: SetType[]) => {
    switch (view) {
      case "card": {
        return <ViewCard {...{ sets, details, detailSet, closeDetails, edit, loading, user }} />;
      }
      case "list": {
        return <ViewList {...{ sets, details, detailSet, closeDetails, edit, loading }} />;
      }
      case "imageList": {
        return <ViewImageList {...{ sets, details, detailSet, closeDetails, edit, loading }} />;
      }
      case "compact": {
        return <ViewCompact {...{ sets, details, detailSet, closeDetails, edit, loading }} />;
      }
      default:
        return null;
    }
  };
  return (
    <div className="content-grid">
      {setGroups.map((group) => {
        return (
          <div className="outer-container" key={group.title}>
            <div className="subheader">
              {loading ? (
                <SkeletonBlock typography="caption" content={`${group.title} (${group.sets.length})`} />
              ) : (
                <Typography use="caption">
                  {group.title} <b>{`(${group.sets.length})`}</b>
                </Typography>
              )}
            </div>
            {createGroup(group.sets)}
          </div>
        );
      })}
    </div>
  );
};

export default ContentGrid;
