import React from "react";
import { Card } from "@rmwc/card";
import { CustomReactMarkdown } from "../util/ReactMarkdown";
import "./UpdateEntry.scss";

const testString = "# Hello, *world*!\nMultline **too**?";

export const UpdateEntry = () => {
  return (
    <Card className="update-entry">
      <CustomReactMarkdown>{testString}</CustomReactMarkdown>
    </Card>
  );
};
