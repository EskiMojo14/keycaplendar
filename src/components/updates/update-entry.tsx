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
import { useLocation } from "react-router-dom";
import { notify } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import { CustomReactMarkdown } from "@c/util/react-markdown";
import { useAppSelector } from "@h";
import { createURL } from "@s/router/functions";
import {
  selectEntryById,
  useGetUpdatesQuery,
  usePinEntryMutation,
} from "@s/updates";
import { selectUser } from "@s/user";
import { iconObject, ordinal } from "@s/util/functions";
import { Delete, Edit, PushPin, Share } from "@i";
import "./update-entry.scss";

type UpdateEntryProps = {
  delete: (entry: EntityId) => void;
  edit: (entry: EntityId) => void;
  entryId: EntityId;
};

export const UpdateEntry = ({
  delete: deleteFn,
  edit,
  entryId,
}: UpdateEntryProps) => {
  const user = useAppSelector(selectUser);

  const { entry } = useGetUpdatesQuery(undefined, {
    selectFromResult: ({ data }) => ({
      entry: data && selectEntryById(data, entryId),
    }),
  });

  if (!entry) {
    return null;
  }

  const [pinEntry] = usePinEntryMutation({ selectFromResult: () => ({}) });

  const { hash } = useLocation();
  const urlEntry = hash.substring(1);

  const copyLink = async () => {
    const url = createURL({
      hash: entryId.toString(),
      pathname: "/updates",
      search: "",
    });
    try {
      await navigator.clipboard.writeText(url.href);
      notify({ title: "Copied URL to clipboard." });
    } catch (error) {
      notify({ title: `Error copying to clipboard ${error}` });
    }
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
          onClick={() => pinEntry(entry)}
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
};
