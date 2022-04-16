/* eslint-disable react/no-array-index-key */
import { memo } from "react";
import { Card } from "@rmwc/card";
import { ImageList } from "@rmwc/image-list";
import { List, ListDivider } from "@rmwc/list";
import { useAppSelector } from "~/app/hooks";
import { SkeletonCard } from "@c/main/views/card/skeleton-card";
import { SkeletonCompact } from "@c/main/views/compact/skeleton-compact";
import { SkeletonImage } from "@c/main/views/image-list/skeleton-image";
import { SkeletonList } from "@c/main/views/list/skeleton-list";
import { SkeletonBlock } from "@c/util/skeleton-block";
import { selectView } from "@s/settings";
import { selectUser } from "@s/user";
import { randomInt } from "@s/util/functions";

export const ContentSkeleton = () => {
  const view = useAppSelector(selectView);
  const loggedIn = useAppSelector((state) => !!selectUser(state).email);
  const content = () => {
    const array = [...Array(randomInt(4, 11))];
    switch (view) {
      case "card": {
        return (
          <div className="group-container">
            {array.map((_, index) => (
              <SkeletonCard key={index} {...{ loggedIn }} />
            ))}
          </div>
        );
      }
      case "list": {
        return (
          <List className="view-list three-line" nonInteractive twoLine>
            {array.map((_, index) => (
              <SkeletonList key={index} />
            ))}
            <ListDivider />
          </List>
        );
      }
      case "imageList": {
        return (
          <ImageList style={{ margin: -2 }} withTextProtection>
            {array.map((_, index) => (
              <SkeletonImage key={index} />
            ))}
          </ImageList>
        );
      }
      case "compact": {
        return (
          <Card>
            <List nonInteractive twoLine>
              {array.map((_, index) => (
                <SkeletonCompact key={index} />
              ))}
            </List>
          </Card>
        );
      }
      default:
        return null;
    }
  };
  return (
    <div className="content-grid">
      {[...Array(randomInt(3, 5))].map((_, index) => (
        <div key={index} className="outer-container">
          <div className="subheader">
            <SkeletonBlock
              maxContentLength={16}
              minContentLength={12}
              typography="caption"
            />
          </div>
          {content()}
        </div>
      ))}
    </div>
  );
};

export default memo(ContentSkeleton);
