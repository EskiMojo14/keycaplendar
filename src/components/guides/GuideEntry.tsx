import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { iconObject } from "../../app/slices/common/functions";
import { selectFilteredTag, setFilteredTag } from "../../app/slices/guides/guidesSlice";
import { formattedVisibility, visibilityIcons } from "../../app/slices/guides/constants";
import { GuideEntryType } from "../../app/slices/guides/types";
import { selectUser } from "../../app/slices/user/userSlice";
import { Card, CardActionIcon, CardActionIcons, CardActions } from "@rmwc/card";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import { CustomReactMarkdown } from "../util/ReactMarkdown";
import "./GuideEntry.scss";
import { Chip, ChipSet } from "@rmwc/chip";

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

  const adminButtons = user.isAdmin ? (
    <CardActions>
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
      {adminButtons}
    </Card>
  );
};
