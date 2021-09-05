import React from "react";
import classNames from "classnames";
import { DateTime } from "luxon";
import { queue } from "~/app/snackbar-queue";
import { useAppSelector } from "~/app/hooks";
import { selectURLEntry } from "@s/updates";
import { UpdateEntryType } from "@s/updates/types";
import { selectUser } from "@s/user";
import { iconObject, ordinal } from "@s/util/functions";
import { Card, CardActionButton, CardActionButtons, CardActionIcon, CardActionIcons, CardActions } from "@rmwc/card";
import { Icon } from "@rmwc/icon";
import { Typography } from "@rmwc/typography";
import { CustomReactMarkdown } from "@c/util/react-markdown";
import { withTooltip } from "@c/util/hocs";
import "./update-entry.scss";

type UpdateEntryProps = {
  entry: UpdateEntryType;
  edit: (entry: UpdateEntryType) => void;
  delete: (entry: UpdateEntryType) => void;
  pin: (entry: UpdateEntryType) => void;
};

export const UpdateEntry = (props: UpdateEntryProps) => {
  const { entry } = props;

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
      <div className="linked-indicator">{withTooltip(<Icon icon="link" />, "Linked")}</div>
    ) : null;

  const pinIndicator = entry.pinned ? (
    <div className="pin-indicator">
      {withTooltip(
        <Icon
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
              <rect fill="none" height="24" width="24" />
              <path d="M14,4h-4v5c0,1.1-0.35,2.14-1,3h6c-0.63-0.84-1-1.88-1-3V4z" opacity=".3" />
              <path d="M19,12c-1.66,0-3-1.34-3-3V4l1,0c0,0,0,0,0,0c0.55,0,1-0.45,1-1s-0.45-1-1-1H7C6.45,2,6,2.45,6,3s0.45,1,1,1c0,0,0,0,0,0 l1,0v5c0,1.66-1.34,3-3,3v2h5.97v7l1,1l1-1v-7H19L19,12C19,12,19,12,19,12z M9,12c0.65-0.86,1-1.9,1-3V4h4v5c0,1.12,0.37,2.16,1,3 H9z" />
            </svg>
          )}
        />,
        "Pinned"
      )}
    </div>
  ) : null;
  const buttons = user.isAdmin ? (
    <CardActions>
      <CardActionButtons>
        <CardActionButton
          label={entry.pinned ? "Unpin" : "Pin"}
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
              <rect fill="none" height="24" width="24" />
              <path d="M14,4h-4v5c0,1.1-0.35,2.14-1,3h6c-0.63-0.84-1-1.88-1-3V4z" opacity=".3" />
              <path d="M19,12c-1.66,0-3-1.34-3-3V4l1,0c0,0,0,0,0,0c0.55,0,1-0.45,1-1s-0.45-1-1-1H7C6.45,2,6,2.45,6,3s0.45,1,1,1c0,0,0,0,0,0 l1,0v5c0,1.66-1.34,3-3,3v2h5.97v7l1,1l1-1v-7H19L19,12C19,12,19,12,19,12z M9,12c0.65-0.86,1-1.9,1-3V4h4v5c0,1.12,0.37,2.16,1,3 H9z" />
            </svg>
          )}
          className={classNames({ secondary: entry.pinned })}
          onClick={() => {
            props.pin(entry);
          }}
        />
        <CardActionButton
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <circle cx="18" cy="5" opacity=".3" r="1" />
              <circle cx="6" cy="12" opacity=".3" r="1" />
              <circle cx="18" cy="19.02" opacity=".3" r="1" />
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
            </svg>
          )}
          label="Share"
          onClick={copyLink}
        />
      </CardActionButtons>
      <CardActionIcons>
        {withTooltip(
          <CardActionIcon
            icon={iconObject(
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M5 18.08V19h.92l9.06-9.06-.92-.92z" opacity=".3" />
                  <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29s-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM5.92 19H5v-.92l9.06-9.06.92.92L5.92 19z" />
                </svg>
              </div>
            )}
            onClick={() => {
              props.edit(entry);
            }}
          />,
          "Edit"
        )}
        {withTooltip(
          <CardActionIcon
            icon={iconObject(
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M8 9h8v10H8z" opacity=".3" />
                  <path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z" />
                </svg>
              </div>
            )}
            onClick={() => {
              props.delete(entry);
            }}
          />,
          "Delete"
        )}
      </CardActionIcons>
    </CardActions>
  ) : (
    <CardActions>
      <CardActionIcons>
        {withTooltip(
          <CardActionIcon
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
          />,
          "Share"
        )}
      </CardActionIcons>
    </CardActions>
  );
  return (
    <Card
      className={classNames("update-entry", { pinned: entry.pinned, linked: entry.id === urlEntry })}
      id={"update-entry-" + entry.id}
    >
      <div className="title-container">
        <div className="title">
          <Typography use="overline" tag="h3">
            {entry.name}
          </Typography>
          <Typography use="headline5" tag="h1">
            {entry.title}
          </Typography>
          <Typography use="caption" tag="p">
            {DateTime.fromISO(entry.date).toFormat(`d'${ordinal(DateTime.fromISO(entry.date).day)}' MMMM yyyy`)}
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
