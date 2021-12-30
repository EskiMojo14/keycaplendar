import { ListItem, ListItemMeta, ListItemPrimaryText, ListItemSecondaryText, ListItemText } from "@rmwc/list";
import { SkeletonBlock, SkeletonIcon } from "@c/util/skeleton-block";

export type SkeletonListProps = {
  designer: string;
  title: string;
  subtitle: string;
  icon?: boolean;
};

export const SkeletonList = ({ designer, title, subtitle, icon }: SkeletonListProps) => (
  <ListItem ripple={false} className="skeleton">
    <div className="list-image-container">
      <div className="list-image" />
    </div>
    <ListItemText>
      <SkeletonBlock className="overline" typography="overline" content={designer} constrain />
      <ListItemPrimaryText>
        <SkeletonBlock content={title} />
      </ListItemPrimaryText>
      <ListItemSecondaryText>
        <SkeletonBlock content={subtitle} />
      </ListItemSecondaryText>
    </ListItemText>
    {icon && <ListItemMeta tag={SkeletonIcon} />}
  </ListItem>
);
