import React, { useContext, useState } from "react";
import reactStringReplace from "react-string-replace";
import { DeviceContext } from "../../util/contexts";
import { iconObject } from "../../util/functions";
import { ImageType } from "../../util/types";
import { Checkbox } from "@rmwc/checkbox";
import { Drawer, DrawerHeader, DrawerContent, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import {
  List,
  ListItem,
  ListItemText,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemGraphic,
  ListItemMeta,
} from "@rmwc/list";
import { TextField } from "@rmwc/textfield";
import { Tooltip } from "@rmwc/tooltip";
import "./DrawerSearch.scss";

type DrawerSearchProps = {
  close: () => void;
  images: ImageType[];
  open: boolean;
  unusedImages: ImageType[];
};

export const DrawerSearch = (props: DrawerSearchProps) => {
  const device = useContext(DeviceContext);
  const dismissible = device === "desktop";
  const closeIcon = dismissible ? (
    <Tooltip enterDelay={500} content="Close" align="bottom">
      <IconButton className="close-icon" icon="close" onClick={props.close} />
    </Tooltip>
  ) : null;

  const [search, setSearch] = useState("");
  const [regexSearch, setRegexSearch] = useState(false);

  const handleChange = (e: any) => {
    setSearch(e.target.value);
  };

  const toggleRegex = () => {
    setRegexSearch(!regexSearch);
  };

  const searchedImages = props.images.filter((image) => {
    if (regexSearch) {
      const regex = new RegExp(search);
      return regex.test(image.name) && search.length > 1;
    } else {
      return image.name.toLowerCase().includes(search.toLowerCase()) && search.length > 1;
    }
  });
  return (
    <Drawer
      dismissible={dismissible}
      modal={!dismissible}
      className="drawer-right search-drawer"
      open={props.open}
      onClose={props.close}
    >
      <DrawerHeader>
        <DrawerTitle>Search</DrawerTitle>
        {closeIcon}
      </DrawerHeader>
      <div className="search-bar__container">
        <TextField
          outlined
          className="search-bar"
          label="Search"
          value={search}
          onChange={handleChange}
          trailingIcon={
            <IconButton
              checked={regexSearch}
              onClick={toggleRegex}
              onIcon={iconObject(
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <rect fill="none" width="24" height="24" />
                  <path d="M16,16.92C15.67,16.97 15.34,17 15,17C14.66,17 14.33,16.97 14,16.92V13.41L11.5,15.89C11,15.5 10.5,15 10.11,14.5L12.59,12H9.08C9.03,11.67 9,11.34 9,11C9,10.66 9.03,10.33 9.08,10H12.59L10.11,7.5C10.3,7.25 10.5,7 10.76,6.76V6.76C11,6.5 11.25,6.3 11.5,6.11L14,8.59V5.08C14.33,5.03 14.66,5 15,5C15.34,5 15.67,5.03 16,5.08V8.59L18.5,6.11C19,6.5 19.5,7 19.89,7.5L17.41,10H20.92C20.97,10.33 21,10.66 21,11C21,11.34 20.97,11.67 20.92,12H17.41L19.89,14.5C19.7,14.75 19.5,15 19.24,15.24V15.24C19,15.5 18.75,15.7 18.5,15.89L16,13.41V16.92H16V16.92M5,19A2,2 0 0,1 7,17A2,2 0 0,1 9,19A2,2 0 0,1 7,21A2,2 0 0,1 5,19H5Z" />
                </svg>
              )}
              icon={iconObject(
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  width="24px"
                  height="24px"
                  viewBox="0 0 24 24"
                >
                  <rect fill="none" width="24" height="24" />
                  <path
                    d="M20.92,12h-3.51l2.48,2.5c-0.19,0.25-0.39,0.5-0.65,0.74C19,15.5,18.75,15.7,18.5,15.89L16,13.41v0.06L12.54,10h0.05
	l-2.48-2.5C10.3,7.25,10.5,7,10.76,6.76C11,6.5,11.25,6.3,11.5,6.11L14,8.59V5.08C14.33,5.03,14.66,5,15,5s0.67,0.03,1,0.08v3.51
	l2.5-2.48C19,6.5,19.5,7,19.89,7.5L17.41,10h3.51c0.05,0.33,0.08,0.66,0.08,1S20.97,11.67,20.92,12z M16,16.01l-2-2v0l-0.3-0.3l0,0
	l-1.41-1.41l0,0l-0.3-0.3h0l-1.74-1.74L4.14,4.14L2.86,5.41l6.19,6.19c0.01,0.13,0.01,0.27,0.03,0.4h0.37l1.58,1.58l-0.91,0.92
	c0.39,0.5,0.89,1,1.39,1.39l0.92-0.91L14,16.56v0.36c0.13,0.02,0.26,0.02,0.39,0.03l4.19,4.19l1.27-1.27L16,16.01L16,16.01z M7,17
	c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S8.1,17,7,17z"
                  />
                </svg>
              )}
            />
          }
        />
      </div>
      <DrawerContent>
        <List twoLine>
          {searchedImages.map((image) => (
            <ListItem disabled key={image.fullPath}>
              <ListItemGraphic className="image" style={{ backgroundImage: "url(" + image.src + ")" }} />
              <Tooltip content={image.name} enterDelay={500} align="top">
                <ListItemText>
                  <ListItemPrimaryText>
                    {reactStringReplace(image.name, search, (match, i) => (
                      <span key={match + i} className="highlight">
                        {match}
                      </span>
                    ))}
                  </ListItemPrimaryText>
                  <ListItemSecondaryText>{image.fullPath}</ListItemSecondaryText>
                </ListItemText>
              </Tooltip>
              <ListItemMeta>
                <Checkbox
                  checked={!props.unusedImages.map((image) => image.name).includes(image.name)}
                  readOnly
                  disabled
                />
              </ListItemMeta>
            </ListItem>
          ))}
        </List>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerSearch;
