import React, { useContext, useState } from "react";
import classNames from "classnames";
import { DeviceContext } from "../../util/contexts";
import { Set } from "../../util/constructors";
import { openModal, closeModal } from "../../util/functions";
import { DrawerAppContent } from "@rmwc/drawer";
import { TopAppBarFixedAdjust } from "@rmwc/top-app-bar";
import { ContentGrid } from "./ContentGrid";
import { ContentEmpty } from "./ContentEmpty";
import { DrawerDetails } from "../common/DrawerDetails";
import { DrawerFilter } from "../common/DrawerFilter";
import { DialogSales } from "../common/DialogSales";
import { Footer } from "../common/Footer";
import { BoolWrapper } from "../util/ConditionalWrapper";

export const ContentMain = (props) => {
  const device = useContext(DeviceContext);
  const blankSet = new Set();

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
          //openPreset={this.openFilterPresetDrawer}
          //deletePreset={this.openFilterPresetDeleteDialog}
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
      </div>
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
