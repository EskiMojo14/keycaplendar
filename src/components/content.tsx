import { useState } from "react";
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
import { mainPages, routes } from "@s/router/constants";
import { selectUser } from "@s/user";
import { arrayIncludes } from "@s/util/functions";
import "./content.scss";

type ContentProps = HTMLAttributes<HTMLDivElement>;

export const Content = ({ className, ...props }: ContentProps) => {
  const device = useDevice();

  const bottomNav = useBottomNav();

  const user = useAppSelector(selectUser);

  const page = usePage();

  const [navOpen, setNavOpen] = useState(device === "desktop");
  const openNav = () => {
    setNavOpen(true);
  };
  const closeNav = () => setNavOpen(false);

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
          <Route path={routes.statistics}>
            <ContentStatistics openNav={openNav} />
          </Route>
          <Route path={routes.history}>
            <ContentHistory openNav={openNav} />
          </Route>
          {user.isAdmin && (
            <Route path={routes.audit}>
              <ContentAudit openNav={openNav} />
            </Route>
          )}
          {user.isAdmin && (
            <Route path={routes.users}>
              <ContentUsers openNav={openNav} />
            </Route>
          )}
          {user.isAdmin && (
            <Route path={routes.images}>
              <ContentImages openNav={openNav} />
            </Route>
          )}
          <Route path={routes.guides}>
            <ContentGuides openNav={openNav} />
          </Route>
          <Route path={routes.updates}>
            <ContentUpdates openNav={openNav} />
          </Route>
          <Route path={routes.settings}>
            <ContentSettings openNav={openNav} />
          </Route>
          <Route path={mainPages.map((page) => routes[page])}>
            <ContentMain openNav={openNav} />
          </Route>
        </Switch>
      </DrawerAppContent>
    </div>
  );
};

export default Content;
