import React from "react";
import { DateTime } from "luxon";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common/commonSlice";
import { formatBytes, objectKeys, ordinal } from "@s/common/functions";
import { ImageType } from "@s/images/types";
import { Drawer, DrawerHeader, DrawerContent, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { List, ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText } from "@rmwc/list";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import "./DrawerDetails.scss";

type DrawerDetailsProps = {
  close: () => void;
  image: ImageType;
  metadata: { [key: string]: any };
  open: boolean;
};

export const DrawerDetails = (props: DrawerDetailsProps) => {
  const device = useAppSelector(selectDevice);
  const dismissible = device === "desktop";
  const closeIcon = dismissible ? (
    <Tooltip enterDelay={500} content="Close" align="bottom">
      <IconButton className="close-icon" icon="close" onClick={props.close} />
    </Tooltip>
  ) : null;
  const imageProps = {
    name: "File name",
    fullPath: "Path",
  };
  const metadata = {
    size: "File size",
    contentType: "Type",
    timeCreated: "Created",
    updated: "Updated",
  };
  return (
    <Drawer
      dismissible={dismissible}
      modal={!dismissible}
      className="drawer-right details-drawer image-details"
      open={props.open}
      onClose={props.close}
    >
      <DrawerHeader>
        <DrawerTitle>Details</DrawerTitle>
        {closeIcon}
      </DrawerHeader>
      <DrawerContent>
        <div className="image-container">
          <img className="image" src={props.image.src} alt={props.image.name} />
        </div>
        <List twoLine className="details-list">
          <div className="subheader">
            <Typography use="caption">Image</Typography>
          </div>
          {objectKeys(imageProps).map((key) => (
            <ListItem key={key} disabled>
              <ListItemText>
                <ListItemPrimaryText>{imageProps[key]}</ListItemPrimaryText>
                <ListItemSecondaryText>{props.image[key]}</ListItemSecondaryText>
              </ListItemText>
            </ListItem>
          ))}
          <div className="subheader">
            <Typography use="caption">Metadata</Typography>
          </div>
          {objectKeys(metadata).map((key) => (
            <ListItem key={key} disabled>
              <ListItemText>
                <ListItemPrimaryText>{metadata[key]}</ListItemPrimaryText>
                <ListItemSecondaryText>
                  {key === "updated" || key === "timeCreated"
                    ? DateTime.fromISO(props.metadata[key], { zone: "utc" }).toFormat(
                        `d'${ordinal(DateTime.fromISO(props.metadata[key], { zone: "utc" }).day)}' MMMM yyyy, HH:mm:ss`
                      )
                    : key === "size"
                    ? formatBytes(props.metadata[key])
                    : props.metadata[key]}
                </ListItemSecondaryText>
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerDetails;
