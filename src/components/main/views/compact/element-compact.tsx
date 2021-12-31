import { IconButton } from "@rmwc/icon-button";
import {
  ListItem,
  ListItemGraphic,
  ListItemMeta,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from "@rmwc/list";
import Twemoji from "react-twemoji";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import { selectDevice } from "@s/common";
import type { SetType } from "@s/main/types";
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

export const ElementCompact = ({
  closeDetails,
  details,
  link,
  live,
  selected,
  set,
  subtitle,
  title,
}: ElementCompactProps) => {
  const device = useAppSelector(selectDevice);

  const useLink = device === "desktop";

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

  const liveIndicator = live
    ? withTooltip(
        <ListItemGraphic
          className="live-indicator"
          icon={iconObject(<NewReleases />)}
        />,
        "Live"
      )
    : null;
  const shipIndicator = set.shipped
    ? withTooltip(
        <ListItemGraphic
          className="ship-indicator"
          icon={iconObject(<CheckCircle />)}
        />,
        "Shipped"
      )
    : null;
  return (
    <ListItem
      selected={selected}
      onClick={() => (!selected ? details(set) : closeDetails())}
    >
      {liveIndicator}
      {shipIndicator}
      <ListItemText>
        <ListItemPrimaryText>
          <Twemoji options={{ className: "twemoji" }}>{title}</Twemoji>
        </ListItemPrimaryText>
        <ListItemSecondaryText>{subtitle}</ListItemSecondaryText>
      </ListItemText>
      {useLink
        ? withTooltip(
            <IconButton
              className="mdc-list-item__meta"
              icon="open_in_new"
              tag="a"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              label={"Link to " + title}
            />,
            "Link"
          )
        : withTooltip(
            <ListItemMeta
              tag={IconButton}
              icon={iconObject(<Share />)}
              label={"Copy link to " + title}
              onClick={copyShareLink}
            />,
            "Share"
          )}
    </ListItem>
  );
};

export default ElementCompact;
