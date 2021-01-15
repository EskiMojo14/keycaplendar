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
import { Footer } from "../common/Footer";
import { BoolWrapper } from "../util/ConditionalWrapper";

export const ContentMain = (props) => {
  const device = useContext(DeviceContext);
  const blankSet = new Set();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailSet, setDetailSet] = useState(blankSet);
  const openDetails = (set) => {
    if (device !== "desktop") {
      openModal();
    }
    setDetailsOpen(true);
    setDetailSet(set);
  };
  const closeDetails = () => {
    if (device !== "desktop") {
      closeModal();
    }
    setDetailsOpen(false);
    setDetailSet(blankSet);
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
    setEditSet(blankSet);
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
          //openSales={this.openSalesDialog}
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
      </div>
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
