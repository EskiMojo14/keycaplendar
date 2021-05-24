import React from "react";
import Twemoji from "react-twemoji";
import LazyLoad from "react-lazy-load";
import classNames from "classnames";
import { useAppSelector } from "../../../../app/hooks";
import { selectPage } from "../../../../app/slices/common/commonSlice";
import { iconObject } from "../../../../app/slices/common/functions";
import { SetType } from "../../../../app/slices/main/types";
import { selectFavorites, selectHidden, selectUser } from "../../../../app/slices/user/userSlice";
import { toggleFavorite, toggleHidden } from "../../../../app/slices/user/functions";
import { Typography } from "@rmwc/typography";
import {
  Card,
  CardMedia,
  CardPrimaryAction,
  CardActions,
  CardActionButtons,
  CardActionButton,
  CardActionIcons,
  CardActionIcon,
} from "@rmwc/card";
import { Tooltip } from "@rmwc/tooltip";
import "./ElementCard.scss";

type ElementCardProps = {
  closeDetails: () => void;
  daysLeft: number;
  designer: string;
  details: (set: SetType) => void;
  edit: (set: SetType) => void;
  image: string;
  link: string;
  live: boolean;
  selected: boolean;
  set: SetType;
  subtitle: string;
  thisWeek: boolean;
  title: string;
};

export const ElementCard = (props: ElementCardProps) => {
  const page = useAppSelector(selectPage);

  const user = useAppSelector(selectUser);
  const favorites = useAppSelector(selectFavorites);
  const hidden = useAppSelector(selectHidden);

  const liveIndicator =
    props.live && page !== "live" ? (
      <Tooltip content="Live" align="bottom" enterDelay={500}>
        <div className="live-indicator">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M18.49 9.89l.26-2.79-2.74-.62-1.43-2.41L12 5.18 9.42 4.07 7.99 6.48l-2.74.62.26 2.78L3.66 12l1.85 2.11-.26 2.8 2.74.62 1.43 2.41L12 18.82l2.58 1.11 1.43-2.41 2.74-.62-.26-2.79L20.34 12l-1.85-2.11zM13 17h-2v-2h2v2zm0-4h-2V7h2v6z"
              opacity=".3"
            />
            <path d="M20.9 5.54l-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12l-2.44-2.78.34-3.68zM18.75 16.9l-2.74.62-1.43 2.41L12 18.82l-2.58 1.11-1.43-2.41-2.74-.62.26-2.8L3.66 12l1.85-2.12-.26-2.78 2.74-.61 1.43-2.41L12 5.18l2.58-1.11 1.43 2.41 2.74.62-.26 2.79L20.34 12l-1.85 2.11.26 2.79zM11 15h2v2h-2zm0-8h2v6h-2z" />
          </svg>
        </div>
      </Tooltip>
    ) : null;
  const shipIndicator =
    props.set && props.set.shipped ? (
      <Tooltip content="Shipped" align="bottom" enterDelay={500}>
        <div className="ship-indicator">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm-2 13l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
              opacity=".3"
            />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
          </svg>
        </div>
      </Tooltip>
    ) : null;
  const timeIndicator = props.thisWeek ? (
    <Typography use="overline" tag="h4" className="time-indicator">
      {props.daysLeft} day{props.daysLeft === 1 ? "" : "s"}
    </Typography>
  ) : null;
  const linkButton = user.email ? (
    <CardActionButtons>
      <CardActionButton
        icon="open_in_new"
        tag="a"
        href={props.link}
        target="_blank"
        rel="noopener noreferrer"
        label="Link"
      />
    </CardActionButtons>
  ) : null;
  const linkIcon = !user.email ? (
    <Tooltip enterDelay={500} content="Link" align="bottom">
      <CardActionIcon
        icon="open_in_new"
        tag="a"
        href={props.link}
        target="_blank"
        rel="noopener noreferrer"
        label={"Link to " + props.title}
      />
    </Tooltip>
  ) : null;
  const favoriteIcon = user.email ? (
    <Tooltip enterDelay={500} content={favorites.includes(props.set.id) ? "Unfavorite" : "Favorite"} align="bottom">
      <CardActionIcon
        icon="favorite_border"
        onIcon={iconObject(
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              d="M16.5 5c-1.54 0-3.04.99-3.56 2.36h-1.87C10.54 5.99 9.04 5 7.5 5 5.5 5 4 6.5 4 8.5c0 2.89 3.14 5.74 7.9 10.05l.1.1.1-.1C16.86 14.24 20 11.39 20 8.5c0-2-1.5-3.5-3.5-3.5z"
              opacity=".3"
            />
            <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
          </svg>
        )}
        className="favorite"
        checked={favorites.includes(props.set.id)}
        onClick={() => toggleFavorite(props.set.id)}
      />
    </Tooltip>
  ) : null;
  const hiddenIcon =
    user.email && !user.isEditor ? (
      <Tooltip enterDelay={500} content={hidden.includes(props.set.id) ? "Unhide" : "Hide"} align="bottom">
        <CardActionIcon
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                d="M12 6c-3.79 0-7.17 2.13-8.82 5.5C4.83 14.87 8.21 17 12 17s7.17-2.13 8.82-5.5C19.17 8.13 15.79 6 12 6zm0 10c-2.48 0-4.5-2.02-4.5-4.5S9.52 7 12 7s4.5 2.02 4.5 4.5S14.48 16 12 16z"
                opacity=".3"
              />
              <path d="M12 4C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 13c-3.79 0-7.17-2.13-8.82-5.5C4.83 8.13 8.21 6 12 6s7.17 2.13 8.82 5.5C19.17 14.87 15.79 17 12 17zm0-10c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7zm0 7c-1.38 0-2.5-1.12-2.5-2.5S10.62 9 12 9s2.5 1.12 2.5 2.5S13.38 14 12 14z" />
            </svg>
          )}
          onIcon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none" />
              <path
                d="M12 14c.04 0 .08-.01.12-.01l-2.61-2.61c0 .04-.01.08-.01.12 0 1.38 1.12 2.5 2.5 2.5zm1.01-4.79l1.28 1.28c-.26-.57-.71-1.03-1.28-1.28zm7.81 2.29C19.17 8.13 15.79 6 12 6c-.68 0-1.34.09-1.99.22l.92.92c.35-.09.7-.14 1.07-.14 2.48 0 4.5 2.02 4.5 4.5 0 .37-.06.72-.14 1.07l2.05 2.05c.98-.86 1.81-1.91 2.41-3.12zM12 17c.95 0 1.87-.13 2.75-.39l-.98-.98c-.54.24-1.14.37-1.77.37-2.48 0-4.5-2.02-4.5-4.5 0-.63.13-1.23.36-1.77L6.11 7.97c-1.22.91-2.23 2.1-2.93 3.52C4.83 14.86 8.21 17 12 17z"
                opacity=".3"
              />
              <path d="M12 6c3.79 0 7.17 2.13 8.82 5.5-.59 1.22-1.42 2.27-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm2.28 4.49l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.06-1.07.14L13 9.21c.58.25 1.03.71 1.28 1.28zM2.01 3.87l2.68 2.68C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02-1.38 0-2.5-1.12-2.5-2.5 0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75c-.23.55-.36 1.15-.36 1.78 0 2.48 2.02 4.5 4.5 4.5.63 0 1.23-.13 1.77-.36l.98.98c-.88.24-1.8.38-2.75.38-3.79 0-7.17-2.13-8.82-5.5.7-1.43 1.72-2.61 2.93-3.53z" />
            </svg>
          )}
          className="hide"
          checked={hidden.includes(props.set.id)}
          onClick={() => toggleHidden(props.set.id)}
        />
      </Tooltip>
    ) : null;
  const editButton =
    user.isEditor || (user.isDesigner && props.set.designer && props.set.designer.includes(user.nickname)) ? (
      <Tooltip enterDelay={500} content="Edit" align="bottom">
        <CardActionIcon
          icon={iconObject(
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" />
                <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" />
              </svg>
            </div>
          )}
          onClick={() => props.edit(props.set)}
        />
      </Tooltip>
    ) : null;
  return (
    <div className="card-container">
      <Card className={classNames({ "mdc-card--selected": props.selected })}>
        <CardPrimaryAction
          className={classNames({ "mdc-card__primary-action--selected": props.selected })}
          onClick={() => (!props.selected ? props.details(props.set) : props.closeDetails())}
        >
          <div className="media-container">
            <LazyLoad debounce={false} offsetVertical={480} className="lazy-load">
              <CardMedia sixteenByNine style={{ backgroundImage: "url(" + props.image + ")" }} />
            </LazyLoad>
            {timeIndicator}
          </div>
          <div className="text-row">
            <div className="text-container">
              <div className="overline">
                <Typography use="overline" tag="h3">
                  {props.designer}
                </Typography>
                {liveIndicator}
                {shipIndicator}
              </div>
              <div className="title">
                <Typography use="headline5" tag="h2">
                  <Twemoji options={{ className: "twemoji" }}>{props.title}</Twemoji>
                </Typography>
              </div>
              <Typography use="subtitle2" tag="p">
                {props.subtitle}
              </Typography>
            </div>
          </div>
        </CardPrimaryAction>
        <CardActions className={classNames({ "hover-button": !user.email })}>
          {linkButton}
          <CardActionIcons>
            {linkIcon}
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
