import { useEffect, useState } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { CircularProgress } from "@rmwc/circular-progress";
import { Fab } from "@rmwc/fab";
import { LinearProgress } from "@rmwc/linear-progress";
import {
  TopAppBar,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import classNames from "classnames";
import { useParams } from "react-router-dom";
import { confirm } from "~/app/dialog-queue";
import { notify } from "~/app/snackbar-queue";
import { Footer } from "@c/common/footer";
import { ModalCreate, ModalEdit } from "@c/guides/admin/modal-entry";
import { AppBarIndent } from "@c/util/app-bar-indent";
import { withTooltip } from "@c/util/hocs";
import { useAppDispatch, useAppSelector } from "@h";
import useBottomNav from "@h/use-bottom-nav";
import useDelayedValue from "@h/use-delayed-value";
import useDevice from "@h/use-device";
import { pageTitle } from "@s/common/constants";
import firestore from "@s/firebase/firestore";
import type { GuideId } from "@s/firebase/types";
import {
  selectEntries,
  selectEntryById,
  selectEntryMap,
  selectLoading,
} from "@s/guides";
import { getEntries as getEntriesThunk } from "@s/guides/thunks";
import { replace } from "@s/router";
import { selectUser } from "@s/user";
import { closeModal, openModal } from "@s/util/functions";
import { selectFromState } from "@s/util/thunks";
import { EntriesList } from "./entries-list";
import { GuideEntry } from "./guide-entry";
import { ModalDetail } from "./modal-detail";
import emptyImg from "@m/empty.svg";
import "./index.scss";

type ContentGuidesProps = {
  openNav: () => void;
};

export const ContentGuides = ({ openNav }: ContentGuidesProps) => {
  const dispatch = useAppDispatch();

  const getEntries = () => dispatch(getEntriesThunk());

  const device = useDevice();

  const bottomNav = useBottomNav();

  const user = useAppSelector(selectUser);

  const loading = useAppSelector(selectLoading);
  const entries = useAppSelector(selectEntries);
  const entryMap = useAppSelector(selectEntryMap);

  const { id } = useParams<{ id?: string }>();
  const urlEntry = useDelayedValue(id && id in entryMap ? id : undefined, 300, {
    delayed: [undefined],
  });

  useEffect(() => {
    if (entries.length === 0) {
      getEntries();
    }
  }, []);

  const openDetail = (entry: EntityId) => {
    dispatch(replace(`/guides/${entry}`));
  };
  const closeDetail = () => {
    dispatch(replace("/guides"));
  };

  useEffect(() => {
    if (!urlEntry && device === "desktop") {
      openDetail("Di1F9XkWTG2M9qbP2ZcN");
    }
  }, [entries, urlEntry]);

  const [createOpen, setCreateOpen] = useState(false);
  const openCreate = () => {
    setCreateOpen(true);
    openModal();
  };
  const closeCreate = () => {
    setCreateOpen(false);
    closeModal();
  };

  const [editEntry, setEditEntry] = useState<EntityId>("");
  const [editOpen, setEditOpen] = useState(false);
  const openEdit = (entry: EntityId) => {
    const open = () => {
      setEditOpen(true);
      setEditEntry(entry);
      openModal();
    };
    if (urlEntry && device !== "desktop") {
      closeDetail();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const closeEdit = () => {
    setEditOpen(false);
    setTimeout(() => {
      setEditEntry("");
    }, 300);
    closeModal();
  };

  const openDelete = (id: EntityId) => {
    const entry = dispatch(
      selectFromState((state) => selectEntryById(state, id))
    );
    if (entry) {
      confirm({
        acceptLabel: "Delete",
        body: `Are you sure you want to delete the guide entry "${entry.title}"? This cannot be undone.`,
        className: "mdc-dialog--delete-confirm",
        onClose: async (e) => {
          switch (e.detail.action) {
            case "accept": {
              try {
                await firestore
                  .collection("guides")
                  .doc(id as GuideId)
                  .delete();
                notify({ title: "Successfully deleted entry." });
                getEntries();
              } catch (error) {
                console.log(`Failed to delete entry: ${error}`);
                notify({ title: `Failed to delete entry: ${error}` });
              }
            }
          }
        },
        title: `Delete "${entry.title}"`,
      });
    }
  };

  const refreshButton =
    (user.isAdmin || user.isEditor || user.isDesigner) &&
    (loading ? (
      <CircularProgress />
    ) : (
      withTooltip(
        <TopAppBarActionItem icon="refresh" onClick={() => getEntries()} />,
        "Refresh"
      )
    ));

  const buttons = <>{refreshButton}</>;

  const indent = user.isAdmin && bottomNav && <AppBarIndent />;

  const editorElements = user.isAdmin && (
    <>
      <Fab
        className={classNames("create-fab", { middle: bottomNav })}
        icon="add"
        label={device === "desktop" ? "Create" : undefined}
        onClick={openCreate}
      />
      <ModalCreate
        getEntries={getEntries}
        onClose={closeCreate}
        open={createOpen}
      />
      <ModalEdit
        entryId={editEntry}
        getEntries={getEntries}
        onClose={closeEdit}
        open={editOpen}
      />
    </>
  );

  const leftButtons = !indent ? (
    <TopAppBarTitle>{pageTitle.guides}</TopAppBarTitle>
  ) : (
    buttons
  );
  const rightButtons = !indent && (
    <TopAppBarSection alignEnd>{buttons}</TopAppBarSection>
  );

  const content =
    device === "desktop" ? (
      <div className="guides-container">
        <EntriesList detailEntry={urlEntry} openEntry={openDetail} />
        <div className="main drawer-margin">
          <div className="guide-container">
            {urlEntry ? (
              <GuideEntry
                delete={openDelete}
                edit={openEdit}
                entryId={urlEntry}
              />
            ) : (
              <div className="empty-container">
                <img alt="Empty" className="image" src={emptyImg} />
                <Typography className="title" tag="h3" use="headline6">
                  Nothing to see here
                </Typography>
                <Typography className="subtitle" tag="p" use="body1">
                  No guide selected.
                </Typography>
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    ) : (
      <div className="guides-container">
        <div className="main">
          <EntriesList detailEntry={urlEntry} openEntry={openDetail} />
          <ModalDetail
            delete={openDelete}
            edit={openEdit}
            entryId={urlEntry}
            onClose={closeDetail}
            open={!!id}
          />
          <Footer />
        </div>
      </div>
    );

  return (
    <>
      <TopAppBar
        className={classNames({
          "bottom-app-bar": bottomNav,
          "bottom-app-bar--indent": bottomNav && user.isAdmin,
        })}
        fixed
      >
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={openNav} />
            {leftButtons}
          </TopAppBarSection>
          {rightButtons}
          {indent}
        </TopAppBarRow>
        <LinearProgress closed={!loading} />
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        {content}
        {editorElements}
      </div>
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
