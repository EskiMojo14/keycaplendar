import {
  Card,
  CardActionIcon,
  CardActionIcons,
  CardActions,
  CardMedia,
} from "@rmwc/card";
import { SkeletonBlock, SkeletonIcon } from "@c/util/skeleton-block";
import { iconObject } from "@s/util/functions";

export type SkeletonCardProps = {
  designer?: string;
  icon?: boolean;
  loggedIn?: boolean;
  subtitle?: string;
  title?: string;
};

export const SkeletonCard = ({
  designer,
  icon,
  loggedIn,
  subtitle,
  title,
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
          <CardActionIcons>
            <CardActionIcon
              icon={iconObject(<SkeletonIcon />)}
              ripple={false}
              role="presentation"
              tabIndex={-1}
              tag="div"
            />
            <CardActionIcon
              icon={iconObject(<SkeletonIcon />)}
              ripple={false}
              role="presentation"
              tabIndex={-1}
              tag="div"
            />
          </CardActionIcons>
        </CardActions>
      )}
    </Card>
  </div>
);
