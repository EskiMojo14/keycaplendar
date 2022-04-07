import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { List } from "@rmwc/list";
import { TextField } from "@rmwc/textfield";
import { useAppSelector } from "~/app/hooks";
import { SearchItem } from "@c/images/search-item";
import { withTooltip } from "@c/util/hocs";
import { selectDevice } from "@s/common";
import { searchImages } from "@s/images/functions";
import { iconObject } from "@s/util/functions";
import { Regex, RegexOff } from "@i";
import "./drawer-search.scss";

type DrawerSearchProps = {
  close: () => void;
  open: boolean;
  unusedImages: EntityId[];
};

export const DrawerSearch = ({
  close,
  open,
  unusedImages,
}: DrawerSearchProps) => {
  const device = useAppSelector(selectDevice);
  const dismissible = device === "desktop";
  const closeIcon =
    dismissible &&
    withTooltip(
      <IconButton className="close-icon" icon="close" onClick={close} />,
      "Close"
    );
  const [search, setSearch] = useState("");
  const [regexSearch, setRegexSearch] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const toggleRegex = () => {
    setRegexSearch(!regexSearch);
  };

  const searchedImages = useMemo(
    () => searchImages(search, regexSearch),
    [search, regexSearch]
  );

  return (
    <Drawer
      className="drawer-right search-drawer"
      dismissible={dismissible}
      modal={!dismissible}
      onClose={close}
      open={open}
    >
      <DrawerHeader>
        <DrawerTitle>Search</DrawerTitle>
        {closeIcon}
      </DrawerHeader>
      <div className="search-bar__container">
        <TextField
          className="search-bar"
          label="Search"
          onChange={handleChange}
          outlined
          trailingIcon={withTooltip(
            <IconButton
              checked={regexSearch}
              icon={iconObject(<RegexOff />)}
              onClick={toggleRegex}
              onIcon={iconObject(<Regex />)}
            />,
            `${regexSearch ? "Disable" : "Enable"} regex search`
          )}
          value={search}
        />
      </div>
      <DrawerContent>
        <List twoLine>
          {searchedImages.map((image) => (
            <SearchItem
              key={image}
              checked={!unusedImages.includes(image)}
              imageId={image}
              search={search}
            />
          ))}
        </List>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerSearch;
