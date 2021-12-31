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
import { useAppSelector } from "~/app/hooks";
import { withTooltip } from "@c/util/hocs";
import { selectDevice } from "@s/common";
import type { ImageType } from "@s/images/types";
import { formatBytes, objectKeys, ordinal } from "@s/util/functions";
import "./drawer-details.scss";

type DrawerDetailsProps = {
  close: () => void;
  image: ImageType;
  metadata: Record<string, any>;
  open: boolean;
};

export const DrawerDetails = ({
  close,
  image,
  metadata,
  open,
}: DrawerDetailsProps) => {
  const device = useAppSelector(selectDevice);
  const dismissible = device === "desktop";
  const closeIcon = dismissible
    ? withTooltip(
        <IconButton className="close-icon" icon="close" onClick={close} />,
        "Close"
      )
    : null;
  const imageProps = {
    name: "File name",
    fullPath: "Path",
  };
  const metadataLabels = {
    size: "File size",
    contentType: "Type",
    timeCreated: "Created",
    updated: "Updated",
  };
  return (
    <Drawer
      className="drawer-right details-drawer image-details"
      dismissible={dismissible}
      modal={!dismissible}
      onClose={close}
      open={open}
    >
      <DrawerHeader>
        <DrawerTitle>Details</DrawerTitle>
        {closeIcon}
      </DrawerHeader>
      <DrawerContent>
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
          <div className="subheader">
            <Typography use="caption">Metadata</Typography>
          </div>
          {objectKeys(metadataLabels).map((key) => (
            <ListItem key={key} disabled>
              <ListItemText>
                <ListItemPrimaryText>{metadataLabels[key]}</ListItemPrimaryText>
                <ListItemSecondaryText>
                  {key === "updated" || key === "timeCreated"
                    ? DateTime.fromISO(metadata[key], { zone: "utc" }).toFormat(
                        `d'${ordinal(
                          DateTime.fromISO(metadata[key], { zone: "utc" }).day
                        )}' MMMM yyyy, HH:mm:ss`
                      )
                    : key === "size"
                    ? formatBytes(metadata[key])
                    : metadata[key]}
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
