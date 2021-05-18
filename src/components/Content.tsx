import React, { useState, useContext, useEffect } from "react";
import classNames from "classnames";
import { useAppSelector } from "../app/hooks";
import { selectDevice } from "./settings/displaySlice";
import { UserContext } from "../util/contexts";
import { mainPages } from "../util/constants";
import { openModal, closeModal, arrayIncludes } from "../util/functions";
import {
  WhitelistType,
  SetType,
  SortOrderType,
  PresetType,
  Page,
  SortType,
  StatsTab,
  ViewType,
  SetGroup,
} from "../util/types";
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
  bottomNav: boolean;
  className: string;
  content: boolean;
  getData: () => void;
  loading: boolean;
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
  setSort: (sort: SortType) => void;
  setSortOrder: (sortOrder: SortOrderType) => void;
  setStatisticsTab: (tab: StatsTab) => void;
  setToTimeTheme: (toTimeTheme: string) => void;
  setView: (view: ViewType) => void;
  setWhitelist: <T extends keyof WhitelistType>(prop: T, whitelist: WhitelistType[T]) => void;
  setWhitelistMerge: (partialWhitelist: Partial<WhitelistType>) => void;
  sets: SetType[];
  setGroups: SetGroup[];
  sort: SortType;
  sortOrder: SortOrderType;
  statisticsTab: StatsTab;
  toggleLichTheme: () => void;
  whitelist: WhitelistType;
};

export const Content = (props: ContentProps) => {
  const { user } = useContext(UserContext);
  const device = useAppSelector(selectDevice);
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
      sets={props.sets}
      setGroups={props.setGroups}
      sort={props.sort}
      setSort={props.setSort}
      sortOrder={props.sortOrder}
      setSortOrder={props.setSortOrder}
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
      setWhitelistMerge={props.setWhitelistMerge}
      whitelist={props.whitelist}
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
      />
    ) : null;
  const contentChangelog =
    props.page === "history" ? (
      <ContentHistory allSets={props.allSets} bottomNav={props.bottomNav} openNav={openNav} setPage={props.setPage} />
    ) : null;
  const contentAudit =
    props.page === "audit" && user.isAdmin ? <ContentAudit openNav={openNav} bottomNav={props.bottomNav} /> : null;
  const contentUsers =
    props.page === "users" && user.isAdmin ? (
      <ContentUsers bottomNav={props.bottomNav} openNav={openNav} allDesigners={props.allDesigners} />
    ) : null;
  const contentImages =
    props.page === "images" && user.isAdmin ? (
      <ContentImages openNav={openNav} bottomNav={props.bottomNav} sets={props.allSets} />
    ) : null;
  const contentUpdates =
    props.page === "updates" ? <ContentUpdates openNav={openNav} bottomNav={props.bottomNav} /> : null;
  const contentSettings =
    props.page === "settings" ? (
      <ContentSettings
        openNav={openNav}
        setBottomNav={props.setBottomNav}
        setLightTheme={props.setLightTheme}
        setDarkTheme={props.setDarkTheme}
        setApplyTheme={props.setApplyTheme}
        setManualTheme={props.setManualTheme}
        setFromTimeTheme={props.setFromTimeTheme}
        setToTimeTheme={props.setToTimeTheme}
        setDensity={props.setDensity}
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
