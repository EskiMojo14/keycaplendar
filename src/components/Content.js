import React from "react";
import PropTypes from "prop-types";
import firebase from "firebase";
import {
  userTypes,
  setTypes,
  whitelistTypes,
  statisticsTypes,
  statisticsSortTypes,
  queueTypes,
} from "./util/propTypeTemplates";
import { DesktopAppBar, TabletAppBar, MobileAppBar, BottomAppBar, BottomAppBarIndent } from "./app_bar/AppBar";
import { DrawerAppContent } from "@rmwc/drawer";
import { DrawerNav } from "./common/DrawerNav";
import { Fab } from "@rmwc/fab";
import { ContentAudit } from "./content/ContentAudit";
import { ContentEmpty } from "./content/ContentEmpty";
import { ContentStatistics } from "./content/ContentStatistics";
import { ContentGrid } from "./content/ContentGrid";
import { ContentSettings } from "./content/ContentSettings";
import { ContentUsers } from "./content/ContentUsers";
import { DialogDelete } from "./admin/DialogDelete";
import { DialogSales } from "./common/DialogSales";
import { DialogStatistics } from "./statistics/DialogStatistics";
import { DialogCreate, DialogEdit } from "./admin/DialogEntry";
import { DrawerFilter } from "./common/DrawerFilter";
import { DrawerDetails } from "./common/DrawerDetails";
import { DrawerCreate, DrawerEdit } from "./admin/DrawerEntry";
import { DrawerAuditFilter } from "./admin/audit_log/DrawerAuditFilter";
import { DialogAuditDelete } from "./admin/audit_log/DialogAuditDelete";
import { SnackbarDeleted } from "./admin/SnackbarDeleted";
import { SearchAppBar } from "./app_bar/SearchBar";
import { Footer } from "./common/Footer";
import "./Content.scss";

const bodyScroll = require("body-scroll-toggle");

export class DesktopContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navDrawerOpen: true,
      filterDrawerOpen: false,
      detailsDrawerOpen: false,
      detailSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      salesDialogOpen: false,
      salesSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      createDrawerOpen: false,
      editDrawerOpen: false,
      editSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      deleteDialogOpen: false,
      deleteSnackbarOpen: false,
      deleteSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      auditActions: [],
      auditActionsFiltered: [],
      auditFilterAction: "none",
      auditFilterUser: "all",
      auditLength: 50,
      auditFilterDrawerOpen: false,
      auditDeleteDialogOpen: false,
      auditDeleteAction: {
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
      auditUsers: [{ label: "All", value: "all" }],
      userView: "table",
      userSort: "nickname",
      userReverseSort: false,
    };
  }
  openModal = () => {
    if (window.scrollY > 0) {
      document.querySelector("body").classList.add("scrolled");
    }
    bodyScroll.disable();
  };
  closeModal = () => {
    setTimeout(() => {
      document.querySelector("body").classList.remove("scrolled");
    }, 20);
    bodyScroll.enable();
  };
  openNavDrawer = () => {
    this.setState({ navDrawerOpen: true });
  };
  closeNavDrawer = () => {
    this.setState({ navDrawerOpen: false });
  };
  toggleFilterDrawer = () => {
    if (this.state.detailsDrawerOpen) {
      this.closeDetailsDrawer();
      setTimeout(() => {
        if (this.props.view === "compact") {
          this.openModal();
        }
        this.setState({ filterDrawerOpen: !this.state.filterDrawerOpen });
      }, 400);
    } else {
      if (this.props.view === "compact") {
        this.openModal();
      }
      this.setState({ filterDrawerOpen: !this.state.filterDrawerOpen });
    }
  };
  closeFilterDrawer = () => {
    if (this.props.view === "compact") {
      this.closeModal();
    }
    this.setState({ filterDrawerOpen: false });
  };
  openDetailsDrawer = (set) => {
    if (this.state.filterDrawerOpen) {
      this.closeFilterDrawer();
      setTimeout(() => {
        if (this.props.view === "compact") {
          this.openModal();
        }
        this.setState({
          detailsDrawerOpen: true,
          detailSet: set,
        });
      }, 400);
    } else {
      if (this.props.view === "compact") {
        this.openModal();
      }
      this.setState({
        detailsDrawerOpen: true,
        detailSet: set,
      });
    }
  };
  closeDetailsDrawer = () => {
    if (this.props.view === "compact") {
      this.closeModal();
    }
    this.setState({
      detailsDrawerOpen: false,
    });
    setTimeout(() => {
      this.setState({
        detailSet: {
          colorway: "",
          designer: [""],
          details: "",
          icDate: "",
          id: "",
          image: "",
          profile: "",
        },
      });
    }, 250);
  };
  openSalesDialog = (set) => {
    if (this.props.view !== "compact") {
      this.openModal();
    }
    this.setState({
      salesDialogOpen: true,
      salesSet: set,
    });
  };
  closeSalesDialog = () => {
    if (this.props.view !== "compact") {
      this.closeModal();
    }
    this.setState({
      salesDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        salesSet: {
          colorway: "",
          designer: [""],
          details: "",
          icDate: "",
          id: "",
          image: "",
          profile: "",
        },
      });
    }, 250);
  };
  openCreateDrawer = () => {
    this.openModal();
    this.setState({ createDrawerOpen: true });
  };
  closeCreateDrawer = () => {
    this.closeModal();
    this.setState({ createDrawerOpen: false });
  };
  openDeleteDialog = (set) => {
    this.closeDetailsDrawer();
    setTimeout(() => {
      this.openModal();
      this.setState({
        deleteDialogOpen: true,
        deleteSet: set,
      });
    }, 200);
  };
  closeDeleteDialog = () => {
    this.closeModal();
    this.setState({ deleteDialogOpen: false });
  };
  openDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: true });
  };
  closeDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: false });
  };
  openEditDrawer = (set) => {
    this.openModal();
    this.setState({
      editDrawerOpen: true,
      editSet: set,
    });
  };
  closeEditDrawer = () => {
    this.closeModal();
    this.setState({
      editDrawerOpen: false,
      editSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
    });
  };
  openAuditDeleteDialog = (action) => {
    this.setState({
      auditDeleteDialogOpen: true,
      auditDeleteAction: action,
    });
  };
  closeAuditDeleteDialog = () => {
    this.setState({
      auditDeleteDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        auditDeleteAction: {
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
  toggleAuditFilterDrawer = () => {
    this.setState({
      auditFilterDrawerOpen: !this.state.auditFilterDrawerOpen,
    });
  };
  closeAuditFilterDrawer = () => {
    this.setState({
      auditFilterDrawerOpen: false,
    });
  };
  handleAuditFilterChange = (e, prop) => {
    this.setState({
      ["audit" + prop.charAt(0).toUpperCase() + prop.slice(1)]: e.target.value,
    });

    this.filterAuditActions(
      this.state.action,
      prop === "filterAction" ? e.target.value : this.state.auditFilterAction,
      prop === "filterUser" ? e.target.value : this.state.auditFilterUser
    );
  };
  getAuditActions = (num = this.state.auditLength) => {
    if (!this.props.loading) {
      this.props.toggleLoading();
    }
    this.setState({ auditLength: num });
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
          data.action = data.before ? (data.after.profile ? "updated" : "deleted") : "created";
          data.changelogId = doc.id;
          actions.push(data);
          if (users.filter((e) => e.value === data.user.nickname).length === 0) {
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
          auditActions: actions,
          auditUsers: users,
        });

        this.filterAuditActions(actions);
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error getting data: " + error });
        if (this.props.loading) {
          this.props.toggleLoading();
        }
      });
  };

  filterAuditActions = (
    actions = this.state.auditActions,
    filterAction = this.state.auditFilterAction,
    filterUser = this.state.auditFilterUser
  ) => {
    let filteredActions = actions;

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
      auditActionsFiltered: filteredActions,
    });
    if (this.props.loading) {
      this.props.toggleLoading();
    }
  };
  deleteAuditAction = (action) => {
    const db = firebase.firestore();
    db.collection("changelog")
      .doc(action.changelogId)
      .delete()
      .then(() => {
        this.props.snackbarQueue.notify({ title: "Successfully deleted changelog entry." });
        this.getAuditActions();
        this.closeAuditDeleteDialog();
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error deleting changelog entry: " + error });
        this.closeAuditDeleteDialog();
      });
  };
  setUserView = (index) => {
    const views = ["card", "table"];
    this.setState({
      userView: views[index],
    });
  };
  setUserSort = (sort) => {
    let reverseSort;
    if (sort === this.state.userSort) {
      reverseSort = !this.state.userReverseSort;
    } else {
      reverseSort = false;
    }
    this.setState({
      userSort: sort,
      userReverseSort: reverseSort,
    });
  };
  setUserSortIndex = (index) => {
    const props = ["displayName", "email", "nickname"];
    this.setState({
      userSort: props[index],
      userReverseSort: false,
    });
  };
  componentDidUpdate(prevProps) {
    if (
      this.props.page !== prevProps.page &&
      (this.props.page === "statistics" ||
        this.props.page === "audit" ||
        this.props.page === "users" ||
        this.props.page === "settings")
    ) {
      if (this.state.filterDrawerOpen) {
        this.closeFilterDrawer();
      }
      if (this.state.detailsDrawerOpen) {
        this.closeDetailsDrawer();
      }
    }
    if (this.props.page !== prevProps.page && prevProps.page === "audit" && this.state.auditFilterDrawerOpen) {
      this.closeAuditFilterDrawer();
    }
  }
  render() {
    const content = this.props.content ? (
      <ContentGrid
        groups={this.props.groups}
        sets={this.props.sets}
        sort={this.props.sort}
        page={this.props.page}
        view={this.props.view}
        details={this.openDetailsDrawer}
        closeDetails={this.closeDetailsDrawer}
        detailSet={this.state.detailSet}
        edit={this.openEditDrawer}
        delete={this.openDeleteDialog}
        user={this.props.user}
      />
    ) : this.props.page === "statistics" ? (
      <ContentStatistics
        profiles={this.props.profiles}
        sets={this.props.allSets}
        navOpen={this.state.navDrawerOpen}
        statistics={this.props.statistics}
        statisticsTab={this.props.statisticsTab}
        statisticsSort={this.props.statisticsSort}
        setStatisticsSort={this.props.setStatisticsSort}
        allDesigners={this.props.allDesigners}
        allVendors={this.props.allVendors}
      />
    ) : this.props.page === "audit" && this.props.user.isAdmin ? (
      <ContentAudit
        loading={this.props.loading}
        actions={this.state.auditActionsFiltered}
        getActions={this.getAuditActions}
        snackbarQueue={this.props.snackbarQueue}
        openDeleteDialog={this.openAuditDeleteDialog}
      />
    ) : this.props.page === "users" && this.props.user.isAdmin ? (
      <ContentUsers
        loading={this.props.loading}
        toggleLoading={this.props.toggleLoading}
        user={this.props.user}
        device={this.props.device}
        view={this.state.userView}
        sort={this.state.userSort}
        setSort={this.setUserSort}
        reverseSort={this.state.userReverseSort}
        allDesigners={this.props.allDesigners}
        snackbarQueue={this.props.snackbarQueue}
      />
    ) : this.props.page === "settings" ? (
      <ContentSettings
        device={this.props.device}
        user={this.props.user}
        setUser={this.props.setUser}
        lightTheme={this.props.lightTheme}
        setLightTheme={this.props.setLightTheme}
        darkTheme={this.props.darkTheme}
        setDarkTheme={this.props.setDarkTheme}
        applyTheme={this.props.applyTheme}
        setApplyTheme={this.props.setApplyTheme}
        manualTheme={this.props.manualTheme}
        setManualTheme={this.props.setManualTheme}
        fromTimeTheme={this.props.fromTimeTheme}
        setFromTimeTheme={this.props.setFromTimeTheme}
        toTimeTheme={this.props.toTimeTheme}
        setToTimeTheme={this.props.setToTimeTheme}
        density={this.props.density}
        setDensity={this.props.setDensity}
        snackbarQueue={this.props.snackbarQueue}
      />
    ) : (
      <ContentEmpty />
    );
    const editorElements =
      (this.props.user.isEditor || this.props.user.isDesigner) &&
      this.props.page !== "statistics" &&
      this.props.page !== "audit" &&
      this.props.page !== "users" &&
      this.props.page !== "settings" ? (
        <div className="editor-elements">
          <Fab className="create-fab" icon="add" label="Create" onClick={this.openCreateDrawer} />
          <DrawerCreate
            open={this.state.createDrawerOpen}
            close={this.closeCreateDrawer}
            user={this.props.user}
            profiles={this.props.profiles}
            allDesigners={this.props.allDesigners}
            allVendors={this.props.allVendors}
            allRegions={this.props.allRegions}
            getData={this.props.getData}
            snackbarQueue={this.props.snackbarQueue}
          />
          <DrawerEdit
            open={this.state.editDrawerOpen}
            close={this.closeEditDrawer}
            user={this.props.user}
            profiles={this.props.profiles}
            allDesigners={this.props.allDesigners}
            allVendors={this.props.allVendors}
            allRegions={this.props.allRegions}
            set={this.state.editSet}
            getData={this.props.getData}
            snackbarQueue={this.props.snackbarQueue}
          />
          {this.props.user.isEditor ? (
            <>
              <DialogDelete
                open={this.state.deleteDialogOpen}
                close={this.closeDeleteDialog}
                set={this.state.deleteSet}
                openSnackbar={this.openDeleteSnackbar}
                getData={this.props.getData}
                snackbarQueue={this.props.snackbarQueue}
                user={this.props.user}
              />
              <SnackbarDeleted
                open={this.state.deleteSnackbarOpen}
                close={this.closeDeleteSnackbar}
                set={this.state.deleteSet}
                getData={this.props.getData}
                snackbarQueue={this.props.snackbarQueue}
              />
            </>
          ) : null}
        </div>
      ) : null;
    const auditFilterDrawer =
      this.props.page === "audit" ? (
        <DrawerAuditFilter
          open={this.state.auditFilterDrawerOpen}
          close={this.closeAuditFilterDrawer}
          device={this.props.device}
          handleFilterChange={this.handleAuditFilterChange}
          filterAction={this.state.auditFilterAction}
          filterUser={this.state.auditFilterUser}
          users={this.state.auditUsers}
          auditLength={this.state.auditLength}
          getActions={this.getAuditActions}
        />
      ) : null;
    const auditDeleteDialog =
      this.props.page === "audit" ? (
        <DialogAuditDelete
          open={this.state.auditDeleteDialogOpen}
          close={this.closeAuditDeleteDialog}
          deleteAction={this.state.auditDeleteAction}
          deleteActionFn={this.deleteAuditAction}
        />
      ) : null;
    return (
      <div className={`${this.props.className} ${this.props.page} app-container`}>
        <DrawerNav
          device={this.props.device}
          view={this.props.view}
          open={this.state.navDrawerOpen}
          close={this.closeNavDrawer}
          page={this.props.page}
          setPage={this.props.setPage}
          user={this.props.user}
        />
        <DrawerAppContent
          className={
            (this.state.detailsDrawerOpen && this.props.view !== "compact" ? "details-drawer-open " : "") +
            ((this.state.filterDrawerOpen || this.state.auditFilterDrawerOpen) && this.props.view !== "compact"
              ? "filter-drawer-open"
              : "")
          }
        >
          <DesktopAppBar
            page={this.props.page}
            loading={this.props.loading}
            openNav={this.openNavDrawer}
            toggleFilter={this.toggleFilterDrawer}
            toggleAuditFilter={this.toggleAuditFilterDrawer}
            getActions={this.getAuditActions}
            view={this.props.view}
            setView={this.props.setView}
            userView={this.state.userView}
            setUserView={this.setUserView}
            sort={this.props.sort}
            setSort={this.props.setSort}
            userSort={this.state.userSort}
            setUserSort={this.setUserSort}
            setUserSortIndex={this.setUserSortIndex}
            search={this.props.search}
            setSearch={this.props.setSearch}
            sets={this.props.sets}
            statistics={this.props.statistics}
            setStatistics={this.props.setStatistics}
            statisticsSort={this.props.statisticsSort}
            setStatisticsSort={this.props.setStatisticsSort}
            statisticsTab={this.props.statisticsTab}
            setStatisticsTab={this.props.setStatisticsTab}
          />
          <div className="content-container">
            <DrawerDetails
              device={this.props.device}
              view={this.props.view}
              user={this.props.user}
              set={this.state.detailSet}
              open={this.state.detailsDrawerOpen}
              close={this.closeDetailsDrawer}
              edit={this.openEditDrawer}
              delete={this.openDeleteDialog}
              search={this.props.search}
              setSearch={this.props.setSearch}
              toggleLichTheme={this.props.toggleLichTheme}
              openSales={this.openSalesDialog}
            />
            <DialogSales open={this.state.salesDialogOpen} close={this.closeSalesDialog} set={this.state.salesSet} />
            <DrawerFilter
              device={this.props.device}
              view={this.props.view}
              profiles={this.props.profiles}
              vendors={this.props.allVendors}
              open={this.state.filterDrawerOpen}
              close={this.closeFilterDrawer}
              setWhitelist={this.props.setWhitelist}
              whitelist={this.props.whitelist}
            />
            {auditFilterDrawer}
            <DrawerAppContent className={"main " + this.props.view + (this.props.content ? " content" : "")}>
              {content}
              <Footer />
            </DrawerAppContent>
            {editorElements}
          </div>
        </DrawerAppContent>
        {auditDeleteDialog}
      </div>
    );
  }
}
export class TabletContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navDrawerOpen: false,
      filterDrawerOpen: false,
      detailsDrawerOpen: false,
      detailSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      salesDialogOpen: false,
      salesSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      createDrawerOpen: false,
      editDrawerOpen: false,
      editSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      deleteDialogOpen: false,
      deleteSnackbarOpen: false,
      deleteSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      statisticsDialogOpen: false,
      auditActions: [],
      auditActionsFiltered: [],
      auditFilterAction: "none",
      auditFilterUser: "all",
      auditLength: 50,
      auditFilterDrawerOpen: false,
      auditDeleteDialogOpen: false,
      auditDeleteAction: {
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
      auditUsers: [{ label: "All", value: "all" }],
      userSort: "nickname",
      userReverseSort: false,
    };
  }
  openModal = () => {
    if (window.scrollY > 0) {
      document.querySelector("body").classList.add("scrolled");
    }
    bodyScroll.disable();
  };
  closeModal = () => {
    setTimeout(() => {
      document.querySelector("body").classList.remove("scrolled");
    }, 20);
    bodyScroll.enable();
  };
  openNavDrawer = () => {
    this.openModal();
    this.setState({ navDrawerOpen: true });
  };
  closeNavDrawer = () => {
    this.closeModal();
    this.setState({ navDrawerOpen: false });
  };
  openCreateDrawer = () => {
    this.openModal();
    this.setState({ createDrawerOpen: true });
  };
  closeCreateDrawer = () => {
    this.closeModal();
    this.setState({ createDrawerOpen: false });
  };
  openEditDrawer = (set) => {
    this.openModal();
    if (this.state.detailsDrawerOpen) {
      this.closeDetailsDrawer();
      this.setState({ editSet: set });
      setTimeout(() => {
        this.setState({ editDrawerOpen: !this.state.editDrawerOpen });
      }, 400);
    } else {
      this.setState({
        editDrawerOpen: !this.state.editDrawerOpen,
        editSet: set,
      });
    }
  };
  closeEditDrawer = () => {
    this.closeModal();
    this.setState({
      editDrawerOpen: false,
      editSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
    });
  };
  openDeleteDialog = (set) => {
    this.closeDetailsDrawer();
    setTimeout(() => {
      this.openModal();
      this.setState({
        deleteDialogOpen: true,
        deleteSet: set,
      });
    }, 200);
  };
  closeDeleteDialog = () => {
    this.closeModal();
    this.setState({ deleteDialogOpen: false });
  };
  openDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: true });
  };
  closeDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: false });
  };
  openFilterDrawer = () => {
    this.openModal();
    this.setState({ filterDrawerOpen: true });
  };
  closeFilterDrawer = () => {
    this.closeModal();
    this.setState({ filterDrawerOpen: false });
  };
  openDetailsDrawer = (set) => {
    this.openModal();
    this.setState({
      detailsDrawerOpen: true,
      detailSet: set,
    });
  };
  closeDetailsDrawer = () => {
    this.closeModal();
    this.setState({
      detailsDrawerOpen: false,
      detailSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
    });
  };
  openSalesDialog = (set) => {
    this.setState({
      salesDialogOpen: true,
      salesSet: set,
    });
  };
  closeSalesDialog = () => {
    this.setState({
      salesDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        salesSet: {
          colorway: "",
          designer: [""],
          details: "",
          icDate: "",
          id: "",
          image: "",
          profile: "",
        },
      });
    }, 250);
  };
  openStatisticsDialog = () => {
    this.openModal();
    this.setState({ statisticsDialogOpen: true });
  };
  closeStatisticsDialog = () => {
    this.closeModal();
    this.setState({ statisticsDialogOpen: false });
  };
  openAuditDeleteDialog = (action) => {
    this.setState({
      auditDeleteDialogOpen: true,
      auditDeleteAction: action,
    });
  };
  closeAuditDeleteDialog = () => {
    this.setState({
      auditDeleteDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        auditDeleteAction: {
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
  openAuditFilterDrawer = () => {
    this.setState({
      auditFilterDrawerOpen: !this.state.auditFilterDrawerOpen,
    });
  };
  closeAuditFilterDrawer = () => {
    this.setState({
      auditFilterDrawerOpen: false,
    });
  };
  handleAuditFilterChange = (e, prop) => {
    this.setState({
      ["audit" + prop.charAt(0).toUpperCase() + prop.slice(1)]: e.target.value,
    });

    this.filterAuditActions(
      this.state.action,
      prop === "filterAction" ? e.target.value : this.state.auditFilterAction,
      prop === "filterUser" ? e.target.value : this.state.auditFilterUser
    );
  };
  getAuditActions = (num = this.state.auditLength) => {
    if (!this.props.loading) {
      this.props.toggleLoading();
    }
    this.setState({ auditLength: num });
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
          data.action = data.before ? (data.after.profile ? "updated" : "deleted") : "created";
          data.changelogId = doc.id;
          actions.push(data);
          if (users.filter((e) => e.value === data.user.nickname).length === 0) {
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
          auditActions: actions,
          auditUsers: users,
        });

        this.filterAuditActions(actions);
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error getting data: " + error });
        if (this.props.loading) {
          this.props.toggleLoading();
        }
      });
  };

  filterAuditActions = (
    actions = this.state.auditActions,
    filterAction = this.state.auditFilterAction,
    filterUser = this.state.auditFilterUser
  ) => {
    let filteredActions = actions;

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
      auditActionsFiltered: filteredActions,
    });
    if (this.props.loading) {
      this.props.toggleLoading();
    }
  };
  deleteAuditAction = (action) => {
    const db = firebase.firestore();
    db.collection("changelog")
      .doc(action.changelogId)
      .delete()
      .then(() => {
        this.props.snackbarQueue.notify({ title: "Successfully deleted changelog entry." });
        this.getAuditActions();
        this.closeAuditDeleteDialog();
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error deleting changelog entry: " + error });
        this.closeAuditDeleteDialog();
      });
  };
  setUserSortIndex = (index) => {
    const props = ["displayName", "email", "nickname"];
    this.setState({
      userSort: props[index],
      userReverseSort: false,
    });
  };
  render() {
    const content = this.props.content ? (
      <ContentGrid
        groups={this.props.groups}
        sets={this.props.sets}
        sort={this.props.sort}
        page={this.props.page}
        view={this.props.view}
        details={this.openDetailsDrawer}
        closeDetails={this.closeDetailsDrawer}
        detailSet={this.state.detailSet}
        edit={this.openEditDrawer}
        delete={this.openDeleteDialog}
        user={this.props.user}
      />
    ) : this.props.page === "statistics" ? (
      <ContentStatistics
        profiles={this.props.profiles}
        sets={this.props.allSets}
        statistics={this.props.statistics}
        statisticsTab={this.props.statisticsTab}
        statisticsSort={this.props.statisticsSort}
        setStatisticsSort={this.props.setStatisticsSort}
        allDesigners={this.props.allDesigners}
        allVendors={this.props.allVendors}
      />
    ) : this.props.page === "audit" && this.props.user.isAdmin ? (
      <ContentAudit
        loading={this.props.loading}
        actions={this.state.auditActionsFiltered}
        getActions={this.getAuditActions}
        snackbarQueue={this.props.snackbarQueue}
        openDeleteDialog={this.openAuditDeleteDialog}
      />
    ) : this.props.page === "users" && this.props.user.isAdmin ? (
      <ContentUsers
        loading={this.props.loading}
        toggleLoading={this.props.toggleLoading}
        user={this.props.user}
        device={this.props.device}
        view={"card"}
        sort={this.state.userSort}
        setSort={this.setUserSort}
        reverseSort={this.state.userReverseSort}
        allDesigners={this.props.allDesigners}
        snackbarQueue={this.props.snackbarQueue}
      />
    ) : this.props.page === "settings" ? (
      <ContentSettings
        device={this.props.device}
        user={this.props.user}
        setUser={this.props.setUser}
        lightTheme={this.props.lightTheme}
        setLightTheme={this.props.setLightTheme}
        darkTheme={this.props.darkTheme}
        setDarkTheme={this.props.setDarkTheme}
        applyTheme={this.props.applyTheme}
        setApplyTheme={this.props.setApplyTheme}
        manualTheme={this.props.manualTheme}
        setManualTheme={this.props.setManualTheme}
        fromTimeTheme={this.props.fromTimeTheme}
        setFromTimeTheme={this.props.setFromTimeTheme}
        toTimeTheme={this.props.toTimeTheme}
        setToTimeTheme={this.props.setToTimeTheme}
        density={this.props.density}
        setDensity={this.props.setDensity}
        snackbarQueue={this.props.snackbarQueue}
      />
    ) : (
      <ContentEmpty />
    );
    const editorElements =
      (this.props.user.isEditor || this.props.user.isDesigner) &&
      this.props.page !== "statistics" &&
      this.props.page !== "audit" &&
      this.props.page !== "users" &&
      this.props.page !== "settings" ? (
        <>
          <Fab key="CreateFab" className="create-fab" icon="add" onClick={this.openCreateDrawer} />
          <DrawerCreate
            open={this.state.createDrawerOpen}
            close={this.closeCreateDrawer}
            user={this.props.user}
            profiles={this.props.profiles}
            allDesigners={this.props.allDesigners}
            allVendors={this.props.allVendors}
            allRegions={this.props.allRegions}
            getData={this.props.getData}
            snackbarQueue={this.props.snackbarQueue}
          />
          <DrawerEdit
            open={this.state.editDrawerOpen}
            close={this.closeEditDrawer}
            user={this.props.user}
            profiles={this.props.profiles}
            allDesigners={this.props.allDesigners}
            allVendors={this.props.allVendors}
            allRegions={this.props.allRegions}
            set={this.state.editSet}
            getData={this.props.getData}
            snackbarQueue={this.props.snackbarQueue}
          />
          {this.props.user.isEditor ? (
            <>
              <DialogDelete
                open={this.state.deleteDialogOpen}
                close={this.closeDeleteDialog}
                set={this.state.deleteSet}
                openSnackbar={this.openDeleteSnackbar}
                getData={this.props.getData}
                snackbarQueue={this.props.snackbarQueue}
                user={this.props.user}
              />
              <SnackbarDeleted
                open={this.state.deleteSnackbarOpen}
                close={this.closeDeleteSnackbar}
                set={this.state.deleteSet}
                getData={this.props.getData}
                snackbarQueue={this.props.snackbarQueue}
              />
            </>
          ) : null}
        </>
      ) : null;
    const statsDialog =
      this.props.page === "statistics" ? (
        <DialogStatistics
          open={this.state.statisticsDialogOpen}
          onClose={this.closeStatisticsDialog}
          statistics={this.props.statistics}
          setStatistics={this.props.setStatistics}
          statisticsTab={this.props.statisticsTab}
        />
      ) : null;
    const auditFilterDrawer =
      this.props.page === "audit" ? (
        <DrawerAuditFilter
          open={this.state.auditFilterDrawerOpen}
          close={this.closeAuditFilterDrawer}
          device={this.props.device}
          handleFilterChange={this.handleAuditFilterChange}
          filterAction={this.state.auditFilterAction}
          filterUser={this.state.auditFilterUser}
          users={this.state.auditUsers}
          auditLength={this.state.auditLength}
          getActions={this.getAuditActions}
        />
      ) : null;
    const auditDeleteDialog =
      this.props.page === "audit" ? (
        <DialogAuditDelete
          open={this.state.auditDeleteDialogOpen}
          close={this.closeAuditDeleteDialog}
          deleteAction={this.state.auditDeleteAction}
          deleteActionFn={this.deleteAuditAction}
        />
      ) : null;
    return (
      <div className={`${this.props.className} ${this.props.page} app-container`}>
        <DrawerNav
          device={this.props.device}
          view={this.props.view}
          open={this.state.navDrawerOpen}
          page={this.props.page}
          setPage={this.props.setPage}
          close={this.closeNavDrawer}
          user={this.props.user}
        />
        <TabletAppBar
          page={this.props.page}
          loading={this.props.loading}
          openNav={this.openNavDrawer}
          openFilter={this.openFilterDrawer}
          openAuditFilter={this.openAuditFilterDrawer}
          getActions={this.getAuditActions}
          view={this.props.view}
          setView={this.props.setView}
          sort={this.props.sort}
          setSort={this.props.setSort}
          userSort={this.state.userSort}
          setUserSortIndex={this.setUserSortIndex}
          search={this.props.search}
          setSearch={this.props.setSearch}
          sets={this.props.sets}
          statistics={this.props.statistics}
          setStatistics={this.props.setStatistics}
          statisticsSort={this.props.statisticsSort}
          setStatisticsSort={this.props.setStatisticsSort}
          statisticsTab={this.props.statisticsTab}
          setStatisticsTab={this.props.setStatisticsTab}
          openStatisticsDialog={this.openStatisticsDialog}
        />
        <main className={"main " + this.props.view + (this.props.content ? " content" : "")}>
          {content}
          <Footer />
        </main>
        {editorElements}
        <DrawerDetails
          device={this.props.device}
          view={this.props.view}
          user={this.props.user}
          set={this.state.detailSet}
          open={this.state.detailsDrawerOpen}
          close={this.closeDetailsDrawer}
          edit={this.openEditDrawer}
          delete={this.openDeleteDialog}
          search={this.props.search}
          setSearch={this.props.setSearch}
          toggleLichTheme={this.props.toggleLichTheme}
          openSales={this.openSalesDialog}
        />
        <DialogSales open={this.state.salesDialogOpen} close={this.closeSalesDialog} set={this.state.salesSet} />
        <DrawerFilter
          device={this.props.device}
          view={this.props.view}
          vendors={this.props.allVendors}
          profiles={this.props.profiles}
          open={this.state.filterDrawerOpen}
          close={this.closeFilterDrawer}
          setWhitelist={this.props.setWhitelist}
          whitelist={this.props.whitelist}
        />
        {auditFilterDrawer}
        {auditDeleteDialog}
        {statsDialog}
      </div>
    );
  }
}

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterDrawerOpen: false,
      createDialogOpen: false,
      detailsDrawerOpen: false,
      detailSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      salesDialogOpen: false,
      salesSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      navDrawerOpen: false,
      editDialogOpen: false,
      editSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      deleteDialogOpen: false,
      deleteSnackbarOpen: false,
      deleteSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
      statisticsDialogOpen: false,
      searchBarOpen: false,
      auditActions: [],
      auditActionsFiltered: [],
      auditFilterAction: "none",
      auditFilterUser: "all",
      auditLength: 50,
      auditFilterDrawerOpen: false,
      auditDeleteDialogOpen: false,
      auditDeleteAction: {
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
      auditUsers: [{ label: "All", value: "all" }],
      userSort: "nickname",
      userReverseSort: false,
    };
  }
  openModal = () => {
    if (window.scrollY > 0) {
      document.querySelector("body").classList.add("scrolled");
    }
    bodyScroll.disable();
  };
  closeModal = () => {
    setTimeout(() => {
      document.querySelector("body").classList.remove("scrolled");
    }, 20);
    bodyScroll.enable();
  };
  openNavDrawer = () => {
    this.openModal();
    this.setState({ navDrawerOpen: true });
  };
  closeNavDrawer = () => {
    this.closeModal();
    this.setState({ navDrawerOpen: false });
  };
  openFilterDrawer = () => {
    this.openModal();
    this.setState({ filterDrawerOpen: true });
  };
  closeFilterDrawer = () => {
    this.closeModal();
    this.setState({ filterDrawerOpen: false });
  };
  openCreateDialog = () => {
    this.openModal();
    this.setState({ createDialogOpen: !this.state.createDialogOpen });
  };
  closeCreateDialog = () => {
    this.closeModal();
    this.setState({ createDialogOpen: false });
  };
  openEditDialog = (set) => {
    if (this.state.detailsDrawerOpen) {
      this.closeDetailsDrawer();
      this.setState({ editSet: set });
      setTimeout(() => {
        this.openModal();
        this.setState({ editDialogOpen: !this.state.editDialogOpen });
      }, 400);
    } else {
      this.openModal();
      this.setState({
        editDialogOpen: !this.state.editDialogOpen,
        editSet: set,
      });
    }
  };
  closeEditDialog = () => {
    this.setState({
      editDialogOpen: false,
    });
    setTimeout(() => {
      this.closeModal();
      this.setState({
        editSet: {
          colorway: "",
          designer: [""],
          details: "",
          icDate: "",
          id: "",
          image: "",
          profile: "",
        },
      });
    }, 200);
  };
  openDeleteDialog = (set) => {
    this.closeDetailsDrawer();
    setTimeout(() => {
      this.openModal();
      this.setState({
        deleteDialogOpen: true,
        deleteSet: set,
      });
    }, 200);
  };
  closeDeleteDialog = () => {
    this.closeModal();
    this.setState({ deleteDialogOpen: false });
  };
  openDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: true });
  };
  closeDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: false });
  };
  openDetailsDrawer = (set) => {
    this.openModal();
    this.setState({
      detailsDrawerOpen: true,
      detailSet: set,
    });
  };
  closeDetailsDrawer = () => {
    this.closeModal();
    this.setState({
      detailsDrawerOpen: false,
      detailSet: {
        colorway: "",
        designer: [""],
        details: "",
        icDate: "",
        id: "",
        image: "",
        profile: "",
      },
    });
  };
  openSalesDialog = (set) => {
    this.setState({
      salesDialogOpen: true,
      salesSet: set,
    });
  };
  closeSalesDialog = () => {
    this.setState({
      salesDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        salesSet: {
          colorway: "",
          designer: [""],
          details: "",
          icDate: "",
          id: "",
          image: "",
          profile: "",
        },
      });
    }, 250);
  };
  openStatisticsDialog = () => {
    this.openModal();
    this.setState({ statisticsDialogOpen: true });
  };
  closeStatisticsDialog = () => {
    this.closeModal();
    this.setState({ statisticsDialogOpen: false });
  };
  openSearchBar = () => {
    this.setState({ searchBarOpen: true });
    document.getElementById("search").focus();
  };
  closeSearchBar = () => {
    this.setState({ searchBarOpen: false });
  };
  openAuditDeleteDialog = (action) => {
    this.setState({
      auditDeleteDialogOpen: true,
      auditDeleteAction: action,
    });
  };
  closeAuditDeleteDialog = () => {
    this.setState({
      auditDeleteDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        auditDeleteAction: {
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
  openAuditFilterDrawer = () => {
    this.setState({
      auditFilterDrawerOpen: !this.state.auditFilterDrawerOpen,
    });
  };
  closeAuditFilterDrawer = () => {
    this.setState({
      auditFilterDrawerOpen: false,
    });
  };
  handleAuditFilterChange = (e, prop) => {
    this.setState({
      ["audit" + prop.charAt(0).toUpperCase() + prop.slice(1)]: e.target.value,
    });

    this.filterAuditActions(
      this.state.action,
      prop === "filterAction" ? e.target.value : this.state.auditFilterAction,
      prop === "filterUser" ? e.target.value : this.state.auditFilterUser
    );
  };
  getAuditActions = (num = this.state.auditLength) => {
    if (!this.props.loading) {
      this.props.toggleLoading();
    }
    this.setState({ auditLength: num });
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
          data.action = data.before ? (data.after.profile ? "updated" : "deleted") : "created";
          data.changelogId = doc.id;
          actions.push(data);
          if (users.filter((e) => e.value === data.user.nickname).length === 0) {
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
          auditActions: actions,
          auditUsers: users,
        });

        this.filterAuditActions(actions);
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error getting data: " + error });
        if (this.props.loading) {
          this.props.toggleLoading();
        }
      });
  };

  filterAuditActions = (
    actions = this.state.auditActions,
    filterAction = this.state.auditFilterAction,
    filterUser = this.state.auditFilterUser
  ) => {
    let filteredActions = actions;

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
      auditActionsFiltered: filteredActions,
    });
    if (this.props.loading) {
      this.props.toggleLoading();
    }
  };
  deleteAuditAction = (action) => {
    const db = firebase.firestore();
    db.collection("changelog")
      .doc(action.changelogId)
      .delete()
      .then(() => {
        this.props.snackbarQueue.notify({ title: "Successfully deleted changelog entry." });
        this.getAuditActions();
        this.closeAuditDeleteDialog();
      })
      .catch((error) => {
        this.props.snackbarQueue.notify({ title: "Error deleting changelog entry: " + error });
        this.closeAuditDeleteDialog();
      });
  };
  setUserSortIndex = (index) => {
    const props = ["displayName", "email", "nickname"];
    this.setState({
      userSort: props[index],
      userReverseSort: false,
    });
  };
  render() {
    const content = this.props.content ? (
      <ContentGrid
        groups={this.props.groups}
        sets={this.props.sets}
        sort={this.props.sort}
        page={this.props.page}
        view={this.props.view}
        details={this.openDetailsDrawer}
        closeDetails={this.closeDetailsDrawer}
        edit={this.openEditDialog}
        detailSet={this.state.detailSet}
        delete={this.openDeleteDialog}
        user={this.props.user}
      />
    ) : this.props.page === "statistics" ? (
      <ContentStatistics
        profiles={this.props.profiles}
        sets={this.props.allSets}
        statistics={this.props.statistics}
        statisticsTab={this.props.statisticsTab}
        statisticsSort={this.props.statisticsSort}
        setStatisticsSort={this.props.setStatisticsSort}
        allDesigners={this.props.allDesigners}
        allVendors={this.props.allVendors}
      />
    ) : this.props.page === "audit" && this.props.user.isAdmin ? (
      <ContentAudit
        loading={this.props.loading}
        actions={this.state.auditActionsFiltered}
        getActions={this.getAuditActions}
        snackbarQueue={this.props.snackbarQueue}
        openDeleteDialog={this.openAuditDeleteDialog}
      />
    ) : this.props.page === "users" && this.props.user.isAdmin ? (
      <ContentUsers
        loading={this.props.loading}
        toggleLoading={this.props.toggleLoading}
        user={this.props.user}
        device={this.props.device}
        view={"card"}
        sort={this.state.userSort}
        setSort={this.setUserSort}
        reverseSort={this.state.userReverseSort}
        allDesigners={this.props.allDesigners}
        snackbarQueue={this.props.snackbarQueue}
      />
    ) : this.props.page === "settings" ? (
      <ContentSettings
        device={this.props.device}
        bottomNav={this.props.bottomNav}
        setBottomNav={this.props.setBottomNav}
        user={this.props.user}
        setUser={this.props.setUser}
        lightTheme={this.props.lightTheme}
        setLightTheme={this.props.setLightTheme}
        darkTheme={this.props.darkTheme}
        setDarkTheme={this.props.setDarkTheme}
        applyTheme={this.props.applyTheme}
        setApplyTheme={this.props.setApplyTheme}
        manualTheme={this.props.manualTheme}
        setManualTheme={this.props.setManualTheme}
        fromTimeTheme={this.props.fromTimeTheme}
        setFromTimeTheme={this.props.setFromTimeTheme}
        toTimeTheme={this.props.toTimeTheme}
        setToTimeTheme={this.props.setToTimeTheme}
        density={this.props.density}
        setDensity={this.props.setDensity}
        snackbarQueue={this.props.snackbarQueue}
      />
    ) : (
      <ContentEmpty />
    );
    const editorElements =
      (this.props.user.isEditor || this.props.user.isDesigner) &&
      this.props.page !== "statistics" &&
      this.props.page !== "audit" &&
      this.props.page !== "users" &&
      this.props.page !== "settings" ? (
        <>
          <Fab
            className={"create-fab" + (this.props.bottomNav ? " middle" : "")}
            icon="add"
            onClick={this.openCreateDialog}
          />
          <DialogCreate
            open={this.state.createDialogOpen}
            close={this.closeCreateDialog}
            user={this.props.user}
            profiles={this.props.profiles}
            allDesigners={this.props.allDesigners}
            allVendors={this.props.allVendors}
            allRegions={this.props.allRegions}
            getData={this.props.getData}
            snackbarQueue={this.props.snackbarQueue}
          />
          <DialogEdit
            open={this.state.editDialogOpen}
            close={this.closeEditDialog}
            user={this.props.user}
            profiles={this.props.profiles}
            allDesigners={this.props.allDesigners}
            allVendors={this.props.allVendors}
            allRegions={this.props.allRegions}
            set={this.state.editSet}
            getData={this.props.getData}
            snackbarQueue={this.props.snackbarQueue}
          />
          {this.props.user.isEditor ? (
            <>
              <DialogDelete
                key="DialogDelete"
                open={this.state.deleteDialogOpen}
                close={this.closeDeleteDialog}
                set={this.state.deleteSet}
                openSnackbar={this.openDeleteSnackbar}
                getData={this.props.getData}
                snackbarQueue={this.props.snackbarQueue}
                user={this.props.user}
              />
              <SnackbarDeleted
                key="SnackbarDeleted"
                open={this.state.deleteSnackbarOpen}
                close={this.closeDeleteSnackbar}
                set={this.state.deleteSet}
                getData={this.props.getData}
                snackbarQueue={this.props.snackbarQueue}
              />
            </>
          ) : null}
        </>
      ) : null;
    const appBar = this.props.bottomNav ? (
      <div className="bottomNav">
        {(this.props.user.isEditor || this.props.user.isDesigner) &&
        this.props.page !== "statistics" &&
        this.props.page !== "audit" &&
        this.props.page !== "users" &&
        this.props.page !== "settings" ? (
          <BottomAppBarIndent
            page={this.props.page}
            loading={this.props.loading}
            openFilter={this.openFilterDrawer}
            openNav={this.openNavDrawer}
            view={this.props.view}
            setView={this.props.setView}
            sort={this.props.sort}
            setSort={this.props.setSort}
            openSearch={this.openSearchBar}
          />
        ) : (
          <BottomAppBar
            page={this.props.page}
            loading={this.props.loading}
            openFilter={this.openFilterDrawer}
            openAuditFilter={this.openAuditFilterDrawer}
            getActions={this.getAuditActions}
            openNav={this.openNavDrawer}
            view={this.props.view}
            setView={this.props.setView}
            sort={this.props.sort}
            setSort={this.props.setSort}
            userSort={this.state.userSort}
            setUserSortIndex={this.setUserSortIndex}
            search={this.props.search}
            setSearch={this.props.setSearch}
            sets={this.props.sets}
            statistics={this.props.statistics}
            setStatistics={this.props.setStatistics}
            statisticsSort={this.props.statisticsSort}
            setStatisticsSort={this.props.setStatisticsSort}
            statisticsTab={this.props.statisticsTab}
            setStatisticsTab={this.props.setStatisticsTab}
            openStatisticsDialog={this.openStatisticsDialog}
          />
        )}
      </div>
    ) : (
      <MobileAppBar
        page={this.props.page}
        loading={this.props.loading}
        openFilter={this.openFilterDrawer}
        openAuditFilter={this.openAuditFilterDrawer}
        getActions={this.getAuditActions}
        openNav={this.openNavDrawer}
        view={this.props.view}
        setView={this.props.setView}
        sort={this.props.sort}
        setSort={this.props.setSort}
        userSort={this.state.userSort}
        setUserSortIndex={this.setUserSortIndex}
        search={this.props.search}
        setSearch={this.props.setSearch}
        sets={this.props.sets}
        statistics={this.props.statistics}
        setStatistics={this.props.setStatistics}
        statisticsSort={this.props.statisticsSort}
        setStatisticsSort={this.props.setStatisticsSort}
        openStatisticsDialog={this.openStatisticsDialog}
        statisticsTab={this.props.statisticsTab}
        setStatisticsTab={this.props.setStatisticsTab}
      />
    );
    const statsDialog =
      this.props.page === "statistics" ? (
        <DialogStatistics
          open={this.state.statisticsDialogOpen}
          onClose={this.closeStatisticsDialog}
          statistics={this.props.statistics}
          setStatistics={this.props.setStatistics}
          statisticsTab={this.props.statisticsTab}
        />
      ) : null;
    const search =
      this.props.bottomNav &&
      (this.props.user.isEditor || this.props.user.isDesigner) &&
      this.props.page !== "statistics" &&
      this.props.page !== "audit" &&
      this.props.page !== "users" ? (
        <SearchAppBar
          open={this.state.searchBarOpen}
          openBar={this.openSearchBar}
          close={this.closeSearchBar}
          search={this.props.search}
          setSearch={this.props.setSearch}
          sets={this.props.sets}
        />
      ) : null;
    const auditFilterDrawer =
      this.props.page === "audit" ? (
        <DrawerAuditFilter
          open={this.state.auditFilterDrawerOpen}
          close={this.closeAuditFilterDrawer}
          device={this.props.device}
          handleFilterChange={this.handleAuditFilterChange}
          filterAction={this.state.auditFilterAction}
          filterUser={this.state.auditFilterUser}
          users={this.state.auditUsers}
          auditLength={this.state.auditLength}
          getActions={this.getAuditActions}
        />
      ) : null;
    const auditDeleteDialog =
      this.props.page === "audit" ? (
        <DialogAuditDelete
          open={this.state.auditDeleteDialogOpen}
          close={this.closeAuditDeleteDialog}
          deleteAction={this.state.auditDeleteAction}
          deleteActionFn={this.deleteAuditAction}
        />
      ) : null;
    return (
      <div
        className={`${this.props.className} ${this.props.page} app-container ${
          this.props.user.isEditor || this.props.user.isDesigner ? "offset-snackbar" : ""
        } ${this.props.bottomNav ? "bottom-nav" : ""}`}
      >
        {search}
        <DrawerNav
          device={this.props.device}
          view={this.props.view}
          bottomNav={this.props.bottomNav}
          open={this.state.navDrawerOpen}
          page={this.props.page}
          setPage={this.props.setPage}
          close={this.closeNavDrawer}
          user={this.props.user}
        />
        {appBar}
        <main className={"main " + this.props.view + (this.props.content ? " content" : "")}>
          {content}
          <Footer />
        </main>
        {editorElements}
        <DrawerDetails
          device={this.props.device}
          view={this.props.view}
          user={this.props.user}
          set={this.state.detailSet}
          open={this.state.detailsDrawerOpen}
          close={this.closeDetailsDrawer}
          edit={this.openEditDialog}
          delete={this.openDeleteDialog}
          search={this.props.search}
          setSearch={this.props.setSearch}
          toggleLichTheme={this.props.toggleLichTheme}
          openSales={this.openSalesDialog}
        />
        <DialogSales open={this.state.salesDialogOpen} close={this.closeSalesDialog} set={this.state.salesSet} />
        <DrawerFilter
          device={this.props.device}
          view={this.props.view}
          vendors={this.props.allVendors}
          profiles={this.props.profiles}
          open={this.state.filterDrawerOpen}
          close={this.closeFilterDrawer}
          setWhitelist={this.props.setWhitelist}
          whitelist={this.props.whitelist}
        />
        {auditFilterDrawer}
        {auditDeleteDialog}
        {statsDialog}
      </div>
    );
  }
}

export default DesktopContent;

DesktopContent.propTypes = {
  allDesigners: PropTypes.arrayOf(PropTypes.string),
  allRegions: PropTypes.arrayOf(PropTypes.string),
  allSets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  allVendors: PropTypes.arrayOf(PropTypes.string),
  applyTheme: PropTypes.string,
  className: PropTypes.string,
  content: PropTypes.bool,
  darkTheme: PropTypes.string,
  density: PropTypes.string,
  device: PropTypes.string,
  editor: PropTypes.bool,
  fromTimeTheme: PropTypes.string,
  getData: PropTypes.func,
  groups: PropTypes.arrayOf(PropTypes.string),
  lightTheme: PropTypes.string,
  loading: PropTypes.bool,
  manualTheme: PropTypes.bool,
  page: PropTypes.string,
  profiles: PropTypes.arrayOf(PropTypes.string),
  search: PropTypes.string,
  setApplyTheme: PropTypes.func,
  setDarkTheme: PropTypes.func,
  setDensity: PropTypes.func,
  setFromTimeTheme: PropTypes.func,
  setLightTheme: PropTypes.func,
  setManualTheme: PropTypes.func,
  setPage: PropTypes.func,
  setSearch: PropTypes.func,
  setSort: PropTypes.func,
  setStatistics: PropTypes.func,
  setStatisticsSort: PropTypes.func,
  setStatisticsTab: PropTypes.func,
  setToTimeTheme: PropTypes.func,
  setUser: PropTypes.func,
  setView: PropTypes.func,
  setWhitelist: PropTypes.func,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  snackbarQueue: PropTypes.shape(queueTypes),
  sort: PropTypes.string,
  statistics: PropTypes.shape(statisticsTypes),
  statisticsSort: PropTypes.shape(statisticsSortTypes),
  statisticsTab: PropTypes.string,
  toTimeTheme: PropTypes.string,
  toggleLichTheme: PropTypes.func,
  toggleLoading: PropTypes.func,
  user: PropTypes.shape(userTypes),
  view: PropTypes.string,
  whitelist: PropTypes.shape(whitelistTypes),
};

TabletContent.propTypes = {
  allDesigners: PropTypes.arrayOf(PropTypes.string),
  allRegions: PropTypes.arrayOf(PropTypes.string),
  allsets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  allVendors: PropTypes.arrayOf(PropTypes.string),
  applyTheme: PropTypes.string,
  className: PropTypes.string,
  content: PropTypes.bool,
  darkTheme: PropTypes.string,
  density: PropTypes.string,
  device: PropTypes.string,
  editor: PropTypes.bool,
  fromTimeTheme: PropTypes.string,
  getData: PropTypes.func,
  groups: PropTypes.arrayOf(PropTypes.string),
  lightTheme: PropTypes.string,
  loading: PropTypes.bool,
  manualTheme: PropTypes.bool,
  page: PropTypes.string,
  profiles: PropTypes.arrayOf(PropTypes.string),
  search: PropTypes.string,
  setApplyTheme: PropTypes.func,
  setDarkTheme: PropTypes.func,
  setDensity: PropTypes.func,
  setFromTimeTheme: PropTypes.func,
  setLightTheme: PropTypes.func,
  setManualTheme: PropTypes.func,
  setPage: PropTypes.func,
  setSearch: PropTypes.func,
  setSort: PropTypes.func,
  setStatistics: PropTypes.func,
  setStatisticsSort: PropTypes.func,
  setStatisticsTab: PropTypes.func,
  setToTimeTheme: PropTypes.func,
  setUser: PropTypes.func,
  setView: PropTypes.func,
  setWhitelist: PropTypes.func,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  snackbarQueue: PropTypes.shape(queueTypes),
  sort: PropTypes.string,
  statistics: PropTypes.shape(statisticsTypes),
  statisticsSort: PropTypes.shape(statisticsSortTypes),
  statisticsTab: PropTypes.string,
  toTimeTheme: PropTypes.string,
  toggleLichTheme: PropTypes.func,
  toggleLoading: PropTypes.func,
  user: PropTypes.shape(userTypes),
  view: PropTypes.string,
  whitelist: PropTypes.shape(whitelistTypes),
};

MobileContent.propTypes = {
  allDesigners: PropTypes.arrayOf(PropTypes.string),
  allRegions: PropTypes.arrayOf(PropTypes.string),
  allsets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  allVendors: PropTypes.arrayOf(PropTypes.string),
  applyTheme: PropTypes.string,
  bottomNav: PropTypes.bool,
  className: PropTypes.string,
  content: PropTypes.bool,
  darkTheme: PropTypes.string,
  density: PropTypes.string,
  device: PropTypes.string,
  editor: PropTypes.bool,
  fromTimeTheme: PropTypes.string,
  getData: PropTypes.func,
  groups: PropTypes.arrayOf(PropTypes.string),
  lightTheme: PropTypes.string,
  loading: PropTypes.bool,
  manualTheme: PropTypes.bool,
  page: PropTypes.string,
  profiles: PropTypes.arrayOf(PropTypes.string),
  search: PropTypes.string,
  setApplyTheme: PropTypes.func,
  setBottomNav: PropTypes.func,
  setDarkTheme: PropTypes.func,
  setDensity: PropTypes.func,
  setFromTimeTheme: PropTypes.func,
  setLightTheme: PropTypes.func,
  setManualTheme: PropTypes.func,
  setPage: PropTypes.func,
  setSearch: PropTypes.func,
  setSort: PropTypes.func,
  setStatistics: PropTypes.func,
  setStatisticsSort: PropTypes.func,
  setStatisticsTab: PropTypes.func,
  setToTimeTheme: PropTypes.func,
  setUser: PropTypes.func,
  setView: PropTypes.func,
  setWhitelist: PropTypes.func,
  sets: PropTypes.arrayOf(PropTypes.shape(setTypes())),
  snackbarQueue: PropTypes.shape(queueTypes),
  sort: PropTypes.string,
  statistics: PropTypes.shape(statisticsTypes),
  statisticsSort: PropTypes.shape(statisticsSortTypes),
  statisticsTab: PropTypes.string,
  toTimeTheme: PropTypes.string,
  toggleLichTheme: PropTypes.func,
  toggleLoading: PropTypes.func,
  user: PropTypes.shape(userTypes),
  view: PropTypes.string,
  whitelist: PropTypes.shape(whitelistTypes),
};
