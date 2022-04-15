import {
  ListItem,
  ListItemMeta,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from "@rmwc/list";
import { SkeletonBlock, SkeletonIcon } from "@c/util/skeleton-block";

export type SkeletonListProps = {
  icon?: boolean;
};

export const SkeletonList = ({ icon }: SkeletonListProps) => (
  <ListItem className="skeleton" ripple={false}>
    <div className="list-image-container">
      <div className="list-image" />
    </div>
    <ListItemText>
      <SkeletonBlock
        className="overline"
        constrain
        maxContentLength={16}
        minContentLength={10}
        typography="overline"
      />
      <ListItemPrimaryText>
        <SkeletonBlock maxContentLength={24} minContentLength={9} />
      </ListItemPrimaryText>
      <ListItemSecondaryText>
        <SkeletonBlock maxContentLength={21} minContentLength={14} />
      </ListItemSecondaryText>
    </ListItemText>
    {icon && <ListItemMeta tag={SkeletonIcon} />}
  </ListItem>
);
