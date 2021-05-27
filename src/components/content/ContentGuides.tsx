import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectDevice } from "../../app/slices/common/commonSlice";
import { pageTitle } from "../../app/slices/common/constants";
import { closeModal, openModal } from "../../app/slices/common/functions";
import { selectEntries, selectLoading } from "../../app/slices/guides/guidesSlice";
import { Guide } from "../../app/slices/guides/constructors";
import { getEntries } from "../../app/slices/guides/functions";
import { GuideEntryType } from "../../app/slices/guides/types";
import { selectBottomNav } from "../../app/slices/settings/settingsSlice";
import { selectUser } from "../../app/slices/user/userSlice";
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
import { Footer } from "../common/Footer";
import { GuideEntry } from "../guides/GuideEntry";
import { ModalCreate, ModalEdit } from "../guides/admin/ModalEntry";
import { DialogDelete } from "../guides/admin/DialogDelete";
import "./ContentGuides.scss";

type ContentGuidesProps = {
  openNav: () => void;
};

export const ContentGuides = (props: ContentGuidesProps) => {
  const device = useAppSelector(selectDevice);

  const bottomNav = useAppSelector(selectBottomNav);

  const user = useAppSelector(selectUser);

  const loading = useAppSelector(selectLoading);
  const entries = useAppSelector(selectEntries);

  useEffect(() => {
    if (entries.length === 0) {
      getEntries();
    }
  }, []);

  const blankEntry: GuideEntryType = new Guide();
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
  const openDelete = (entry: GuideEntryType) => {
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

  return (
    <>
      <TopAppBar
        fixed
        className={classNames({ "bottom-app-bar": bottomNav, "bottom-app-bar--indent": bottomNav && user.isAdmin })}
      >
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>{pageTitle.guides}</TopAppBarTitle>
          </TopAppBarSection>
          {indent}
        </TopAppBarRow>
        <LinearProgress closed={!loading} />
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div className="main extended-app-bar">
          <div className="guide-container">
            {entries.map((entry) => (
              <GuideEntry key={entry.id} entry={entry} edit={openEdit} delete={openDelete} />
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
