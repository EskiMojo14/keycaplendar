import React from "react";
import PropTypes from "prop-types";
import Twemoji from "react-twemoji";
import LazyLoad from "react-lazy-load";
import { userTypes, setTypes } from "../../util/propTypeTemplates";
import { Typography } from "@rmwc/typography";
import { Card, CardMedia, CardPrimaryAction, CardActions, CardActionIcons, CardActionIcon } from "@rmwc/card";
import { Tooltip } from "@rmwc/tooltip";
import "./ElementCard.scss";

export const ElementCard = (props) => {
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
  const editButton =
    props.user.isEditor ||
    (props.user.isDesigner && props.set.designer && props.set.designer.includes(props.user.nickname)) ? (
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
        <CardActions className="hover-button">
          <CardActionIcons>
            <CardActionIcon
              icon="open_in_new"
              tag="a"
              href={props.link}
              target="_blank"
              rel="noopener noreferrer"
              label={"Link to " + props.title}
            />
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
  user: PropTypes.shape(userTypes),
};
