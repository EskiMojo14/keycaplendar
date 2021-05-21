import React, { useState } from "react";
import classNames from "classnames";
import { useAppSelector } from "../../app/hooks";
import { selectDevice } from "../../app/slices/common/commonSlice";
import { closeModal, openModal } from "../../app/slices/common/functions";
import { Keyset, Preset } from "../../app/slices/main/constructors";
import { selectContent } from "../../app/slices/main/mainSlice";
import { PresetType, SetType, SortOrderType, SortType, WhitelistType } from "../../app/slices/main/types";
import { selectBottomNav, selectMainView } from "../../app/slices/settings/settingsSlice";
import { selectUser } from "../../app/slices/user/userSlice";
import { Fab } from "@rmwc/fab";
import { DrawerAppContent } from "@rmwc/drawer";
import { TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import { AppBar } from "../main/app_bar/AppBar";
import { ContentEmpty } from "../main/content/ContentEmpty";
import { ContentGrid } from "../main/content/ContentGrid";
import { DrawerDetails } from "../main/DrawerDetails";
import { DrawerFilter } from "../main/DrawerFilter";
import { DialogSales } from "../main/DialogSales";
import { ModalFilterPreset } from "../main/ModalFilterPreset";
import { DialogDeleteFilterPreset } from "../main/DialogDeleteFilterPreset";
import { ModalCreate, ModalEdit } from "../main/admin/ModalEntry";
import { DialogDelete } from "../main/admin/DialogDelete";
import { SnackbarDeleted } from "../main/admin/SnackbarDeleted";
import { Footer } from "../common/Footer";
import ConditionalWrapper, { BoolWrapper } from "../util/ConditionalWrapper";

type ContentMainProps = {
  navOpen: boolean;
  openNav: () => void;
  setSort: (sort: SortType) => void;
  setSortOrder: (sortOrder: SortOrderType) => void;
  setSearch: (search: string) => void;
  setWhitelist: <T extends keyof WhitelistType>(prop: T, whitelist: WhitelistType[T]) => void;
  setWhitelistMerge: (partialWhitelist: Partial<WhitelistType>) => void;
  getData: () => void;
};

export const ContentMain = (props: ContentMainProps) => {
  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);
  const view = useAppSelector(selectMainView);

  const user = useAppSelector(selectUser);

  const contentBool = useAppSelector(selectContent);

  const blankSet: SetType = new Keyset();
  const blankPreset: PresetType = new Preset();

  const [filterOpen, setFilterOpen] = useState(false);
  const openFilter = () => {
    const open = () => {
      if (filterOpen && device === "desktop") {
        closeFilter();
      } else {
        if (device !== "desktop" || view === "compact") {
          openModal();
        }
        setFilterOpen(true);
      }
    };
    if (detailsOpen) {
      closeDetails();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const closeFilter = () => {
    closeModal();
    setFilterOpen(false);
  };

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailSet, setDetailSet] = useState(blankSet);
  const openDetails = (set: SetType) => {
    const open = () => {
      if (device !== "desktop" || view === "compact") {
        openModal();
      }
      setDetailsOpen(true);
      setDetailSet(set);
    };
    if (filterOpen) {
      closeFilter();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const closeDetails = () => {
    closeModal();
    setDetailsOpen(false);
    setTimeout(() => setDetailSet(blankSet), 300);
  };

  const [salesOpen, setSalesOpen] = useState(false);
  const [salesSet, setSalesSet] = useState(blankSet);
  const openSales = (set: SetType) => {
    setSalesOpen(true);
    setSalesSet(set);
  };
  const closeSales = () => {
    setSalesOpen(false);
    setTimeout(() => setSalesSet(blankSet), 300);
  };

  const [createOpen, setCreateOpen] = useState(false);
  const openCreate = () => {
    openModal();
    setCreateOpen(true);
  };
  const closeCreate = () => {
    closeModal();
    setCreateOpen(false);
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editSet, setEditSet] = useState(blankSet);
  const openEdit = (set: SetType) => {
    openModal();
    setEditOpen(true);
    setEditSet(set);
  };
  const closeEdit = () => {
    closeModal();
    setEditOpen(false);
    setTimeout(() => setEditSet(blankSet), 300);
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteSnackbarOpen, setDeleteSnackbarOpen] = useState(false);
  const [deleteSet, setDeleteSet] = useState(blankSet);
  const openDeleteDialog = (set: SetType) => {
    closeDetails();
    setDeleteDialogOpen(true);
    setDeleteSet(set);
  };
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const openDeleteSnackbar = () => {
    setDeleteSnackbarOpen(true);
  };

  const closeDeleteSnackbar = () => {
    setDeleteSnackbarOpen(false);
    setTimeout(() => setDeleteSet(blankSet), 300);
  };

  const [filterPresetOpen, setFilterPresetOpen] = useState(false);
  const [filterPreset, setFilterPreset] = useState(blankPreset);
  const openFilterPreset = (preset: PresetType) => {
    const open = () => {
      openModal();
      setFilterPresetOpen(true);
      setFilterPreset(preset);
    };
    if (filterOpen && (view === "compact" || device !== "desktop")) {
      closeFilter();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const closeFilterPreset = () => {
    closeModal();
    setFilterPresetOpen(false);
    setTimeout(() => setFilterPreset(blankPreset), 300);
  };

  const [deleteFilterPresetOpen, setDeleteFilterPresetOpen] = useState(false);
  const [deleteFilterPreset, setDeleteFilterPreset] = useState(blankPreset);
  const openDeleteFilterPreset = (preset: PresetType) => {
    const open = () => {
      openModal();
      setDeleteFilterPresetOpen(true);
      setDeleteFilterPreset(preset);
    };
    if (filterOpen && (view === "compact" || device !== "desktop")) {
      closeFilter();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const closeDeleteFilterPreset = () => {
    closeModal();
    setDeleteFilterPresetOpen(false);
    setTimeout(() => setDeleteFilterPreset(blankPreset), 300);
  };

  const filterPresetElements = user.email ? (
    <>
      <ModalFilterPreset open={filterPresetOpen} close={closeFilterPreset} preset={filterPreset} />
      <DialogDeleteFilterPreset
        open={deleteFilterPresetOpen}
        close={closeDeleteFilterPreset}
        preset={deleteFilterPreset}
      />
    </>
  ) : null;

  const deleteElements = user.isEditor ? (
    <>
      <DialogDelete
        open={deleteDialogOpen}
        close={closeDeleteDialog}
        set={deleteSet}
        openSnackbar={openDeleteSnackbar}
        getData={props.getData}
      />
      <SnackbarDeleted open={deleteSnackbarOpen} close={closeDeleteSnackbar} set={deleteSet} getData={props.getData} />
    </>
  ) : null;

  const editorElements =
    user.isEditor || user.isDesigner ? (
      <ConditionalWrapper
        condition={device === "desktop"}
        wrapper={(children) => <div className="editor-elements">{children}</div>}
      >
        <Fab
          className={classNames("create-fab", { middle: bottomNav })}
          icon="add"
          label={device === "desktop" ? "Create" : null}
          onClick={openCreate}
        />
        <ModalCreate open={createOpen} close={closeCreate} getData={props.getData} />
        <ModalEdit open={editOpen} close={closeEdit} set={editSet} getData={props.getData} />
        {deleteElements}
      </ConditionalWrapper>
    ) : null;

  const content = contentBool ? (
    <ContentGrid details={openDetails} closeDetails={closeDetails} detailSet={detailSet} edit={openEdit} />
  ) : (
    <ContentEmpty />
  );
  const drawerOpen = (detailsOpen || filterOpen) && device === "desktop";
  const wrapperClasses = classNames("main", view, {
    "extended-app-bar": view === "card" && !bottomNav,
    "drawer-open": drawerOpen,
  });
  return (
    <>
      <AppBar
        openNav={props.openNav}
        indent={user.isDesigner || user.isEditor}
        setSort={props.setSort}
        setSortOrder={props.setSortOrder}
        setSearch={props.setSearch}
        openFilter={openFilter}
      />
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <DrawerFilter
          open={filterOpen}
          close={closeFilter}
          setWhitelist={props.setWhitelist}
          setWhitelistMerge={props.setWhitelistMerge}
          openPreset={openFilterPreset}
          deletePreset={openDeleteFilterPreset}
        />
        <DrawerDetails
          set={detailSet}
          open={detailsOpen}
          close={closeDetails}
          edit={openEdit}
          delete={openDeleteDialog}
          setSearch={props.setSearch}
          openSales={openSales}
        />
        <BoolWrapper
          condition={device === "desktop"}
          trueWrapper={(children) => <DrawerAppContent className={wrapperClasses}>{children}</DrawerAppContent>}
          falseWrapper={(children) => <div className={wrapperClasses}>{children}</div>}
        >
          {content}
          <Footer />
        </BoolWrapper>
        <DialogSales open={salesOpen} close={closeSales} set={salesSet} />
        {filterPresetElements}
        {editorElements}
      </div>
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
