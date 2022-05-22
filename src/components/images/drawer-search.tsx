import { useState } from "react";
import type { ChangeEvent } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { List } from "@rmwc/list";
import { TextField } from "@rmwc/textfield";
import { SearchItem } from "@c/images/search-item";
import { withTooltip } from "@c/util/hocs";
import { useAppSelector } from "@h";
import useDebouncedValue from "@h/use-debounced-value";
import useDevice from "@h/use-device";
import {
  selectCurrentFolder,
  selectSearchedImages,
  useGetAllImagesQuery,
} from "@s/images";
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
  const device = useDevice();
  const dismissible = device === "desktop";
  const closeIcon =
    dismissible &&
    withTooltip(
      <IconButton className="close-icon" icon="close" onClick={close} />,
      "Close"
    );
  const [search, setSearch] = useState("");
  const [regexSearch, setRegexSearch] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearch(e.target.value);

  const toggleRegex = () => setRegexSearch((cur) => !cur);

  const currentFolder = useAppSelector(selectCurrentFolder);
  const { searchedImages = [] } = useGetAllImagesQuery(currentFolder, {
    selectFromResult: ({ data }) => ({
      searchedImages:
        data && selectSearchedImages(data, debouncedSearch, regexSearch),
    }),
  });

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
