import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { selectDevice, selectPage } from "@s/common/commonSlice";
import { mainPages } from "@s/common/constants";
import { arrayIncludes, closeModal, openModal } from "@s/common/functions";
import { selectBottomNav } from "@s/settings/settingsSlice";
import { selectUser } from "@s/user/userSlice";
import { DrawerAppContent } from "@rmwc/drawer";
import { DrawerNav } from "@c/common/DrawerNav";
import { ContentAudit } from "@c/content/ContentAudit";
import { ContentImages } from "@c/content/ContentImages";
import { ContentMain } from "@c/content/ContentMain";
import { ContentSettings } from "@c/content/ContentSettings";
import { ContentStatistics } from "@c/content/ContentStatistics";
import { ContentHistory } from "@c/content/ContentHistory";
import { ContentUsers } from "@c/content/ContentUsers";
import { ContentGuides } from "@c/content/ContentGuides";
import { ContentUpdates } from "@c/content/ContentUpdates";
import "./Content.scss";

type ContentProps = {
  className: string;
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

  const contentMain = arrayIncludes(mainPages, page) ? <ContentMain navOpen={navOpen} openNav={openNav} /> : null;
  const contentStatistics = page === "statistics" ? <ContentStatistics navOpen={navOpen} openNav={openNav} /> : null;
  const contentChangelog = page === "history" ? <ContentHistory openNav={openNav} /> : null;
  const contentAudit = page === "audit" && user.isAdmin ? <ContentAudit openNav={openNav} /> : null;
  const contentUsers = page === "users" && user.isAdmin ? <ContentUsers openNav={openNav} /> : null;
  const contentImages = page === "images" && user.isAdmin ? <ContentImages openNav={openNav} /> : null;
  const contentGuides = page === "guides" ? <ContentGuides openNav={openNav} /> : null;
  const contentUpdates = page === "updates" ? <ContentUpdates openNav={openNav} /> : null;
  const contentSettings = page === "settings" ? <ContentSettings openNav={openNav} /> : null;
  return (
    <div
      className={classNames(props.className, page, "app-container", {
        "has-fab": (user.isEditor || user.isDesigner) && device !== "desktop" && arrayIncludes(mainPages, page),
        "bottom-nav": bottomNav,
      })}
    >
      <DrawerNav open={navOpen} close={closeNav} />
      <DrawerAppContent>
        {contentMain}
        {contentStatistics}
        {contentChangelog}
        {contentAudit}
        {contentUsers}
        {contentImages}
        {contentGuides}
        {contentUpdates}
        {contentSettings}
      </DrawerAppContent>
    </div>
  );
};

export default Content;
