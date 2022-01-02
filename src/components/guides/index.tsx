import { useEffect, useState } from "react";
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
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { Footer } from "@c/common/footer";
import { DialogDelete } from "@c/guides/admin/dialog-delete";
import { ModalCreate, ModalEdit } from "@c/guides/admin/modal-entry";
import { AppBarIndent } from "@c/util/app-bar-indent";
import { withTooltip } from "@c/util/hocs";
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
import {
  selectEntries,
  selectLoading,
  selectURLEntry,
  setURLEntry,
} from "@s/guides";
import { Guide } from "@s/guides/constructors";
import { getEntries } from "@s/guides/functions";
import type { GuideEntryType } from "@s/guides/types";
import { selectBottomNav } from "@s/settings";
import { selectUser } from "@s/user";
import { closeModal, openModal } from "@s/util/functions";
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

  useEffect(() => {
    const id = urlEntry || "Di1F9XkWTG2M9qbP2ZcN";
    const index = entries.findIndex((entry) => entry.id === id);
    if (index >= 0 && device === "desktop") {
      const { [index]: entry } = entries;
      setDetailEntry(entry);
    }
  }, [entries]);

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
        withTooltip(
          <TopAppBarActionItem
            icon="refresh"
            onClick={() => {
              getEntries();
            }}
          />,
          "Refresh"
        )
      )
    ) : null;

  const buttons = <>{refreshButton}</>;

  const indent = user.isAdmin && bottomNav ? <AppBarIndent /> : null;

  const editorElements = user.isAdmin ? (
    <>
      <Fab
        className={classNames("create-fab", { middle: bottomNav })}
        icon="add"
        label={device === "desktop" ? "Create" : null}
        onClick={openCreate}
      />
      <ModalCreate
        getEntries={getEntries}
        onClose={closeCreate}
        open={createOpen}
      />
      <ModalEdit
        entry={editEntry}
        getEntries={getEntries}
        onClose={closeEdit}
        open={editOpen}
      />
      <DialogDelete
        entry={deleteEntry}
        getEntries={getEntries}
        onClose={closeDelete}
        open={deleteOpen}
      />
    </>
  ) : null;

  const leftButtons = !indent ? (
    <TopAppBarTitle>{pageTitle.guides}</TopAppBarTitle>
  ) : (
    buttons
  );
  const rightButtons = !indent ? (
    <TopAppBarSection alignEnd>{buttons}</TopAppBarSection>
  ) : null;

  const content =
    device === "desktop" ? (
      <div className="guides-container">
        <EntriesList detailEntry={detailEntry} openEntry={openDetail} />
        <div className="main drawer-margin">
          <div className="guide-container">
            {detailEntry.id ? (
              <GuideEntry
                delete={openDelete}
                edit={openEdit}
                entry={detailEntry}
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
            entry={detailEntry}
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
