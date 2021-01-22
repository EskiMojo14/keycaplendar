import React from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import { setTypes } from "../../util/propTypeTemplates";
import { Typography } from "@rmwc/typography";
import { ViewCard } from "../views/card/ViewCard";
import { ViewList } from "../views/list/ViewList";
import { ViewImageList } from "../views/image-list/ViewImageList";
import { ViewCompact } from "../views/compact/ViewCompact";
import "./ContentGrid.scss";

export const ContentGrid = (props) => {
  const filterSets = (sets, group, sort, page) => {
    let filteredSets = sets.filter((set) => {
      if (sort === "icDate" || sort === "gbLaunch" || sort === "gbEnd") {
        let setMonth = set[sort] ? format(new Date(set[sort]), "MMMM yyyy") : null;
        return setMonth === group;
      } else if (sort === "vendor") {
        return set.vendors[0] && set.vendors[0].name === group;
      } else if (sort === "designer") {
        return set.designer.includes(group);
      } else {
        return set[sort] === group;
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
