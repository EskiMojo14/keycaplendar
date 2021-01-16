import React, { useContext, useState } from "react";
import classNames from "classnames";
import { DeviceContext, UserContext } from "../../util/contexts";
import { Preset, Set } from "../../util/constructors";
import { openModal, closeModal } from "../../util/functions";
import { DrawerAppContent } from "@rmwc/drawer";
import { TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import { ContentGrid } from "./ContentGrid";
import { ContentEmpty } from "./ContentEmpty";
import { DrawerDetails } from "../common/DrawerDetails";
import { DrawerFilter } from "../common/DrawerFilter";
import { DialogSales } from "../common/DialogSales";
import { DrawerFilterPreset } from "../common/DrawerFilterPreset";
import { DialogFilterPreset } from "../common/DialogFilterPreset";
import { DialogDeleteFilterPreset } from "../common/DialogDeleteFilterPreset";
import { Footer } from "../common/Footer";
import { BoolWrapper } from "../util/ConditionalWrapper";

export const ContentMain = (props) => {
  const { user } = useContext(UserContext);
  const device = useContext(DeviceContext);
  const blankSet = new Set();
  const blankPreset = new Preset();

  const [filterOpen, setFilterOpen] = useState(false);
  const openFilter = (set) => {
    const open = () => {
      if (device !== "desktop") {
        openModal();
      }
      setFilterOpen(true);
    };
    if (detailsOpen) {
      closeFilter();
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
    openModal();
    setSalesOpen(true);
    setSalesSet(set);
  };
  const closeSales = () => {
    closeModal();
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
  const drawerOpen = detailsOpen && device === "desktop";
  const wrapperClasses = classNames("main", props.view, { "extended-app-bar": props.view === "card" && !drawerOpen });
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
          //delete={this.openDeleteDialog}
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
      </div>
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
