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
  icon?: boolean;
  loggedIn?: boolean;
};

export const SkeletonCard = ({ icon, loggedIn }: SkeletonCardProps) => (
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
                  maxContentLength={16}
                  minContentLength={10}
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
              <SkeletonBlock
                maxContentLength={24}
                minContentLength={9}
                typography="headline5"
              />
            </div>
            <div className="subtitle">
              <SkeletonBlock
                maxContentLength={21}
                minContentLength={14}
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
