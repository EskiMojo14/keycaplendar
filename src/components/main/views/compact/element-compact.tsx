import type { EntityId } from "@reduxjs/toolkit";
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
import { notify } from "~/app/snackbar-queue";
import { SkeletonCompact } from "@c/main/views/compact/skeleton-compact";
import { withTooltip } from "@c/util/hocs";
import { useAppSelector } from "@h";
import useDevice from "@h/use-device";
import usePage from "@h/use-page";
import { selectSetById } from "@s/main";
import { getSetDetails } from "@s/main/functions";
import { createURL, iconObject } from "@s/util/functions";
import { CheckCircle, NewReleases, Share } from "@i";
import "./element-compact.scss";

type ElementCompactProps = {
  closeDetails: () => void;
  details: (set: EntityId) => void;
  selected: boolean;
  setId: EntityId;
  loading?: boolean;
};

export const ElementCompact = ({
  closeDetails,
  details,
  loading,
  selected,
  setId,
}: ElementCompactProps) => {
  const set = useAppSelector((state) => selectSetById(state, setId));

  if (!set) {
    return null;
  }

  const device = useDevice();
  const useLink = device === "desktop";

  const page = usePage();

  const { live, subtitle } = getSetDetails(set, { month: "MMM" });

  if (loading) {
    return <SkeletonCompact icon={set.shipped || live} />;
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
    page !== "live" &&
    live &&
    withTooltip(
      <ListItemGraphic
        className="live-indicator"
        icon={iconObject(<NewReleases />)}
      />,
      "Live"
    );
  const shipIndicator =
    set.shipped &&
    withTooltip(
      <ListItemGraphic
        className="ship-indicator"
        icon={iconObject(<CheckCircle />)}
      />,
      "Shipped"
    );
  return (
    <ListItem
      onClick={() => (!selected ? details(set.alias) : closeDetails())}
      selected={selected}
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
            <ListItemMeta
              icon={iconObject(<Share />)}
              label={`Copy link to ${title}`}
              onClick={copyShareLink}
              tag={IconButton}
            />,
            "Share"
          )}
    </ListItem>
  );
};

export default ElementCompact;
