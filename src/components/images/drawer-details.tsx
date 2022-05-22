import { useEffect, useState } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import {
  List,
  ListItem,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from "@rmwc/list";
import { Typography } from "@rmwc/typography";
import { DateTime } from "luxon";
import { notify } from "~/app/snackbar-queue";
import { withTooltip } from "@c/util/hocs";
import { useAppSelector } from "@h";
import useDevice from "@h/use-device";
import firebase from "@s/firebase";
import {
  selectCurrentFolder,
  selectImageById,
  useGetAllImagesQuery,
} from "@s/images";
import { formatBytes, objectKeys, ordinal } from "@s/util/functions";
import "./drawer-details.scss";

const storage = firebase.storage();

const storageRef = storage.ref();

type DrawerDetailsProps = {
  close: () => void;
  imageId: EntityId;
  open: boolean;
};

export const DrawerDetails = ({ close, imageId, open }: DrawerDetailsProps) => {
  const device = useDevice();

  const currentFolder = useAppSelector(selectCurrentFolder);

  const { image } = useGetAllImagesQuery(currentFolder, {
    selectFromResult: ({ data }) => ({
      image: data && selectImageById(data, imageId),
    }),
  });

  const [metadata, setMetadata] = useState<Record<string, any>>({});

  useEffect(() => {
    if (image) {
      setMetadata({});
      const getMetadata = async () => {
        try {
          const metadata = await storageRef.child(image.fullPath).getMetadata();
          setMetadata(metadata);
        } catch (error) {
          notify({ title: `Failed to get metadata: ${error}` });
          setMetadata({});
        }
      };
      getMetadata();
    } else {
      setMetadata({});
    }
  }, [image?.fullPath]);

  const dismissible = device === "desktop";
  const closeIcon =
    dismissible &&
    withTooltip(
      <IconButton className="close-icon" icon="close" onClick={close} />,
      "Close"
    );
  const imageProps = {
    fullPath: "Path",
    name: "File name",
  };
  const metadataLabels = {
    contentType: "Type",
    size: "File size",
    timeCreated: "Created",
    updated: "Updated",
  };
  return (
    <Drawer
      className="drawer-right details-drawer image-details"
      dismissible={dismissible}
      modal={!dismissible}
      onClose={close}
      open={open && !!image}
    >
      <DrawerHeader>
        <DrawerTitle>Details</DrawerTitle>
        {closeIcon}
      </DrawerHeader>
      <DrawerContent>
        {image && (
          <>
            <div className="image-container">
              <img alt={image.name} className="image" src={image.src} />
            </div>
            <List className="details-list" twoLine>
              <div className="subheader">
                <Typography use="caption">Image</Typography>
              </div>
              {objectKeys(imageProps).map((key) => (
                <ListItem key={key} disabled>
                  <ListItemText>
                    <ListItemPrimaryText>{imageProps[key]}</ListItemPrimaryText>
                    <ListItemSecondaryText>{image[key]}</ListItemSecondaryText>
                  </ListItemText>
                </ListItem>
              ))}
              {Object.keys(metadata).length && (
                <>
                  <div className="subheader">
                    <Typography use="caption">Metadata</Typography>
                  </div>
                  {objectKeys(metadataLabels).map((key) => (
                    <ListItem key={key} disabled>
                      <ListItemText>
                        <ListItemPrimaryText>
                          {metadataLabels[key]}
                        </ListItemPrimaryText>
                        <ListItemSecondaryText>
                          {key === "updated" || key === "timeCreated"
                            ? DateTime.fromISO(metadata[key], {
                                zone: "utc",
                              }).toFormat(
                                `d'${ordinal(
                                  DateTime.fromISO(metadata[key], {
                                    zone: "utc",
                                  }).day
                                )}' MMMM yyyy, HH:mm:ss`
                              )
                            : key === "size"
                            ? formatBytes(metadata[key])
                            : metadata[key]}
                        </ListItemSecondaryText>
                      </ListItemText>
                    </ListItem>
                  ))}
                </>
              )}
            </List>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerDetails;
