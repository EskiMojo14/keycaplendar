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
import { notify } from "~/app/snackbar-queue";
import { SkeletonList } from "@c/main/views/list/skeleton-list";
import { withTooltip } from "@c/util/hocs";
import { useAppSelector } from "@h";
import useDevice from "@h/use-device";
import usePage from "@h/use-page";
import { selectSetById } from "@s/main";
import { getSetDetails } from "@s/main/functions";
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
  details: (set: EntityId) => void;
  selected: boolean;
  setId: EntityId;
  loading?: boolean;
};

export const ElementList = ({
  closeDetails,
  details,
  loading,
  selected,
  setId,
}: ElementListProps) => {
  const set = useAppSelector((state) => selectSetById(state, setId));

  if (!set) {
    return null;
  }

  const device = useDevice();
  const useLink = device === "desktop";

  const page = usePage();

  const { daysLeft, live, subtitle, thisWeek } = getSetDetails(set);

  if (loading) {
    return <SkeletonList icon={set.shipped || live} />;
  }

  const copyShareLink = async () => {
    const url = createURL({ pathname: "/" }, (params) => {
      clearSearchParams(params);
      params.set("keysetAlias", set.alias);
    });
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
          style={{
            backgroundImage: `url(${set.image.replace("keysets", "list")})`,
          }}
        ></div>
      </LazyLoad>
      <ListItemText>
        <Typography className="overline" use="overline">
          {set.designer.join(" + ")}
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
