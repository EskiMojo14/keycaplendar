import { useCallback } from "react";
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
import { notify } from "~/app/snackbar-queue";
import { SkeletonCard } from "@c/main/views/card/skeleton-card";
import { withTooltip } from "@c/util/hocs";
import { useAppDispatch, useAppSelector } from "@h";
import useDevice from "@h/use-device";
import usePage from "@h/use-page";
import { selectSetById } from "@s/main";
import { getSetDetails } from "@s/main/functions";
import { createURL } from "@s/router/functions";
import {
  createSelectSetFavorited,
  createSelectSetHidden,
  selectUser,
} from "@s/user";
import { toggleFavorite, toggleHidden } from "@s/user/thunks";
import { iconObject, pluralise } from "@s/util/functions";
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
  const dispatch = useAppDispatch();

  const device = useDevice();
  const useLink = device === "desktop";

  const page = usePage();

  const selectFavorited = useCallback(createSelectSetFavorited(), []);
  const favorited = useAppSelector((state) => selectFavorited(state, setId));
  const selectHidden = useCallback(createSelectSetHidden(), []);
  const hidden = useAppSelector((state) => selectHidden(state, setId));

  const set = useAppSelector((state) => selectSetById(state, setId));

  if (!set) {
    return null;
  }

  const { daysLeft, live, subtitle, thisWeek } = getSetDetails(set);

  const user = useAppSelector(selectUser);

  if (loading) {
    return <SkeletonCard icon={set.shipped || live} loggedIn={!!user?.email} />;
  }

  const copyShareLink = async () => {
    const url = createURL({ pathname: `/calendar/${set.alias}`, search: "" });
    try {
      await navigator.clipboard.writeText(url.href);
      notify({ title: "Copied URL to clipboard." });
    } catch (error) {
      notify({ title: `Error copying to clipboard ${error}` });
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
  const userButtons = user.email && (
    <CardActionButtons>
      {useLink ? (
        <CardActionButton
          href={set.details}
          label="Link"
          rel="noopener noreferrer"
          tag="a"
          target="_blank"
        />
      ) : (
        <CardActionButton label="Share" onClick={copyShareLink} />
      )}
    </CardActionButtons>
  );
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
        checked={favorited}
        className="favorite"
        icon="favorite_border"
        onClick={() => dispatch(toggleFavorite(set.id))}
        onIcon={iconObject(<Favorite />)}
      />,
      favorited ? "Unfavorite" : "Favorite"
    );
  const hiddenIcon =
    user.email &&
    !(
      user.isEditor ||
      (user.isDesigner && set.designer && set.designer.includes(user.nickname))
    ) &&
    withTooltip(
      <CardActionIcon
        checked={hidden}
        className="hide"
        icon={iconObject(<Visibility />)}
        onClick={() => dispatch(toggleHidden(set.id))}
        onIcon={iconObject(<VisibilityOff />)}
      />,
      hidden ? "Unhide" : "Hide"
    );
  const editButton =
    user.isEditor ||
    (user.isDesigner && set.designer && set.designer.includes(user.nickname))
      ? withTooltip(
          <CardActionIcon
            icon={iconObject(<Edit />)}
            onClick={() => edit(set.id)}
          />,
          "Edit"
        )
      : null;
  return (
    <div className="card-container">
      <Card className={classNames({ "mdc-card--selected": selected })}>
        <CardPrimaryAction
          className={classNames("content", {
            "mdc-card__primary-action--selected": selected,
          })}
          onClick={() => {
            if (!selected) {
              details(set.alias);
            } else {
              closeDetails();
            }
          }}
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
