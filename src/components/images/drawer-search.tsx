import { useState } from "react";
import type { ChangeEvent } from "react";
import { Checkbox } from "@rmwc/checkbox";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import {
  List,
  ListItem,
  ListItemGraphic,
  ListItemMeta,
  ListItemPrimaryText,
  ListItemSecondaryText,
  ListItemText,
} from "@rmwc/list";
import { TextField } from "@rmwc/textfield";
import reactStringReplace from "react-string-replace";
import { useAppSelector } from "~/app/hooks";
import { withTooltip } from "@c/util/hocs";
import { selectDevice } from "@s/common";
import type { ImageType } from "@s/images/types";
import { iconObject } from "@s/util/functions";
import { Regex, RegexOff } from "@i";
import "./drawer-search.scss";

type DrawerSearchProps = {
  close: () => void;
  images: ImageType[];
  open: boolean;
  unusedImages: ImageType[];
};

export const DrawerSearch = ({ close, images, open, unusedImages }: DrawerSearchProps) => {
  const device = useAppSelector(selectDevice);
  const dismissible = device === "desktop";
  const closeIcon = dismissible
    ? withTooltip(<IconButton className="close-icon" icon="close" onClick={close} />, "Close")
    : null;

  const [search, setSearch] = useState("");
  const [regexSearch, setRegexSearch] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const toggleRegex = () => {
    setRegexSearch(!regexSearch);
  };

  const searchedImages = images.filter((image) => {
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
      open={open}
      onClose={close}
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
          trailingIcon={withTooltip(
            <IconButton
              checked={regexSearch}
              onClick={toggleRegex}
              onIcon={iconObject(<Regex />)}
              icon={iconObject(<RegexOff />)}
            />,
            (regexSearch ? "Disable" : "Enable") + " regex search"
          )}
        />
      </div>
      <DrawerContent>
        <List twoLine>
          {searchedImages.map((image) => (
            <ListItem disabled key={image.fullPath}>
              <ListItemGraphic className="image" style={{ backgroundImage: "url(" + image.src + ")" }} />
              {withTooltip(
                <ListItemText>
                  <ListItemPrimaryText>
                    {reactStringReplace(image.name, search, (match, i) => (
                      <span key={match + i} className="highlight">
                        {match}
                      </span>
                    ))}
                  </ListItemPrimaryText>
                  <ListItemSecondaryText>{image.fullPath}</ListItemSecondaryText>
                </ListItemText>,
                image.name
              )}
              <ListItemMeta>
                <Checkbox checked={!unusedImages.map(({ name }) => name).includes(image.name)} readOnly disabled />
              </ListItemMeta>
            </ListItem>
          ))}
        </List>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerSearch;
