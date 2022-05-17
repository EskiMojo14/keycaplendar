import { useState } from "react";
import { LinearProgress } from "@rmwc/linear-progress";
import { Menu, MenuItem, MenuSurfaceAnchor } from "@rmwc/menu";
import {
  TopAppBar,
  TopAppBarActionItem,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import classNames from "classnames";
import { withTooltip } from "@c/util/hocs";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import { useAppDispatch, useAppSelector } from "@h";
import useBoolStates from "@h/use-bool-states";
import useBottomNav from "@h/use-bottom-nav";
import useDevice from "@h/use-device";
import {
  selectCurrentFolder,
  selectLoading,
  useGetStorageFoldersQuery,
} from "@s/images";
import { setFolder } from "@s/images/thunks";
import { pageTitle } from "@s/router/constants";
import { iconObject } from "@s/util/functions";
import { Delete, PermMedia } from "@i";

export type ImageAppBarProps = {
  checkedImages: number;
  clearChecked: () => void;
  openDelete: () => void;
  openNav: () => void;
  openSearch: () => void;
};

export const ImageAppBar = ({
  checkedImages,
  clearChecked,
  openDelete,
  openNav,
  openSearch,
}: ImageAppBarProps) => {
  const dispatch = useAppDispatch();

  const device = useDevice();

  const bottomNav = useBottomNav();
  const loading = useAppSelector(selectLoading);

  const currentFolder = useAppSelector(selectCurrentFolder);

  const { folders = [] } = useGetStorageFoldersQuery(undefined, {
    selectFromResult: ({ data }) => ({ folders: data }),
  });

  const [folderMenuOpen, setFolderMenuOpen] = useState(false);
  const [closeFolderMenu, openFolderMenu] = useBoolStates(
    setFolderMenuOpen,
    "setFolderMenuOpen"
  );
  const contextual = !!checkedImages;
  const tooltipAlign = bottomNav ? "top" : "bottom";
  return (
    <TopAppBar
      className={classNames("is-contextual", {
        "bottom-app-bar": bottomNav,
        contextual,
      })}
      fixed
    >
      <TopAppBarRow>
        <TopAppBarSection alignStart>
          {contextual ? (
            withTooltip(
              <TopAppBarActionItem icon="close" onClick={clearChecked} />,
              "Close",
              { align: tooltipAlign }
            )
          ) : (
            <TopAppBarNavigationIcon icon="menu" onClick={openNav} />
          )}
          <TopAppBarTitle>
            {contextual ? `${checkedImages} selected` : pageTitle.images}
          </TopAppBarTitle>
        </TopAppBarSection>
        <TopAppBarSection alignEnd>
          {contextual ? (
            <>
              {withTooltip(
                <TopAppBarActionItem
                  icon={iconObject(<Delete />)}
                  onClick={openDelete}
                />,
                "Delete",
                {
                  align: tooltipAlign,
                }
              )}
            </>
          ) : (
            <>
              {withTooltip(
                <TopAppBarActionItem icon="search" onClick={openSearch} />,
                "Search",
                {
                  align: tooltipAlign,
                }
              )}
              {device === "mobile" ? (
                <MenuSurfaceAnchor>
                  {withTooltip(
                    <TopAppBarActionItem
                      icon={iconObject(<PermMedia />)}
                      onClick={openFolderMenu}
                    />,
                    "Folder",
                    { align: tooltipAlign }
                  )}
                  <Menu
                    anchorCorner="bottomLeft"
                    className="folder-menu"
                    onClose={closeFolderMenu}
                    open={folderMenuOpen}
                  >
                    {folders.map((folder) => (
                      <MenuItem
                        key={folder}
                        onClick={() => dispatch(setFolder(folder))}
                        selected={currentFolder === folder}
                      >
                        {`${folder}/`}
                      </MenuItem>
                    ))}
                  </Menu>
                </MenuSurfaceAnchor>
              ) : (
                <SegmentedButton toggle>
                  {folders.map((folder) => (
                    <SegmentedButtonSegment
                      key={folder}
                      label={folder}
                      onClick={() => dispatch(setFolder(folder))}
                      selected={currentFolder === folder}
                    />
                  ))}
                </SegmentedButton>
              )}
            </>
          )}
        </TopAppBarSection>
      </TopAppBarRow>
      <LinearProgress closed={!loading} />
    </TopAppBar>
  );
};

export default ImageAppBar;
