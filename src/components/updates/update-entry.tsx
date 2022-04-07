import type { EntityId } from "@reduxjs/toolkit";
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
import { selectEntryById, selectURLEntry } from "@s/updates";
import { selectUser } from "@s/user";
import {
  clearSearchParams,
  createURL,
  iconObject,
  ordinal,
} from "@s/util/functions";
import { Delete, Edit, PushPin, Share } from "@i";
import "./update-entry.scss";

type UpdateEntryProps = {
  delete: (entry: EntityId) => void;
  edit: (entry: EntityId) => void;
  entryId: EntityId;
  pin: (entry: EntityId) => void;
};

export const UpdateEntry = ({
  delete: deleteFn,
  edit,
  entryId,
  pin,
}: UpdateEntryProps) => {
  const user = useAppSelector(selectUser);

  const entry = useAppSelector((state) => selectEntryById(state, entryId));

  const urlEntry = useAppSelector(selectURLEntry);

  if (entry) {
    const copyLink = () => {
      const url = createURL({ pathname: "/updates" }, (params) => {
        clearSearchParams(params);
        params.set("updateId", `${entryId}`);
      });
      navigator.clipboard
        .writeText(url.href)
        .then(() => {
          queue.notify({ title: "Copied URL to clipboard." });
        })
        .catch((error) => {
          queue.notify({ title: `Error copying to clipboard ${error}` });
        });
    };

    const linkedIndicator = entryId === urlEntry && (
      <div className="linked-indicator">
        {withTooltip(<Icon icon="link" />, "Linked")}
      </div>
    );

    const pinIndicator = entry.pinned && (
      <div className="pin-indicator">
        {withTooltip(<Icon icon={iconObject(<PushPin />)} />, "Pinned")}
      </div>
    );
    const buttons = user.isAdmin ? (
      <CardActions>
        <CardActionButtons>
          <CardActionButton
            className={classNames({ secondary: entry.pinned })}
            icon={iconObject(<PushPin />)}
            label={entry.pinned ? "Unpin" : "Pin"}
            onClick={() => pin(entryId)}
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
              onClick={() => edit(entryId)}
            />,
            "Edit"
          )}
          {withTooltip(
            <CardActionIcon
              icon={iconObject(<Delete />)}
              onClick={() => deleteFn(entryId)}
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
          linked: entryId === urlEntry,
          pinned: entry.pinned,
        })}
        id={`update-entry-${entryId}`}
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
  }
  return null;
};
