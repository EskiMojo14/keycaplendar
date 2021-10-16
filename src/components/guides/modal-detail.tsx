import { queue } from "~/app/snackbar-queue";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { selectFilteredTag, setFilteredTag } from "@s/guides";
import { formattedVisibility, visibilityIcons } from "@s/guides/constants";
import { GuideEntryType } from "@s/guides/types";
import { selectUser } from "@s/user";
import { iconObject } from "@s/util/functions";
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
import { ConditionalWrapper, BoolWrapper } from "@c/util/conditional-wrapper";
import { FullScreenDialog, FullScreenDialogAppBar, FullScreenDialogContent } from "@c/util/full-screen-dialog";
import { CustomReactMarkdown } from "@c/util/react-markdown";
import { withTooltip } from "@c/util/hocs";
import { Delete, Edit, Share } from "@i";
import "./modal-detail.scss";

type ModalCreateProps = {
  open: boolean;
  onClose: () => void;
  edit: (entry: GuideEntryType) => void;
  delete: (entry: GuideEntryType) => void;
  entry: GuideEntryType;
};

export const ModalDetail = (props: ModalCreateProps) => {
  const { entry } = props;

  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);

  const user = useAppSelector(selectUser);

  const filteredTag = useAppSelector(selectFilteredTag);

  const useDrawer = device !== "mobile";

  const setFilter = (tag: string) => {
    if (filteredTag === tag) {
      dispatch(setFilteredTag(""));
    } else {
      dispatch(setFilteredTag(tag));
    }
    props.onClose();
  };

  const copyLink = () => {
    const arr = window.location.href.split("/");
    const url = arr[0] + "//" + arr[2] + "/guides?guideId=" + entry.id;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        queue.notify({ title: "Copied URL to clipboard." });
      })
      .catch((error) => {
        queue.notify({ title: "Error copying to clipboard" + error });
      });
  };

  const actions = user.isAdmin ? (
    useDrawer ? (
      <>
        {withTooltip(<IconButton icon={iconObject(<Share />)} onClick={copyLink} />, "Share")}
        {withTooltip(
          <IconButton
            icon={iconObject(<Edit />)}
            onClick={() => {
              props.edit(entry);
            }}
          />,
          "Edit"
        )}
        {withTooltip(
          <IconButton
            icon={iconObject(<Delete />)}
            onClick={() => {
              props.delete(entry);
            }}
          />,
          "Delete"
        )}
      </>
    ) : (
      <>
        {withTooltip(<TopAppBarActionItem icon={iconObject(<Share />)} onClick={copyLink} />, "Share")}
        {withTooltip(
          <TopAppBarActionItem
            icon={iconObject(<Edit />)}
            onClick={() => {
              props.edit(entry);
            }}
          />,
          "Edit"
        )}
        {withTooltip(
          <TopAppBarActionItem
            icon={iconObject(<Delete />)}
            onClick={() => {
              props.edit(entry);
            }}
          />,
          "Delete"
        )}
      </>
    )
  ) : null;

  return (
    <BoolWrapper
      condition={useDrawer}
      trueWrapper={(children) => (
        <Drawer modal open={props.open} onClose={props.onClose} className="drawer-right guide-detail-modal">
          {children}
        </Drawer>
      )}
      falseWrapper={(children) => (
        <FullScreenDialog open={props.open} onClose={props.onClose} className="guide-detail-modal">
          {children}
        </FullScreenDialog>
      )}
    >
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerHeader>{children}</DrawerHeader>}
        falseWrapper={(children) => (
          <FullScreenDialogAppBar>
            <TopAppBarRow>{children}</TopAppBarRow>
          </FullScreenDialogAppBar>
        )}
      >
        <BoolWrapper
          condition={useDrawer}
          trueWrapper={(children) => <DrawerTitle>{children}</DrawerTitle>}
          falseWrapper={(children) => (
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="close" onClick={props.onClose} />
              <TopAppBarTitle>{children}</TopAppBarTitle>
            </TopAppBarSection>
          )}
        >
          Guide
        </BoolWrapper>
        <ConditionalWrapper
          condition={!useDrawer}
          wrapper={(children) => <TopAppBarSection alignEnd>{children}</TopAppBarSection>}
        >
          {actions}
        </ConditionalWrapper>
      </BoolWrapper>
      <BoolWrapper
        condition={useDrawer}
        trueWrapper={(children) => <DrawerContent>{children}</DrawerContent>}
        falseWrapper={(children) => <FullScreenDialogContent>{children}</FullScreenDialogContent>}
      >
        <div className="title">
          <Typography use="overline" tag="h3">
            {entry.name}
          </Typography>
          <Typography use="headline5" tag="h1">
            {entry.title}
          </Typography>
          <Typography use="caption" tag="p">
            {entry.description}
          </Typography>
          <div className="tags-container">
            <ChipSet>
              <Chip icon={visibilityIcons[entry.visibility]} label={formattedVisibility[entry.visibility]} />
              {entry.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={tag === filteredTag}
                  onClick={() => {
                    setFilter(tag);
                  }}
                />
              ))}
            </ChipSet>
          </div>
        </div>
        <div className="content">
          <CustomReactMarkdown>{entry.body}</CustomReactMarkdown>
        </div>
      </BoolWrapper>
    </BoolWrapper>
  );
};
