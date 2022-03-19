import type { EntityId } from "@reduxjs/toolkit";
import { Icon } from "@rmwc/icon";
import { IconButton } from "@rmwc/icon-button";
import {
  ImageListImage,
  ImageListImageAspectContainer,
  ImageListItem,
  ImageListLabel,
  ImageListSupporting,
} from "@rmwc/image-list";
import { Ripple } from "@rmwc/ripple";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import LazyLoad from "react-lazy-load";
import Twemoji from "react-twemoji";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import { selectDevice } from "@s/common";
import type { SetType } from "@s/main/types";
import {
  clearSearchParams,
  createURL,
  iconObject,
  pluralise,
} from "@s/util/functions";
import { CheckCircle, NewReleases, Share } from "@i";
import "./element-image.scss";

type ElementImageProps = {
  closeDetails: () => void;
  daysLeft: number;
  details: (set: EntityId) => void;
  image: string;
  link: string;
  live: boolean;
  selected: boolean;
  set: SetType;
  subtitle: string;
  thisWeek: boolean;
  title: string;
};

export const ElementImage = ({
  closeDetails,
  daysLeft,
  details,
  image,
  link,
  live,
  selected,
  set,
  subtitle,
  thisWeek,
  title,
}: ElementImageProps) => {
  const device = useAppSelector(selectDevice);

  const copyShareLink = () => {
    const url = createURL({ pathname: "/" }, (params) => {
      clearSearchParams(params);
      params.set("keysetAlias", set.alias);
    });
    navigator.clipboard
      .writeText(url.href)
      .then(() => {
        queue.notify({ title: "Copied URL to clipboard." });
      })
      .catch((error) => {
        queue.notify({ title: `Error copying to clipboard ${error}` });
      });
  };

  const useLink = device === "desktop";

  const liveIndicator = live
    ? withTooltip(
        <Icon className="live-indicator" icon={iconObject(<NewReleases />)} />,
        "Live"
      )
    : null;
  const shipIndicator = set?.shipped
    ? withTooltip(
        <Icon className="ship-indicator" icon={iconObject(<CheckCircle />)} />,
        "Shipped"
      )
    : null;
  const timeIndicator = thisWeek ? (
    <div className="time-indicator">
      <Typography className="live-indicator-text" use="overline">
        {pluralise`${daysLeft} ${[daysLeft, "day"]}`}
      </Typography>
    </div>
  ) : null;

  const linkIcon = useLink
    ? withTooltip(
        <IconButton
          className="link-icon"
          href={link}
          icon="open_in_new"
          label={`Link to ${title}`}
          rel="noopener noreferrer"
          tag="a"
          target="_blank"
        />,
        "Link"
      )
    : null;
  return (
    <Ripple>
      <ImageListItem
        className={classNames("image-list-item", { selected })}
        onClick={() => (!selected ? details(set.id) : closeDetails())}
      >
        <div className="container">
          <div className="link-icon-container">
            {linkIcon}
            {withTooltip(
              <IconButton
                className="link-icon"
                icon={iconObject(<Share />)}
                onClick={copyShareLink}
              />,
              "Share"
            )}
          </div>
          <div className="media-container">
            {timeIndicator}
            <ImageListImageAspectContainer
              style={{ paddingBottom: "calc(100% / 1)" }}
            >
              <LazyLoad debounce={false} offsetVertical={480}>
                <ImageListImage
                  style={{ backgroundImage: `url(${image})` }}
                  tag="div"
                />
              </LazyLoad>
            </ImageListImageAspectContainer>
          </div>
          <ImageListSupporting>
            <ImageListLabel>
              <div className="text-container">
                <div className="primary-text">
                  <Twemoji options={{ className: "twemoji" }}>{title}</Twemoji>
                </div>
                <div className="secondary-text">{subtitle}</div>
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
