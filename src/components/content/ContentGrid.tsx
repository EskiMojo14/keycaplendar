import React from "react";
import moment from "moment";
import { SetType } from "../../util/types";
import { Typography } from "@rmwc/typography";
import { ViewCard } from "../views/card/ViewCard";
import { ViewList } from "../views/list/ViewList";
import { ViewImageList } from "../views/image-list/ViewImageList";
import { ViewCompact } from "../views/compact/ViewCompact";
import "./ContentGrid.scss";
import { hasKey } from "../../util/functions";
import { dateSorts } from "../../util/constants";

type ContentGridProps = {
  closeDetails: () => void;
  detailSet: SetType;
  details: (set: SetType) => void;
  edit: (set: SetType) => void;
  groups: string[];
  page: string;
  sets: SetType[];
  sort: string;
  sortOrder: string;
  view: string;
};

export const ContentGrid = (props: ContentGridProps) => {
  const filterSets = (sets: SetType[], group: string, sort: string) => {
    const filteredSets = sets.filter((set) => {
      if (hasKey(set, sort) || sort === "vendor") {
        if (dateSorts.includes(sort) && sort !== "vendor") {
          const val = set[sort];
          const setDate = typeof val === "string" ? moment.utc(val) : null;
          const setMonth = setDate ? setDate.format("MMMM YYYY") : null;
          return setMonth && setMonth === group;
        } else if (sort === "vendor") {
          if (set.vendors) {
            return set.vendors.map((vendor) => vendor.name).includes(group);
          } else {
            return false;
          }
        } else if (sort === "designer") {
          return set.designer.includes(group);
        } else {
          return set[sort] === group;
        }
      } else {
        return false;
      }
    });
    const alphabeticalSort = (a: string, b: string) => {
      if (a > b) {
        return props.sortOrder === "ascending" ? 1 : -1;
      } else if (a < b) {
        return props.sortOrder === "ascending" ? -1 : 1;
      }
      return 0;
    };
    filteredSets.sort((a, b) => {
      const aName = `${a.profile.toLowerCase()} ${a.colorway.toLowerCase()}`;
      const bName = `${b.profile.toLowerCase()} ${b.colorway.toLowerCase()}`;
      if (dateSorts.includes(props.sort) && hasKey(a, props.sort) && hasKey(b, props.sort)) {
        const aProp = a[props.sort];
        const aDate = aProp && typeof aProp === "string" && !aProp.includes("Q") ? moment.utc(aProp) : null;
        const bProp = b[props.sort];
        const bDate = bProp && typeof bProp === "string" && !bProp.includes("Q") ? moment.utc(bProp) : null;
        if (aDate && bDate) {
          if (aDate > bDate) {
            return props.sortOrder === "ascending" ? 1 : -1;
          } else if (aDate < bDate) {
            return props.sortOrder === "ascending" ? -1 : 1;
          }
          return alphabeticalSort(aName, bName);
        }
        return alphabeticalSort(aName, bName);
      }
      return alphabeticalSort(aName, bName);
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
        const filteredSets = filterSets(props.sets, value, props.sort);
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
