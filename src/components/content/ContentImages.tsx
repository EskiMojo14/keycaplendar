import React, { useEffect, useState } from "react";
import classNames from "classnames";
import LazyLoad from "react-lazy-load";
import firebase from "@s/firebase/firebase";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common/commonSlice";
import { pageTitle } from "@s/common/constants";
import { addOrRemove, closeModal, hasKey, iconObject, openModal, useBoolStates } from "@s/common/functions";
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
} from "@s/images/imagesSlice";
import { ImageObj } from "@s/images/constructors";
import { createSetImageList, getFolders, listAll, setFolder } from "@s/images/functions";
import { ImageType } from "@s/images/types";
import { selectAllSets } from "@s/main/mainSlice";
import { selectBottomNav } from "@s/settings/settingsSlice";
import { queue } from "~/app/snackbarQueue";
import { Button } from "@rmwc/button";
import { Checkbox } from "@rmwc/checkbox";
import { DrawerAppContent } from "@rmwc/drawer";
import {
  ImageList,
  ImageListItem,
  ImageListImageAspectContainer,
  ImageListImage,
  ImageListSupporting,
  ImageListLabel,
} from "@rmwc/image-list";
import { LinearProgress } from "@rmwc/linear-progress";
import { MenuSurfaceAnchor, Menu, MenuItem } from "@rmwc/menu";
import { Ripple } from "@rmwc/ripple";
import { Tooltip } from "@rmwc/tooltip";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
  TopAppBarActionItem,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { DrawerDetails } from "@c/images/DrawerDetails";
import { DrawerSearch } from "@c/images/DrawerSearch";
import { DialogDelete } from "@c/images/DialogDelete";
import { Footer } from "@c/common/Footer";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/SegmentedButton";
import { ConditionalWrapper } from "@c/util/ConditionalWrapper";
import "./ContentImages.scss";

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

export const ContentImages = (props: ContentImagesProps) => {
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
  const closeSearch = () => {
    if (device !== "desktop") {
      closeModal();
    }
    setSearchOpen(false);
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
  const unusedImages = images.filter((image) => !keysetImages.includes(image.name));
  const usedImages = images.filter((image) => keysetImages.includes(image.name));
  const duplicateImages = usedImages.filter((image) => duplicateSetImages.includes(image.name));
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
      <TopAppBar fixed className={classNames("is-contextual", { "bottom-app-bar": bottomNav, contextual: contextual })}>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            {contextual ? (
              <Tooltip enterDelay={500} content="Close" align={tooltipAlign}>
                <TopAppBarActionItem icon="close" onClick={clearChecked} />
              </Tooltip>
            ) : (
              <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            )}
            <TopAppBarTitle>{contextual ? `${checkedImages.length} selected` : pageTitle.images}</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>
            {contextual ? (
              <>
                <Tooltip enterDelay={500} content="Delete" align={tooltipAlign}>
                  <TopAppBarActionItem
                    icon={iconObject(
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                          <path d="M0 0h24v24H0V0z" fill="none" />
                          <path d="M8 9h8v10H8z" opacity=".3" />
                          <path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9z" />
                        </svg>
                      </div>
                    )}
                    onClick={openDelete}
                  />
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip enterDelay={500} content="Search" align={tooltipAlign}>
                  <TopAppBarActionItem icon="search" onClick={openSearch} />
                </Tooltip>
                {device === "mobile" ? (
                  <MenuSurfaceAnchor>
                    <Tooltip enterDelay={500} content="Folder" align={tooltipAlign}>
                      <TopAppBarActionItem
                        icon={iconObject(
                          <div>
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                              <path d="M0 0h24v24H0V0z" fill="none" />
                              <path
                                d="M13.17 6l-.59-.59L11.17 4H6v12h16V6h-8.83zm4.33 4.5L21 15H7l4.5-6 3.5 4.51 2.5-3.01z"
                                opacity=".3"
                              />
                              <path d="M2 6H0v5h.01L0 20c0 1.1.9 2 2 2h18v-2H2V6zm5 9h14l-3.5-4.5-2.5 3.01L11.5 9zM22 4h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 12H6V4h5.17l1.41 1.41.59.59H22v10z" />
                            </svg>
                          </div>
                        )}
                        onClick={openFolderMenu}
                      />
                    </Tooltip>
                    <Menu
                      open={folderMenuOpen}
                      onClose={closeFolderMenu}
                      anchorCorner="bottomLeft"
                      className="folder-menu"
                    >
                      {folders.map((folder) => (
                        <MenuItem
                          key={folder}
                          selected={currentFolder === folder}
                          onClick={() => {
                            setFolder(folder);
                          }}
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
                        selected={currentFolder === folder}
                        onClick={() => {
                          setFolder(folder);
                        }}
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
          <DrawerSearch open={searchOpen} close={closeSearch} images={images} unusedImages={unusedImages} />
          <DrawerDetails open={detailOpen} close={closeDetails} image={detailImage} metadata={detailMetadata} />
          <DialogDelete
            open={deleteOpen && checkedImages.length > 0}
            close={closeDelete}
            images={checkedImages}
            folders={folders}
            toggleImageChecked={toggleImageChecked}
          />
          <ConditionalWrapper
            condition={device === "desktop"}
            wrapper={(children) => <DrawerAppContent>{children}</DrawerAppContent>}
          >
            <div className="image-grid">
              {display.map((obj) =>
                obj.array.length > 0 ? (
                  <div className="display-container" key={obj.title}>
                    <div className="subheader">
                      <Typography use="caption">{`${obj.title} (${obj.array.length})`}</Typography>
                      <Button
                        className="subheader-button"
                        label="Select all"
                        onClick={() => toggleImageCheckedArray(obj.array)}
                      />
                    </div>
                    <ImageList style={{ margin: -2 }} withTextProtection>
                      {obj.array.map((image) => {
                        return (
                          <Ripple key={image.fullPath}>
                            <ImageListItem className={classNames({ selected: image === detailImage })}>
                              <div className="container">
                                <div className="item-container" onClick={() => openDetails(image)}>
                                  <ImageListImageAspectContainer
                                    style={{
                                      paddingBottom: hasKey(aspectRatios, currentFolder)
                                        ? "calc(100% /" + aspectRatios[currentFolder] + ")"
                                        : undefined,
                                    }}
                                  >
                                    <LazyLoad debounce={false} offsetVertical={480}>
                                      <ImageListImage tag="div" style={{ backgroundImage: "url(" + image.src + ")" }} />
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
                        );
                      })}
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
