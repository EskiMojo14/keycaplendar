import {
  ImageListImageAspectContainer,
  ImageListItem,
  ImageListLabel,
  ImageListSupporting,
} from "@rmwc/image-list";
import { SkeletonBlock, SkeletonIcon } from "@c/util/skeleton-block";

export type SkeletonImageProps = {
  icon?: boolean;
};

export const SkeletonImage = ({ icon }: SkeletonImageProps) => (
  <ImageListItem className="image-list-item skeleton">
    <div className="container">
      <div className="media-container">
        <ImageListImageAspectContainer
          style={{ paddingBottom: "calc(100% / 1)" }}
        />
      </div>
      <ImageListSupporting>
        <ImageListLabel>
          <div className="text-container">
            <div className="primary-text">
              <SkeletonBlock
                colour="white"
                constrain
                maxContentLength={24}
                minContentLength={9}
                typography="subtitle1"
              />
            </div>
            <div className="secondary-text">
              <SkeletonBlock
                colour="hsla(0,0%,100%,.6)"
                constrain
                maxContentLength={16}
                minContentLength={8}
                typography="body2"
              />
            </div>
          </div>
          {icon && <SkeletonIcon className="live-indicator ship-indicator" />}
        </ImageListLabel>
      </ImageListSupporting>
    </div>
  </ImageListItem>
);
