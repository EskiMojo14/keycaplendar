import { IconButton } from "@rmwc/icon-button";
import { ListItem, ListItemMeta, ListItemPrimaryText, ListItemSecondaryText, ListItemText } from "@rmwc/list";
import { Typography } from "@rmwc/typography";
import LazyLoad from "react-lazy-load";
import Twemoji from "react-twemoji";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import { selectDevice } from "@s/common";
import type { SetType } from "@s/main/types";
import { iconObject, pluralise } from "@s/util/functions";
import { CheckCircle, NewReleases, Share } from "@i";
import "./element-list.scss";

type ElementListProps = {
  closeDetails: () => void;
  daysLeft: number;
  designer: string;
  details: (set: SetType) => void;
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

  const copyShareLink = () => {
    const arr = window.location.href.split("/");
    const url = arr[0] + "//" + arr[2] + "?keysetAlias=" + set.alias;
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

  const liveIndicator = live
    ? withTooltip(<ListItemMeta className="live-indicator" icon={iconObject(<NewReleases />)} />, "Live")
    : null;
  const shipIndicator = set?.shipped
    ? withTooltip(<ListItemMeta className="ship-indicator" icon={iconObject(<CheckCircle />)} />, "Shipped")
    : null;
  const timeIndicator = thisWeek ? (
    <Typography use="overline" className="time-indicator">
      {pluralise`${daysLeft} ${[daysLeft, "day"]}`}
    </Typography>
  ) : null;
  const shareIcon = useLink
    ? withTooltip(
        <IconButton
          className="link-icon"
          icon="open_in_new"
          tag="a"
          href={set.details}
          target="_blank"
          rel="noopener noreferrer"
          label={"Link to " + title}
        />,
        "Link"
      )
    : withTooltip(<IconButton icon={iconObject(<Share />)} onClick={copyShareLink} />, "Share");
  return (
    <ListItem selected={selected} onClick={() => (!selected ? details(set) : closeDetails())}>
      <LazyLoad debounce={false} offsetVertical={480} className="list-image-container">
        <div className="list-image" style={{ backgroundImage: "url(" + image + ")" }}></div>
      </LazyLoad>
      <ListItemText>
        <Typography use="overline" className="overline">
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
