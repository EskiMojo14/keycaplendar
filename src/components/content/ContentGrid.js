import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { setTypes } from "../../util/propTypeTemplates";
import { Typography } from "@rmwc/typography";
import { ViewCard } from "../views/card/ViewCard";
import { ViewList } from "../views/list/ViewList";
import { ViewImageList } from "../views/image-list/ViewImageList";
import { ViewCompact } from "../views/compact/ViewCompact";

import "./ContentGrid.scss";

export const ContentGrid = (props) => {
  const filterSets = (sets, group, sort, page) => {
    let filteredSets = [];
    sets.forEach((set) => {
      if (sort === "icDate" || sort === "gbLaunch" || sort === "gbEnd") {
        const setDate = moment.utc(set[sort]);
        let setMonth = setDate.format("MMMM YYYY");
        if (setMonth === group) {
          filteredSets.push(set);
        }
      } else if (sort === "vendor") {
        if (set.vendors[0]) {
          if (set.vendors[0].name === group) {
            filteredSets.push(set);
          }
        }
      } else if (sort === "designer") {
        if (set.designer.includes(group)) {
          filteredSets.push(set);
        }
      } else {
        if (set[sort] === group) {
          filteredSets.push(set);
        }
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
  const createGroup = (sets) => {
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

ContentGrid.propTypes = {
  closeDetails: PropTypes.func,
  detailSet: PropTypes.shape(setTypes()),
  details: PropTypes.func,
  edit: PropTypes.func,
  groups: PropTypes.arrayOf(PropTypes.string),
  page: PropTypes.string,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  sort: PropTypes.string,
  view: PropTypes.string,
};
