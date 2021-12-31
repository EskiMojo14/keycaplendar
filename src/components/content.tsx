import { useEffect, useState } from "react";
import type { HTMLAttributes } from "react";
import { DrawerAppContent } from "@rmwc/drawer";
import classNames from "classnames";
import { useAppSelector } from "~/app/hooks";
import { ContentAudit } from "@c/audit";
import { DrawerNav } from "@c/common/drawer-nav";
import { ContentGuides } from "@c/guides";
import { ContentHistory } from "@c/history";
import { ContentImages } from "@c/images";
import { ContentMain } from "@c/main";
import { ContentSettings } from "@c/settings";
import { ContentStatistics } from "@c/statistics";
import { ContentUpdates } from "@c/updates";
import { ContentUsers } from "@c/users";
import { selectDevice, selectPage } from "@s/common";
import { mainPages } from "@s/common/constants";
import { selectBottomNav } from "@s/settings";
import { selectUser } from "@s/user";
import { arrayIncludes, closeModal, openModal } from "@s/util/functions";
import "./content.scss";

type ContentProps = HTMLAttributes<HTMLDivElement>;

export const Content = ({ className, ...filteredProps }: ContentProps) => {
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

  const contentMain = arrayIncludes(mainPages, page) ? <ContentMain openNav={openNav} /> : null;
  const contentStatistics = page === "statistics" ? <ContentStatistics openNav={openNav} /> : null;
  const contentChangelog = page === "history" ? <ContentHistory openNav={openNav} /> : null;
  const contentAudit = page === "audit" && user.isAdmin ? <ContentAudit openNav={openNav} /> : null;
  const contentUsers = page === "users" && user.isAdmin ? <ContentUsers openNav={openNav} /> : null;
  const contentImages = page === "images" && user.isAdmin ? <ContentImages openNav={openNav} /> : null;
  const contentGuides = page === "guides" ? <ContentGuides openNav={openNav} /> : null;
  const contentUpdates = page === "updates" ? <ContentUpdates openNav={openNav} /> : null;
  const contentSettings = page === "settings" ? <ContentSettings openNav={openNav} /> : null;
  return (
    <div
      className={classNames(className, page, "app-container", {
        "has-fab": (user.isEditor || user.isDesigner) && device !== "desktop" && arrayIncludes(mainPages, page),
        "bottom-nav": bottomNav,
      })}
      {...filteredProps}
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
