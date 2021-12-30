import { Card, CardActions, CardMedia } from "@rmwc/card";
import { SkeletonBlock, SkeletonIcon } from "@c/util/skeleton-block";

export type SkeletonCardProps = {
  designer?: string;
  title?: string;
  subtitle?: string;
  loggedIn?: boolean;
  icon?: boolean;
};

export const SkeletonCard = ({ designer, title, subtitle, icon, loggedIn }: SkeletonCardProps) => (
  <div className="card-container">
    <Card className="skeleton">
      <div className="media-container">
        <CardMedia sixteenByNine />
      </div>
      <div className="text-row">
        <div className="text-container">
          <div className="overline">
            <SkeletonBlock typography="overline" content={designer} constrain tag="span" />
            {icon && <SkeletonIcon className="live-indicator shipped-indicator" />}
          </div>
          <div className="title">
            <SkeletonBlock typography="headline5" content={title} double />
          </div>
          <SkeletonBlock typography="subtitle2" content={subtitle} tag="p" />
        </div>
      </div>
      {loggedIn && (
        <CardActions>
          <SkeletonBlock typography="button" content="Share" constrain />
        </CardActions>
      )}
    </Card>
  </div>
);
