import React, { useContext } from "react";
import emptyImg from "../../media/empty.svg";
import { UserContext } from "../../util/contexts";
import { Page } from "../../util/types";
import { Typography } from "@rmwc/typography";
import "./ContentEmpty.scss";

type ContentEmptyProps = {
  page: Page;
};

export const ContentEmpty = (props: ContentEmptyProps) => {
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
