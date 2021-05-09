import React from "react";
import { UpdateEntryType } from "../../util/types";
import { Card } from "@rmwc/card";
import { Typography } from "@rmwc/typography";
import { CustomReactMarkdown } from "../util/ReactMarkdown";
import "./UpdateEntry.scss";
import moment from "moment";

type UpdateEntryProps = {
  entry: UpdateEntryType;
};

export const UpdateEntry = (props: UpdateEntryProps) => {
  const { entry } = props;
  return (
    <Card className="update-entry">
      <Typography use="overline">{entry.name}</Typography>
      <Typography use="headline5">{entry.title}</Typography>
      <Typography use="caption">{moment(entry.date).format("Do MMMM YYYY")}</Typography>
      <CustomReactMarkdown>{entry.body}</CustomReactMarkdown>
    </Card>
  );
};
