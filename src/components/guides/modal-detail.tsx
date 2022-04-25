import type { EntityId } from "@reduxjs/toolkit";
import { Chip, ChipSet } from "@rmwc/chip";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import {
  TopAppBarActionItem,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { notify } from "~/app/snackbar-queue";
import { BoolWrapper, ConditionalWrapper } from "@c/util/conditional-wrapper";
import {
  FullScreenDialog,
  FullScreenDialogAppBar,
  FullScreenDialogContent,
} from "@c/util/full-screen-dialog";
import { withTooltip } from "@c/util/hocs";
import { CustomReactMarkdown } from "@c/util/react-markdown";
import { useAppDispatch, useAppSelector } from "@h";
import useDevice from "@h/use-device";
import { selectEntryById, selectFilteredTag, setFilteredTag } from "@s/guides";
import { formattedVisibility, visibilityIcons } from "@s/guides/constants";
import { createURL } from "@s/router/functions";
import { selectUser } from "@s/user";
import { iconObject } from "@s/util/functions";
import { Delete, Edit, Share } from "@i";
import "./modal-detail.scss";

type ModalCreateProps = {
  delete: (entry: EntityId) => void;
  edit: (entry: EntityId) => void;
  entryId: EntityId | undefined;
  onClose: () => void;
  open: boolean;
};

export const ModalDetail = ({
  delete: deleteFn,
  edit,
  entryId = "",
  onClose,
  open,
}: ModalCreateProps) => {
  const dispatch = useAppDispatch();

  const device = useDevice();

  const user = useAppSelector(selectUser);

  const entry = useAppSelector((state) => selectEntryById(state, entryId));

  const filteredTag = useAppSelector(selectFilteredTag);

  const useDrawer = device !== "mobile";

  const setFilter = (tag: string) =>
    dispatch(setFilteredTag(filteredTag === tag ? "" : tag));

  const copyLink = async () => {
    const url = createURL({ pathname: `/guides/${entryId}`, search: "" });
    try {
      await navigator.clipboard.writeText(url.href);
      notify({ title: "Copied URL to clipboard." });
    } catch (error) {
      notify({ title: `Error copying to clipboard: ${error}` });
    }
  };

  const actions =
    user.isAdmin &&
    (useDrawer ? (
      <>
        {withTooltip(
          <IconButton icon={iconObject(<Share />)} onClick={copyLink} />,
          "Share"
        )}
        {withTooltip(
          <IconButton
            icon={iconObject(<Edit />)}
            onClick={() => entryId && edit(entryId)}
          />,
          "Edit"
        )}
        {withTooltip(
          <IconButton
            icon={iconObject(<Delete />)}
            onClick={() => entryId && deleteFn(entryId)}
          />,
          "Delete"
        )}
      </>
    ) : (
      <>
        {withTooltip(
          <TopAppBarActionItem
            icon={iconObject(<Share />)}
            onClick={copyLink}
          />,
          "Share"
        )}
        {withTooltip(
          <TopAppBarActionItem
            icon={iconObject(<Edit />)}
            onClick={() => entryId && edit(entryId)}
          />,
          "Edit"
        )}
        {withTooltip(
          <TopAppBarActionItem
            icon={iconObject(<Delete />)}
            onClick={() => entryId && edit(entryId)}
          />,
          "Delete"
        )}
      </>
    ));

  return (
    <BoolWrapper
      condition={useDrawer}
      falseWrapper={(children) => (
        <FullScreenDialog
          className="guide-detail-modal"
          onClose={onClose}
          open={open}
        >
          {children}
        </FullScreenDialog>
      )}
      trueWrapper={(children) => (
        <Drawer
          className="drawer-right guide-detail-modal"
          modal
          onClose={onClose}
          open={open}
        >
          {children}
        </Drawer>
      )}
    >
      <BoolWrapper
        condition={useDrawer}
        falseWrapper={(children) => (
          <FullScreenDialogAppBar>
            <TopAppBarRow>{children}</TopAppBarRow>
          </FullScreenDialogAppBar>
        )}
        trueWrapper={(children) => <DrawerHeader>{children}</DrawerHeader>}
      >
        <BoolWrapper
          condition={useDrawer}
          falseWrapper={(children) => (
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={onClose} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
          trueWrapper={(children) => <DrawerTitle>{children}</DrawerTitle>}
        >
          Guide
        </BoolWrapper>
        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => (
            <TopAppBarSection alignEnd>{children}</TopAppBarSection>
          )}
        >
          {actions}
        </ConditionalWrapper>
      </BoolWrapper>
      <BoolWrapper
        condition={useDrawer}
        falseWrapper={(children) => (
          <FullScreenDialogContent>{children}</FullScreenDialogContent>
        )}
        trueWrapper={(children) => <DrawerContent>{children}</DrawerContent>}
      >
        {entry && (
          <>
            <div className="title">
              <Typography tag="h3" use="overline">
                {entry.name}
              </Typography>
              <Typography tag="h1" use="headline5">
                {entry.title}
              </Typography>
              <Typography tag="p" use="caption">
                {entry.description}
              </Typography>
              <div className="tags-container">
                <ChipSet>
                  <Chip
                    icon={visibilityIcons[entry.visibility]}
                    label={formattedVisibility[entry.visibility]}
                  />
                  {entry.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => {
                        setFilter(tag);
                      }}
                      selected={tag === filteredTag}
                    />
                  ))}
                </ChipSet>
              </div>
            </div>
            <div className="content">
              <CustomReactMarkdown>{entry.body}</CustomReactMarkdown>
            </div>
          </>
        )}
      </BoolWrapper>
    </BoolWrapper>
  );
};
