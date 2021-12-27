import { Typography } from "@rmwc/typography";
import { useAppSelector } from "~/app/hooks";
import { ViewCard } from "@c/main/views/card/view-card";
import { ViewCompact } from "@c/main/views/compact/view-compact";
import { ViewImageList } from "@c/main/views/image-list/view-image-list";
import { ViewList } from "@c/main/views/list/view-list";
import { selectSetGroups } from "@s/main";
import { SetType } from "@s/main/types";
import { selectView } from "@s/settings";
import "./content-grid.scss";

type ContentGridProps = {
  closeDetails: () => void;
  detailSet: SetType;
  details: (set: SetType) => void;
  edit: (set: SetType) => void;
};

export const ContentGrid = (props: ContentGridProps) => {
  const view = useAppSelector(selectView);

  const setGroups = useAppSelector(selectSetGroups);

  const createGroup = (sets: SetType[]) => {
    if (view === "card") {
      return (
        <ViewCard
          sets={sets}
          details={props.details}
          closeDetails={props.closeDetails}
          detailSet={props.detailSet}
          edit={props.edit}
        />
      );
    } else if (view === "list") {
      return (
        <ViewList sets={sets} details={props.details} closeDetails={props.closeDetails} detailSet={props.detailSet} />
      );
    } else if (view === "imageList") {
      return (
        <ViewImageList
          sets={sets}
          details={props.details}
          closeDetails={props.closeDetails}
          detailSet={props.detailSet}
        />
      );
    } else if (view === "compact") {
      return (
        <ViewCompact
          sets={sets}
          details={props.details}
          closeDetails={props.closeDetails}
          detailSet={props.detailSet}
        />
      );
    }
  };
  return (
    <div className="content-grid">
      {setGroups.map((group) => {
        return (
          <div className="outer-container" key={group.title}>
            <div className="subheader">
              <Typography use="caption">
                {group.title} <b>{`(${group.sets.length})`}</b>
              </Typography>
            </div>
            {createGroup(group.sets)}
          </div>
        );
      })}
    </div>
  );
};

export default ContentGrid;
