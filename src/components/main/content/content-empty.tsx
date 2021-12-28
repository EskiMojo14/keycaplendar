import { Typography } from "@rmwc/typography";
import { useAppSelector } from "~/app/hooks";
import { selectPage } from "@s/common";
import { selectFavorites, selectHidden } from "@s/user";
import emptyImg from "@m/empty.svg";
import "./content-empty.scss";

export const ContentEmpty = () => {
  const page = useAppSelector(selectPage);

  const favorites = useAppSelector(selectFavorites);
  const hidden = useAppSelector(selectHidden);
  return (
    <div className="empty-container">
      <img className="image" src={emptyImg} alt="Empty" />
      <Typography className="title" use="headline6" tag="h3">
        Nothing to see here
      </Typography>
      <Typography className="subtitle" use="body1" tag="p">
        {page === "favorites" && favorites.length === 0
          ? "No sets currently favorited."
          : page === "hidden" && hidden.length === 0
          ? "No sets currently hidden."
          : "No results, please adjust your filters/search."}
      </Typography>
    </div>
  );
};

export default ContentEmpty;
