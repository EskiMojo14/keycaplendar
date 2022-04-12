import type { EntityId } from "@reduxjs/toolkit";
import { IconButton } from "@rmwc/icon-button";
import {
  ListItem,
  ListItemMeta,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from "@rmwc/list";
import { Typography } from "@rmwc/typography";
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
import "./element-list.scss";

type ElementListProps = {
  closeDetails: () => void;
  daysLeft: number;
  designer: string;
  details: (set: EntityId) => void;
  image: string;
  live: boolean;
  selected: boolean;
  set: SetType;
  subtitle: string;
  thisWeek: boolean;
  title: string;
};

export const ElementList = ({
  closeDetails,
  daysLeft,
  designer,
  details,
  image,
  live,
  selected,
  set,
  subtitle,
  thisWeek,
  title,
}: ElementListProps) => {
  const device = useAppSelector(selectDevice);

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

  const useLink = device === "desktop";

  const liveIndicator =
    live &&
    withTooltip(
      <ListItemMeta
        className="live-indicator"
        icon={iconObject(<NewReleases />)}
      />,
      "Live"
    );
  const shipIndicator =
    set?.shipped &&
    withTooltip(
      <ListItemMeta
        className="ship-indicator"
        icon={iconObject(<CheckCircle />)}
      />,
      "Shipped"
    );
  const timeIndicator = thisWeek && (
    <Typography className="time-indicator" use="overline">
      {pluralise`${daysLeft} ${[daysLeft, "day"]}`}
    </Typography>
  );
  const shareIcon = useLink
    ? withTooltip(
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
      )
    : withTooltip(
        <IconButton icon={iconObject(<Share />)} onClick={copyShareLink} />,
        "Share"
      );
  return (
    <ListItem
      onClick={() => (!selected ? details(set.id) : closeDetails())}
      selected={selected}
    >
      <LazyLoad
        className="list-image-container"
        debounce={false}
        offsetVertical={480}
      >
        <div
          className="list-image"
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      </LazyLoad>
      <ListItemText>
        <Typography className="overline" use="overline">
          {designer}
        </Typography>
        <ListItemPrimaryText>
          <Twemoji options={{ className: "twemoji" }}>{title}</Twemoji>
        </ListItemPrimaryText>
        <ListItemSecondaryText>{subtitle}</ListItemSecondaryText>
      </ListItemText>
      {timeIndicator}
      {liveIndicator}
      {shipIndicator}
      <div className="share-icon">{shareIcon}</div>
    </ListItem>
  );
};

export default ElementList;
