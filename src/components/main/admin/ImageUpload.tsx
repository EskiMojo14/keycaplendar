import React from "react";
import classNames from "classnames";
import { queue } from "../../../app/snackbarQueue";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";
import { CircularProgress } from "@rmwc/circular-progress";
import { Card, CardActions, CardActionButtons, CardActionButton } from "@rmwc/card";
import "./ImageUpload.scss";

type ImageUploadProps = {
  desktop: boolean;
  image: Blob | File | string | null;
  setImage: (image: Blob | File | null) => void;
};

type ImageUploadState = {
  imageBase64: string;
  imageLink: string;
  imageFromURL: boolean;
  dragOver: boolean;
  loading: boolean;
  hasImage: boolean;
};

export class ImageUpload extends React.Component<ImageUploadProps, ImageUploadState> {
  state = {
    imageBase64: "",
    imageLink: "",
    imageFromURL: true,
    dragOver: false,
    loading: false,
    hasImage: false,
  };
  componentDidUpdate(prevProps: ImageUploadProps) {
    if (this.props.image !== prevProps.image) {
      if (this.props.image) {
        if (typeof this.props.image === "string") {
          this.setState({
            imageBase64: this.props.image,
            hasImage: true,
          });
        } else {
          this.previewImage(this.props.image);
        }
      } else {
        this.setState({
          imageBase64: "",
          imageLink: "",
          imageFromURL: true,
          dragOver: false,
          loading: false,
          hasImage: false,
        });
      }
    }
  }

  previewImage = (image: Blob | File) => {
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = () => {
      this.setState({
        imageBase64: reader.result as string,
        hasImage: true,
        loading: false,
      });
    };
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState<never>({
      [e.target.name]: e.target.value,
    });
    const regex = RegExp("https?://.+.(?:jpg|jpeg|png)");
    if (regex.test(e.target.value)) {
      this.getImageFromURL(e.target.value);
    }
  };

  getImageFromURL = (url: string) => {
    this.setState({ loading: true });
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);

    xhr.responseType = "blob";

    xhr.onload = () => {
      this.props.setImage(xhr.response);
    };

    xhr.send();
  };

  dragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragOver: true });
  };

  dragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragOver: false });
  };

  dragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ loading: true });
    const dt = e.dataTransfer;
    const file = dt.files[0];
    if (!file.type.includes("image")) {
      queue.notify({ title: "Error: file is not an image." });
      this.setState({ dragOver: false, loading: false });
    } else {
      this.props.setImage(file);
      this.setState({ dragOver: false });
    }
  };

  fileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ loading: true });
    const files = e.target.files;
    if (files) {
      const file = files[0];
      this.props.setImage(file);
      this.setState({ dragOver: false });
    }
  };

  fromUrl = () => {
    this.setState({ imageFromURL: true });
  };

  fromFile = () => {
    this.setState({
      imageFromURL: false,
      imageLink: "",
    });
  };
  render() {
    const imageTextField = this.state.imageFromURL ? (
      <TextField
        autoComplete="off"
        icon="link"
        outlined
        label="Image link"
        pattern="https?://.+\.(?:jpg|jpeg|png)"
        name="imageLink"
        value={this.state.imageLink}
        onChange={this.handleChange}
        helpText={{ persistent: false, validationMsg: true, children: "Must be valid link" }}
      />
    ) : null;
    const areaInner = this.state.hasImage ? (
      <div className="image-display-image" style={{ backgroundImage: "url(" + this.state.imageBase64 + ")" }} />
    ) : this.state.loading ? null : this.props.desktop && !this.state.imageFromURL ? (
      <div className="drag-label">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M10.21 16.83l-1.96-2.36L5.5 18h11l-3.54-4.71z" />
          <path d="M16.5 18h-11l2.75-3.53 1.96 2.36 2.75-3.54L16.5 18zM17 7h-3V6H4v14h14V10h-1V7z" opacity=".3" />
          <path d="M20 4V1h-2v3h-3v2h3v2.99h2V6h3V4zm-2 16H4V6h10V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10h-2v10z" />
        </svg>
        <Typography use="body2" tag="p" className="caption">
          Drag image here
        </Typography>
      </div>
    ) : (
      <div className="drag-label">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M10.21 16.83l-1.96-2.36L5.5 18h11l-3.54-4.71z" />
          <path d="M16.5 18h-11l2.75-3.53 1.96 2.36 2.75-3.54L16.5 18zM17 7h-3V6H4v14h14V10h-1V7z" opacity=".3" />
          <path d="M20 4V1h-2v3h-3v2h3v2.99h2V6h3V4zm-2 16H4V6h10V4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10h-2v10z" />
        </svg>
      </div>
    );
    const loadingIndicator = this.state.loading ? (
      <div className={classNames("loading-indicator", { image: this.state.hasImage })}>
        <CircularProgress size="large" />
      </div>
    ) : null;
    const actions = !this.state.imageFromURL ? (
      <CardActions>
        <CardActionButtons>
          <div className="file-input">
            <CardActionButton tag="label" htmlFor="file-upload" label="Browse" />
            <input type="file" id="file-upload" accept=".png, .jpg, .jpeg" onChange={this.fileChange} />
          </div>
          <CardActionButton label="From URL" onClick={this.fromUrl} />
        </CardActionButtons>
      </CardActions>
    ) : (
      <CardActions>
        <CardActionButtons>
          <CardActionButton label="From file" onClick={this.fromFile} />
        </CardActionButtons>
      </CardActions>
    );
    return (
      <Card outlined className="image-upload">
        <Typography use="caption" tag="h3" className="image-upload-title">
          Image*
        </Typography>
        <div className="image-upload-form">
          <div
            className={classNames("image-display", { over: this.state.dragOver, image: this.state.hasImage })}
            onDragEnter={(e) => {
              if (!this.state.imageFromURL) {
                this.dragEnter(e);
              }
            }}
            onDragLeave={(e) => {
              if (!this.state.imageFromURL) {
                this.dragLeave(e);
              }
            }}
            onDragOver={(e) => {
              if (!this.state.imageFromURL) {
                this.dragOver(e);
              }
            }}
            onDrop={(e) => {
              if (!this.state.imageFromURL) {
                this.onDrop(e);
              }
            }}
          >
            {loadingIndicator}
            {areaInner}
          </div>
          {imageTextField}
        </div>
        {actions}
      </Card>
    );
  }
}

export default ImageUpload;
