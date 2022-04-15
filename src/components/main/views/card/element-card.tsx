import type { EntityId } from "@reduxjs/toolkit";
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
import { SkeletonCard } from "@c/main/views/card/skeleton-card";
import { withTooltip } from "@c/util/hocs";
import { selectDevice, selectPage } from "@s/common";
import { selectSetById } from "@s/main";
import { getSetDetails } from "@s/main/functions";
import { selectFavorites, selectHidden, selectUser } from "@s/user";
import { toggleFavorite, toggleHidden } from "@s/user/functions";
import {
  clearSearchParams,
  createURL,
  iconObject,
  pluralise,
} from "@s/util/functions";
import {
  CheckCircle,
  Edit,
  Favorite,
  NewReleases,
  Share,
  Visibility,
  VisibilityOff,
} from "@i";
import "./element-card.scss";

type ElementCardProps = {
  closeDetails: () => void;
  details: (set: EntityId) => void;
  edit: (set: EntityId) => void;
  selected: boolean;
  setId: EntityId;
  loading?: boolean;
};

export const ElementCard = ({
  closeDetails,
  details,
  edit,
  loading,
  selected,
  setId,
}: ElementCardProps) => {
  const set = useAppSelector((state) => selectSetById(state, setId));

  if (!set) {
    return null;
  }

  const { daysLeft, live, subtitle, thisWeek } = getSetDetails(set);

  const user = useAppSelector(selectUser);
  const page = useAppSelector(selectPage);
  const device = useAppSelector(selectDevice);
  const useLink = device === "desktop";

  const favorites = useAppSelector(selectFavorites);
  const hidden = useAppSelector(selectHidden);

  if (loading) {
    return <SkeletonCard icon={set.shipped || live} loggedIn={!!user?.email} />;
  }

  const copyShareLink = async () => {
    const url = createURL({ pathname: "/" }, (params) => {
      clearSearchParams(params);
      params.set("keysetAlias", set.alias);
    });
    try {
      await navigator.clipboard.writeText(url.href);
      queue.notify({ title: "Copied URL to clipboard." });
    } catch (error) {
      queue.notify({ title: `Error copying to clipboard ${error}` });
    }
  };

  const title = `${set.profile} ${set.colorway}`;

  const liveIndicator =
    page !== "live" &&
    live &&
    withTooltip(
      <Icon className="live-indicator" icon={iconObject(<NewReleases />)} />,
      "Live"
    );
  const shipIndicator =
    set.shipped &&
    withTooltip(
      <Icon className="ship-indicator" icon={iconObject(<CheckCircle />)} />,
      "Shipped"
    );
  const timeIndicator = thisWeek && (
    <Typography className="time-indicator" tag="h4" use="overline">
      {pluralise`${daysLeft} ${[daysLeft, "day"]}`}
    </Typography>
  );
  const userButtons =
    user.email &&
    (useLink ? (
      <CardActionButtons>
        <CardActionButton
          href={set.details}
          label="Link"
          rel="noopener noreferrer"
          tag="a"
          target="_blank"
        />
      </CardActionButtons>
    ) : (
      <CardActionButtons>
        <CardActionButton label="Share" onClick={copyShareLink} />
      </CardActionButtons>
    ));
  const linkIcon =
    !user.email &&
    withTooltip(
      <CardActionIcon
        href={set.details}
        icon="open_in_new"
        label={`Link to ${title}`}
        rel="noopener noreferrer"
        tag="a"
        target="_blank"
      />,
      "Link"
    );
  const shareIcon =
    !user.email &&
    withTooltip(
      <CardActionIcon
        icon={iconObject(<Share />)}
        label={`Copy link to ${title}`}
        onClick={copyShareLink}
      />,
      "Share"
    );
  const favoriteIcon =
    user.email &&
    withTooltip(
      <CardActionIcon
        checked={favorites.includes(set.id)}
        className="favorite"
        icon="favorite_border"
        onClick={() => toggleFavorite(set.id)}
        onIcon={iconObject(<Favorite />)}
      />,
      favorites.includes(set.id) ? "Unfavorite" : "Favorite"
    );
  const hiddenIcon =
    user.email &&
    !(
      user.isEditor ||
      (user.isDesigner && set.designer && set.designer.includes(user.nickname))
    ) &&
    withTooltip(
      <CardActionIcon
        checked={hidden.includes(set.id)}
        className="hide"
        icon={iconObject(<Visibility />)}
        onClick={() => toggleHidden(set.id)}
        onIcon={iconObject(<VisibilityOff />)}
      />,
      hidden.includes(set.id) ? "Unhide" : "Hide"
    );
  const editButton =
    user.isEditor ||
    (user.isDesigner &&
      set.designer &&
      set.designer.includes(user.nickname) &&
      withTooltip(
        <CardActionIcon
          icon={iconObject(<Edit />)}
          onClick={() => edit(set.id)}
        />,
        "Edit"
      ));
  return (
    <div className="card-container">
      <Card className={classNames({ "mdc-card--selected": selected })}>
        <CardPrimaryAction
          className={classNames("content", {
            "mdc-card__primary-action--selected": selected,
          })}
          onClick={() => (!selected ? details(set.id) : closeDetails())}
        >
          <div className="media-container">
            <LazyLoad
              className="lazy-load"
              debounce={false}
              offsetVertical={480}
            >
              <CardMedia
                sixteenByNine
                style={{
                  backgroundImage: `url(${set.image.replace(
                    "keysets",
                    "card"
                  )})`,
                }}
              />
            </LazyLoad>
            {timeIndicator}
          </div>
          <div className="text-row">
            <div className="text-container">
              <div className="overline">
                <Typography tag="h3" use="overline">
                  {set.designer.join(" + ")}
                </Typography>
                {liveIndicator}
                {shipIndicator}
              </div>
              <div className="title">
                <Typography tag="h2" use="headline5">
                  <Twemoji options={{ className: "twemoji" }}>{title}</Twemoji>
                </Typography>
              </div>
              <div className="subtitle">
                <Typography tag="p" use="subtitle2">
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
