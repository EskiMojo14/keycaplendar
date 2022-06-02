import { useMemo, useState } from "react";
import { Card } from "@rmwc/card";
import { CircularProgress } from "@rmwc/circular-progress";
import { DrawerAppContent } from "@rmwc/drawer";
import { List } from "@rmwc/list";
import {
  TopAppBar,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import classNames from "classnames";
import { Footer } from "@c/common/footer";
import { ConditionalWrapper } from "@c/util/conditional-wrapper";
import { withTooltip } from "@c/util/hocs";
import { useAppSelector } from "@h";
import useBoolStates from "@h/use-bool-states";
import useBottomNav from "@h/use-bottom-nav";
import useDevice from "@h/use-device";
import {
  selectActions,
  selectFilter,
  selectLength,
  useGetActionsQuery,
} from "@s/audit";
import { filterActions } from "@s/audit/functions";
import { pageTitle } from "@s/router/constants";
import { AuditEntry } from "./audit-entry";
import { DrawerAuditFilter } from "./drawer-audit-filter";
import "./index.scss";

type ContentAuditProps = {
  openNav: () => void;
};

export const ContentAudit = ({ openNav }: ContentAuditProps) => {
  const length = useAppSelector(selectLength);
  const {
    actions = [],
    isFetching,
    refetch,
  } = useGetActionsQuery(length, {
    selectFromResult: ({ data, isFetching }) => ({
      actions: data && selectActions(data),
      isFetching,
    }),
  });

  const device = useDevice();
  const bottomNav = useBottomNav();

  const filter = useAppSelector(selectFilter);
  const filteredActions = useMemo(
    () => filterActions(actions, filter),
    [actions, filter]
  );

  const [filterOpen, setFilterOpen] = useState(false);
  const [closeFilter, , toggleFilter] = useBoolStates(
    setFilterOpen,
    "setFilterOpen"
  );

  const refreshButton = isFetching ? (
    <CircularProgress />
  ) : (
    withTooltip(
      <TopAppBarActionItem icon="refresh" onClick={refetch} />,
      "Refresh",
      { align: bottomNav ? "top" : "bottom" }
    )
  );

  return (
    <>
      <TopAppBar className={classNames({ "bottom-app-bar": bottomNav })} fixed>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={openNav} />
            <TopAppBarTitle>{pageTitle.audit}</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>
            {withTooltip(
              <TopAppBarActionItem icon="filter_list" onClick={toggleFilter} />,
              "Filter"
            )}
            {refreshButton}
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      {!bottomNav && <TopAppBarFixedAdjust />}
      <div
        className={classNames("content-container", {
          "drawer-open": filterOpen && device === "desktop",
        })}
      >
        <div className="main extended-app-bar">
          <DrawerAuditFilter close={closeFilter} open={filterOpen} />
          <ConditionalWrapper
            condition={device === "desktop"}
            wrapper={(children) => (
              <DrawerAppContent>{children}</DrawerAppContent>
            )}
          >
            <div className="admin-main">
              <div className="log-container">
                <Card
                  className={classNames("log", {
                    placeholder: filteredActions.length === 0,
                  })}
                >
                  <List className="three-line" twoLine>
                    {filteredActions.map((actionId) => (
                      <AuditEntry key={actionId} actionId={actionId} />
                    ))}
                  </List>
                </Card>
              </div>
            </div>
          </ConditionalWrapper>
        </div>
      </div>
      <Footer />
      {bottomNav && <TopAppBarFixedAdjust />}
    </>
  );
};

export default ContentAudit;
