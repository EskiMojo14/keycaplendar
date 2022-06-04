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
import { notify } from "~/app/snackbar-queue";
import { SkeletonImage } from "@c/main/views/image-list/skeleton-image";
import { withTooltip } from "@c/util/hocs";
import useDevice from "@h/use-device";
import { selectSetById, useGetAllKeysetsQuery } from "@s/main";
import { getSetDetails } from "@s/main/functions";
import { createURL } from "@s/router/functions";
import { iconObject, pluralise } from "@s/util/functions";
import { CheckCircle, NewReleases, Share } from "@i";
import "./element-image.scss";

type ElementImageProps = {
  closeDetails: () => void;
  details: (set: EntityId) => void;
  selected: boolean;
  setId: EntityId;
  loading?: boolean;
};

export const ElementImage = ({
  closeDetails,
  details,
  loading,
  selected,
  setId,
}: ElementImageProps) => {
  const { set } = useGetAllKeysetsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      set: data && selectSetById(data, setId),
    }),
  });

  if (!set) {
    return null;
  }

  const { daysLeft, live, subtitle, thisWeek } = getSetDetails(set, {
    month: "MMM",
  });

  const device = useDevice();
  const useLink = device === "desktop";

  if (loading) {
    return <SkeletonImage icon={set.shipped || live} />;
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
    live &&
    withTooltip(
      <Icon className="live-indicator" icon={iconObject(<NewReleases />)} />,
      "Live"
    );
  const shipIndicator =
    set?.shipped &&
    withTooltip(
      <Icon className="ship-indicator" icon={iconObject(<CheckCircle />)} />,
      "Shipped"
    );
  const timeIndicator = thisWeek && (
    <div className="time-indicator">
      <Typography className="live-indicator-text" use="overline">
        {pluralise`${daysLeft} ${[daysLeft, "day"]}`}
      </Typography>
    </div>
  );

  const linkIcon =
    useLink &&
    withTooltip(
      <IconButton
        className="link-icon"
        href={set.details}
        icon="open_in_new"
        label={`Link to ${title}`}
        rel="noopener noreferrer"
        tag="a"
        target="_blank"
      />,
      "Link"
    );
  return (
    <Ripple>
      <ImageListItem
        className={classNames("image-list-item", { selected })}
        onClick={() => {
          if (!selected) {
            details(setId);
          } else {
            closeDetails();
          }
        }}
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
                  style={{
                    backgroundImage: `url(${set.image.replace(
                      "keysets",
                      "image-list"
                    )})`,
                  }}
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
