import React, { useEffect, useState } from "react";
import moment from "moment";
import classNames from "classnames";
import firebase from "../../firebase";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectAllActions,
  selectFilterAction,
  selectFilteredActions,
  selectFilterUser,
  selectLoading,
  setFilterAction,
  setFilterUser,
} from "../../app/slices/audit/auditSlice";
import { getActions, filterActions } from "../../app/slices/audit/functions";
import { ActionType } from "../../app/slices/audit/types";
import { selectDevice } from "../../app/slices/common/commonSlice";
import { pageTitle } from "../../app/slices/common/constants";
import { arrayIncludes, closeModal, openModal } from "../../app/slices/common/functions";
import { Keyset } from "../../app/slices/main/constructors";
import { selectBottomNav } from "../../app/slices/settings/settingsSlice";
import { queue } from "../../app/snackbarQueue";
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
import { DrawerAuditFilter } from "../audit/DrawerAuditFilter";
import { DialogAuditDelete } from "../audit/DialogAuditDelete";
import { AuditEntry } from "../audit/AuditEntry";
import { ConditionalWrapper } from "../util/ConditionalWrapper";
import { Footer } from "../common/Footer";
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

  const auditFilterAction = useAppSelector(selectFilterAction);
  const auditFilterUser = useAppSelector(selectFilterUser);

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
      filterActions(allAuditActions, auditFilterAction, e.target.value);
    } else if (
      prop === "filterAction" &&
      arrayIncludes(["none", "created", "updated", "deleted"] as const, e.target.value)
    ) {
      dispatch(setFilterAction(e.target.value));
      filterActions(allAuditActions, e.target.value, auditFilterUser);
    }
  };

  useEffect(() => {
    if (allAuditActions.length === 0) {
      getActions();
    }
  }, []);

  const deleteActionFn = (action: ActionType) => {
    const db = firebase.firestore();
    db.collection("changelog")
      .doc(action.changelogId)
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
          <DrawerAuditFilter
            open={filterOpen}
            close={closeFilter}
            handleFilterChange={handleFilterChange}
            getActions={getActions}
          />
          <ConditionalWrapper
            condition={device === "desktop"}
            wrapper={(children) => <DrawerAppContent>{children}</DrawerAppContent>}
          >
            <div className="admin-main">
              <div className="log-container">
                <Card className={classNames("log", { placeholder: filteredActions.length === 0 })}>
                  <List twoLine className="three-line">
                    {filteredActions.map((action) => {
                      const timestamp = moment(action.timestamp);
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
