import React from "react";
import Twemoji from "react-twemoji";
import LazyLoad from "react-lazy-load";
import classNames from "classnames";
import { useAppSelector } from "../../../app/hooks";
import { selectPage } from "../../../app/slices/commonSlice";
import { SetType } from "../../../util/types";
import {
  ImageListItem,
  ImageListImageAspectContainer,
  ImageListImage,
  ImageListSupporting,
  ImageListLabel,
} from "@rmwc/image-list";
import { IconButton } from "@rmwc/icon-button";
import { Ripple } from "@rmwc/ripple";
import { Typography } from "@rmwc/typography";
import { Tooltip } from "@rmwc/tooltip";
import "./ElementImage.scss";

type ElementImageProps = {
  closeDetails: () => void;
  daysLeft: number;
  details: (set: SetType) => void;
  image: string;
  link: string;
  live: boolean;
  selected: boolean;
  set: SetType;
  subtitle: string;
  thisWeek: boolean;
  title: string;
};

export const ElementImage = (props: ElementImageProps) => {
  const page = useAppSelector(selectPage);

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
    <div className="time-indicator">
      <Typography use="overline" className="live-indicator-text">
        {props.daysLeft} day{props.daysLeft === 1 ? "" : "s"}
      </Typography>
    </div>
  ) : null;
  return (
    <Ripple>
      <ImageListItem
        onClick={() => (!props.selected ? props.details(props.set) : props.closeDetails())}
        className={classNames("image-list-item", { selected: props.selected })}
      >
        <div className="container">
          <div className="link-icon-container">
            <IconButton
              className="link-icon"
              icon="open_in_new"
              tag="a"
              href={props.link}
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
          <div className="media-container">
            {timeIndicator}
            <ImageListImageAspectContainer style={{ paddingBottom: "calc(100% / 1)" }}>
              <LazyLoad debounce={false} offsetVertical={480}>
                <ImageListImage tag="div" style={{ backgroundImage: "url(" + props.image + ")" }} />
              </LazyLoad>
            </ImageListImageAspectContainer>
          </div>
          <ImageListSupporting>
            <ImageListLabel>
              <div className="text-container">
                <div className="primary-text">
                  <Twemoji options={{ className: "twemoji" }}>{props.title}</Twemoji>
                </div>
                <div className="secondary-text">{props.subtitle}</div>
              </div>
              {liveIndicator}
              {shipIndicator}
            </ImageListLabel>
          </ImageListSupporting>
        </div>
      </ImageListItem>
    </Ripple>
  );
};

export default ElementImage;
