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
  subtitle: string;
  title: string;
  icon?: boolean;
};

export const SkeletonCompact = ({
  icon,
  subtitle,
  title,
}: SkeletonCompactProps) => (
  <ListItem className="skeleton" ripple={false}>
    {icon && (
      <ListItemGraphic
        className="live-indicator ship-indicator"
        tag={SkeletonIcon}
      />
    )}
    <ListItemText>
      <ListItemPrimaryText>
        <SkeletonBlock content={title} tag="span" />
      </ListItemPrimaryText>
      <ListItemSecondaryText>
        <SkeletonBlock content={subtitle} tag="span" />
      </ListItemSecondaryText>
    </ListItemText>
    <ListItemMeta tag={SkeletonIcon} />
  </ListItem>
);
