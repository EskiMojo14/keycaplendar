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
import { withTooltip } from "@c/util/hocs";
import { useAppSelector } from "@h";
import {
  selectCurrentFolder,
  selectImageById,
  useGetAllImagesQuery,
} from "@s/images";
import "./search-item.scss";

export type SearchItemProps = {
  checked: boolean;
  imageId: EntityId;
  search: string;
};

export const SearchItem = ({ checked, imageId, search }: SearchItemProps) => {
  const currentFolder = useAppSelector(selectCurrentFolder);

  const { image } = useGetAllImagesQuery(currentFolder, {
    selectFromResult: ({ data }) => ({
      image: data && selectImageById(data, imageId),
    }),
  });

  return image ? (
    <ListItem className="search-drawer-item" disabled>
      <ListItemGraphic
        className="image search-drawer-item__graphic"
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
      <ListItemMeta className="search-drawer-item__meta">
        <Checkbox checked={checked} disabled readOnly />
      </ListItemMeta>
    </ListItem>
  ) : null;
};
