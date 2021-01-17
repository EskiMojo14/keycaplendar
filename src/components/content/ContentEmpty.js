import React, { useContext } from "react";
import PropTypes from "prop-types";
import emptyImg from "../../media/empty.svg";
import { UserContext } from "../../util/contexts";
import { Typography } from "@rmwc/typography";
import "./ContentEmpty.scss";

export const ContentEmpty = (props) => {
  const { favorites, hidden } = useContext(UserContext);
  return (
    <div className="empty-container">
      <img className="image" src={emptyImg} alt="Empty" />
      <Typography className="title" use="headline6" tag="h3">
        Nothing to see here
      </Typography>
      <Typography className="subtitle" use="body1" tag="p">
        {props.page === "favorites" && favorites.length === 0
          ? "No sets currently favorited."
          : props.page === "hidden" && hidden.length === 0
          ? "No sets currently hidden."
          : "No results, please adjust your filters/search."}
      </Typography>
    </div>
  );
};

export default ContentEmpty;

ContentEmpty.propTypes = {
  page: PropTypes.string,
};
