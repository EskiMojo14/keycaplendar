import React, { useContext } from "react";
import moment from "moment";
import { UserContext } from "../../util/contexts";
import { UpdateEntryType } from "../../util/types";
import { Card, CardActionIcon, CardActionIcons, CardActions } from "@rmwc/card";
import { Typography } from "@rmwc/typography";
import { CustomReactMarkdown } from "../util/ReactMarkdown";
import "./UpdateEntry.scss";
import { iconObject } from "../../util/functions";

type UpdateEntryProps = {
  entry: UpdateEntryType;
  edit: (entry: UpdateEntryType) => void;
  delete: (entry: UpdateEntryType) => void;
};

export const UpdateEntry = (props: UpdateEntryProps) => {
  const { entry } = props;
  const { user } = useContext(UserContext);
  const adminButtons = user.isAdmin ? (
    <CardActions>
      <CardActionIcons>
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
      </CardActionIcons>
    </CardActions>
  ) : null;
  return (
    <Card className="update-entry">
      <div className="content">
        <Typography use="overline">{entry.name}</Typography>
        <Typography use="headline5">{entry.title}</Typography>
        <Typography use="caption">{moment(entry.date).format("Do MMMM YYYY")}</Typography>
        <CustomReactMarkdown>{entry.body}</CustomReactMarkdown>
      </div>
      {adminButtons}
    </Card>
  );
};
