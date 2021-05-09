import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames";
import firebase from "../../firebase";
import { Update } from "../../util/constructors";
import { DeviceContext, UserContext } from "../../util/contexts";
import { closeModal, openModal } from "../../util/functions";
import { QueueType, UpdateEntryType } from "../../util/types";
import { Fab } from "@rmwc/fab";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { Footer } from "../common/Footer";
import { UpdateEntry } from "../updates/UpdateEntry";
import { ModalCreate, ModalEdit } from "../updates/admin/ModalEntry";
import "./ContentUpdates.scss";
import { DialogDelete } from "../updates/admin/DialogDelete";

const db = firebase.firestore();

type ContentUpdatesProps = {
  bottomNav: boolean;
  openNav: () => void;
  snackbarQueue: QueueType;
};

export const ContentUpdates = (props: ContentUpdatesProps) => {
  const { user } = useContext(UserContext);
  const device = useContext(DeviceContext);
  const indent =
    user.isAdmin && props.bottomNav ? (
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

  const [entries, setEntries] = useState<UpdateEntryType[]>([]);

  const getEntries = () => {
    db.collection("updates")
      .orderBy("date", "desc")
      .get()
      .then((querySnapshot) => {
        const entries: UpdateEntryType[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          entries.push({
            id: doc.id,
            name: data.name,
            title: data.title,
            date: data.date,
            body: data.body,
            pinned: data.pinned ? data.pinned : false,
          });
        });
        sortEntries(entries);
      })
      .catch((error) => {
        console.log("Error getting data: " + error);
        props.snackbarQueue.notify({ title: "Error getting data: " + error });
      });
  };
  useEffect(getEntries, []);
  const sortEntries = (entries: UpdateEntryType[]) => {
    const sortedEntries = entries.sort((a, b) => {
      if ((a.pinned || b.pinned) && !(a.pinned && b.pinned)) {
        return a.pinned ? -1 : 1;
      } else {
        return a.date > b.date ? -1 : 1;
      }
    });
    setEntries(sortedEntries);
  };

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

  const pinEntry = (entry: UpdateEntryType) => {
    db.collection("updates")
      .doc(entry.id)
      .set({ pinned: !entry.pinned }, { merge: true })
      .then(() => {
        props.snackbarQueue.notify({ title: `Entry ${entry.pinned ? "unpinned" : "pinned"}.` });
        getEntries();
      })
      .catch((error) => {
        console.log(`Failed to ${entry.pinned ? "unpin" : "pin"} entry: ${error}`);
        props.snackbarQueue.notify({ title: `Failed to ${entry.pinned ? "unpin" : "pin"} entry: ${error}` });
      });
  };

  const editorElements = user.isAdmin ? (
    <>
      <Fab
        className={classNames("create-fab", { middle: props.bottomNav })}
        icon="add"
        label={device === "desktop" ? "Create" : null}
        onClick={openCreate}
      />
      <ModalCreate
        open={createOpen}
        onClose={closeCreate}
        getEntries={getEntries}
        snackbarQueue={props.snackbarQueue}
      />
      <ModalEdit
        open={editOpen}
        onClose={closeEdit}
        getEntries={getEntries}
        entry={editEntry}
        snackbarQueue={props.snackbarQueue}
      />
      <DialogDelete
        open={deleteOpen}
        onClose={closeDelete}
        entry={deleteEntry}
        getEntries={getEntries}
        snackbarQueue={props.snackbarQueue}
      />
    </>
  ) : null;
  return (
    <>
      <TopAppBar
        fixed
        className={classNames({
          "bottom-app-bar": props.bottomNav,
          "bottom-app-bar--indent": props.bottomNav && user.isAdmin,
        })}
      >
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>Updates</TopAppBarTitle>
          </TopAppBarSection>
          {indent}
        </TopAppBarRow>
      </TopAppBar>
      {props.bottomNav ? null : <TopAppBarFixedAdjust />}
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
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
