import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common/commonSlice";
import { pageTitle } from "@s/common/constants";
import { closeModal, openModal } from "@s/common/functions";
import { selectEntries, selectLoading, selectURLEntry, setURLEntry } from "@s/guides/guidesSlice";
import { Guide } from "@s/guides/constructors";
import { getEntries } from "@s/guides/functions";
import { GuideEntryType } from "@s/guides/types";
import { selectBottomNav } from "@s/settings/settingsSlice";
import { selectUser } from "@s/user/userSlice";
import { CircularProgress } from "@rmwc/circular-progress";
import { Fab } from "@rmwc/fab";
import { LinearProgress } from "@rmwc/linear-progress";
import { Tooltip } from "@rmwc/tooltip";
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
import { Footer } from "@c/common/Footer";
import { GuideEntry } from "@c/guides/GuideEntry";
import { EntriesList } from "@c/guides/EntriesList";
import { ModalDetail } from "@c/guides/ModalDetail";
import { ModalCreate, ModalEdit } from "@c/guides/admin/ModalEntry";
import { DialogDelete } from "@c/guides/admin/DialogDelete";
import emptyImg from "@m/empty.svg";
import "./ContentGuides.scss";

type ContentGuidesProps = {
  openNav: () => void;
};

export const ContentGuides = (props: ContentGuidesProps) => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);

  const bottomNav = useAppSelector(selectBottomNav);

  const user = useAppSelector(selectUser);

  const loading = useAppSelector(selectLoading);
  const entries = useAppSelector(selectEntries);
  const urlEntry = useAppSelector(selectURLEntry);

  useEffect(() => {
    if (entries.length === 0) {
      getEntries();
    }
  }, []);

  useEffect(() => {
    const id = urlEntry ? urlEntry : "Di1F9XkWTG2M9qbP2ZcN";
    const index = entries.findIndex((entry) => entry.id === id);
    if (index >= 0 && device === "desktop") {
      const entry = entries[index];
      setDetailEntry(entry);
    }
  }, [entries]);

  const blankEntry: GuideEntryType = new Guide();

  const [detailEntry, setDetailEntry] = useState(blankEntry);
  const [detailOpen, setDetailOpen] = useState(false);
  const openDetail = (entry: GuideEntryType) => {
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
      params.delete("guideId");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  };
  const closeDetail = () => {
    setDetailOpen(false);
    setTimeout(() => {
      setDetailEntry(blankEntry);
    }, 300);
    closeModal();
  };

  const [createOpen, setCreateOpen] = useState(false);
  const openCreate = () => {
    setCreateOpen(true);
    openModal();
  };
  const closeCreate = () => {
    setCreateOpen(false);
    closeModal();
  };

  const [editEntry, setEditEntry] = useState(blankEntry);
  const [editOpen, setEditOpen] = useState(false);
  const openEdit = (entry: GuideEntryType) => {
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
      setEditEntry(blankEntry);
    }, 300);
    closeModal();
  };

  const [deleteEntry, setDeleteEntry] = useState(blankEntry);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const openDelete = (entry: GuideEntryType) => {
    const open = () => {
      setDeleteOpen(true);
      setDeleteEntry(entry);
      openModal();
    };
    if (detailOpen && device !== "desktop") {
      closeDetail();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const closeDelete = () => {
    setDeleteOpen(false);
    setTimeout(() => {
      setDeleteEntry(blankEntry);
    }, 300);
    closeModal();
  };

  const refreshButton =
    user.isAdmin || user.isEditor || user.isDesigner ? (
      loading ? (
        <CircularProgress />
      ) : (
        <Tooltip enterDelay={500} content="Refresh" align="bottom">
          <TopAppBarActionItem
            icon="refresh"
            onClick={() => {
              getEntries();
            }}
          />
        </Tooltip>
      )
    ) : null;

  const buttons = <>{refreshButton}</>;

  const indent =
    user.isAdmin && bottomNav ? (
      <TopAppBarSection className="indent" alignEnd>
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="56" viewBox="0 0 128 56">
          <path
            d="M107.3,0a8.042,8.042,0,0,0-7.9,6.6A36.067,36.067,0,0,1,64,36,36.067,36.067,0,0,1,28.6,6.6,8.042,8.042,0,0,0,20.7,0H0V56H128V0Z"
            fill="inherit"
          />
        </svg>
        <div className="fill"></div>
      </TopAppBarSection>
    ) : null;

  const editorElements = user.isAdmin ? (
    <>
      <Fab
        className={classNames("create-fab", { middle: bottomNav })}
        icon="add"
        label={device === "desktop" ? "Create" : null}
        onClick={openCreate}
      />
      <ModalCreate open={createOpen} onClose={closeCreate} getEntries={getEntries} />
      <ModalEdit open={editOpen} onClose={closeEdit} entry={editEntry} getEntries={getEntries} />
      <DialogDelete open={deleteOpen} onClose={closeDelete} entry={deleteEntry} getEntries={getEntries} />
    </>
  ) : null;

  const leftButtons = !indent ? <TopAppBarTitle>{pageTitle.guides}</TopAppBarTitle> : buttons;
  const rightButtons = !indent ? <TopAppBarSection alignEnd>{buttons}</TopAppBarSection> : null;

  const content =
    device === "desktop" ? (
      <div className="guides-container">
        <EntriesList openEntry={openDetail} detailEntry={detailEntry} />
        <div className="main drawer-margin">
          <div className="guide-container">
            {detailEntry.id ? (
              <GuideEntry entry={detailEntry} edit={openEdit} delete={openDelete} />
            ) : (
              <div className="empty-container">
                <img className="image" src={emptyImg} alt="Empty" />
                <Typography className="title" use="headline6" tag="h3">
                  Nothing to see here
                </Typography>
                <Typography className="subtitle" use="body1" tag="p">
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
          <EntriesList openEntry={openDetail} detailEntry={detailEntry} />
          <ModalDetail
            open={detailOpen}
            onClose={closeDetail}
            entry={detailEntry}
            edit={openEdit}
            delete={openDelete}
          />
          <Footer />
        </div>
      </div>
    );

  return (
    <>
      <TopAppBar
        fixed
        className={classNames({ "bottom-app-bar": bottomNav, "bottom-app-bar--indent": bottomNav && user.isAdmin })}
      >
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
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
