import { useEffect, useState } from "react";
import { Button } from "@rmwc/button";
import { Checkbox } from "@rmwc/checkbox";
import { DrawerAppContent } from "@rmwc/drawer";
import {
  ImageList,
  ImageListImage,
  ImageListImageAspectContainer,
  ImageListItem,
  ImageListLabel,
  ImageListSupporting,
} from "@rmwc/image-list";
import { LinearProgress } from "@rmwc/linear-progress";
import { Menu, MenuItem, MenuSurfaceAnchor } from "@rmwc/menu";
import { Ripple } from "@rmwc/ripple";
import {
  TopAppBar,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import LazyLoad from "react-lazy-load";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { Footer } from "@c/common/footer";
import { ConditionalWrapper } from "@c/util/conditional-wrapper";
import { withTooltip } from "@c/util/hocs";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
import firebase from "@s/firebase";
import {
  selectCheckedImages,
  selectCurrentFolder,
  selectDetailImage,
  selectDetailMetadata,
  selectDuplicateSetImages,
  selectFolders,
  selectImages,
  selectLoading,
  selectSetImages,
  setCheckedImages,
  setDetailImage,
  setDetailMetadata,
} from "@s/images";
import { ImageObj } from "@s/images/constructors";
import {
  createSetImageList,
  getFolders,
  listAll,
  setFolder,
} from "@s/images/functions";
import type { ImageType } from "@s/images/types";
import { selectAllSets } from "@s/main";
import { selectBottomNav } from "@s/settings";
import {
  addOrRemove,
  closeModal,
  hasKey,
  iconObject,
  openModal,
  useBoolStates,
} from "@s/util/functions";
import { Delete, PermMedia } from "@i";
import { DialogDelete } from "./dialog-delete";
import { DrawerDetails } from "./drawer-details";
import { DrawerSearch } from "./drawer-search";
import "./index.scss";

const storage = firebase.storage();

const storageRef = storage.ref();

const aspectRatios = {
  "image-list": 1,
  card: 16 / 9,
  list: 16 / 9,
  thumbs: 16 / 9,
};

const blankImage = { ...new ImageObj() };

type ContentImagesProps = {
  openNav: () => void;
};

export const ContentImages = ({ openNav }: ContentImagesProps) => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);

  const bottomNav = useAppSelector(selectBottomNav);

  const allSets = useAppSelector(selectAllSets);

  const loading = useAppSelector(selectLoading);

  const currentFolder = useAppSelector(selectCurrentFolder);
  const folders = useAppSelector(selectFolders);

  const images = useAppSelector(selectImages);
  const checkedImages = useAppSelector(selectCheckedImages);
  const keysetImages = useAppSelector(selectSetImages);
  const duplicateSetImages = useAppSelector(selectDuplicateSetImages);

  const detailImage = useAppSelector(selectDetailImage);
  const detailMetadata = useAppSelector(selectDetailMetadata);

  const [detailOpen, setDetailOpen] = useState(false);
  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const [closeFolderMenu, openFolderMenu] = useBoolStates(setFolderMenuOpen);
  const [searchOpen, setSearchOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [closeDelete, openDelete] = useBoolStates(setDeleteOpen);

  useEffect(() => {
    if (images.length === 0) {
      getFolders();
      listAll();
      createSetImageList();
    }
  }, []);
  useEffect(createSetImageList, [JSON.stringify(allSets)]);

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
    dispatch(setDetailImage(blankImage));
    dispatch(setDetailMetadata({}));
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

  const openDetails = (image: ImageType) => {
    const open = () => {
      if (detailImage === image) {
        closeDetails();
      } else {
        setDetailOpen(true);
        if (device !== "desktop") {
          openModal();
        }
        dispatch(setDetailImage(image));
        storageRef
          .child(image.fullPath)
          .getMetadata()
          .then((metadata) => {
            dispatch(setDetailMetadata(metadata));
          })
          .catch((error) => {
            queue.notify({ title: "Failed to get metadata: " + error });
            dispatch(setDetailMetadata({}));
          });
      }
    };
    if (searchOpen) {
      closeSearch();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };

  const toggleImageChecked = (image: ImageType) => {
    const editedArray = addOrRemove([...checkedImages], image);
    dispatch(setCheckedImages(editedArray));
  };
  const toggleImageCheckedArray = (array: ImageType[], append = false) => {
    const editedArray = append ? [...checkedImages, ...array] : array;
    dispatch(setCheckedImages(editedArray));
  };
  const clearChecked = () => {
    dispatch(setCheckedImages([]));
  };
  const unusedImages = images.filter(
    (image) => !keysetImages.includes(image.name)
  );
  const usedImages = images.filter((image) =>
    keysetImages.includes(image.name)
  );
  const duplicateImages = usedImages.filter((image) =>
    duplicateSetImages.includes(image.name)
  );
  const display = [
    {
      title: "Unused images",
      array: unusedImages,
    },
    {
      title: "Duplicate images",
      array: duplicateImages,
    },
    {
      title: "Used images",
      array: usedImages,
    },
  ];
  const contextual = checkedImages.length > 0;
  const tooltipAlign = bottomNav ? "top" : "bottom";
  return (
    <>
      <TopAppBar
        className={classNames("is-contextual", {
          "bottom-app-bar": bottomNav,
          contextual,
        })}
        fixed
      >
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            {contextual ? (
              withTooltip(
                <TopAppBarActionItem icon="close" onClick={clearChecked} />,
                "Close",
                { align: tooltipAlign }
              )
            ) : (
              <TopAppBarNavigationIcon icon="menu" onClick={openNav} />
            )}
            <TopAppBarTitle>
              {contextual
                ? `${checkedImages.length} selected`
                : pageTitle.images}
            </TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>
            {contextual ? (
              <>
                {withTooltip(
                  <TopAppBarActionItem
                    icon={iconObject(<Delete />)}
                    onClick={openDelete}
                  />,
                  "Delete",
                  {
                    align: tooltipAlign,
                  }
                )}
              </>
            ) : (
              <>
                {withTooltip(
                  <TopAppBarActionItem icon="search" onClick={openSearch} />,
                  "Search",
                  {
                    align: tooltipAlign,
                  }
                )}
                {device === "mobile" ? (
                  <MenuSurfaceAnchor>
                    {withTooltip(
                      <TopAppBarActionItem
                        icon={iconObject(<PermMedia />)}
                        onClick={openFolderMenu}
                      />,
                      "Folder",
                      { align: tooltipAlign }
                    )}
                    <Menu
                      anchorCorner="bottomLeft"
                      className="folder-menu"
                      onClose={closeFolderMenu}
                      open={folderMenuOpen}
                    >
                      {folders.map((folder) => (
                        <MenuItem
                          key={folder}
                          onClick={() => {
                            setFolder(folder);
                          }}
                          selected={currentFolder === folder}
                        >
                          {`${folder}/`}
                        </MenuItem>
                      ))}
                    </Menu>
                  </MenuSurfaceAnchor>
                ) : (
                  <SegmentedButton toggle>
                    {folders.map((folder) => (
                      <SegmentedButtonSegment
                        key={folder}
                        label={folder}
                        onClick={() => {
                          setFolder(folder);
                        }}
                        selected={currentFolder === folder}
                      />
                    ))}
                  </SegmentedButton>
                )}
              </>
            )}
          </TopAppBarSection>
        </TopAppBarRow>
        <LinearProgress closed={!loading} />
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div
        className={classNames("content-container", {
          "drawer-open": device === "desktop" && detailOpen,
        })}
      >
        <div className="main">
          <DrawerSearch
            close={closeSearch}
            images={images}
            open={searchOpen}
            unusedImages={unusedImages}
          />
          <DrawerDetails
            close={closeDetails}
            image={detailImage}
            metadata={detailMetadata}
            open={detailOpen}
          />
          <DialogDelete
            close={closeDelete}
            folders={folders}
            images={checkedImages}
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
              {display.map((obj) =>
                obj.array.length > 0 ? (
                  <div key={obj.title} className="display-container">
                    <div className="subheader">
                      <Typography use="caption">{`${obj.title} (${obj.array.length})`}</Typography>
                      <Button
                        className="subheader-button"
                        label="Select all"
                        onClick={() => toggleImageCheckedArray(obj.array)}
                      />
                    </div>
                    <ImageList style={{ margin: -2 }} withTextProtection>
                      {obj.array.map((image) => (
                        <Ripple key={image.fullPath}>
                          <ImageListItem
                            className={classNames({
                              selected: image === detailImage,
                            })}
                          >
                            <div className="container">
                              <div
                                className="item-container"
                                onClick={() => openDetails(image)}
                              >
                                <ImageListImageAspectContainer>
                                  <LazyLoad
                                    debounce={false}
                                    offsetVertical={480}
                                  >
                                    <ImageListImage
                                      style={{
                                        backgroundImage:
                                          "url(" + image.src + ")",
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
                                    checked={checkedImages.includes(image)}
                                    onClick={() => {
                                      toggleImageChecked(image);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </ImageListItem>
                        </Ripple>
                      ))}
                    </ImageList>
                  </div>
                ) : null
              )}
            </div>
            <Footer />
          </ConditionalWrapper>
        </div>
      </div>
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};

export default ContentImages;
