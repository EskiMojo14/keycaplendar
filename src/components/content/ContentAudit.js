import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import firebase from "../../firebase";
import { DeviceContext } from "../../util/contexts";
import { openModal, closeModal } from "../../util/functions";
import { queueTypes } from "../../util/propTypeTemplates";
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

export class ContentAudit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      actions: [],
      actionsFiltered: [],
      filterAction: "none",
      filterUser: "all",
      length: 50,
      filterOpen: false,
      deleteOpen: false,
      deleteAction: {
        action: "",
        changelogId: "",
        documentId: "",
        timestamp: "",
        user: {
          displayName: "",
          email: "",
          nickname: "",
        },
      },
      users: [{ label: "All", value: "all" }],
      loading: false,
    };
  }
  componentDidMount() {
    this.getActions();
  }
  toggleLoading = () => {
    this.setState({
      loading: !this.state.loading,
    });
  };
  toggleFilter = () => {
    if (this.state.filterOpen && this.context !== "desktop") {
      closeModal();
    } else if (this.context !== "desktop") {
      openModal();
    }
    this.setState({
      filterOpen: !this.state.filterOpen,
    });
  };
  closeFilter = () => {
    if (this.context !== "desktop") {
      closeModal();
    }
    this.setState({
      filterOpen: false,
    });
  };
  openDelete = (action) => {
    this.setState({
      deleteOpen: true,
      deleteAction: action,
    });
  };
  closeDelete = () => {
    this.setState({
      deleteOpen: false,
    });
    setTimeout(() => {
      this.setState({
        deleteAction: {
          action: "",
          changelogId: "",
          documentId: "",
          timestamp: "",
          user: {
            displayName: "",
            email: "",
            nickname: "",
          },
        },
      });
    }, 100);
  };
  handleFilterChange = (e, prop) => {
    this.setState({
      [prop]: e.target.value,
    });
    this.filterActions(
      this.state.action,
      prop === "filterAction" ? e.target.value : this.state.filterAction,
      prop === "filterUser" ? e.target.value : this.state.filterUser
    );
  };
  getActions = (num = this.state.length) => {
    if (!this.loading) {
      this.toggleLoading();
    }
    this.setState({ length: num });
    const db = firebase.firestore();
    db.collection("changelog")
      .orderBy("timestamp", "desc")
      .limit(parseInt(num))
      .get()
      .then((querySnapshot) => {
        let actions = [];
        let users = [{ label: "All", value: "all" }];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          data.action =
            data.before && data.before.profile ? (data.after && data.after.profile ? "updated" : "deleted") : "created";
          data.changelogId = doc.id;
          actions.push(data);
          if (!users.map((user) => user.value).includes(data.user.nickname)) {
            users.push({ label: data.user.nickname, value: data.user.nickname });
          }
        });

        actions.sort(function (a, b) {
          var x = a.timestamp.toLowerCase();
          var y = b.timestamp.toLowerCase();
          if (x < y) {
            return 1;
          }
          if (x > y) {
            return -1;
          }
          return 0;
        });
        this.setState({
          actions: actions,
          users: users,
        });

        this.filterActions(actions);
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error getting data: " + error });
        if (this.loading) {
          this.toggleLoading();
        }
      });
  };

  filterActions = (
    actions = this.state.actions,
    filterAction = this.state.filterAction,
    filterUser = this.state.filterUser
  ) => {
    let filteredActions = [...actions];

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

    this.setState({
      actionsFiltered: filteredActions,
    });
    if (this.state.loading) {
      this.toggleLoading();
    }
  };
  deleteAction = (action) => {
    const db = firebase.firestore();
    db.collection("changelog")
      .doc(action.changelogId)
      .delete()
      .then(() => {
        this.props.snackbarQueue.notify({ title: "Successfully deleted changelog entry." });
        this.getActions();
        this.closeDelete();
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error deleting changelog entry: " + error });
        this.closeDelete();
      });
  };
  render() {
    const properties = [
      "profile",
      "colorway",
      "designer",
      "icDate",
      "details",
      "gbMonth",
      "gbLaunch",
      "gbEnd",
      "image",
      "shipped",
      "vendors",
      "sales",
    ];
    const refreshButton = this.state.loading ? (
      <CircularProgress />
    ) : (
      <Tooltip enterDelay={500} content="Refresh" align="bottom">
        <TopAppBarActionItem
          icon="refresh"
          onClick={() => {
            this.getActions();
          }}
        />
      </Tooltip>
    );
    return (
      <>
        <TopAppBar fixed className={{ "bottom-app-bar": this.props.bottomNav }}>
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="menu" onClick={this.props.openNav} />
              <TopAppBarTitle>Audit Log</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd>
              <Tooltip enterDelay={500} content="Filter" align="bottom">
                <TopAppBarActionItem icon="filter_list" onClick={this.toggleFilter} />
              </Tooltip>
              {refreshButton}
            </TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        {this.props.bottomNav ? null : <TopAppBarFixedAdjust />}
        <div
          className={classNames("content-container", {
            "drawer-open": this.state.filterOpen && this.context === "desktop",
          })}
        >
          <div className="main extended-app-bar">
            <DrawerAuditFilter
              open={this.state.filterOpen}
              close={this.closeFilter}
              handleFilterChange={this.handleFilterChange}
              filterAction={this.state.filterAction}
              filterUser={this.state.filterUser}
              users={this.state.users}
              auditLength={this.state.length}
              getActions={this.getActions}
            />
            <ConditionalWrapper
              condition={this.context === "desktop"}
              wrapper={(children) => <DrawerAppContent>{children}</DrawerAppContent>}
            >
              <div className="admin-main">
                <div className="log-container">
                  <Card className={classNames("log", { placeholder: this.state.actionsFiltered.length === 0 })}>
                    <List twoLine className="three-line">
                      {this.state.actionsFiltered.map((action) => {
                        return (
                          <AuditEntry
                            key={action.timestamp}
                            action={action}
                            openDeleteDialog={this.openDelete}
                            properties={properties}
                          />
                        );
                      })}
                    </List>
                  </Card>
                </div>
              </div>
            </ConditionalWrapper>
            <DialogAuditDelete
              open={this.state.deleteOpen}
              close={this.closeDelete}
              deleteAction={this.state.deleteAction}
              deleteActionFn={this.deleteAction}
            />
          </div>
        </div>
        <Footer />
        {this.props.bottomNav ? <TopAppBarFixedAdjust /> : null}
      </>
    );
  }
}
export default ContentAudit;

ContentAudit.contextType = DeviceContext;

ContentAudit.propTypes = {
  bottomNav: PropTypes.bool,
  openNav: PropTypes.func,
  snackbarQueue: PropTypes.shape(queueTypes),
};
