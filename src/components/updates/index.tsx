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
import { blankUpdate } from "@s/updates/constants";
import { getEntries, pinEntry } from "@s/updates/functions";
import type { UpdateEntryType } from "@s/updates/types";
import { selectUser } from "@s/user";
import { closeModal, openModal } from "@s/util/functions";
import { UpdateEntry } from "./update-entry";
import "./index.scss";

type ContentUpdatesProps = {
  openNav: () => void;
};

export const ContentUpdates = ({ openNav }: ContentUpdatesProps) => {
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
      const element = document.getElementById(`update-entry-${urlEntry}`);
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
  const [createOpen, setCreateOpen] = useState(false);
  const openCreate = () => {
    setCreateOpen(true);
    openModal();
  };
  const closeCreate = () => {
    setCreateOpen(false);
    closeModal();
  };

  const [editEntry, setEditEntry] = useState(blankUpdate);
  const [editOpen, setEditOpen] = useState(false);
  const openEdit = (entry: UpdateEntryType) => {
    setEditOpen(true);
    setEditEntry(entry);
    openModal();
  };
  const closeEdit = () => {
    setEditOpen(false);
    setTimeout(() => {
      setEditEntry(blankUpdate);
    }, 300);
    closeModal();
  };

  const [deleteEntry, setDeleteEntry] = useState(blankUpdate);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const openDelete = (entry: UpdateEntryType) => {
    setDeleteOpen(true);
    setDeleteEntry(entry);
    openModal();
  };
  const closeDelete = () => {
    setDeleteOpen(false);
    setTimeout(() => {
      setDeleteEntry(blankUpdate);
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
              <UpdateEntry
                key={entry.id}
                delete={openDelete}
                edit={openEdit}
                entry={entry}
                pin={pinEntry}
              />
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
