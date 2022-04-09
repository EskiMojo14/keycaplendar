import { useEffect, useMemo, useState } from "react";
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

export const Content = ({ className, ...props }: ContentProps) => {
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

  const Content = useMemo(() => {
    if (arrayIncludes(mainPages, page)) {
      return ContentMain;
    }
    switch (page) {
      case "statistics":
        return ContentStatistics;
      case "history":
        return ContentHistory;
      case "audit":
        return user.isAdmin && ContentAudit;
      case "users":
        return user.isAdmin && ContentUsers;
      case "images":
        return user.isAdmin && ContentImages;
      case "guides":
        return ContentGuides;
      case "updates":
        return ContentUpdates;
      case "settings":
        return ContentSettings;
      default:
        return null;
    }
  }, [page]);

  return (
    <div
      className={classNames(className, page, "app-container", {
        "bottom-nav": bottomNav,
        "has-fab":
          (user.isEditor || user.isDesigner) &&
          device !== "desktop" &&
          arrayIncludes(mainPages, page),
      })}
      {...props}
    >
      <DrawerNav close={closeNav} open={navOpen} />
      <DrawerAppContent>
        {Content && <Content openNav={openNav} />}
      </DrawerAppContent>
    </div>
  );
};

export default Content;
