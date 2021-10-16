import Twemoji from "react-twemoji";
import LazyLoad from "react-lazy-load";
import classNames from "classnames";
import { queue } from "~/app/snackbar-queue";
import { useAppSelector } from "~/app/hooks";
import { selectDevice, selectPage } from "@s/common";
import { SetType } from "@s/main/types";
import { iconObject, pluralise } from "@s/util/functions";
import { Icon } from "@rmwc/icon";
import { IconButton } from "@rmwc/icon-button";
import {
  ImageListItem,
  ImageListImageAspectContainer,
  ImageListImage,
  ImageListSupporting,
  ImageListLabel,
} from "@rmwc/image-list";
import { Ripple } from "@rmwc/ripple";
import { Typography } from "@rmwc/typography";
import { withTooltip } from "@c/util/hocs";
import { CheckCircle, NewReleases, Share } from "@i";
import "./element-image.scss";

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
  const device = useAppSelector(selectDevice);
  const page = useAppSelector(selectPage);

  const copyShareLink = () => {
    const arr = window.location.href.split("/");
    const url = arr[0] + "//" + arr[2] + "?keysetAlias=" + props.set.alias;
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

  const liveIndicator =
    props.live && page !== "live"
      ? withTooltip(<Icon className="live-indicator" icon={iconObject(<NewReleases />)} />, "Live")
      : null;
  const shipIndicator =
    props.set && props.set.shipped
      ? withTooltip(<Icon className="ship-indicator" icon={iconObject(<CheckCircle />)} />, "Shipped")
      : null;
  const timeIndicator = props.thisWeek ? (
    <div className="time-indicator">
      <Typography use="overline" className="live-indicator-text">
        {pluralise`${props.daysLeft} ${[props.daysLeft, "day"]}`}
      </Typography>
    </div>
  ) : null;

  const linkIcon = useLink
    ? withTooltip(
        <IconButton
          className="link-icon"
          icon="open_in_new"
          tag="a"
          href={props.link}
          target="_blank"
          rel="noopener noreferrer"
          label={"Link to " + props.title}
        />,
        "Link"
      )
    : null;
  return (
    <Ripple>
      <ImageListItem
        onClick={() => (!props.selected ? props.details(props.set) : props.closeDetails())}
        className={classNames("image-list-item", { selected: props.selected })}
      >
        <div className="container">
          <div className="link-icon-container">
            {linkIcon}
            {withTooltip(
              <IconButton className="link-icon" icon={iconObject(<Share />)} onClick={copyShareLink} />,
              "Share"
            )}
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
