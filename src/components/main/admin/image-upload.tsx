import { useEffect, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  Card,
  CardActionButton,
  CardActionButtons,
  CardActions,
} from "@rmwc/card";
import { CircularProgress } from "@rmwc/circular-progress";
import { Icon } from "@rmwc/icon";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { is } from "typescript-is";
import { queue } from "~/app/snackbar-queue";
import { iconObject } from "@s/util/functions";
import { AddPhotoAlternate } from "@i";
import "./image-upload.scss";

type ImageUploadProps = {
  desktop: boolean;
  image: Blob | File | string | null;
  setImage: (image: Blob | File | null) => void;
};

export const ImageUpload = ({ desktop, image, setImage }: ImageUploadProps) => {
  const [imageBase64, setImageBase64] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [imageFromURL, setImageFromURL] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    if (image) {
      if (is<string>(image)) {
        setImageBase64(image);
        setHasImage(true);
      } else {
        previewImage(image);
      }
    } else {
      setImageBase64("");
      setImageLink("");
      setImageFromURL(true);
      setDragOver(false);
      setLoading(false);
      setHasImage(false);
    }
  }, [image]);

  const previewImage = (image: Blob | File) => {
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
      setHasImage(true);
      setLoading(false);
    };
  };

  const handleChange = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) => {
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
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        setLoading(false);
        setImage(blob);
      })
      .catch((err) => {
        setLoading(false);
        queue.notify({ title: "Failed to fetch image: " + err });
      });
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (!imageFromURL) {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!imageFromURL) {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!imageFromURL) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    if (!imageFromURL) {
      e.preventDefault();
      e.stopPropagation();
      setLoading(true);
      const {
        dataTransfer: {
          files: [file],
        },
      } = e;
      if (!file.type.includes("image")) {
        queue.notify({ title: "Error: file is not an image." });
        setDragOver(false);
        setLoading(false);
      } else {
        setImage(file);
        setDragOver(false);
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const {
      target: { files },
    } = e;
    if (files) {
      const [file] = files;
      setImage(file);
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
      helpText={{
        persistent: false,
        validationMsg: true,
        children: "Must be valid link",
      }}
      icon="link"
      label="Image link"
      name="imageLink"
      onChange={handleChange}
      outlined
      pattern="https?://.+\.(?:jpg|jpeg|png)"
      value={imageLink}
    />
  ) : null;
  const areaInner = hasImage ? (
    <div
      className="image-display-image"
      style={{ backgroundImage: "url(" + imageBase64 + ")" }}
    />
  ) : loading ? null : desktop && !imageFromURL ? (
    <div className="drag-label">
      <Icon icon={iconObject(<AddPhotoAlternate />, { size: "medium" })} />
      <Typography className="caption" tag="p" use="body2">
        Drag image here
      </Typography>
    </div>
  ) : (
    <div className="drag-label">
      <Icon icon={iconObject(<AddPhotoAlternate />, { size: "medium" })} />
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
          <CardActionButton htmlFor="file-upload" label="Browse" tag="label" />
          <input
            accept=".png, .jpg, .jpeg"
            id="file-upload"
            onChange={handleFileChange}
            type="file"
          />
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
    <Card className="image-upload" outlined>
      <Typography className="image-upload-title" tag="h3" use="caption">
        Image*
      </Typography>
      <div className="image-upload-form">
        <div
          className={classNames("image-display", {
            over: dragOver,
            image: hasImage,
          })}
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
