import React, { useState, useContext, useEffect } from "react";
import classNames from "classnames";
import { UserContext, DeviceContext } from "../util/contexts";
import { mainPages } from "../util/constants";
import { openModal, closeModal } from "../util/functions";
import { MainWhitelistType, QueueType, SetType } from "../util/types";
import { DrawerAppContent } from "@rmwc/drawer";
import { DrawerNav } from "./common/DrawerNav";
import { ContentAudit } from "./content/ContentAudit";
import { ContentImages } from "./content/ContentImages";
import { ContentMain } from "./content/ContentMain";
import { ContentSettings } from "./content/ContentSettings";
import { ContentStatistics } from "./content/ContentStatistics";
import { ContentUsers } from "./content/ContentUsers";
import "./Content.scss";

type ContentProps = {
  allDesigners: string[];
  allRegions: string[];
  allSets: SetType[];
  allVendors: string[];
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
  page: string;
  profiles: string[];
  search: string;
  setApplyTheme: (applyTheme: string) => void;
  setBottomNav: (bottomNav: boolean) => void;
  setDarkTheme: (darkTheme: string) => void;
  setDensity: (density: string) => void;
  setFromTimeTheme: (fromTimeTheme: string) => void;
  setLightTheme: (lightTheme: string) => void;
  setManualTheme: (manualTheme: boolean) => void;
  setPage: (page: string) => void;
  setSearch: (search: string) => void;
  setSort: (sort: string) => void;
  setStatisticsTab: (tab: string) => void;
  setToTimeTheme: (toTimeTheme: string) => void;
  setView: (view: string) => void;
  setWhitelist: (prop: string, whitelist: MainWhitelistType | MainWhitelistType[keyof MainWhitelistType]) => void;
  sets: SetType[];
  snackbarQueue: QueueType;
  sort: string;
  statisticsTab: string;
  toTimeTheme: string;
  toggleLichTheme: () => void;
  toggleLoading: () => void;
  view: string;
  whitelist: MainWhitelistType;
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

  const contentMain = mainPages.includes(props.page) ? (
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
      view={props.view}
      setView={props.setView}
      search={props.search}
      setSearch={props.setSearch}
      toggleLichTheme={props.toggleLichTheme}
      profiles={props.profiles}
      allDesigners={props.allDesigners}
      allVendors={props.allVendors}
      allRegions={props.allRegions}
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
        profiles={props.profiles}
        sets={props.allSets}
        bottomNav={props.bottomNav}
        navOpen={navOpen}
        openNav={openNav}
        statisticsTab={props.statisticsTab}
        setStatisticsTab={props.setStatisticsTab}
        allDesigners={props.allDesigners}
        allVendors={props.allVendors}
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
        "offset-snackbar": (user.isEditor || user.isDesigner) && device !== "desktop" && mainPages.includes(props.page),
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
        {contentAudit}
        {contentUsers}
        {contentImages}
        {contentSettings}
      </DrawerAppContent>
    </div>
  );
};

export default Content;
