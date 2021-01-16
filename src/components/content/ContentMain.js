import React, { useContext, useState } from "react";
import classNames from "classnames";
import { DeviceContext, UserContext } from "../../util/contexts";
import { Preset, Set } from "../../util/constructors";
import { openModal, closeModal, boolFunctions } from "../../util/functions";
import { DrawerAppContent } from "@rmwc/drawer";
import { TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import { ContentGrid } from "./ContentGrid";
import { ContentEmpty } from "./ContentEmpty";
import { DrawerDetails } from "../main/DrawerDetails";
import { DrawerFilter } from "../main/DrawerFilter";
import { DialogSales } from "../main/DialogSales";
import { DrawerFilterPreset } from "../main/DrawerFilterPreset";
import { DialogFilterPreset } from "../main/DialogFilterPreset";
import { DialogDeleteFilterPreset } from "../main/DialogDeleteFilterPreset";
import { DialogDelete } from "../admin/DialogDelete";
import { SnackbarDeleted } from "../admin/SnackbarDeleted";
import { Footer } from "../common/Footer";
import { BoolWrapper } from "../util/ConditionalWrapper";

export const ContentMain = (props) => {
  const { user } = useContext(UserContext);
  const device = useContext(DeviceContext);
  const blankSet = new Set();
  const blankPreset = new Preset();

  const [filterOpen, setFilterOpen] = useState(true);
  const openFilter = (set) => {
    const open = () => {
      if (device !== "desktop") {
        openModal();
      }
      setFilterOpen(true);
    };
    if (detailsOpen) {
      closeDetails();
      setTimeout(() => open(), 300);
    } else {
      open();
    }
  };
  const closeFilter = () => {
    if (device !== "desktop") {
      closeModal();
    }
    setFilterOpen(false);
  };

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailSet, setDetailSet] = useState(blankSet);
  const openDetails = (set) => {
    const open = () => {
      if (device !== "desktop") {
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
    if (device !== "desktop") {
      closeModal();
    }
    setDetailsOpen(false);
    setTimeout(() => setDetailSet(blankSet), 300);
  };

  const [salesOpen, setSalesOpen] = useState(false);
  const [salesSet, setSalesSet] = useState(blankSet);
  const openSales = (set) => {
    setSalesOpen(true);
    setSalesSet(set);
  };
  const closeSales = () => {
    setSalesOpen(false);
    setTimeout(() => setSalesSet(blankSet), 300);
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editSet, setEditSet] = useState(blankSet);
  const openEdit = (set) => {
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
  const [closeDeleteSnackbar, openDeleteSnackbar] = boolFunctions(setDeleteSnackbarOpen);
  const [deleteSet, setDeleteSet] = useState(blankSet);
  const openDeleteDialog = (set) => {
    closeDetails();
    setDeleteDialogOpen(true);
    setDeleteSet(set);
  };
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTimeout(() => setDeleteSet(blankSet), 300);
  };

  const [filterPresetOpen, setFilterPresetOpen] = useState(false);
  const [filterPreset, setFilterPreset] = useState(blankPreset);
  const openFilterPreset = (preset) => {
    const open = () => {
      openModal();
      setFilterPresetOpen(true);
      setFilterPreset(preset);
    };
    if (filterOpen && (props.view === "compact" || device !== "desktop")) {
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
  const openDeleteFilterPreset = (preset) => {
    const open = () => {
      openModal();
      setDeleteFilterPresetOpen(true);
      setDeleteFilterPreset(preset);
    };
    if (filterOpen && (props.view === "compact" || device !== "desktop")) {
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
      {device !== "mobile" ? (
        <DrawerFilterPreset open={filterPresetOpen} close={closeFilterPreset} preset={filterPreset} />
      ) : (
        <DialogFilterPreset open={filterPresetOpen} close={closeFilterPreset} preset={filterPreset} />
      )}
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
        snackbarQueue={props.snackbarQueue}
      />
      <SnackbarDeleted
        open={deleteSnackbarOpen}
        close={closeDeleteSnackbar}
        set={deleteSet}
        getData={props.getData}
        snackbarQueue={props.snackbarQueue}
      />
    </>
  ) : null;

  const editorElements = user.isEditor || user.isDesigner ? <>{deleteElements}</> : null;

  const content = props.content ? (
    <ContentGrid
      groups={props.groups}
      sets={props.sets}
      sort={props.sort}
      page={props.page}
      view={props.view}
      details={openDetails}
      closeDetails={closeDetails}
      detailSet={detailSet}
      edit={openEdit}
    />
  ) : (
    <ContentEmpty page={props.page} />
  );
  const drawerOpen = (detailsOpen || filterOpen) && device === "desktop";
  const wrapperClasses = classNames("main", props.view, {
    "extended-app-bar": props.view === "card" && !props.bottomNav,
    "drawer-open": drawerOpen,
  });
  return (
    <>
      {props.bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <DrawerFilter
          view={props.view}
          profiles={props.profiles}
          vendors={props.allVendors}
          open={filterOpen}
          close={closeFilter}
          setWhitelist={props.setWhitelist}
          whitelist={props.whitelist}
          snackbarQueue={props.snackbarQueue}
          openPreset={openFilterPreset}
          deletePreset={openDeleteFilterPreset}
          sort={props.sort}
        />
        <DrawerDetails
          view={props.view}
          set={detailSet}
          open={detailsOpen}
          close={closeDetails}
          edit={openEdit}
          delete={openDeleteDialog}
          search={props.search}
          setSearch={props.setSearch}
          toggleLichTheme={props.toggleLichTheme}
          openSales={openSales}
          device={device}
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
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
