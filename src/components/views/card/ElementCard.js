import React, { useContext } from "react";
import PropTypes from "prop-types";
import Twemoji from "react-twemoji";
import LazyLoad from "react-lazy-load";
import { setTypes } from "../../util/propTypeTemplates";
import { UserContext } from "../../util/contexts";
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

export const ElementCard = (props) => {
  const { user, favorites, toggleFavorite } = useContext(UserContext);
  const liveIndicator =
    props.live && props.page !== "live" ? (
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
      {props.daysLeft} day{props.daysLeft > 1 ? "s" : ""}
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
    <Tooltip enterDelay={500} content="Favorite" align="bottom">
      <CardActionIcon
        icon="favorite_border"
        onIcon={{
          strategy: "component",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path
                d="M16.5 5c-1.54 0-3.04.99-3.56 2.36h-1.87C10.54 5.99 9.04 5 7.5 5 5.5 5 4 6.5 4 8.5c0 2.89 3.14 5.74 7.9 10.05l.1.1.1-.1C16.86 14.24 20 11.39 20 8.5c0-2-1.5-3.5-3.5-3.5z"
                opacity=".3"
              />
              <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
            </svg>
          ),
        }}
        className="favorite"
        checked={favorites.includes(props.set.id)}
        onClick={() => toggleFavorite(props.set.id)}
      />
    </Tooltip>
  ) : null;
  const editButton =
    user.isEditor || (user.isDesigner && props.set.designer && props.set.designer.includes(user.nickname)) ? (
      <Tooltip enterDelay={500} content="Edit" align="bottom">
        <CardActionIcon
          icon={{
            strategy: "component",
            icon: (
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" />
                  <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" />
                </svg>
              </div>
            ),
          }}
          onClick={() => props.edit(props.set)}
        />
      </Tooltip>
    ) : null;
  return (
    <div className="card-container">
      <Card className={props.selected ? "mdc-card--selected" : ""}>
        <CardPrimaryAction
          className={props.selected ? "mdc-card__primary-action--selected" : ""}
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
        <CardActions className={!user.email ? "hover-button" : ""}>
          {linkButton}
          <CardActionIcons>
            {linkIcon}
            {favoriteIcon}
            {editButton}
          </CardActionIcons>
        </CardActions>
      </Card>
    </div>
  );
};

export default ElementCard;

ElementCard.propTypes = {
  closeDetails: PropTypes.func,
  daysLeft: PropTypes.number,
  designer: PropTypes.string,
  details: PropTypes.func,
  edit: PropTypes.func,
  image: PropTypes.string,
  link: PropTypes.string,
  live: PropTypes.bool,
  page: PropTypes.string,
  selected: PropTypes.bool,
  set: PropTypes.shape(setTypes()),
  subtitle: PropTypes.string,
  thisWeek: PropTypes.bool,
  title: PropTypes.string,
};
