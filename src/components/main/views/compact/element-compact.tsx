import { IconButton } from "@rmwc/icon-button";
import {
  ListItem,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemGraphic,
  ListItemMeta,
} from "@rmwc/list";
import Twemoji from "react-twemoji";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import { selectDevice, selectPage } from "@s/common";
import { SetType } from "@s/main/types";
import { iconObject } from "@s/util/functions";
import { CheckCircle, NewReleases, Share } from "@i";
import "./element-compact.scss";

type ElementCompactProps = {
  closeDetails: () => void;
  details: (set: SetType) => void;
  link: string;
  live: boolean;
  selected: boolean;
  set: SetType;
  subtitle: string;
  title: string;
};

export const ElementCompact = (props: ElementCompactProps) => {
  const device = useAppSelector(selectDevice);
  const page = useAppSelector(selectPage);

  const useLink = device === "desktop";

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

  const liveIndicator =
    props.live && page !== "live"
      ? withTooltip(<ListItemGraphic className="live-indicator" icon={iconObject(<NewReleases />)} />, "Live")
      : null;
  const shipIndicator =
    props.set && props.set.shipped
      ? withTooltip(<ListItemGraphic className="ship-indicator" icon={iconObject(<CheckCircle />)} />, "Shipped")
      : null;
  return (
    <ListItem
      selected={props.selected}
      onClick={() => (!props.selected ? props.details(props.set) : props.closeDetails())}
    >
      {liveIndicator}
      {shipIndicator}
      <ListItemText>
        <ListItemPrimaryText>
          <Twemoji options={{ className: "twemoji" }}>{props.title}</Twemoji>
        </ListItemPrimaryText>
        <ListItemSecondaryText>{props.subtitle}</ListItemSecondaryText>
      </ListItemText>
      {useLink
        ? withTooltip(
            <IconButton
              className="mdc-list-item__meta"
              icon="open_in_new"
              tag="a"
              href={props.link}
              target="_blank"
              rel="noopener noreferrer"
              label={"Link to " + props.title}
            />,
            "Link"
          )
        : withTooltip(
            <ListItemMeta
              tag={IconButton}
              icon={iconObject(<Share />)}
              label={"Copy link to " + props.title}
              onClick={copyShareLink}
            />,
            "Share"
          )}
    </ListItem>
  );
};

export default ElementCompact;
