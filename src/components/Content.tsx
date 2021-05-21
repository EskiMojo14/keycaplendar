import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { useAppSelector } from "../app/hooks";
import { selectDevice, selectPage } from "../app/slices/common/commonSlice";
import { mainPages } from "../app/slices/common/constants";
import { arrayIncludes, closeModal, openModal } from "../app/slices/common/functions";
import { Page } from "../app/slices/common/types";
import { PresetType, SortOrderType, SortType, WhitelistType } from "../app/slices/main/types";
import { selectBottomNav } from "../app/slices/settings/settingsSlice";
import { ViewType } from "../app/slices/settings/types";
import { selectUser } from "../app/slices/user/userSlice";
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
  appPresets: PresetType[];
  className: string;
  getData: () => void;
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
  setToTimeTheme: (toTimeTheme: string) => void;
  setView: (view: ViewType) => void;
  setWhitelist: <T extends keyof WhitelistType>(prop: T, whitelist: WhitelistType[T]) => void;
  setWhitelistMerge: (partialWhitelist: Partial<WhitelistType>) => void;
  toggleLichTheme: () => void;
  whitelist: WhitelistType;
};

export const Content = (props: ContentProps) => {
  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);

  const user = useAppSelector(selectUser);

  const page = useAppSelector(selectPage);

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

  const contentMain = arrayIncludes(mainPages, page) ? (
    <ContentMain
      navOpen={navOpen}
      openNav={openNav}
      setSort={props.setSort}
      setSortOrder={props.setSortOrder}
      setView={props.setView}
      search={props.search}
      setSearch={props.setSearch}
      toggleLichTheme={props.toggleLichTheme}
      appPresets={props.appPresets}
      setWhitelist={props.setWhitelist}
      setWhitelistMerge={props.setWhitelistMerge}
      whitelist={props.whitelist}
      getData={props.getData}
    />
  ) : null;
  const contentStatistics = page === "statistics" ? <ContentStatistics navOpen={navOpen} openNav={openNav} /> : null;
  const contentChangelog = page === "history" ? <ContentHistory openNav={openNav} setPage={props.setPage} /> : null;
  const contentAudit = page === "audit" && user.isAdmin ? <ContentAudit openNav={openNav} /> : null;
  const contentUsers = page === "users" && user.isAdmin ? <ContentUsers openNav={openNav} /> : null;
  const contentImages = page === "images" && user.isAdmin ? <ContentImages openNav={openNav} /> : null;
  const contentUpdates = page === "updates" ? <ContentUpdates openNav={openNav} /> : null;
  const contentSettings =
    page === "settings" ? (
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
      className={classNames(props.className, page, "app-container", {
        "has-fab": (user.isEditor || user.isDesigner) && device !== "desktop" && arrayIncludes(mainPages, page),
        "bottom-nav": bottomNav,
      })}
    >
      <DrawerNav open={navOpen} close={closeNav} setPage={props.setPage} />
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
