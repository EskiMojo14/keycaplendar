import React, { useContext, useState } from "react";
import reactStringReplace from "react-string-replace";
import { DeviceContext } from "../../util/contexts";
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

export const DrawerSearch = (props) => {
  const device = useContext(DeviceContext);
  const dismissible = device === "desktop";
  const closeIcon = dismissible ? (
    <Tooltip enterDelay={500} content="Close" align="bottom">
      <IconButton className="close-icon" icon="close" onClick={props.close} />
    </Tooltip>
  ) : null;

  const [search, setSearch] = useState("");

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const searchedImages = props.images.filter((image) => image.name.toLowerCase().includes(search) && search.length > 1);
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
        <TextField outlined className="search-bar" label="Search" value={search} onChange={handleChange} />
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
