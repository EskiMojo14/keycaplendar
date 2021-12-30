import { ListItem, ListItemPrimaryText, ListItemSecondaryText, ListItemText } from "@rmwc/list";
import { SkeletonBlock } from "@c/util/skeleton-block";

export type SkeletonListProps = {
  designer: string;
  title: string;
  subtitle: string;
};

export const SkeletonList = ({ designer, title, subtitle }: SkeletonListProps) => (
  <ListItem ripple={false} className="skeleton">
    <div className="list-image-container">
      <div className="list-image" />
    </div>
    <ListItemText>
      <SkeletonBlock className="overline" typography="overline" content={designer} constrain />
      <ListItemPrimaryText>
        <SkeletonBlock content={title} double />
      </ListItemPrimaryText>
      <ListItemSecondaryText>
        <SkeletonBlock content={subtitle} />
      </ListItemSecondaryText>
    </ListItemText>
  </ListItem>
);
