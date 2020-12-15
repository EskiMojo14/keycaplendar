import React from "react";
import PropTypes from "prop-types";
import Twemoji from "react-twemoji";
import LazyLoad from "react-lazy-load";
import { setTypes } from "../../../util/propTypeTemplates";
import { ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, ListItemMeta } from "@rmwc/list";
import { IconButton } from "@rmwc/icon-button";
import { Typography } from "@rmwc/typography";
import { Tooltip } from "@rmwc/tooltip";
import "./ElementList.scss";

export const ElementList = (props) => {
  const liveIndicator =
    props.live && props.page !== "live" ? (
      <Tooltip content="Live" align="bottom" enterDelay={500}>
        <ListItemMeta
          className="live-indicator"
          icon={{
            strategy: "component",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                  d="M18.49 9.89l.26-2.79-2.74-.62-1.43-2.41L12 5.18 9.42 4.07 7.99 6.48l-2.74.62.26 2.78L3.66 12l1.85 2.11-.26 2.8 2.74.62 1.43 2.41L12 18.82l2.58 1.11 1.43-2.41 2.74-.62-.26-2.79L20.34 12l-1.85-2.11zM13 17h-2v-2h2v2zm0-4h-2V7h2v6z"
                  opacity=".3"
                />
                <path d="M20.9 5.54l-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12l-2.44-2.78.34-3.68zM18.75 16.9l-2.74.62-1.43 2.41L12 18.82l-2.58 1.11-1.43-2.41-2.74-.62.26-2.8L3.66 12l1.85-2.12-.26-2.78 2.74-.61 1.43-2.41L12 5.18l2.58-1.11 1.43 2.41 2.74.62-.26 2.79L20.34 12l-1.85 2.11.26 2.79zM11 15h2v2h-2zm0-8h2v6h-2z" />
              </svg>
            ),
          }}
        />
      </Tooltip>
    ) : null;
  const shipIndicator =
    props.set && props.set.shipped ? (
      <Tooltip content="Shipped" align="bottom" enterDelay={500}>
        <ListItemMeta
          className="ship-indicator"
          icon={{
            strategy: "component",
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                  d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm-2 13l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
                  opacity=".3"
                />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
              </svg>
            ),
          }}
        />
      </Tooltip>
    ) : null;
  const timeIndicator = props.thisWeek ? (
    <Typography use="overline" className="time-indicator">
      {props.daysLeft} day{props.daysLeft > 1 ? "s" : ""}
    </Typography>
  ) : null;
  return (
    <ListItem
      selected={props.selected}
      onClick={() => (!props.selected ? props.details(props.set) : props.closeDetails())}
    >
      <LazyLoad debounce={false} offsetVertical={480} className="list-image-container">
        <div className="list-image" style={{ backgroundImage: "url(" + props.image + ")" }}></div>
      </LazyLoad>
      <ListItemText>
        <Typography use="overline" className="overline">
          {props.set.designer.join(" + ")}
        </Typography>
        <ListItemPrimaryText>
          <Twemoji options={{ className: "twemoji" }}>{props.title}</Twemoji>
        </ListItemPrimaryText>
        <ListItemSecondaryText>{props.subtitle}</ListItemSecondaryText>
      </ListItemText>
      {timeIndicator}
      {liveIndicator}
      {shipIndicator}
      <div className="link-icon">
        <IconButton tag="a" href={props.link} target="_blank" rel="noopener noreferrer" icon="open_in_new" />
      </div>
    </ListItem>
  );
};

export default ElementList;

ElementList.propTypes = {
  closeDetails: PropTypes.func,
  daysLeft: PropTypes.number,
  details: PropTypes.func,
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
