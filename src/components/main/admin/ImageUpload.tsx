import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { is } from "typescript-is";
import { queue } from "../../../app/snackbarQueue";
import { Card, CardActions, CardActionButtons, CardActionButton } from "@rmwc/card";
import { CircularProgress } from "@rmwc/circular-progress";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";
import "./ImageUpload.scss";

type ImageUploadProps = {
  desktop: boolean;
  image: Blob | File | string | null;
  setImage: (image: Blob | File | null) => void;
};

export const ImageUpload = (props: ImageUploadProps) => {
  const [imageBase64, setImageBase64] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [imageFromURL, setImageFromURL] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    if (props.image) {
      if (is<string>(props.image)) {
        setImageBase64(props.image);
        setHasImage(true);
      } else {
        previewImage(props.image);
      }
    } else {
      setImageBase64("");
      setImageLink("");
      setImageFromURL(true);
      setDragOver(false);
      setLoading(false);
      setHasImage(false);
    }
  }, [props.image]);

  const previewImage = (image: Blob | File) => {
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
      setHasImage(true);
      setLoading(false);
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    if (name === "imageLink") {
      setImageLink(value);
    }
    const regex = RegExp("https?://.+(?:.(?:jpe?g|png)|;image)");
    if (regex.test(value)) {
      getImageFromURL(value);
    }
  };

  const getImageFromURL = (url: string) => {
    setLoading(true);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);

    xhr.responseType = "blob";

    xhr.onload = () => {
      props.setImage(xhr.response);
    };

    xhr.send();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!imageFromURL) {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!imageFromURL) {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!imageFromURL) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!imageFromURL) {
      e.preventDefault();
      e.stopPropagation();
      setLoading(true);
      const dt = e.dataTransfer;
      const file = dt.files[0];
      if (!file.type.includes("image")) {
        queue.notify({ title: "Error: file is not an image." });
        setDragOver(false);
        setLoading(false);
      } else {
        props.setImage(file);
        setDragOver(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const files = e.target.files;
    if (files) {
      const file = files[0];
      props.setImage(file);
      setDragOver(false);
    }
  };

  const fromUrl = () => {
    setImageFromURL(true);
  };

  const fromFile = () => {
    setImageFromURL(false);
    setImageLink("");
  };
  const imageTextField = imageFromURL ? (
    <TextField
      autoComplete="off"
      icon="link"
      outlined
      label="Image link"
      pattern="https?://.+\.(?:jpg|jpeg|png)"
      name="imageLink"
      value={imageLink}
      onChange={handleChange}
      helpText={{ persistent: false, validationMsg: true, children: "Must be valid link" }}
    />
  ) : null;
  const areaInner = hasImage ? (
    <div className="image-display-image" style={{ backgroundImage: "url(" + imageBase64 + ")" }} />
  ) : loading ? null : props.desktop && !imageFromURL ? (
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
  const loadingIndicator = loading ? (
    <div className={classNames("loading-indicator", { image: hasImage })}>
      <CircularProgress size="large" />
    </div>
  ) : null;
  const actions = !imageFromURL ? (
    <CardActions>
      <CardActionButtons>
        <div className="file-input">
          <CardActionButton tag="label" htmlFor="file-upload" label="Browse" />
          <input type="file" id="file-upload" accept=".png, .jpg, .jpeg" onChange={handleFileChange} />
        </div>
        <CardActionButton label="From URL" onClick={fromUrl} />
      </CardActionButtons>
    </CardActions>
  ) : (
    <CardActions>
      <CardActionButtons>
        <CardActionButton label="From file" onClick={fromFile} />
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
          className={classNames("image-display", { over: dragOver, image: hasImage })}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {loadingIndicator}
          {areaInner}
        </div>
        {imageTextField}
      </div>
      {actions}
    </Card>
  );
};

export default ImageUpload;
