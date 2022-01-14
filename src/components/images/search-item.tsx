import type { EntityId } from "@reduxjs/toolkit";
import { Checkbox } from "@rmwc/checkbox";
import {
  ListItem,
  ListItemGraphic,
  ListItemMeta,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from "@rmwc/list";
import reactStringReplace from "react-string-replace";
import { useAppSelector } from "~/app/hooks";
import { withTooltip } from "@c/util/hocs";
import { selectById } from "@s/images";
import "./search-item.scss";

export type SearchItemProps = {
  checked: boolean;
  imageId: EntityId;
  search: string;
};

export const SearchItem = ({ checked, imageId, search }: SearchItemProps) => {
  const image = useAppSelector((state) => selectById(state, imageId));
  return image ? (
    <ListItem disabled>
      <ListItemGraphic
        className="image"
        style={{ backgroundImage: `url(${image.src})` }}
      />
      {withTooltip(
        <ListItemText>
          <ListItemPrimaryText>
            {reactStringReplace(image.name, search, (match) => (
              <span className="highlight">{match}</span>
            ))}
          </ListItemPrimaryText>
          <ListItemSecondaryText>{image.fullPath}</ListItemSecondaryText>
        </ListItemText>,
        image.name
      )}
      <ListItemMeta>
        <Checkbox checked={checked} disabled readOnly />
      </ListItemMeta>
    </ListItem>
  ) : null;
};
