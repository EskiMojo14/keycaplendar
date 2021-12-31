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
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import { CustomReactMarkdown } from "@c/util/react-markdown";
import { selectFilteredTag, setFilteredTag } from "@s/guides";
import { formattedVisibility, visibilityIcons } from "@s/guides/constants";
import type { GuideEntryType } from "@s/guides/types";
import { selectUser } from "@s/user";
import { iconObject } from "@s/util/functions";
import { Delete, Edit, Share } from "@i";
import "./guide-entry.scss";

type GuideEntryProps = {
  entry: GuideEntryType;
  edit: (entry: GuideEntryType) => void;
  delete: (entry: GuideEntryType) => void;
};

export const GuideEntry = ({
  delete: deleteFn,
  edit,
  entry,
}: GuideEntryProps) => {
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
          icon={iconObject(<Share />)}
          label="Share"
          onClick={copyLink}
        />
      </CardActionButtons>
      <CardActionIcons>
        {withTooltip(
          <CardActionIcon
            icon={iconObject(<Edit />)}
            onClick={() => {
              edit(entry);
            }}
          />,
          "Edit"
        )}
        {withTooltip(
          <CardActionIcon
            icon={iconObject(<Delete />)}
            onClick={() => {
              deleteFn(entry);
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
          <CardActionIcon icon={iconObject(<Share />)} onClick={copyLink} />,
          "Share"
        )}
      </CardActionIcons>
    </CardActions>
  );
  return (
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
  );
};
