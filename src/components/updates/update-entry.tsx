import {
  Card,
  CardActionButton,
  CardActionButtons,
  CardActionIcon,
  CardActionIcons,
  CardActions,
} from "@rmwc/card";
import { Icon } from "@rmwc/icon";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { DateTime } from "luxon";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import { CustomReactMarkdown } from "@c/util/react-markdown";
import { selectURLEntry } from "@s/updates";
import type { UpdateEntryType } from "@s/updates/types";
import { selectUser } from "@s/user";
import { iconObject, ordinal } from "@s/util/functions";
import { Delete, Edit, PushPin, Share } from "@i";
import "./update-entry.scss";

type UpdateEntryProps = {
  delete: (entry: UpdateEntryType) => void;
  edit: (entry: UpdateEntryType) => void;
  entry: UpdateEntryType;
  pin: (entry: UpdateEntryType) => void;
};

export const UpdateEntry = ({
  delete: deleteFn,
  edit,
  entry,
  pin,
}: UpdateEntryProps) => {
  const user = useAppSelector(selectUser);

  const urlEntry = useAppSelector(selectURLEntry);

  const copyLink = () => {
    const arr = window.location.href.split("/");
    const url = arr[0] + "//" + arr[2] + "/updates?updateId=" + entry.id;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        queue.notify({ title: "Copied URL to clipboard." });
      })
      .catch((error) => {
        queue.notify({ title: "Error copying to clipboard" + error });
      });
  };

  const linkedIndicator =
    entry.id === urlEntry ? (
      <div className="linked-indicator">
        {withTooltip(<Icon icon="link" />, "Linked")}
      </div>
    ) : null;

  const pinIndicator = entry.pinned ? (
    <div className="pin-indicator">
      {withTooltip(<Icon icon={iconObject(<PushPin />)} />, "Pinned")}
    </div>
  ) : null;
  const buttons = user.isAdmin ? (
    <CardActions>
      <CardActionButtons>
        <CardActionButton
          className={classNames({ secondary: entry.pinned })}
          icon={iconObject(<PushPin />)}
          label={entry.pinned ? "Unpin" : "Pin"}
          onClick={() => pin(entry)}
        />
        <CardActionButton
          icon={iconObject(<Share />)}
          label="Share"
          onClick={copyLink}
        />
      </CardActionButtons>
      <CardActionIcons>
        {withTooltip(
          <CardActionIcon
            icon={iconObject(<Edit />)}
            onClick={() => edit(entry)}
          />,
          "Edit"
        )}
        {withTooltip(
          <CardActionIcon
            icon={iconObject(<Delete />)}
            onClick={() => deleteFn(entry)}
          />,
          "Delete"
        )}
      </CardActionIcons>
    </CardActions>
  ) : (
    <CardActions>
      <CardActionIcons>
        {withTooltip(
          <CardActionIcon icon={iconObject(<Share />)} onClick={copyLink} />,
          "Share"
        )}
      </CardActionIcons>
    </CardActions>
  );
  return (
    <Card
      className={classNames("update-entry", {
        pinned: entry.pinned,
        linked: entry.id === urlEntry,
      })}
      id={"update-entry-" + entry.id}
    >
      <div className="title-container">
        <div className="title">
          <Typography tag="h3" use="overline">
            {entry.name}
          </Typography>
          <Typography tag="h1" use="headline5">
            {entry.title}
          </Typography>
          <Typography tag="p" use="caption">
            {DateTime.fromISO(entry.date).toFormat(
              `d'${ordinal(DateTime.fromISO(entry.date).day)}' MMMM yyyy`
            )}
          </Typography>
        </div>
        {linkedIndicator}
        {pinIndicator}
      </div>
      <div className="content">
        <CustomReactMarkdown>{entry.body}</CustomReactMarkdown>
      </div>
      {buttons}
    </Card>
  );
};
