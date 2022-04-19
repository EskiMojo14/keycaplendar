import { Typography } from "@rmwc/typography";
import { useAppSelector } from "@h";
import usePage from "@h/use-page";
import { selectFavorites, selectHidden } from "@s/user";
import emptyImg from "@m/empty.svg";
import "./content-empty.scss";

export const ContentEmpty = () => {
  const page = usePage();

  const favorites = useAppSelector(selectFavorites);
  const hidden = useAppSelector(selectHidden);
  return (
    <div className="empty-container">
      <img alt="Empty" className="image" src={emptyImg} />
      <Typography className="title" tag="h3" use="headline6">
        Nothing to see here
      </Typography>
      <Typography className="subtitle" tag="p" use="body1">
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
