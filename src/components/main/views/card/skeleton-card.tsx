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
            <div className="overline-container">
              <SkeletonBlock typography="overline" content={designer} constrain tag="span" />
            </div>
            {icon && (
              <div className="skeleton-icon-container">
                <SkeletonIcon className="live-indicator shipped-indicator" />
              </div>
            )}
          </div>
          <div className="title">
            <SkeletonBlock typography="headline5" content={title} />
          </div>
          <div className="subtitle">
            <SkeletonBlock typography="subtitle2" content={subtitle} tag="span" />
          </div>
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
