import {
  Card,
  CardActionButton,
  CardActionButtons,
  CardActionIcon,
  CardActionIcons,
  CardActions,
  CardMedia,
  CardPrimaryAction,
} from "@rmwc/card";
import { Icon } from "@rmwc/icon";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import LazyLoad from "react-lazy-load";
import Twemoji from "react-twemoji";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import { selectDevice } from "@s/common";
import type { SetType } from "@s/main/types";
import { selectFavorites, selectHidden } from "@s/user";
import { toggleFavorite, toggleHidden } from "@s/user/functions";
import type { CurrentUserType } from "@s/user/types";
import { iconObject, pluralise } from "@s/util/functions";
import { CheckCircle, Edit, Favorite, NewReleases, Share, Visibility, VisibilityOff } from "@i";
import "./element-card.scss";

type ElementCardProps = {
  closeDetails: () => void;
  daysLeft: number;
  designer: string;
  details: (set: SetType) => void;
  edit: (set: SetType) => void;
  image: string;
  live: boolean;
  selected: boolean;
  set: SetType;
  subtitle: string;
  thisWeek: boolean;
  title: string;
  user: CurrentUserType;
};

export const ElementCard = ({
  closeDetails,
  daysLeft,
  designer,
  details,
  edit,
  image,
  live,
  selected,
  set,
  subtitle,
  thisWeek,
  title,
  user,
}: ElementCardProps) => {
  const device = useAppSelector(selectDevice);
  const favorites = useAppSelector(selectFavorites);
  const hidden = useAppSelector(selectHidden);

  const copyShareLink = () => {
    const arr = window.location.href.split("/");
    const url = arr[0] + "//" + arr[2] + "?keysetAlias=" + set.alias;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        queue.notify({ title: "Copied URL to clipboard." });
      })
      .catch((error) => {
        queue.notify({ title: "Error copying to clipboard" + error });
      });
  };

  const useLink = device === "desktop";

  const liveIndicator = live
    ? withTooltip(<Icon className="live-indicator" icon={iconObject(<NewReleases />)} />, "Live")
    : null;
  const shipIndicator = set?.shipped
    ? withTooltip(<Icon className="ship-indicator" icon={iconObject(<CheckCircle />)} />, "Shipped")
    : null;
  const timeIndicator = thisWeek ? (
    <Typography use="overline" tag="h4" className="time-indicator">
      {pluralise`${daysLeft} ${[daysLeft, "day"]}`}
    </Typography>
  ) : null;
  const userButtons = user.email ? (
    useLink ? (
      <CardActionButtons>
        <CardActionButton tag="a" label="Link" href={set.details} target="_blank" rel="noopener noreferrer" />
      </CardActionButtons>
    ) : (
      <CardActionButtons>
        <CardActionButton label="Share" onClick={copyShareLink} />
      </CardActionButtons>
    )
  ) : null;
  const linkIcon = !user.email
    ? withTooltip(
        <CardActionIcon
          icon="open_in_new"
          tag="a"
          href={set.details}
          target="_blank"
          rel="noopener noreferrer"
          label={"Link to " + title}
        />,
        "Link"
      )
    : null;
  const shareIcon = !user.email
    ? withTooltip(
        <CardActionIcon icon={iconObject(<Share />)} label={"Copy link to " + title} onClick={copyShareLink} />,
        "Share"
      )
    : null;
  const favoriteIcon = user.email
    ? withTooltip(
        <CardActionIcon
          icon="favorite_border"
          onIcon={iconObject(<Favorite />)}
          className="favorite"
          checked={favorites.includes(set.id)}
          onClick={() => toggleFavorite(set.id)}
        />,
        favorites.includes(set.id) ? "Unfavorite" : "Favorite"
      )
    : null;
  const hiddenIcon =
    user.email && !(user.isEditor || (user.isDesigner && set.designer && set.designer.includes(user.nickname)))
      ? withTooltip(
          <CardActionIcon
            icon={iconObject(<Visibility />)}
            onIcon={iconObject(<VisibilityOff />)}
            className="hide"
            checked={hidden.includes(set.id)}
            onClick={() => toggleHidden(set.id)}
          />,
          hidden.includes(set.id) ? "Unhide" : "Hide"
        )
      : null;
  const editButton =
    user.isEditor || (user.isDesigner && set.designer && set.designer.includes(user.nickname))
      ? withTooltip(<CardActionIcon icon={iconObject(<Edit />)} onClick={() => edit(set)} />, "Edit")
      : null;
  return (
    <div className="card-container">
      <Card className={classNames({ "mdc-card--selected": selected })}>
        <CardPrimaryAction
          className={classNames({ "mdc-card__primary-action--selected": selected })}
          onClick={() => (!selected ? details(set) : closeDetails())}
        >
          <div className="media-container">
            <LazyLoad debounce={false} offsetVertical={480} className="lazy-load">
              <CardMedia sixteenByNine style={{ backgroundImage: "url(" + image + ")" }} />
            </LazyLoad>
            {timeIndicator}
          </div>
          <div className="text-row">
            <div className="text-container">
              <div className="overline">
                <Typography use="overline" tag="h3">
                  {designer}
                </Typography>
                {liveIndicator}
                {shipIndicator}
              </div>
              <div className="title">
                <Typography use="headline5" tag="h2">
                  <Twemoji options={{ className: "twemoji" }}>{title}</Twemoji>
                </Typography>
              </div>
              <div className="subtitle">
                <Typography use="subtitle2" tag="p">
                  {subtitle}
                </Typography>
              </div>
            </div>
          </div>
        </CardPrimaryAction>
        <CardActions className={classNames({ "hover-button": !user.email })}>
          {userButtons}
          <CardActionIcons>
            {linkIcon}
            {shareIcon}
            {favoriteIcon}
            {hiddenIcon}
            {editButton}
          </CardActionIcons>
        </CardActions>
      </Card>
    </div>
  );
};

export default ElementCard;
