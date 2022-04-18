import type { EntityId } from "@reduxjs/toolkit";
import {
  Card,
  CardActionButton,
  CardActionButtons,
  CardActionIcon,
  CardActionIcons,
  CardActions,
} from "@rmwc/card";
import { Chip, ChipSet } from "@rmwc/chip";
import { Typography } from "@rmwc/typography";
import { notify } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import { CustomReactMarkdown } from "@c/util/react-markdown";
import { useAppDispatch, useAppSelector } from "@h";
import { selectEntryById, selectFilteredTag, setFilteredTag } from "@s/guides";
import { formattedVisibility, visibilityIcons } from "@s/guides/constants";
import { selectUser } from "@s/user";
import { clearSearchParams, createURL, iconObject } from "@s/util/functions";
import { Delete, Edit, Share } from "@i";
import "./guide-entry.scss";

type GuideEntryProps = {
  delete: (entry: EntityId) => void;
  edit: (entry: EntityId) => void;
  entryId: EntityId;
};

export const GuideEntry = ({
  delete: deleteFn,
  edit,
  entryId,
}: GuideEntryProps) => {
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectUser);

  const entry = useAppSelector((state) => selectEntryById(state, entryId));
  const filteredTag = useAppSelector(selectFilteredTag);

  const setFilter = (tag: string) =>
    dispatch(setFilteredTag(filteredTag === tag ? "" : tag));

  const copyLink = async () => {
    const url = createURL({ pathname: "/guides" }, (params) => {
      clearSearchParams(params);
      params.set("guideId", `${entryId}`);
    });
    try {
      await navigator.clipboard.writeText(url.href);
      notify({ title: "Copied URL to clipboard." });
    } catch (error) {
      notify({ title: `Error copying to clipboard ${error}` });
    }
  };

  const buttons = user.isAdmin ? (
    <CardActions>
      <CardActionButtons>
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
  return entry ? (
    <Card className="guide-entry">
      <div className="title">
        <Typography tag="h3" use="overline">
          {entry.name}
        </Typography>
        <Typography tag="h1" use="headline5">
          {entry.title}
        </Typography>
        <Typography tag="p" use="caption">
          {entry.description}
        </Typography>
        <div className="tags-container">
          <ChipSet>
            <Chip
              icon={visibilityIcons[entry.visibility]}
              label={formattedVisibility[entry.visibility]}
            />
            {entry.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => {
                  setFilter(tag);
                }}
                selected={tag === filteredTag}
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
  ) : null;
};
