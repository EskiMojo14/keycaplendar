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
import { confirm } from "~/app/dialog-queue";
import { notify } from "~/app/snackbar-queue";
import { Footer } from "@c/common/footer";
import { ModalCreate, ModalEdit } from "@c/updates/admin/modal-entry";
import { AppBarIndent } from "@c/util/app-bar-indent";
import { useAppDispatch, useAppSelector } from "@h";
import useBottomNav from "@h/use-bottom-nav";
import useDevice from "@h/use-device";
import firestore from "@s/firebase/firestore";
import type { UpdateId } from "@s/firebase/types";
import { pageTitle } from "@s/router/constants";
import {
  selectEntryById,
  selectEntryIds,
  selectEntryMap,
  selectLoading,
} from "@s/updates";
import { getEntries as getEntriesThunk } from "@s/updates/thunks";
import { selectUser } from "@s/user";
import { closeModal, openModal } from "@s/util/functions";
import { selectFromState } from "@s/util/thunks";
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

  const openDelete = (id: EntityId) => {
    const entry = dispatch(
      selectFromState((state) => selectEntryById(state, id))
    );
    if (entry) {
      confirm({
        acceptLabel: "Delete",
        body: `Are you sure you want to delete the update entry "${entry.title}"? This cannot be undone.`,
        className: "mdc-dialog--delete-confirm",
        onClose: async (e) => {
          switch (e.detail.action) {
            case "accept": {
              try {
                await firestore
                  .collection("updates")
                  .doc(id as UpdateId)
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
