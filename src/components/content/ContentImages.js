import React from "react";
import classNames from "classnames";
import isEqual from "lodash.isequal";
import LazyLoad from "react-lazy-load";
import firebase from "../../firebase";
import { ImageObj } from "../../util/constructors";
import { DeviceContext } from "../../util/contexts";
import { capitalise, addOrRemove, iconObject } from "../../util/functions";
import { Checkbox } from "@rmwc/checkbox";
import { DrawerAppContent } from "@rmwc/drawer";
import { LinearProgress } from "@rmwc/linear-progress";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
  TopAppBarActionItem,
} from "@rmwc/top-app-bar";
import {
  ImageList,
  ImageListItem,
  ImageListImageAspectContainer,
  ImageListImage,
  ImageListSupporting,
  ImageListLabel,
} from "@rmwc/image-list";
import { Ripple } from "@rmwc/ripple";
import { Typography } from "@rmwc/typography";
import { DrawerDetails } from "../images/DrawerDetails";
import { Footer } from "../common/Footer";
import { ToggleGroup, ToggleGroupButton } from "../util/ToggleGroup";
import { ConditionalWrapper } from "../util/ConditionalWrapper";
import "./ContentImages.scss";

const storage = firebase.storage();

const storageRef = storage.ref();

const aspectRatios = {
  "image-list": 1,
  card: 16 / 9,
  list: 16 / 9,
};

const blankImage = new ImageObj();

export class ContentImages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentFolder: "keysets",
      folders: [],
      images: [],
      checkedImages: [],
      setImages: [],
      detailOpen: false,
      detailImage: blankImage,
      detailMetadata: {},
      loading: false,
    };
  }
  componentDidMount() {
    this.listAll(this.state.currentFolder);
    this.createSetImageList();
  }
  componentDidUpdate(prevProps) {
    if (!isEqual(prevProps.sets, this.props.sets)) {
      this.createSetImageList();
    }
  }
  createSetImageList = () => {
    const fileNameRegex = /keysets%2F(.*)\?/;
    const setImages = this.props.sets.map((set) => {
      return decodeURIComponent(set.image.match(fileNameRegex)[1]);
    });
    setImages.sort((a, b) => {
      const nameA = a.toLowerCase();
      const nameB = b.toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    this.setState({ setImages: setImages });
  };
  processPrefixes = (prefixes) => {
    const folders = prefixes.map((folderRef) => {
      return folderRef.fullPath;
    });
    const sortOrder = ["keysets", "card", "list", "image-list"];
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
  processItems = (items) => {
    const images = items.map((itemRef) => {
      const src = `https://firebasestorage.googleapis.com/v0/b/${itemRef.bucket}/o/${encodeURIComponent(
        itemRef.fullPath
      )}?alt=media`;
      const obj = new ImageObj(itemRef.name, itemRef.parent, itemRef.fullPath, src);
      return obj;
    });
    images.sort((a, b) => {
      var nameA = a.name.replace(".png", "").toLowerCase();
      var nameB = b.name.replace(".png", "").toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    this.setState({ images: images, checkedImages: [], loading: false });
  };
  listAll = (path = "") => {
    this.setState({ loading: true });
    storageRef
      .listAll()
      .then((res) => {
        this.processPrefixes(res.prefixes);
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Failed to list top level folders: " + error });
      });
    storageRef
      .child(path)
      .listAll()
      .then((res) => {
        this.processItems(res.items);
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Failed to list images: " + error });
      });
  };
  setFolder = (folder) => {
    this.setState({ currentFolder: folder });
    this.listAll(folder);
  };
  openDetails = (image) => {
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
          this.props.snackbarQueue.notify({ title: "Failed to get metadata: " + error });
          this.setState({ detailMetadata: {} });
        });
    }
  };
  closeDetails = () => {
    this.setState({ detailOpen: false, detailImage: blankImage, detailMetadata: {} });
  };
  handleChecked = (image) => {
    const editedArray = addOrRemove([...this.state.checkedImages], image.fullPath);
    this.setState({ checkedImages: editedArray });
  };
  clearChecked = () => {
    this.setState({ checkedImages: [] });
  };
  render() {
    const unusedImages = this.state.images.filter((image) => !this.state.setImages.includes(image.name));
    const usedImages = this.state.images.filter((image) => this.state.setImages.includes(image.name));
    const display = [
      {
        title: "Unused images",
        array: unusedImages,
      },
      {
        title: "Used images",
        array: usedImages,
      },
    ];
    const contextual = this.state.checkedImages.length > 0;
    return (
      <>
        <TopAppBar
          fixed
          className={classNames("is-contextual", { "bottom-app-bar": this.props.bottomNav, contextual: contextual })}
        >
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              {contextual ? (
                <TopAppBarActionItem icon="close" onClick={this.clearChecked} />
              ) : (
                <TopAppBarNavigationIcon icon="menu" onClick={this.props.openNav} />
              )}
              <TopAppBarTitle>{contextual ? `${this.state.checkedImages.length} selected` : "Images"}</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
              {contextual ? (
                <>
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
                  />
                </>
              ) : (
                <>
                  <ToggleGroup>
                    {this.state.folders.map((folder) => (
                      <ToggleGroupButton
                        key={folder}
                        label={capitalise(folder)}
                        selected={this.state.currentFolder === folder}
                        onClick={() => {
                          this.setFolder(folder);
                        }}
                      />
                    ))}
                  </ToggleGroup>
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
            <DrawerDetails
              open={this.state.detailOpen}
              close={this.closeDetails}
              image={this.state.detailImage}
              metadata={this.state.detailMetadata}
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
                        <Typography use="caption">{obj.title}</Typography>
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
                                        paddingBottom: "calc(100% /" + aspectRatios[this.state.currentFolder] + ")",
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
                                        checked={this.state.checkedImages.includes(image.fullPath)}
                                        onClick={() => {
                                          this.handleChecked(image);
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
