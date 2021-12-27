import { IconButton } from "@rmwc/icon-button";
import { ListItem, ListItemMeta, ListItemPrimaryText, ListItemSecondaryText, ListItemText } from "@rmwc/list";
import { Typography } from "@rmwc/typography";
import LazyLoad from "react-lazy-load";
import Twemoji from "react-twemoji";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import { selectDevice, selectPage } from "@s/common";
import { SetType } from "@s/main/types";
import { iconObject, pluralise } from "@s/util/functions";
import { CheckCircle, NewReleases, Share } from "@i";
import "./element-list.scss";

type ElementListProps = {
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

export const ElementList = (props: ElementListProps) => {
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
      ? withTooltip(<ListItemMeta className="live-indicator" icon={iconObject(<NewReleases />)} />, "Live")
      : null;
  const shipIndicator =
    props.set && props.set.shipped
      ? withTooltip(<ListItemMeta className="ship-indicator" icon={iconObject(<CheckCircle />)} />, "Shipped")
      : null;
  const timeIndicator = props.thisWeek ? (
    <Typography use="overline" className="time-indicator">
      {pluralise`${props.daysLeft} ${[props.daysLeft, "day"]}`}
    </Typography>
  ) : null;
  const shareIcon = useLink
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
    : withTooltip(<IconButton icon={iconObject(<Share />)} onClick={copyShareLink} />, "Share");
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
      <div className="share-icon">{shareIcon}</div>
    </ListItem>
  );
};

export default ElementList;
