import { useEffect, useState } from "react";
import type { EntityId } from "@reduxjs/toolkit";
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
import { useLocation } from "react-router-dom";
import { Footer } from "@c/common/footer";
import { DialogDelete } from "@c/updates/admin/dialog-delete";
import { ModalCreate, ModalEdit } from "@c/updates/admin/modal-entry";
import { AppBarIndent } from "@c/util/app-bar-indent";
import { useAppDispatch, useAppSelector } from "@h";
import useBottomNav from "@h/use-bottom-nav";
import useDevice from "@h/use-device";
import { pageTitle } from "@s/common/constants";
import { selectEntryIds, selectEntryMap, selectLoading } from "@s/updates";
import { getEntries as getEntriesThunk } from "@s/updates/thunks";
import { selectUser } from "@s/user";
import { closeModal, openModal } from "@s/util/functions";
import { UpdateEntry } from "./update-entry";
import "./index.scss";

type ContentUpdatesProps = {
  openNav: () => void;
};

export const ContentUpdates = ({ openNav }: ContentUpdatesProps) => {
  const dispatch = useAppDispatch();

  const getEntries = () => dispatch(getEntriesThunk());

  const device = useDevice();

  const bottomNav = useBottomNav();

  const user = useAppSelector(selectUser);

  const loading = useAppSelector(selectLoading);
  const entries = useAppSelector(selectEntryIds);
  const entryMap = useAppSelector(selectEntryMap);

  const { hash } = useLocation();
  const urlEntry = hash.substring(1) in entryMap ? hash.substring(1) : "";

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
        const top =
          element.getBoundingClientRect().top +
          window.pageYOffset -
          ((topBar?.offsetHeight ?? 0) + 16);
        setTimeout(() => {
          window.scrollTo({ behavior: "smooth", top });
        }, 1000);
      }
    }
  }, [entryMap, urlEntry]);

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
    setEditOpen(true);
    setEditEntry(entry);
    openModal();
  };
  const closeEdit = () => {
    setEditOpen(false);
    setTimeout(() => {
      setEditEntry("");
    }, 300);
    closeModal();
  };

  const [deleteEntry, setDeleteEntry] = useState<EntityId>("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const openDelete = (entry: EntityId) => {
    setDeleteOpen(true);
    setDeleteEntry(entry);
    openModal();
  };
  const closeDelete = () => {
    setDeleteOpen(false);
    setTimeout(() => {
      setDeleteEntry("");
    }, 300);
    closeModal();
  };

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
      <DialogDelete
        entryId={deleteEntry}
        getEntries={getEntries}
        onClose={closeDelete}
        open={deleteOpen}
      />
    </>
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
            <TopAppBarTitle>{pageTitle.updates}</TopAppBarTitle>
          </TopAppBarSection>
          {indent}
        </TopAppBarRow>
        <LinearProgress closed={!loading} />
      </TopAppBar>
      {!bottomNav && <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div className="main extended-app-bar">
          <div className="update-container">
            {entries.map((entryId) => (
              <UpdateEntry
                key={entryId}
                delete={openDelete}
                edit={openEdit}
                entryId={entryId}
              />
            ))}
          </div>
        </div>
        {editorElements}
      </div>
      <Footer />
      {bottomNav && <TopAppBarFixedAdjust />}
    </>
  );
};
