import type { EntityId } from "@reduxjs/toolkit";
import { Checkbox } from "@rmwc/checkbox";
import {
  ImageListImage,
  ImageListImageAspectContainer,
  ImageListItem,
  ImageListLabel,
  ImageListSupporting,
} from "@rmwc/image-list";
import { Ripple } from "@rmwc/ripple";
import classNames from "classnames";
import LazyLoad from "react-lazy-load";
import { useAppSelector } from "@h";
import { selectImageById } from "@s/images";
import "./image-item.scss";

export type ImageItemProps = {
  checked: boolean;
  imageId: EntityId;
  openDetails: (image: EntityId, path: string) => void;
  selected: boolean;
  toggleChecked: (image: EntityId) => void;
};

export const ImageItem = ({
  checked,
  imageId,
  openDetails,
  selected,
  toggleChecked,
}: ImageItemProps) => {
  const image = useAppSelector((state) => selectImageById(state, imageId));
  return image ? (
    <Ripple>
      <ImageListItem
        className={classNames("image-item", {
          selected,
        })}
      >
        <div className="container">
          <div
            className="item-container"
            onClick={() => openDetails(imageId, image.fullPath)}
          >
            <ImageListImageAspectContainer>
              <LazyLoad debounce={false} offsetVertical={480}>
                <ImageListImage
                  style={{
                    backgroundImage: `url(${image.src})`,
                  }}
                  tag="div"
                />
              </LazyLoad>
            </ImageListImageAspectContainer>
            <ImageListSupporting>
              <ImageListLabel>{image.name}</ImageListLabel>
            </ImageListSupporting>
          </div>
          <div className="checkbox-container">
            <div className="checkbox">
              <Checkbox
                checked={checked}
                onClick={() => toggleChecked(imageId)}
              />
            </div>
          </div>
        </div>
      </ImageListItem>
    </Ripple>
  ) : null;
};

export default ImageItem;
