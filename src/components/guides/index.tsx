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
import { confirm } from "~/app/dialog-queue";
import { history } from "~/app/history";
import { notify } from "~/app/snackbar-queue";
import { Footer } from "@c/common/footer";
import { ModalCreate, ModalEdit } from "@c/guides/admin/modal-entry";
import { AppBarIndent } from "@c/util/app-bar-indent";
import { withTooltip } from "@c/util/hocs";
import { useAppDispatch, useAppSelector } from "@h";
import useBottomNav from "@h/use-bottom-nav";
import useDevice from "@h/use-device";
import { pageTitle } from "@s/common/constants";
import firestore from "@s/firebase/firestore";
import type { GuideId } from "@s/firebase/types";
import {
  selectEntries,
  selectEntryById,
  selectEntryTotal,
  selectLoading,
  selectURLEntry,
  setURLEntry,
} from "@s/guides";
import { getEntries as getEntriesThunk } from "@s/guides/thunks";
import { selectUser } from "@s/user";
import { closeModal, createURL, openModal } from "@s/util/functions";
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
  const total = useAppSelector(selectEntryTotal);
  const entries = useAppSelector(selectEntries);
  const urlEntry = useAppSelector(selectURLEntry);

  useEffect(() => {
    if (total === 0) {
      getEntries();
    }
  }, []);

  const [detailEntry, setDetailEntry] = useState<EntityId>("");
  const [detailOpen, setDetailOpen] = useState(false);
  const openDetail = (entry: EntityId) => {
    setDetailEntry(entry);
    if (device !== "desktop") {
      setDetailOpen(true);
      openModal();
    }
    if (urlEntry) {
      dispatch(setURLEntry(""));
    }
    const params = new URLSearchParams(window.location.search);
    if (params.has("guideId")) {
      const newUrl = createURL(
        {},
        (params) => {
          params.delete("guideId");
        },
        true
      );
      history.push(newUrl);
    }
  };
  const closeDetail = () => {
    setDetailOpen(false);
    setTimeout(() => {
      setDetailEntry("");
    }, 300);
    closeModal();
  };

  useEffect(() => {
    if (urlEntry) {
      openDetail(urlEntry);
    } else if (device === "desktop") {
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
    if (detailOpen && device !== "desktop") {
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
        <EntriesList detailEntry={detailEntry} openEntry={openDetail} />
        <div className="main drawer-margin">
          <div className="guide-container">
            {detailEntry ? (
              <GuideEntry
                delete={openDelete}
                edit={openEdit}
                entryId={detailEntry}
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
          <EntriesList detailEntry={detailEntry} openEntry={openDetail} />
          <ModalDetail
            delete={openDelete}
            edit={openEdit}
            entryId={detailEntry}
            onClose={closeDetail}
            open={detailOpen}
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
