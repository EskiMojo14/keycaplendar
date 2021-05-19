import React, { useState } from "react";
import classNames from "classnames";
import { useAppSelector } from "../../app/hooks";
import { selectDevice } from "../../app/slices/common/commonSlice";
import { selectUser } from "../../app/slices/user/userSlice";
import { selectBottomNav, selectMainView } from "../../app/slices/settings/settingsSlice";
import { Preset, Keyset } from "../../util/constructors";
import { openModal, closeModal } from "../../util/functions";
import { WhitelistType, PresetType, SetType, SortOrderType, SortType, ViewType, SetGroup } from "../../util/types";
import { Fab } from "@rmwc/fab";
import { DrawerAppContent } from "@rmwc/drawer";
import { TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import { ContentGrid } from "./ContentGrid";
import { ContentEmpty } from "./ContentEmpty";
import { AppBar } from "../main/app_bar/AppBar";
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
  content: boolean;
  sort: SortType;
  setSort: (sort: SortType) => void;
  sortOrder: SortOrderType;
  setSortOrder: (sortOrder: SortOrderType) => void;
  setView: (view: ViewType) => void;
  search: string;
  setSearch: (search: string) => void;
  toggleLichTheme: () => void;
  sets: SetType[];
  setGroups: SetGroup[];
  allDesigners: string[];
  allProfiles: string[];
  allVendors: string[];
  allVendorRegions: string[];
  allRegions: string[];
  appPresets: PresetType[];
  setWhitelist: <T extends keyof WhitelistType>(prop: T, whitelist: WhitelistType[T]) => void;
  setWhitelistMerge: (partialWhitelist: Partial<WhitelistType>) => void;
  whitelist: WhitelistType;
  loading: boolean;
  getData: () => void;
};

export const ContentMain = (props: ContentMainProps) => {
  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);
  const view = useAppSelector(selectMainView);

  const user = useAppSelector(selectUser);

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
        <ModalCreate
          open={createOpen}
          close={closeCreate}
          allProfiles={props.allProfiles}
          allDesigners={props.allDesigners}
          allVendors={props.allVendors}
          allVendorRegions={props.allVendorRegions}
          getData={props.getData}
        />
        <ModalEdit
          open={editOpen}
          close={closeEdit}
          allProfiles={props.allProfiles}
          allDesigners={props.allDesigners}
          allVendors={props.allVendors}
          allVendorRegions={props.allVendorRegions}
          set={editSet}
          getData={props.getData}
        />
        {deleteElements}
      </ConditionalWrapper>
    ) : null;

  const content = props.content ? (
    <ContentGrid
      setGroups={props.setGroups}
      details={openDetails}
      closeDetails={closeDetails}
      detailSet={detailSet}
      edit={openEdit}
    />
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
        setView={props.setView}
        sort={props.sort}
        setSort={props.setSort}
        sortOrder={props.sortOrder}
        setSortOrder={props.setSortOrder}
        search={props.search}
        setSearch={props.setSearch}
        sets={props.sets}
        loading={props.loading}
        openFilter={openFilter}
      />
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <DrawerFilter
          profiles={props.allProfiles}
          vendors={props.allVendors}
          regions={props.allRegions}
          appPresets={props.appPresets}
          open={filterOpen}
          close={closeFilter}
          setWhitelist={props.setWhitelist}
          setWhitelistMerge={props.setWhitelistMerge}
          whitelist={props.whitelist}
          openPreset={openFilterPreset}
          deletePreset={openDeleteFilterPreset}
          sort={props.sort}
        />
        <DrawerDetails
          set={detailSet}
          open={detailsOpen}
          close={closeDetails}
          edit={openEdit}
          delete={openDeleteDialog}
          search={props.search}
          setSearch={props.setSearch}
          toggleLichTheme={props.toggleLichTheme}
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
