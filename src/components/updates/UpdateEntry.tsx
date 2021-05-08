import React from "react";
import { Card } from "@rmwc/card";
import { CustomReactMarkdown } from "../util/ReactMarkdown";
import { Typography } from "@rmwc/typography";
import "./UpdateEntry.scss";

const testString = `Big news! KeycapLendar now supports logins (using Google, Github and/or Twitter authentication), which have features such as:

- Favourites - add a set to your favourites to add it to your favourites page, and you can also filter to only show favorites.
- Hidden sets - hide a set with the eye icon to hide it from all main pages, and you can of course filter to only show hidden sets.
- Filter presets - create and save filter presets, and switch between them using a dropdown.
- Sync settings - choose to sync your app settings (theme, density) to your account, which means that they'll be synced between devices.

[Log in here.](https://keycaplendar.firebaseapp.com/login)`;

export const UpdateEntry = () => {
  return (
    <Card className="update-entry">
      <Typography use="overline">eskimojo</Typography>
      <Typography use="headline5">Accounts are now launched!</Typography>
      <Typography use="caption">21st April 2021</Typography>
      <CustomReactMarkdown>{testString}</CustomReactMarkdown>
    </Card>
  );
};
