import Twemoji from "react-twemoji";
import LazyLoad from "react-lazy-load";
import { queue } from "~/app/snackbar-queue";
import { useAppSelector } from "~/app/hooks";
import { selectPage } from "@s/common";
import { SetType } from "@s/main/types";
import { iconObject, pluralise } from "@s/util/functions";
import { ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText, ListItemMeta } from "@rmwc/list";
import { IconButton } from "@rmwc/icon-button";
import { Typography } from "@rmwc/typography";
import { withTooltip } from "@c/util/hocs";
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
  const page = useAppSelector(selectPage);

  const copyLink = () => {
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
      ? withTooltip(
          <ListItemMeta
            className="live-indicator"
            icon={iconObject(
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                  d="M18.49 9.89l.26-2.79-2.74-.62-1.43-2.41L12 5.18 9.42 4.07 7.99 6.48l-2.74.62.26 2.78L3.66 12l1.85 2.11-.26 2.8 2.74.62 1.43 2.41L12 18.82l2.58 1.11 1.43-2.41 2.74-.62-.26-2.79L20.34 12l-1.85-2.11zM13 17h-2v-2h2v2zm0-4h-2V7h2v6z"
                  opacity=".3"
                />
                <path d="M20.9 5.54l-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12l-2.44-2.78.34-3.68zM18.75 16.9l-2.74.62-1.43 2.41L12 18.82l-2.58 1.11-1.43-2.41-2.74-.62.26-2.8L3.66 12l1.85-2.12-.26-2.78 2.74-.61 1.43-2.41L12 5.18l2.58-1.11 1.43 2.41 2.74.62-.26 2.79L20.34 12l-1.85 2.11.26 2.79zM11 15h2v2h-2zm0-8h2v6h-2z" />
              </svg>
            )}
          />,
          "Live"
        )
      : null;
  const shipIndicator =
    props.set && props.set.shipped
      ? withTooltip(
          <ListItemMeta
            className="ship-indicator"
            icon={iconObject(
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path
                  d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm-2 13l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"
                  opacity=".3"
                />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z" />
              </svg>
            )}
          />,
          "Shipped"
        )
      : null;
  const timeIndicator = props.thisWeek ? (
    <Typography use="overline" className="time-indicator">
      {pluralise`${props.daysLeft} ${[props.daysLeft, "day"]}`}
    </Typography>
  ) : null;
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
      <div className="share-icon">
        <IconButton
          icon={iconObject(
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <circle cx="18" cy="5" opacity=".3" r="1" />
                <circle cx="6" cy="12" opacity=".3" r="1" />
                <circle cx="18" cy="19.02" opacity=".3" r="1" />
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
            </div>
          )}
          onClick={copyLink}
        />
      </div>
    </ListItem>
  );
};

export default ElementList;
