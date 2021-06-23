import React from "react";
import { queue } from "~/app/snackbarQueue";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { iconObject } from "@s/common/functions";
import { selectFilteredTag, setFilteredTag } from "@s/guides/guidesSlice";
import { formattedVisibility, visibilityIcons } from "@s/guides/constants";
import { GuideEntryType } from "@s/guides/types";
import { selectUser } from "@s/user/userSlice";
import { Card, CardActionButton, CardActionButtons, CardActionIcon, CardActionIcons, CardActions } from "@rmwc/card";
import { Chip, ChipSet } from "@rmwc/chip";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { CustomReactMarkdown } from "@c/util/ReactMarkdown";
import "./GuideEntry.scss";

type GuideEntryProps = {
  entry: GuideEntryType;
  edit: (entry: GuideEntryType) => void;
  delete: (entry: GuideEntryType) => void;
};

export const GuideEntry = (props: GuideEntryProps) => {
  const { entry } = props;
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);

  const filteredTag = useAppSelector(selectFilteredTag);

  const setFilter = (tag: string) => {
    if (filteredTag === tag) {
      dispatch(setFilteredTag(""));
    } else {
      dispatch(setFilteredTag(tag));
    }
  };

  const copyLink = () => {
    const arr = window.location.href.split("/");
    const url = arr[0] + "//" + arr[2] + "/guides?guideId=" + entry.id;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        queue.notify({ title: "Copied URL to clipboard." });
      })
      .catch((error) => {
        queue.notify({ title: "Error copying to clipboard" + error });
      });
  };

  const buttons = user.isAdmin ? (
    <CardActions>
      <CardActionButtons>
        <CardActionButton
          label="Share"
          icon={iconObject(
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <circle cx="18" cy="5" opacity=".3" r="1" />
              <circle cx="6" cy="12" opacity=".3" r="1" />
              <circle cx="18" cy="19.02" opacity=".3" r="1" />
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
            </svg>
          )}
          onClick={copyLink}
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
  ) : (
    <CardActions>
      <CardActionIcons>
        <Tooltip enterDelay={500} content="Share" align="bottom">
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
          />
        </Tooltip>
      </CardActionIcons>
    </CardActions>
  );
  return (
    <Card className="guide-entry">
      <div className="title">
        <Typography use="overline" tag="h3">
          {entry.name}
        </Typography>
        <Typography use="headline5" tag="h1">
          {entry.title}
        </Typography>
        <Typography use="caption" tag="p">
          {entry.description}
        </Typography>
        <div className="tags-container">
          <ChipSet>
            <Chip icon={visibilityIcons[entry.visibility]} label={formattedVisibility[entry.visibility]} />
            {entry.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                selected={tag === filteredTag}
                onClick={() => {
                  setFilter(tag);
                }}
              />
            ))}
          </ChipSet>
        </div>
      </div>
      <div className="content">
        <CustomReactMarkdown>{entry.body}</CustomReactMarkdown>
      </div>
      {buttons}
    </Card>
  );
};
