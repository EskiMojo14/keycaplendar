import { ListItem, ListItemPrimaryText, ListItemSecondaryText, ListItemText } from "@rmwc/list";
import { SkeletonBlock } from "@c/util/skeleton-block";

export type SkeletonCompactProps = {
  title: string;
  subtitle: string;
  live?: boolean;
};

export const SkeletonCompact = ({ title, subtitle }: SkeletonCompactProps) => (
  <ListItem ripple={false} className="skeleton">
    <ListItemText>
      <ListItemPrimaryText>
        <SkeletonBlock content={title} double tag="span" />
      </ListItemPrimaryText>
      <ListItemSecondaryText>
        <SkeletonBlock content={subtitle} tag="span" />
      </ListItemSecondaryText>
    </ListItemText>
  </ListItem>
);
