import React, { useEffect, useState } from "react";
import moment from "moment";
import classNames from "classnames";
import firebase from "../../firebase";
import isEqual from "lodash.isequal";
import { useAppSelector } from "../../app/hooks";
import { selectDevice } from "../common/commonSlice";
import { selectBottomNav } from "../settings/settingsSlice";
import { queue } from "../../app/snackbarQueue";
import { auditProperties } from "../../util/constants";
import { Keyset } from "../../util/constructors";
import { openModal, closeModal, hasKey, alphabeticalSortProp, mergeObject } from "../../util/functions";
import { ActionType } from "../../util/types";
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
  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);

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

  const [actions, setActions] = useState<{
    allActions: ActionType[];
    filteredActions: ActionType[];
  }>({
    allActions: [],
    filteredActions: [],
  });
  const [filterInfo, setFilterInfo] = useState({
    filterAction: "none",
    filterUser: "all",
    length: 50,
    users: [{ label: "All", value: "all" }],
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<ActionType>(blankAction);
  const [loading, setLoading] = useState(false);

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
    if (hasKey(filterInfo, prop)) {
      setFilterInfo((filterInfo) => mergeObject(filterInfo, { [prop]: e.target.value }));
      filterActions(
        actions.allActions,
        prop === "filterAction" ? e.target.value : filterInfo.filterAction,
        prop === "filterUser" ? e.target.value : filterInfo.filterUser
      );
    }
  };
  const getActions = (num = filterInfo.length) => {
    setLoading(true);
    setFilterInfo((filterInfo) => mergeObject(filterInfo, { length: num }));
    const db = firebase.firestore();
    db.collection("changelog")
      .orderBy("timestamp", "desc")
      .limit(num)
      .get()
      .then((querySnapshot) => {
        const actions: ActionType[] = [];
        const users = [{ label: "All", value: "all" }];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          data.action =
            data.before && data.before.profile ? (data.after && data.after.profile ? "updated" : "deleted") : "created";
          data.changelogId = doc.id;
          actions.push(data as ActionType);
          if (!users.map((user) => user.value).includes(data.user.nickname)) {
            users.push({ label: data.user.nickname, value: data.user.nickname });
          }
        });

        alphabeticalSortProp(actions, "timestamp", true);

        setFilterInfo((filterInfo) => mergeObject(filterInfo, { users: users }));

        processActions(actions);

        setActions((prevActions) => mergeObject(prevActions, { allActions: actions }));
      })
      .catch((error) => {
        queue.notify({ title: "Error getting data: " + error });
        setLoading(false);
      });
  };
  useEffect(getActions, []);

  const processActions = (actions: ActionType[]) => {
    const processedActions: ActionType[] = [...actions].map((action) => {
      const { before, after, ...restAction } = action;
      if (before && after) {
        auditProperties.forEach((prop) => {
          const beforeProp = before[prop];
          const afterProp = after[prop];
          if (isEqual(beforeProp, afterProp) && prop !== "profile" && prop !== "colorway") {
            delete before[prop];
            delete after[prop];
          }
        });
      }
      return {
        ...restAction,
        before,
        after,
      };
    });

    filterActions(processedActions);
  };

  const filterActions = (
    allActions = actions.allActions,
    filterAction = filterInfo.filterAction,
    filterUser = filterInfo.filterUser
  ) => {
    let filteredActions = [...allActions];

    if (filterAction !== "none") {
      filteredActions = filteredActions.filter((action) => {
        return action.action === filterAction;
      });
    }

    if (filterUser !== "all") {
      filteredActions = filteredActions.filter((action) => {
        return action.user.nickname === filterUser;
      });
    }

    setActions((actions) => mergeObject(actions, { filteredActions: filteredActions }));
    setLoading(false);
  };
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
            <TopAppBarTitle>Audit Log</TopAppBarTitle>
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
            filterAction={filterInfo.filterAction}
            filterUser={filterInfo.filterUser}
            users={filterInfo.users}
            auditLength={filterInfo.length}
            getActions={getActions}
          />
          <ConditionalWrapper
            condition={device === "desktop"}
            wrapper={(children) => <DrawerAppContent>{children}</DrawerAppContent>}
          >
            <div className="admin-main">
              <div className="log-container">
                <Card className={classNames("log", { placeholder: actions.filteredActions.length === 0 })}>
                  <List twoLine className="three-line">
                    {actions.filteredActions.map((action) => {
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
