import React from "react";
import classNames from "classnames";
import moment from "moment";
import { useAppSelector } from "../../app/hooks";
import { selectUser } from "../../app/slices/user/userSlice";
import { iconObject } from "../../util/functions";
import { UpdateEntryType } from "../../util/types";
import { Card, CardActionButton, CardActionButtons, CardActionIcon, CardActionIcons, CardActions } from "@rmwc/card";
import { Icon } from "@rmwc/icon";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { CustomReactMarkdown } from "../util/ReactMarkdown";
import "./UpdateEntry.scss";

type UpdateEntryProps = {
  entry: UpdateEntryType;
  edit: (entry: UpdateEntryType) => void;
  delete: (entry: UpdateEntryType) => void;
  pin: (entry: UpdateEntryType) => void;
};

export const UpdateEntry = (props: UpdateEntryProps) => {
  const { entry } = props;
  const user = useAppSelector(selectUser);
  const pinIndicator = entry.pinned ? (
    <div className="pin-indicator">
      <Tooltip enterDelay={500} content="Pinned" align="bottom">
        <Icon
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
              <rect fill="none" height="24" width="24" />
              <path d="M14,4h-4v5c0,1.1-0.35,2.14-1,3h6c-0.63-0.84-1-1.88-1-3V4z" opacity=".3" />
              <path d="M19,12c-1.66,0-3-1.34-3-3V4l1,0c0,0,0,0,0,0c0.55,0,1-0.45,1-1s-0.45-1-1-1H7C6.45,2,6,2.45,6,3s0.45,1,1,1c0,0,0,0,0,0 l1,0v5c0,1.66-1.34,3-3,3v2h5.97v7l1,1l1-1v-7H19L19,12C19,12,19,12,19,12z M9,12c0.65-0.86,1-1.9,1-3V4h4v5c0,1.12,0.37,2.16,1,3 H9z" />
            </svg>
          )}
        />
      </Tooltip>
    </div>
  ) : null;
  const adminButtons = user.isAdmin ? (
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
      </CardActionButtons>
      <CardActionIcons>
        <Tooltip enterDelay={500} content="Edit" align="bottom">
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
          />
        </Tooltip>
        <Tooltip enterDelay={500} content="Delete" align="bottom">
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
          />
        </Tooltip>
      </CardActionIcons>
    </CardActions>
  ) : null;
  return (
    <Card className={classNames("update-entry", { pinned: entry.pinned })}>
      <div className="title-container">
        <div className="title">
          <Typography use="overline" tag="h3">
            {entry.name}
          </Typography>
          <Typography use="headline5" tag="h1">
            {entry.title}
          </Typography>
          <Typography use="caption" tag="p">
            {moment(entry.date).format("Do MMMM YYYY")}
          </Typography>
        </div>
        {pinIndicator}
      </div>
      <div className="content">
        <CustomReactMarkdown>{entry.body}</CustomReactMarkdown>
      </div>
      {adminButtons}
    </Card>
  );
};
