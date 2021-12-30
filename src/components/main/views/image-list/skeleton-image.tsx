import { ImageListImageAspectContainer, ImageListItem, ImageListLabel, ImageListSupporting } from "@rmwc/image-list";
import { SkeletonBlock, SkeletonIcon } from "@c/util/skeleton-block";

export type SkeletonImageProps = {
  title: string;
  subtitle: string;
  icon?: boolean;
};

export const SkeletonImage = ({ title, subtitle, icon }: SkeletonImageProps) => (
  <ImageListItem className="image-list-item skeleton">
    <div className="container">
      <div className="media-container">
        <ImageListImageAspectContainer style={{ paddingBottom: "calc(100% / 1)" }} />
      </div>
      <ImageListSupporting>
        <ImageListLabel>
          <div className="text-container">
            <div className="primary-text">
              <SkeletonBlock content={title} colour="white" />
            </div>
            <div className="secondary-text">
              <SkeletonBlock content={subtitle} colour="hsla(0,0%,100%,.6)" />
            </div>
          </div>
          {icon && <SkeletonIcon className="live-indicator ship-indicator" />}
        </ImageListLabel>
      </ImageListSupporting>
    </div>
  </ImageListItem>
);
