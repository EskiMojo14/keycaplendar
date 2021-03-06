import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import classNames from "classnames";
import { typedFirestore } from "@s/firebase/firestore";
import { ChangelogId } from "@s/firebase/types";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import {
  selectAllActions,
  selectFilteredActions,
  selectLoading,
  setFilterAction,
  setFilterUser,
} from "@s/audit/auditSlice";
import { getActions, filterActions } from "@s/audit/functions";
import { ActionType } from "@s/audit/types";
import { selectDevice } from "@s/common/commonSlice";
import { pageTitle } from "@s/common/constants";
import { arrayIncludes, closeModal, openModal } from "@s/common/functions";
import { Keyset } from "@s/main/constructors";
import { selectBottomNav } from "@s/settings/settingsSlice";
import { queue } from "~/app/snackbarQueue";
import { Card } from "@rmwc/card";
import { CircularProgress } from "@rmwc/circular-progress";
import { DrawerAppContent } from "@rmwc/drawer";
import { List } from "@rmwc/list";
import { Tooltip } from "@rmwc/tooltip";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { DrawerAuditFilter } from "@c/audit/DrawerAuditFilter";
import { DialogAuditDelete } from "@c/audit/DialogAuditDelete";
import { AuditEntry } from "@c/audit/AuditEntry";
import { Footer } from "@c/common/Footer";
import { ConditionalWrapper } from "@c/util/ConditionalWrapper";
import "./ContentAudit.scss";

type ContentAuditProps = {
  openNav: () => void;
};

export const ContentAudit = (props: ContentAuditProps) => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);

  const loading = useAppSelector(selectLoading);
  const allAuditActions = useAppSelector(selectAllActions);
  const filteredActions = useAppSelector(selectFilteredActions);

  const blankAction: ActionType = {
    before: new Keyset(),
    after: new Keyset(),
    action: "created",
    changelogId: "",
    documentId: "",
    timestamp: "",
    user: {
      displayName: "",
      email: "",
      nickname: "",
    },
  };
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<ActionType>(blankAction);

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
  const openDelete = (action: ActionType) => {
    setDeleteOpen(true);
    setDeleteAction(action);
  };
  const closeDelete = () => {
    setDeleteOpen(false);
    setTimeout(() => {
      setDeleteAction(blankAction);
    }, 100);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, prop: string) => {
    if (prop === "filterUser") {
      dispatch(setFilterUser(e.target.value));
      filterActions();
    } else if (
      prop === "filterAction" &&
      arrayIncludes(["none", "created", "updated", "deleted"] as const, e.target.value)
    ) {
      dispatch(setFilterAction(e.target.value));
      filterActions();
    }
  };

  useEffect(() => {
    if (allAuditActions.length === 0) {
      getActions();
    }
  }, []);

  const deleteActionFn = (action: ActionType) => {
    typedFirestore
      .collection("changelog")
      .doc(action.changelogId as ChangelogId)
      .delete()
      .then(() => {
        queue.notify({ title: "Successfully deleted changelog entry." });
        getActions();
        closeDelete();
      })
      .catch((error) => {
        queue.notify({ title: "Error deleting changelog entry: " + error });
        closeDelete();
      });
  };

  const refreshButton = loading ? (
    <CircularProgress />
  ) : (
    <Tooltip enterDelay={500} content="Refresh" align="bottom">
      <TopAppBarActionItem
        icon="refresh"
        onClick={() => {
          getActions();
        }}
      />
    </Tooltip>
  );

  return (
    <>
      <TopAppBar fixed className={classNames({ "bottom-app-bar": bottomNav })}>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>{pageTitle.audit}</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>
            <Tooltip enterDelay={500} content="Filter" align="bottom">
              <TopAppBarActionItem icon="filter_list" onClick={toggleFilter} />
            </Tooltip>
            {refreshButton}
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div
        className={classNames("content-container", {
          "drawer-open": filterOpen && device === "desktop",
        })}
      >
        <div className="main extended-app-bar">
          <DrawerAuditFilter open={filterOpen} close={closeFilter} handleFilterChange={handleFilterChange} />
          <ConditionalWrapper
            condition={device === "desktop"}
            wrapper={(children) => <DrawerAppContent>{children}</DrawerAppContent>}
          >
            <div className="admin-main">
              <div className="log-container">
                <Card className={classNames("log", { placeholder: filteredActions.length === 0 })}>
                  <List twoLine className="three-line">
                    {filteredActions.map((action) => {
                      const timestamp = DateTime.fromISO(action.timestamp);
                      return (
                        <AuditEntry
                          key={action.timestamp}
                          action={action}
                          timestamp={timestamp}
                          openDeleteDialog={openDelete}
                        />
                      );
                    })}
                  </List>
                </Card>
              </div>
            </div>
          </ConditionalWrapper>
          <DialogAuditDelete
            open={deleteOpen}
            close={closeDelete}
            deleteAction={deleteAction}
            deleteActionFn={deleteActionFn}
          />
        </div>
      </div>
      <Footer />
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
export default ContentAudit;
