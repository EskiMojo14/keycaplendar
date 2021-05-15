import React from "react";
import classNames from "classnames";
import isEqual from "lodash.isequal";
import LazyLoad from "react-lazy-load";
import firebase from "../../firebase";
import { queue } from "../../app/snackbarQueue";
import { ImageObj } from "../../util/constructors";
import { DeviceContext } from "../../util/contexts";
import { addOrRemove, alphabeticalSort, getStorageFolders, hasKey, iconObject } from "../../util/functions";
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

type ContentImagesState = {
  currentFolder: string;
  folders: string[];
  folderOpen: boolean;
  images: ImageType[];
  checkedImages: ImageType[];
  setImages: string[];
  duplicateSetImages: string[];
  detailOpen: boolean;
  detailImage: ImageType;
  detailMetadata: Record<string, unknown>;
  searchOpen: boolean;
  deleteOpen: boolean;
  loading: boolean;
};

export class ContentImages extends React.Component<ContentImagesProps, ContentImagesState> {
  state: ContentImagesState = {
    currentFolder: "thumbs",
    folders: [],
    folderOpen: false,
    images: [],
    checkedImages: [],
    setImages: [],
    duplicateSetImages: [],
    detailOpen: false,
    detailImage: blankImage,
    detailMetadata: {},
    searchOpen: false,
    deleteOpen: false,
    loading: false,
  };
  componentDidMount() {
    this.getFolders();
    this.listAll();
    this.createSetImageList();
  }
  componentDidUpdate(prevProps: ContentImagesProps) {
    if (!isEqual(prevProps.sets, this.props.sets)) {
      this.createSetImageList();
    }
  }
  createSetImageList = () => {
    const fileNameRegex = /keysets%2F(.*)\?/;
    const setImages = alphabeticalSort(
      this.props.sets
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
    this.setState({ setImages: setImages, duplicateSetImages: findDuplicates(setImages) });
  };
  processItems = (items: firebase.storage.Reference[], append = false) => {
    const images = items.map((itemRef) => {
      const src = `https://firebasestorage.googleapis.com/v0/b/${itemRef.bucket}/o/${encodeURIComponent(
        itemRef.fullPath
      )}?alt=media`;
      const obj = new ImageObj(itemRef.name, itemRef.parent ? itemRef.parent.fullPath : "", itemRef.fullPath, src);
      return obj;
    });
    const allImages = append ? [...this.state.images, ...images] : images;
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
    this.setState({ images: allImages, checkedImages: [], loading: false });
  };
  getFolders = async () => {
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
    this.setState({ folders: folders });
  };
  listAll = (path = this.state.currentFolder) => {
    const paginatedListAll = (nextPageToken?: string) => {
      this.setState({ loading: true });
      storageRef
        .child(path)
        .list({ maxResults: 100, pageToken: nextPageToken })
        .then((res) => {
          this.processItems(res.items, !!nextPageToken);
          if (res.nextPageToken) {
            paginatedListAll(res.nextPageToken);
          }
        })
        .catch((error) => {
          queue.notify({ title: "Failed to list images: " + error });
          this.setState({ loading: false });
        });
    };
    paginatedListAll();
  };
  setFolder = (folder: string) => {
    this.setState({ currentFolder: folder });
    this.listAll(folder);
  };
  openDetails = (image: ImageType) => {
    const open = () => {
      if (this.state.detailImage === image) {
        this.closeDetails();
      } else {
        this.setState({ detailOpen: true, detailImage: image });
        storageRef
          .child(image.fullPath)
          .getMetadata()
          .then((metadata) => {
            this.setState({ detailMetadata: metadata });
          })
          .catch((error) => {
            queue.notify({ title: "Failed to get metadata: " + error });
            this.setState({ detailMetadata: {} });
          });
      }
    };
    if (this.state.searchOpen) {
      this.closeSearch();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  closeDetails = () => {
    this.setState({ detailOpen: false, detailImage: blankImage, detailMetadata: {} });
  };
  openFolders = () => {
    this.setState({ folderOpen: true });
  };
  closeFolders = () => {
    this.setState({ folderOpen: false });
  };
  openSearch = () => {
    const open = () => {
      this.setState((prevState) => ({ searchOpen: !prevState.searchOpen }));
    };
    if (this.state.detailOpen) {
      this.closeDetails();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  closeSearch = () => {
    this.setState({ searchOpen: false });
  };
  openDelete = () => {
    this.setState({ deleteOpen: true });
  };
  closeDelete = () => {
    this.setState({ deleteOpen: false });
  };
  toggleImageChecked = (image: ImageType) => {
    const editedArray = addOrRemove([...this.state.checkedImages], image);
    this.setState({ checkedImages: editedArray });
  };
  toggleImageCheckedArray = (array: ImageType[], append = false) => {
    const editedArray = append ? [...this.state.checkedImages, ...array] : array;
    this.setState({ checkedImages: editedArray });
  };
  clearChecked = () => {
    this.setState({ checkedImages: [] });
  };
  setLoading = (bool: boolean) => {
    this.setState({ loading: bool });
  };
  render() {
    const unusedImages = this.state.images.filter((image) => !this.state.setImages.includes(image.name));
    const usedImages = this.state.images.filter((image) => this.state.setImages.includes(image.name));
    const duplicateImages = usedImages.filter((image) => this.state.duplicateSetImages.includes(image.name));
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
    const contextual = this.state.checkedImages.length > 0;
    const tooltipAlign = this.props.bottomNav ? "top" : "bottom";
    return (
      <>
        <TopAppBar
          fixed
          className={classNames("is-contextual", { "bottom-app-bar": this.props.bottomNav, contextual: contextual })}
        >
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              {contextual ? (
                <Tooltip enterDelay={500} content="Close" align={tooltipAlign}>
                  <TopAppBarActionItem icon="close" onClick={this.clearChecked} />
                </Tooltip>
              ) : (
                <TopAppBarNavigationIcon icon="menu" onClick={this.props.openNav} />
              )}
              <TopAppBarTitle>{contextual ? `${this.state.checkedImages.length} selected` : "Images"}</TopAppBarTitle>
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
                      onClick={this.openDelete}
                    />
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip enterDelay={500} content="Search" align={tooltipAlign}>
                    <TopAppBarActionItem icon="search" onClick={this.openSearch} />
                  </Tooltip>
                  {this.context === "mobile" ? (
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
                          onClick={this.openFolders}
                        />
                      </Tooltip>
                      <Menu
                        open={this.state.folderOpen}
                        onClose={this.closeFolders}
                        anchorCorner="bottomLeft"
                        className="folder-menu"
                      >
                        {this.state.folders.map((folder) => (
                          <MenuItem
                            key={folder}
                            selected={this.state.currentFolder === folder}
                            onClick={() => {
                              this.setFolder(folder);
                            }}
                          >
                            {`${folder}/`}
                          </MenuItem>
                        ))}
                      </Menu>
                    </MenuSurfaceAnchor>
                  ) : (
                    <SegmentedButton toggle>
                      {this.state.folders.map((folder) => (
                        <SegmentedButtonSegment
                          key={folder}
                          label={folder}
                          selected={this.state.currentFolder === folder}
                          onClick={() => {
                            this.setFolder(folder);
                          }}
                        />
                      ))}
                    </SegmentedButton>
                  )}
                </>
              )}
            </TopAppBarSection>
          </TopAppBarRow>
          <LinearProgress closed={!this.state.loading} />
        </TopAppBar>
        {this.props.bottomNav ? null : <TopAppBarFixedAdjust />}
        <div
          className={classNames("content-container", {
            "drawer-open": this.context === "desktop" && this.state.detailOpen,
          })}
        >
          <div className="main">
            <DrawerSearch
              open={this.state.searchOpen}
              close={this.closeSearch}
              images={this.state.images}
              unusedImages={unusedImages}
            />
            <DrawerDetails
              open={this.state.detailOpen}
              close={this.closeDetails}
              image={this.state.detailImage}
              metadata={this.state.detailMetadata}
            />
            <DialogDelete
              open={this.state.deleteOpen && this.state.checkedImages.length > 0}
              close={this.closeDelete}
              images={this.state.checkedImages}
              folders={this.state.folders}
              toggleImageChecked={this.toggleImageChecked}
              setLoading={this.setLoading}
              listAll={this.listAll}
            />
            <ConditionalWrapper
              condition={this.context === "desktop"}
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
                          onClick={() => this.toggleImageCheckedArray(obj.array)}
                        />
                      </div>
                      <ImageList style={{ margin: -2 }} withTextProtection>
                        {obj.array.map((image) => {
                          return (
                            <Ripple key={image.fullPath}>
                              <ImageListItem className={classNames({ selected: image === this.state.detailImage })}>
                                <div className="container">
                                  <div className="item-container" onClick={() => this.openDetails(image)}>
                                    <ImageListImageAspectContainer
                                      style={{
                                        paddingBottom: hasKey(aspectRatios, this.state.currentFolder)
                                          ? "calc(100% /" + aspectRatios[this.state.currentFolder] + ")"
                                          : undefined,
                                      }}
                                    >
                                      <LazyLoad debounce={false} offsetVertical={480}>
                                        <ImageListImage
                                          tag="div"
                                          style={{ backgroundImage: "url(" + image.src + ")" }}
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
                                        checked={this.state.checkedImages.includes(image)}
                                        onClick={() => {
                                          this.toggleImageChecked(image);
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
        {this.props.bottomNav ? <TopAppBarFixedAdjust /> : null}
      </>
    );
  }
}

ContentImages.contextType = DeviceContext;

export default ContentImages;
