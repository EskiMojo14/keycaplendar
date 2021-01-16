import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { UserContext, DeviceContext } from "../util/contexts";
import { mainPages } from "../util/constants";
import { openModal, closeModal } from "../util/functions";
import { setTypes, whitelistTypes, statisticsTypes, statisticsSortTypes, queueTypes } from "../util/propTypeTemplates";
import { DrawerAppContent } from "@rmwc/drawer";
import { DrawerNav } from "./common/DrawerNav";
import { ContentAudit } from "./content/ContentAudit";
import { ContentStatistics } from "./content/ContentStatistics";
import { ContentMain } from "./content/ContentMain";
import { ContentSettings } from "./content/ContentSettings";
import { ContentUsers } from "./content/ContentUsers";
import "./Content.scss";

export const Content = (props) => {
  const { user } = useContext(UserContext);
  const device = useContext(DeviceContext);
  const [navOpen, setNavOpen] = useState(false);
  const openNav = () => {
    if (device !== "desktop") {
      openModal();
    }
    setNavOpen(true);
  };
  const closeNav = () => {
    if (device !== "desktop") {
      closeModal();
    }
    setNavOpen(false);
  };
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
      />
    ) : null;
  const contentAudit =
    props.page === "audit" && user.isAdmin ? (
      <ContentAudit openNav={openNav} bottomNav={props.bottomNav} snackbarQueue={props.snackbarQueue} />
    ) : null;
  const contentUsers =
    props.page === "users" && user.isAdmin ? (
      <ContentUsers
        openNav={openNav}
        allDesigners={props.allDesigners}
        snackbarQueue={props.snackbarQueue}
        device={device}
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
        {contentSettings}
      </DrawerAppContent>
    </div>
  );
};

export default Content;

Content.propTypes = {
  allDesigners: PropTypes.arrayOf(PropTypes.string),
  allRegions: PropTypes.arrayOf(PropTypes.string),
  allSets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  allVendors: PropTypes.arrayOf(PropTypes.string),
  applyTheme: PropTypes.string,
  bottomNav: PropTypes.bool,
  className: PropTypes.string,
  content: PropTypes.bool,
  darkTheme: PropTypes.string,
  density: PropTypes.string,
  device: PropTypes.string,
  fromTimeTheme: PropTypes.string,
  getData: PropTypes.func,
  groups: PropTypes.arrayOf(PropTypes.string),
  lightTheme: PropTypes.string,
  loading: PropTypes.bool,
  manualTheme: PropTypes.bool,
  page: PropTypes.string,
  profiles: PropTypes.arrayOf(PropTypes.string),
  search: PropTypes.string,
  setApplyTheme: PropTypes.func,
  setBottomNav: PropTypes.func,
  setDarkTheme: PropTypes.func,
  setDensity: PropTypes.func,
  setFromTimeTheme: PropTypes.func,
  setLightTheme: PropTypes.func,
  setManualTheme: PropTypes.func,
  setPage: PropTypes.func,
  setSearch: PropTypes.func,
  setSort: PropTypes.func,
  setStatistics: PropTypes.func,
  setStatisticsSort: PropTypes.func,
  setStatisticsTab: PropTypes.func,
  setToTimeTheme: PropTypes.func,
  setView: PropTypes.func,
  setWhitelist: PropTypes.func,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  snackbarQueue: PropTypes.shape(queueTypes),
  sort: PropTypes.string,
  statistics: PropTypes.shape(statisticsTypes),
  statisticsSort: PropTypes.shape(statisticsSortTypes),
  statisticsTab: PropTypes.string,
  toTimeTheme: PropTypes.string,
  toggleLichTheme: PropTypes.func,
  toggleLoading: PropTypes.func,
  view: PropTypes.string,
  whitelist: PropTypes.shape(whitelistTypes),
};
