import React, { useContext } from "react";
import moment from "moment";
import { DeviceContext } from "../../util/contexts";
import { formatBytes } from "../../util/functions";
import { Drawer, DrawerHeader, DrawerContent, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { List, ListItem, ListItemText, ListItemPrimaryText, ListItemSecondaryText } from "@rmwc/list";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import "./DrawerDetails.scss";

export const DrawerDetails = (props) => {
  const device = useContext(DeviceContext);
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
          {Object.keys(imageProps).map((key) => (
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
          {Object.keys(metadata).map((key) => (
            <ListItem key={key} disabled>
              <ListItemText>
                <ListItemPrimaryText>{metadata[key]}</ListItemPrimaryText>
                <ListItemSecondaryText>
                  {key === "updated" || key === "timeCreated"
                    ? moment.utc(props.metadata[key]).format("Do MMMM YYYY, HH:mm:ss")
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
