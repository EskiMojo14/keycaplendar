import { useEffect, useMemo, useState } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { Button } from "@rmwc/button";
import { DrawerAppContent } from "@rmwc/drawer";
import { ImageList } from "@rmwc/image-list";
import { TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { useImmer } from "use-immer";
import { Footer } from "@c/common/footer";
import ImageAppBar from "@c/images/app-bar";
import ImageItem from "@c/images/image-item";
import { ConditionalWrapper } from "@c/util/conditional-wrapper";
import { useAppDispatch, useAppSelector } from "@h";
import useBoolStates from "@h/use-bool-states";
import useBottomNav from "@h/use-bottom-nav";
import useDevice from "@h/use-device";
import {
  selectCurrentFolder,
  selectDuplicateImages,
  selectImages,
  selectImagesByUsage,
} from "@s/images";
import { listAll } from "@s/images/thunks";
import {
  addOrRemove,
  closeModal,
  hasKey,
  openModal,
  removeDuplicates,
} from "@s/util/functions";
import { DialogDelete } from "./dialog-delete";
import { DrawerDetails } from "./drawer-details";
import { DrawerSearch } from "./drawer-search";
import "./index.scss";

const aspectRatios = {
  card: 16 / 9,
  "image-list": 1,
  list: 16 / 9,
  thumbs: 16 / 9,
};

type ContentImagesProps = {
  openNav: () => void;
};

export const ContentImages = ({ openNav }: ContentImagesProps) => {
  const dispatch = useAppDispatch();
  const device = useDevice();

  const bottomNav = useBottomNav();

  const currentFolder = useAppSelector(selectCurrentFolder);

  const images = useAppSelector(selectImages);
  const { unused: unusedImages, used: usedImages } =
    useAppSelector(selectImagesByUsage);
  const duplicateImages = useAppSelector(selectDuplicateImages);

  const [checkedImages, setCheckedImages] = useImmer<EntityId[]>([]);

  const [detailImage, setDetailImage] = useState<EntityId>("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [closeDelete, openDelete] = useBoolStates(
    setDeleteOpen,
    "setDeleteOpen"
  );

  useEffect(() => {
    if (images.length === 0) {
      dispatch(listAll());
    }
  }, []);

  const closeSearch = () => {
    if (device !== "desktop") {
      closeModal();
    }
    setSearchOpen(false);
  };

  const closeDetails = () => {
    if (device !== "desktop") {
      closeModal();
    }
    setDetailOpen(false);
    setTimeout(() => setDetailImage(""), 300);
  };

  const openSearch = () => {
    const open = () => {
      if (device !== "desktop") {
        openModal();
      }
      setSearchOpen(true);
    };
    if (detailOpen) {
      closeDetails();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };

  const openDetails = (image: EntityId) => {
    const open = () => {
      if (detailImage === image) {
        closeDetails();
      } else {
        setDetailOpen(true);
        if (device !== "desktop") {
          openModal();
        }
        setDetailImage(image);
      }
    };
    if (searchOpen) {
      closeSearch();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };

  const toggleImageChecked = (image: EntityId) =>
    setCheckedImages((images) => addOrRemove(images, image));
  const toggleImageCheckedArray = (array: EntityId[], append = false) =>
    setCheckedImages((images) =>
      append ? removeDuplicates(images.concat(array)) : array
    );
  const clearChecked = () => setCheckedImages([]);
  const display = useMemo(
    () => [
      {
        array: unusedImages,
        title: "Unused images",
      },
      {
        array: duplicateImages,
        title: "Duplicate images",
      },
      {
        array: usedImages,
        title: "Used images",
      },
    ],
    [unusedImages, duplicateImages, usedImages]
  );
  return (
    <>
      <ImageAppBar
        checkedImages={checkedImages.length}
        {...{ clearChecked, openDelete, openNav, openSearch }}
      />
      {!bottomNav && <TopAppBarFixedAdjust />}
      <div
        className={classNames("content-container", {
          "drawer-open": device === "desktop" && detailOpen,
        })}
      >
        <div className="main">
          <DrawerSearch
            close={closeSearch}
            open={searchOpen}
            unusedImages={unusedImages}
          />
          <DrawerDetails
            close={closeDetails}
            imageId={detailImage}
            open={detailOpen}
          />
          <DialogDelete
            checkedImages={checkedImages}
            clearChecked={clearChecked}
            close={closeDelete}
            open={deleteOpen && checkedImages.length > 0}
            toggleImageChecked={toggleImageChecked}
          />
          <ConditionalWrapper
            condition={device === "desktop"}
            wrapper={(children) => (
              <DrawerAppContent>{children}</DrawerAppContent>
            )}
          >
            <div
              className="image-grid"
              style={{
                "--aspect-ratio": hasKey(aspectRatios, currentFolder)
                  ? aspectRatios[currentFolder]
                  : 1,
              }}
            >
              {display.map(
                (obj) =>
                  obj.array.length > 0 && (
                    <div key={obj.title} className="display-container">
                      <div className="subheader">
                        <Typography use="caption">{`${obj.title} (${obj.array.length})`}</Typography>
                        <Button
                          className="subheader-button"
                          label="Select all"
                          onClick={() => toggleImageCheckedArray(obj.array)}
                        />
                      </div>
                      <ImageList withTextProtection>
                        {obj.array.map((image) => (
                          <ImageItem
                            key={image}
                            checked={checkedImages.includes(image)}
                            imageId={image}
                            openDetails={openDetails}
                            selected={image === detailImage}
                            toggleChecked={toggleImageChecked}
                          />
                        ))}
                      </ImageList>
                    </div>
                  )
              )}
            </div>
            <Footer />
          </ConditionalWrapper>
        </div>
      </div>
      {bottomNav && <TopAppBarFixedAdjust />}
    </>
  );
};

export default ContentImages;
