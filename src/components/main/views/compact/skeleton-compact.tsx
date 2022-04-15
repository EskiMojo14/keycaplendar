import {
  ListItem,
  ListItemGraphic,
  ListItemMeta,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from "@rmwc/list";
import { SkeletonBlock, SkeletonIcon } from "@c/util/skeleton-block";

export type SkeletonCompactProps = {
  icon?: boolean;
};

export const SkeletonCompact = ({ icon }: SkeletonCompactProps) => (
  <ListItem className="skeleton" ripple={false}>
    {icon && (
      <ListItemGraphic
        className="live-indicator ship-indicator"
        tag={SkeletonIcon}
      />
    )}
    <ListItemText>
      <ListItemPrimaryText>
        <SkeletonBlock maxContentLength={24} minContentLength={9} tag="span" />
      </ListItemPrimaryText>
      <ListItemSecondaryText>
        <SkeletonBlock maxContentLength={16} minContentLength={8} tag="span" />
      </ListItemSecondaryText>
    </ListItemText>
    <ListItemMeta tag={SkeletonIcon} />
  </ListItem>
);
