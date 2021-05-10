import React, { useState, useContext, useEffect } from "react";
import classNames from "classnames";
import { UserContext, DeviceContext } from "../util/contexts";
import { mainPages } from "../util/constants";
import { openModal, closeModal, arrayIncludes } from "../util/functions";
import { WhitelistType, QueueType, SetType, SortOrderType, PresetType, Page } from "../util/types";
import { DrawerAppContent } from "@rmwc/drawer";
import { DrawerNav } from "./common/DrawerNav";
import { ContentAudit } from "./content/ContentAudit";
import { ContentImages } from "./content/ContentImages";
import { ContentMain } from "./content/ContentMain";
import { ContentSettings } from "./content/ContentSettings";
import { ContentStatistics } from "./content/ContentStatistics";
import { ContentHistory } from "./content/ContentHistory";
import { ContentUsers } from "./content/ContentUsers";
import { ContentUpdates } from "./content/ContentUpdates";
import "./Content.scss";

type ContentProps = {
  allDesigners: string[];
  allProfiles: string[];
  allSets: SetType[];
  allVendors: string[];
  allVendorRegions: string[];
  allRegions: string[];
  appPresets: PresetType[];
  applyTheme: string;
  bottomNav: boolean;
  className: string;
  content: boolean;
  darkTheme: string;
  density: string;
  fromTimeTheme: string;
  getData: () => void;
  groups: string[];
  lightTheme: string;
  loading: boolean;
  manualTheme: boolean;
  page: Page;
  search: string;
  setApplyTheme: (applyTheme: string) => void;
  setBottomNav: (bottomNav: boolean) => void;
  setDarkTheme: (darkTheme: string) => void;
  setDensity: (density: string) => void;
  setFromTimeTheme: (fromTimeTheme: string) => void;
  setLightTheme: (lightTheme: string) => void;
  setManualTheme: (manualTheme: boolean) => void;
  setPage: (page: Page) => void;
  setSearch: (search: string) => void;
  setSort: (sort: string) => void;
  setSortOrder: (sortOrder: SortOrderType) => void;
  setStatisticsTab: (tab: string) => void;
  setToTimeTheme: (toTimeTheme: string) => void;
  setView: (view: string) => void;
  setWhitelist: (prop: string, whitelist: WhitelistType | WhitelistType[keyof WhitelistType]) => void;
  sets: SetType[];
  snackbarQueue: QueueType;
  sort: string;
  sortOrder: SortOrderType;
  statisticsTab: string;
  toTimeTheme: string;
  toggleLichTheme: () => void;
  toggleLoading: () => void;
  view: string;
  whitelist: WhitelistType;
};

export const Content = (props: ContentProps) => {
  const { user } = useContext(UserContext);
  const device = useContext(DeviceContext);
  const [navOpen, setNavOpen] = useState(false);
  const [navEdited, setNavEdited] = useState(false);
  const openNav = () => {
    if (device !== "desktop") {
      openModal();
    }
    setNavOpen(true);
    if (!navEdited && device !== "desktop") {
      setNavEdited(true);
    }
  };
  const closeNav = () => {
    if (device !== "desktop") {
      closeModal();
    }
    setNavOpen(false);
  };

  useEffect(() => {
    if (device === "desktop" && !navEdited) {
      setNavOpen(true);
    }
  }, [device, navEdited]);

  const contentMain = arrayIncludes(mainPages, props.page) ? (
    <ContentMain
      bottomNav={props.bottomNav}
      navOpen={navOpen}
      openNav={openNav}
      page={props.page}
      content={props.content}
      groups={props.groups}
      sets={props.sets}
      sort={props.sort}
      setSort={props.setSort}
      sortOrder={props.sortOrder}
      setSortOrder={props.setSortOrder}
      view={props.view}
      setView={props.setView}
      search={props.search}
      setSearch={props.setSearch}
      toggleLichTheme={props.toggleLichTheme}
      allProfiles={props.allProfiles}
      allDesigners={props.allDesigners}
      allVendors={props.allVendors}
      allVendorRegions={props.allVendorRegions}
      allRegions={props.allRegions}
      appPresets={props.appPresets}
      setWhitelist={props.setWhitelist}
      whitelist={props.whitelist}
      snackbarQueue={props.snackbarQueue}
      loading={props.loading}
      getData={props.getData}
    />
  ) : null;
  const contentStatistics =
    props.page === "statistics" ? (
      <ContentStatistics
        bottomNav={props.bottomNav}
        navOpen={navOpen}
        openNav={openNav}
        statisticsTab={props.statisticsTab}
        setStatisticsTab={props.setStatisticsTab}
        snackbarQueue={props.snackbarQueue}
      />
    ) : null;
  const contentChangelog =
    props.page === "history" ? (
      <ContentHistory
        allSets={props.allSets}
        bottomNav={props.bottomNav}
        openNav={openNav}
        setPage={props.setPage}
        snackbarQueue={props.snackbarQueue}
      />
    ) : null;
  const contentAudit =
    props.page === "audit" && user.isAdmin ? (
      <ContentAudit openNav={openNav} bottomNav={props.bottomNav} snackbarQueue={props.snackbarQueue} />
    ) : null;
  const contentUsers =
    props.page === "users" && user.isAdmin ? (
      <ContentUsers
        bottomNav={props.bottomNav}
        openNav={openNav}
        allDesigners={props.allDesigners}
        snackbarQueue={props.snackbarQueue}
        device={device}
      />
    ) : null;
  const contentImages =
    props.page === "images" && user.isAdmin ? (
      <ContentImages
        openNav={openNav}
        bottomNav={props.bottomNav}
        sets={props.allSets}
        snackbarQueue={props.snackbarQueue}
      />
    ) : null;
  const contentUpdates =
    props.page === "updates" ? (
      <ContentUpdates openNav={openNav} bottomNav={props.bottomNav} snackbarQueue={props.snackbarQueue} />
    ) : null;
  const contentSettings =
    props.page === "settings" ? (
      <ContentSettings
        openNav={openNav}
        bottomNav={props.bottomNav}
        setBottomNav={props.setBottomNav}
        lightTheme={props.lightTheme}
        setLightTheme={props.setLightTheme}
        darkTheme={props.darkTheme}
        setDarkTheme={props.setDarkTheme}
        applyTheme={props.applyTheme}
        setApplyTheme={props.setApplyTheme}
        manualTheme={props.manualTheme}
        setManualTheme={props.setManualTheme}
        fromTimeTheme={props.fromTimeTheme}
        setFromTimeTheme={props.setFromTimeTheme}
        toTimeTheme={props.toTimeTheme}
        setToTimeTheme={props.setToTimeTheme}
        density={props.density}
        setDensity={props.setDensity}
        snackbarQueue={props.snackbarQueue}
      />
    ) : null;
  return (
    <div
      className={classNames(props.className, props.page, "app-container", {
        "has-fab": (user.isEditor || user.isDesigner) && device !== "desktop" && arrayIncludes(mainPages, props.page),
        "bottom-nav": props.bottomNav,
      })}
    >
      <DrawerNav
        bottomNav={props.bottomNav}
        view={props.view}
        open={navOpen}
        close={closeNav}
        page={props.page}
        setPage={props.setPage}
      />
      <DrawerAppContent>
        {contentMain}
        {contentStatistics}
        {contentChangelog}
        {contentAudit}
        {contentUsers}
        {contentImages}
        {contentUpdates}
        {contentSettings}
      </DrawerAppContent>
    </div>
  );
};

export default Content;
