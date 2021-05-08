import React from "react";
import ReactMarkdown from "react-markdown";
import { Card } from "@rmwc/card";
import "./UpdateEntry.scss";
import { Typography } from "@rmwc/typography";

type UpdateEntryProps = Record<string, never>;

const testString = "# Hello, *world*!\nMultline _too_?";

export const UpdateEntry = (props: UpdateEntryProps) => {
  return (
    <Card className="update-entry">
      <ReactMarkdown>{testString}</ReactMarkdown>
    </Card>
  );
};
