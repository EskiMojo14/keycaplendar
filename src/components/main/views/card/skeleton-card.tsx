import { Card, CardActions, CardMedia } from "@rmwc/card";
import { SkeletonBlock, SkeletonIcon } from "@c/util/skeleton-block";

export type SkeletonCardProps = {
  designer?: string;
  title?: string;
  subtitle?: string;
  loggedIn?: boolean;
  icon?: boolean;
};

export const SkeletonCard = ({
  designer,
  title,
  subtitle,
  icon,
  loggedIn,
}: SkeletonCardProps) => (
  <div className="card-container">
    <Card className="skeleton">
      <div className="content">
        <div className="media-container">
          <CardMedia sixteenByNine />
        </div>
        <div className="text-row">
          <div className="text-container">
            <div className="overline">
              <div className="overline-container">
                <SkeletonBlock
                  constrain
                  content={designer}
                  tag="span"
                  typography="overline"
                />
              </div>
              {icon && (
                <div className="skeleton-icon-container">
                  <SkeletonIcon className="live-indicator shipped-indicator" />
                </div>
              )}
            </div>
            <div className="title">
              <SkeletonBlock content={title} typography="headline5" />
            </div>
            <div className="subtitle">
              <SkeletonBlock
                content={subtitle}
                tag="span"
                typography="subtitle2"
              />
            </div>
          </div>
        </div>
      </div>
      {loggedIn && (
        <CardActions>
          <div className="skeleton-button">
            <SkeletonBlock
              colour="var(--theme-primary)"
              constrain
              content="Share"
              typography="button"
            />
          </div>
          <SkeletonIcon />
          <SkeletonIcon />
        </CardActions>
      )}
    </Card>
  </div>
);
