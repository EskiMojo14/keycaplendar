import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames";
import LazyLoad from "react-lazy-load";
import firebase from "../../firebase";
import { queue } from "../../app/snackbarQueue";
import { ImageObj } from "../../util/constructors";
import { DeviceContext } from "../../util/contexts";
import {
  addOrRemove,
  alphabeticalSort,
  getStorageFolders,
  hasKey,
  iconObject,
  useBoolStates,
} from "../../util/functions";
import { ImageType, SetType } from "../../util/types";
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
import { DrawerDetails } from "../images/DrawerDetails";
import { DrawerSearch } from "../images/DrawerSearch";
import { DialogDelete } from "../images/DialogDelete";
import { Footer } from "../common/Footer";
import { SegmentedButton, SegmentedButtonSegment } from "../util/SegmentedButton";
import { ConditionalWrapper } from "../util/ConditionalWrapper";
import "./ContentImages.scss";

const storage = firebase.storage();

const storageRef = storage.ref();

const aspectRatios = {
  "image-list": 1,
  card: 16 / 9,
  list: 16 / 9,
  thumbs: 16 / 9,
};

const blankImage = new ImageObj();

type ContentImagesProps = {
  bottomNav: boolean;
  openNav: () => void;
  sets: SetType[];
};

export const ContentImages = (props: ContentImagesProps) => {
  const device = useContext(DeviceContext);

  const [folderInfo, setFolderInfo] = useState<{
    currentFolder: string;
    folders: string[];
  }>({
    currentFolder: "thumbs",
    folders: [],
  });
  const [imageInfo, setImageInfo] = useState<{
    images: ImageType[];
    checkedImages: ImageType[];
    setImages: string[];
    duplicateSetImages: string[];
  }>({
    images: [],
    checkedImages: [],
    setImages: [],
    duplicateSetImages: [],
  });
  const [detailInfo, setDetailInfo] = useState<{
    detailOpen: boolean;
    detailImage: ImageType;
    detailMetadata: Record<string, unknown>;
  }>({
    detailOpen: false,
    detailImage: blankImage,
    detailMetadata: {},
  });

  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const [closeFolderMenu, openFolderMenu] = useBoolStates(setFolderMenuOpen);
  const [searchOpen, setSearchOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [closeDelete, openDelete] = useBoolStates(setDeleteOpen);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getFolders();
    listAll();
    createSetImageList();
  }, []);

  const createSetImageList = () => {
    const fileNameRegex = /keysets%2F(.*)\?/;
    const setImages = alphabeticalSort(
      props.sets
        .map((set) => {
          const regexMatch = set.image.match(fileNameRegex);
          if (regexMatch) {
            return decodeURIComponent(regexMatch[1]);
          }
          return "";
        })
        .filter(Boolean)
    );
    const findDuplicates = (arr: string[]) => arr.filter((item, index) => arr.indexOf(item) !== index);
    setImageInfo((imageInfo) => {
      return { ...imageInfo, setImages: setImages, duplicateSetImages: findDuplicates(setImages) };
    });
  };
  useEffect(createSetImageList, [JSON.stringify(props.sets)]);

  const processItems = (items: firebase.storage.Reference[], append = false) => {
    const images = items.map((itemRef) => {
      const src = `https://firebasestorage.googleapis.com/v0/b/${itemRef.bucket}/o/${encodeURIComponent(
        itemRef.fullPath
      )}?alt=media`;
      const obj = new ImageObj(itemRef.name, itemRef.parent ? itemRef.parent.fullPath : "", itemRef.fullPath, src);
      return obj;
    });
    const allImages = append ? [...imageInfo.images, ...images] : images;
    allImages.sort((a, b) => {
      const nameA = a.name.replace(".png", "").toLowerCase();
      const nameB = b.name.replace(".png", "").toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    setImageInfo((imageInfo) => {
      return { ...imageInfo, images: allImages, checkedImages: [] };
    });
    setLoading(false);
  };
  const getFolders = async () => {
    const folders = await getStorageFolders();
    const sortOrder = ["thumbs", "card", "list", "image-list"];
    folders.sort((a, b) => {
      const nameA = sortOrder.indexOf(a);
      const nameB = sortOrder.indexOf(b);
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    setFolderInfo((folderInfo) => {
      return { ...folderInfo, folders: folders };
    });
  };
  const listAll = (path = folderInfo.currentFolder) => {
    const paginatedListAll = (nextPageToken?: string) => {
      setLoading(true);
      storageRef
        .child(path)
        .list({ maxResults: 100, pageToken: nextPageToken })
        .then((res) => {
          processItems(res.items, !!nextPageToken);
          if (res.nextPageToken) {
            paginatedListAll(res.nextPageToken);
          }
        })
        .catch((error) => {
          queue.notify({ title: "Failed to list images: " + error });
          setLoading(false);
        });
    };
    paginatedListAll();
  };
  const setFolder = (folder: string) => {
    setFolderInfo((folderInfo) => {
      return { ...folderInfo, currentFolder: folder };
    });
    listAll(folder);
  };
  const openDetails = (image: ImageType) => {
    const open = () => {
      if (detailInfo.detailImage === image) {
        closeDetails();
      } else {
        setDetailInfo((detailInfo) => {
          return { ...detailInfo, detailOpen: true, detailImage: image };
        });
        storageRef
          .child(image.fullPath)
          .getMetadata()
          .then((metadata) => {
            setDetailInfo((detailInfo) => {
              return { ...detailInfo, detailMetadata: metadata };
            });
          })
          .catch((error) => {
            queue.notify({ title: "Failed to get metadata: " + error });
            setDetailInfo((detailInfo) => {
              return { ...detailInfo, detailMetadata: {} };
            });
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
    setDetailInfo((detailInfo) => {
      return { ...detailInfo, detailOpen: false, detailImage: blankImage, detailMetadata: {} };
    });
  };
  const openSearch = () => {
    const open = () => {
      setSearchOpen(true);
    };
    if (detailInfo.detailOpen) {
      closeDetails();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const closeSearch = () => {
    setSearchOpen(false);
  };
  const toggleImageChecked = (image: ImageType) => {
    const editedArray = addOrRemove([...imageInfo.checkedImages], image);
    setImageInfo((imageInfo) => {
      return { ...imageInfo, checkedImages: editedArray };
    });
  };
  const toggleImageCheckedArray = (array: ImageType[], append = false) => {
    const editedArray = append ? [...imageInfo.checkedImages, ...array] : array;
    setImageInfo((imageInfo) => {
      return { ...imageInfo, checkedImages: editedArray };
    });
  };
  const clearChecked = () => {
    setImageInfo((imageInfo) => {
      return { ...imageInfo, checkedImages: [] };
    });
  };
  const unusedImages = imageInfo.images.filter((image) => !imageInfo.setImages.includes(image.name));
  const usedImages = imageInfo.images.filter((image) => imageInfo.setImages.includes(image.name));
  const duplicateImages = usedImages.filter((image) => imageInfo.duplicateSetImages.includes(image.name));
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
  const contextual = imageInfo.checkedImages.length > 0;
  const tooltipAlign = props.bottomNav ? "top" : "bottom";
  return (
    <>
      <TopAppBar
        fixed
        className={classNames("is-contextual", { "bottom-app-bar": props.bottomNav, contextual: contextual })}
      >
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            {contextual ? (
              <Tooltip enterDelay={500} content="Close" align={tooltipAlign}>
                <TopAppBarActionItem icon="close" onClick={clearChecked} />
              </Tooltip>
            ) : (
              <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            )}
            <TopAppBarTitle>{contextual ? `${imageInfo.checkedImages.length} selected` : "Images"}</TopAppBarTitle>
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
                      {folderInfo.folders.map((folder) => (
                        <MenuItem
                          key={folder}
                          selected={folderInfo.currentFolder === folder}
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
                    {folderInfo.folders.map((folder) => (
                      <SegmentedButtonSegment
                        key={folder}
                        label={folder}
                        selected={folderInfo.currentFolder === folder}
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
      {props.bottomNav ? null : <TopAppBarFixedAdjust />}
      <div
        className={classNames("content-container", {
          "drawer-open": device === "desktop" && detailInfo.detailOpen,
        })}
      >
        <div className="main">
          <DrawerSearch open={searchOpen} close={closeSearch} images={imageInfo.images} unusedImages={unusedImages} />
          <DrawerDetails
            open={detailInfo.detailOpen}
            close={closeDetails}
            image={detailInfo.detailImage}
            metadata={detailInfo.detailMetadata}
          />
          <DialogDelete
            open={deleteOpen && imageInfo.checkedImages.length > 0}
            close={closeDelete}
            images={imageInfo.checkedImages}
            folders={folderInfo.folders}
            toggleImageChecked={toggleImageChecked}
            setLoading={setLoading}
            listAll={listAll}
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
                            <ImageListItem className={classNames({ selected: image === detailInfo.detailImage })}>
                              <div className="container">
                                <div className="item-container" onClick={() => openDetails(image)}>
                                  <ImageListImageAspectContainer
                                    style={{
                                      paddingBottom: hasKey(aspectRatios, folderInfo.currentFolder)
                                        ? "calc(100% /" + aspectRatios[folderInfo.currentFolder] + ")"
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
                                      checked={imageInfo.checkedImages.includes(image)}
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
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};

export default ContentImages;
