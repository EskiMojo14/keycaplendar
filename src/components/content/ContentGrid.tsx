import React from "react";
import moment from "moment";
import { SetType } from "../../util/types";
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
  groups: string[];
  page: string;
  sets: SetType[];
  sort: string;
  view: string;
};

export const ContentGrid = (props: ContentGridProps) => {
  const filterSets = (sets: SetType[], group: string, sort: string, page: string) => {
    const filteredSets = sets.filter((set) => {
      if (sort === "icDate" || sort === "gbLaunch" || sort === "gbEnd") {
        const setDate = moment.utc(set[sort]);
        const setMonth = setDate.format("MMMM YYYY");
        return setMonth === group;
      } else if (sort === "vendor") {
        if (set.vendors) {
          return set.vendors.map((vendor) => vendor.name).includes(group);
        }
      } else if (sort === "designer") {
        return set.designer.includes(group);
      } else {
        return set[sort as keyof SetType] === group;
      }
    });
    filteredSets.sort((a, b) => {
      const aName = `${a.profile.toLowerCase()} ${a.colorway.toLowerCase()}`;
      const bName = `${b.profile.toLowerCase()} ${b.colorway.toLowerCase()}`;
      if (page === "archive" || page === "favorites") {
        if (aName > bName) {
          return 1;
        } else if (aName < bName) {
          return -1;
        }
      }
      if (sort === "icDate") {
        if (a.icDate < b.icDate) {
          return page === "ic" ? 1 : -1;
        }
        if (a.icDate > b.icDate) {
          return page === "ic" ? -1 : 1;
        }
      } else if (sort === "gbLaunch") {
        if (a.gbLaunch < b.gbLaunch) {
          return page === "previous" ? 1 : -1;
        }
        if (a.gbLaunch > b.gbLaunch) {
          return page === "previous" ? -1 : 1;
        }
        if (!a.gbMonth && b.gbMonth) {
          return -1;
        }
        if (a.gbMonth && !b.gbMonth) {
          return 1;
        }
      } else if (sort === "gbEnd") {
        if (a.gbEnd < b.gbEnd) {
          return page === "previous" ? 1 : -1;
        }
        if (a.gbEnd > b.gbEnd) {
          return page === "previous" ? -1 : 1;
        }
      }
      if (a.gbLaunch && b.gbLaunch) {
        if (a.gbLaunch < b.gbLaunch) {
          return page === "previous" ? 1 : -1;
        }
        if (a.gbLaunch > b.gbLaunch) {
          return page === "previous" ? -1 : 1;
        }
      } else {
        if (a.icDate < b.icDate) {
          return page === "ic" ? 1 : -1;
        }
        if (a.icDate > b.icDate) {
          return page === "ic" ? -1 : 1;
        }
      }
      if (aName > bName) {
        return 1;
      } else if (aName < bName) {
        return -1;
      }
      return 0;
    });
    return filteredSets;
  };
  const createGroup = (sets: SetType[]) => {
    if (props.view === "card") {
      return (
        <ViewCard
          sets={sets}
          page={props.page}
          details={props.details}
          closeDetails={props.closeDetails}
          detailSet={props.detailSet}
          edit={props.edit}
        />
      );
    } else if (props.view === "list") {
      return (
        <ViewList
          sets={sets}
          page={props.page}
          details={props.details}
          closeDetails={props.closeDetails}
          detailSet={props.detailSet}
        />
      );
    } else if (props.view === "imageList") {
      return (
        <ViewImageList
          sets={sets}
          page={props.page}
          details={props.details}
          closeDetails={props.closeDetails}
          detailSet={props.detailSet}
        />
      );
    } else if (props.view === "compact") {
      return (
        <ViewCompact
          sets={sets}
          page={props.page}
          details={props.details}
          closeDetails={props.closeDetails}
          detailSet={props.detailSet}
        />
      );
    }
  };
  return (
    <div className="content-grid">
      {props.groups.map((value) => {
        const filteredSets = filterSets(props.sets, value, props.sort, props.page);
        return (
          <div className="outer-container" key={value}>
            <div className="subheader">
              <Typography use="caption">
                {value} <b>{`(${filteredSets.length})`}</b>
              </Typography>
            </div>
            {createGroup(filteredSets)}
          </div>
        );
      })}
    </div>
  );
};

export default ContentGrid;
