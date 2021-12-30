import { Card, CardActions, CardMedia } from "@rmwc/card";
import { SkeletonBlock } from "@c/util/skeleton-block";

export type SkeletonCardProps = {
  designer?: string;
  title?: string;
  subtitle?: string;
  loggedIn?: boolean;
};

export const SkeletonCard = ({ designer, title, subtitle, loggedIn }: SkeletonCardProps) => (
  <div className="card-container">
    <Card className="skeleton">
      <div className="media-container">
        <CardMedia sixteenByNine />
      </div>
      <div className="text-row">
        <div className="text-container">
          <div className="overline">
            <SkeletonBlock typography="overline" content={designer} constrain />
          </div>
          <div className="title">
            <SkeletonBlock typography="headline5" content={title} double />
          </div>
          <SkeletonBlock typography="subtitle2" content={subtitle} />
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
