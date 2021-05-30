import React from "react";
import { useAppSelector } from "../../../app/hooks";
import { selectSetGroups } from "../../../app/slices/main/mainSlice";
import { SetType } from "../../../app/slices/main/types";
import { selectView } from "../../../app/slices/settings/settingsSlice";
import { Typography } from "@rmwc/typography";
import { ViewCard } from "../views/card/ViewCard";
import { ViewList } from "../views/list/ViewList";
import { ViewImageList } from "../views/image-list/ViewImageList";
import { ViewCompact } from "../views/compact/ViewCompact";
import "./ContentGrid.scss";

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
