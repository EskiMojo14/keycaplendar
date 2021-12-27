import { useEffect, useState } from "react";
import { Fab } from "@rmwc/fab";
import { LinearProgress } from "@rmwc/linear-progress";
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { Footer } from "@c/common/footer";
import { DialogDelete } from "@c/updates/admin/dialog-delete";
import { ModalCreate, ModalEdit } from "@c/updates/admin/modal-entry";
import { AppBarIndent } from "@c/util/app-bar-indent";
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
import { selectBottomNav } from "@s/settings";
import { selectEntries, selectLoading, selectURLEntry } from "@s/updates";
import { Update } from "@s/updates/constructors";
import { getEntries, pinEntry } from "@s/updates/functions";
import { UpdateEntryType } from "@s/updates/types";
import { selectUser } from "@s/user";
import { closeModal, openModal } from "@s/util/functions";
import { UpdateEntry } from "./update-entry";
import "./index.scss";

type ContentUpdatesProps = {
  openNav: () => void;
};

export const ContentUpdates = (props: ContentUpdatesProps) => {
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
    if (urlEntry) {
      const element = document.getElementById("update-entry-" + urlEntry);
      const topBar = document.querySelector<HTMLElement>(".mdc-top-app-bar");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView();
          if (topBar) {
            document.documentElement.scrollTop -= topBar.offsetHeight + 16;
          }
        }, 1000);
      }
    }
  }, [JSON.stringify(entries)]);

  const blankEntry: UpdateEntryType = new Update();
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
  const openEdit = (entry: UpdateEntryType) => {
    setEditOpen(true);
    setEditEntry(entry);
    openModal();
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
  const openDelete = (entry: UpdateEntryType) => {
    setDeleteOpen(true);
    setDeleteEntry(entry);
    openModal();
  };
  const closeDelete = () => {
    setDeleteOpen(false);
    setTimeout(() => {
      setDeleteEntry(blankEntry);
    }, 300);
    closeModal();
  };

  const indent = user.isAdmin && bottomNav ? <AppBarIndent /> : null;

  const editorElements = user.isAdmin ? (
    <>
      <Fab
        className={classNames("create-fab", { middle: bottomNav })}
        icon="add"
        label={device === "desktop" ? "Create" : null}
        onClick={openCreate}
      />
      <ModalCreate open={createOpen} onClose={closeCreate} getEntries={getEntries} />
      <ModalEdit open={editOpen} onClose={closeEdit} getEntries={getEntries} entry={editEntry} />
      <DialogDelete open={deleteOpen} onClose={closeDelete} entry={deleteEntry} getEntries={getEntries} />
    </>
  ) : null;
  return (
    <>
      <TopAppBar
        fixed
        className={classNames({
          "bottom-app-bar": bottomNav,
          "bottom-app-bar--indent": bottomNav && user.isAdmin,
        })}
      >
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>{pageTitle.updates}</TopAppBarTitle>
          </TopAppBarSection>
          {indent}
        </TopAppBarRow>
        <LinearProgress closed={!loading} />
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div className="main extended-app-bar">
          <div className="update-container">
            {entries.map((entry) => (
              <UpdateEntry key={entry.id} entry={entry} edit={openEdit} delete={openDelete} pin={pinEntry} />
            ))}
          </div>
        </div>
        {editorElements}
      </div>
      <Footer />
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
