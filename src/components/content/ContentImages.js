import React from "react";
import classNames from "classnames";
import isEqual from "lodash.isequal";
import LazyLoad from "react-lazy-load";
import firebase from "../../firebase";
import { ImageObj } from "../../util/constructors";
import { DeviceContext } from "../../util/contexts";
import { capitalise } from "../../util/functions";
import { DrawerAppContent } from "@rmwc/drawer";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
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
      currentFolder: "image-list",
      folders: [],
      images: [],
      setImages: [],
      detailOpen: false,
      detailImage: blankImage,
      detailMetadata: {},
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
    this.setState({ images: images });
  };
  listAll = (path = "") => {
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
    return (
      <>
        <TopAppBar fixed className={{ "bottom-app-bar": this.props.bottomNav }}>
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="menu" onClick={this.props.openNav} />
              <TopAppBarTitle>Images</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
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
            </TopAppBarSection>
          </TopAppBarRow>
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
                              <ImageListItem
                                className={classNames({ selected: image === this.state.detailImage })}
                                onClick={() => this.openDetails(image)}
                              >
                                <ImageListImageAspectContainer
                                  style={{
                                    paddingBottom: "calc(100% /" + aspectRatios[this.state.currentFolder] + ")",
                                  }}
                                >
                                  <LazyLoad debounce={false} offsetVertical={480}>
                                    <ImageListImage tag="div" style={{ backgroundImage: "url(" + image.src + ")" }} />
                                  </LazyLoad>
                                </ImageListImageAspectContainer>
                                <ImageListSupporting>
                                  <ImageListLabel>{image.name}</ImageListLabel>
                                </ImageListSupporting>
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
