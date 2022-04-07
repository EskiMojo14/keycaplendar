import { useEffect, useMemo, useState } from "react";
import type { EntityId } from "@reduxjs/toolkit";
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
import { useAppSelector } from "~/app/hooks";
import { Footer } from "@c/common/footer";
import { ConditionalWrapper } from "@c/util/conditional-wrapper";
import { withTooltip } from "@c/util/hocs";
import {
  selectActions,
  selectActionTotal,
  selectFilter,
  selectLoading,
} from "@s/audit";
import { filterActions, getActions } from "@s/audit/functions";
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
import { selectBottomNav } from "@s/settings";
import { closeModal, openModal } from "@s/util/functions";
import { AuditEntry } from "./audit-entry";
import { DialogAuditDelete } from "./dialog-audit-delete";
import { DrawerAuditFilter } from "./drawer-audit-filter";
import "./index.scss";

type ContentAuditProps = {
  openNav: () => void;
};

export const ContentAudit = ({ openNav }: ContentAuditProps) => {
  const total = useAppSelector(selectActionTotal);

  useEffect(() => {
    if (total === 0) {
      getActions();
    }
  }, []);

  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);

  const loading = useAppSelector(selectLoading);
  const actions = useAppSelector(selectActions);
  const filter = useAppSelector(selectFilter);
  const filteredActions = useMemo(
    () => filterActions(actions, filter),
    [actions, filter]
  );

  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<EntityId>("");

  const toggleFilter = () => {
    if (filterOpen && device !== "desktop") {
      closeModal();
    } else if (device !== "desktop") {
      openModal();
    }
    setFilterOpen((filterOpen) => !filterOpen);
  };
  const closeFilter = () => {
    if (device !== "desktop") {
      closeModal();
    }
    setFilterOpen(false);
  };
  const openDelete = (action: EntityId) => {
    setDeleteOpen(true);
    setDeleteAction(action);
  };
  const closeDelete = () => {
    setDeleteOpen(false);
    setTimeout(() => {
      setDeleteAction("");
    }, 100);
  };

  const refreshButton = loading ? (
    <CircularProgress />
  ) : (
    withTooltip(
      <TopAppBarActionItem icon="refresh" onClick={() => getActions()} />,
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
                      <AuditEntry
                        key={actionId}
                        actionId={actionId}
                        openDeleteDialog={openDelete}
                      />
                    ))}
                  </List>
                </Card>
              </div>
            </div>
          </ConditionalWrapper>
          <DialogAuditDelete
            close={closeDelete}
            deleteAction={deleteAction}
            open={deleteOpen}
          />
        </div>
      </div>
      <Footer />
      {bottomNav && <TopAppBarFixedAdjust />}
    </>
  );
};
export default ContentAudit;
