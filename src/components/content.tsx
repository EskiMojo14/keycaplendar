import { useEffect, useState } from "react";
import type { HTMLAttributes } from "react";
import { DrawerAppContent } from "@rmwc/drawer";
import classNames from "classnames";
import { Route, Switch } from "react-router-dom";
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
import { useAppSelector } from "@h";
import useBottomNav from "@h/use-bottom-nav";
import useDevice from "@h/use-device";
import usePage from "@h/use-page";
import { mainPages } from "@s/common/constants";
import { selectUser } from "@s/user";
import { arrayIncludes, closeModal, openModal } from "@s/util/functions";
import "./content.scss";

type ContentProps = HTMLAttributes<HTMLDivElement>;

export const Content = ({ className, ...props }: ContentProps) => {
  const device = useDevice();

  const bottomNav = useBottomNav();

  const user = useAppSelector(selectUser);

  const page = usePage();

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
        <Switch>
          <Route path={mainPages.map((page) => `/${page}`)}>
            <ContentMain openNav={openNav} />
          </Route>
          <Route path="/statistics">
            <ContentStatistics openNav={openNav} />
          </Route>
          <Route path="/history">
            <ContentHistory openNav={openNav} />
          </Route>
          {user.isAdmin && (
            <Route path="/audit">
              <ContentAudit openNav={openNav} />
            </Route>
          )}
          {user.isAdmin && (
            <Route path="/users">
              <ContentUsers openNav={openNav} />
            </Route>
          )}
          {user.isAdmin && (
            <Route path="/images">
              <ContentImages openNav={openNav} />
            </Route>
          )}
          <Route path="/guides">
            <ContentGuides openNav={openNav} />
          </Route>
          <Route path="/updates">
            <ContentUpdates openNav={openNav} />
          </Route>
          <Route path="/settings">
            <ContentSettings openNav={openNav} />
          </Route>
          <Route exact path="/">
            <ContentMain openNav={openNav} />
          </Route>
        </Switch>
      </DrawerAppContent>
    </div>
  );
};

export default Content;
