import React from "react";
import "./Content.scss";
import { DesktopAppBar, TabletAppBar, MobileAppBar, BottomAppBar, BottomAppBarIndent } from "./app_bar/AppBar";
import { DrawerAppContent } from "@rmwc/drawer";
import { DesktopDrawerNav, MobileDrawerNav, BottomDrawerNav } from "./common/DrawerNav";
import { Fab } from "@rmwc/fab";
import { ContentEmpty, ContentFailed } from "./content/ContentEmpty";
import { ContentStatistics } from "./content/ContentStatistics";
import { ContentGrid } from "./content/ContentGrid";
import { DialogFilter } from "./filter/DialogFilter";
import { DialogDelete } from "./admin/DialogDelete";
import { DialogSettings } from "./common/DialogSettings";
import { DialogStatistics } from "./statistics/DialogStatistics";
import { DialogCreate, DialogEdit } from "./admin/DialogEntry";
import { DesktopDrawerFilter, TabletDrawerFilter } from "./filter/DrawerFilter";
import { DesktopDrawerDetails, TabletDrawerDetails } from "./common/DrawerDetails";
import { DrawerCreate, DrawerEdit } from "./admin/DrawerEntry";
import { SnackbarDeleted } from "./admin/SnackbarDeleted";
import { SearchAppBar } from "./app_bar/SearchBar";
import { Footer } from "./common/Footer";

const bodyScroll = require("body-scroll-toggle");

export class DesktopContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navDrawerOpen: true,
      filterDrawerOpen: false,
      detailsDrawerOpen: false,
      detailSet: {},
      createDrawerOpen: false,
      editDrawerOpen: false,
      editSet: {},
      deleteDialogOpen: false,
      deleteSnackbarOpen: false,
      deleteSet: {},
      settingsDialogOpen: false,
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
  toggleNavDrawer = () => {
    this.setState({ navDrawerOpen: !this.state.navDrawerOpen });
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
        detailSet: {},
      });
    }, 200);
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
      editSet: {},
    });
  };
  openSettingsDialog = () => {
    this.openModal();
    this.setState({ settingsDialogOpen: true });
  };
  closeSettingsDialog = () => {
    this.closeModal();
    this.setState({ settingsDialogOpen: false });
  };
  componentDidUpdate(prevProps) {
    if (this.props.page !== prevProps.page && this.props.page === "statistics") {
      if (this.state.filterDrawerOpen) {
        this.closeFilterDrawer();
      }
      if (this.state.detailsDrawerOpen) {
        this.closeDetailsDrawer();
      }
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
        editSet={this.state.editSet}
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
    ) : this.props.failed ? (
      <ContentFailed getData={this.props.getData} />
    ) : (
      <ContentEmpty />
    );
    const editorElements =
      (this.props.user.isEditor || this.props.user.isDesigner) && this.props.page !== "statistics" ? (
        <div>
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
            <div>
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
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      );
    const drawers =
      this.props.view === "compact" ? (
        <div>
          <TabletDrawerDetails
            user={this.props.user}
            set={this.state.detailSet}
            open={this.state.detailsDrawerOpen}
            close={this.closeDetailsDrawer}
            edit={this.openEditDrawer}
            delete={this.openDeleteDialog}
            search={this.props.search}
            setSearch={this.props.setSearch}
            toggleLichTheme={this.props.toggleLichTheme}
          />
          <TabletDrawerFilter
            profiles={this.props.profiles}
            vendors={this.props.vendors}
            open={this.state.filterDrawerOpen}
            close={this.closeFilterDrawer}
            setWhitelist={this.props.setWhitelist}
            whitelist={this.props.whitelist}
          />
        </div>
      ) : (
        <div className="drawer-container">
          <DesktopDrawerDetails
            user={this.props.user}
            set={this.state.detailSet}
            open={this.state.detailsDrawerOpen}
            close={this.closeDetailsDrawer}
            edit={this.openEditDrawer}
            delete={this.openDeleteDialog}
            search={this.props.search}
            setSearch={this.props.setSearch}
            toggleLichTheme={this.props.toggleLichTheme}
          />
          <DesktopDrawerFilter
            profiles={this.props.profiles}
            vendors={this.props.vendors}
            open={this.state.filterDrawerOpen}
            close={this.closeFilterDrawer}
            setWhitelist={this.props.setWhitelist}
            whitelist={this.props.whitelist}
          />
        </div>
      );
    return (
      <div className={this.props.className + "app-container"}>
        <DesktopDrawerNav
          open={this.state.navDrawerOpen}
          close={this.toggleNavDrawer}
          page={this.props.page}
          changePage={this.props.changePage}
          openSettings={this.openSettingsDialog}
        />
        <DrawerAppContent
          className={
            (this.state.detailsDrawerOpen && this.props.view !== "compact" ? "details-drawer-open " : "") +
            (this.state.filterDrawerOpen && this.props.view !== "compact" ? "filter-drawer-open " : "") +
            (this.props.page === "statistics" ? "statistics " : "")
          }
        >
          <DesktopAppBar
            page={this.props.page}
            loading={this.props.loading}
            toggleNav={this.toggleNavDrawer}
            toggleFilter={this.toggleFilterDrawer}
            view={this.props.view}
            changeView={this.props.changeView}
            sort={this.props.sort}
            setSort={this.props.setSort}
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
            <main
              className={
                "main " +
                this.props.view +
                (this.props.content ? " content" : "") +
                (this.props.page === "statistics" ? " card content" : "")
              }
            >
              {content}
              <Footer />
            </main>
            {drawers}
          </div>
        </DrawerAppContent>
        {editorElements}
        <DialogSettings
          user={this.props.user}
          setUser={this.props.setUser}
          open={this.state.settingsDialogOpen}
          close={this.closeSettingsDialog}
          applyTheme={this.props.applyTheme}
          changeApplyTheme={this.props.changeApplyTheme}
          darkTheme={this.props.darkTheme}
          setDarkTheme={this.props.setDarkTheme}
          manualTheme={this.props.manualTheme}
          setManualTheme={this.props.setManualTheme}
          fromTimeTheme={this.props.fromTimeTheme}
          setFromTimeTheme={this.props.setFromTimeTheme}
          toTimeTheme={this.props.toTimeTheme}
          setToTimeTheme={this.props.setToTimeTheme}
          snackbarQueue={this.props.snackbarQueue}
          getData={this.props.getData}
        />
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
      detailSet: {},
      createDrawerOpen: false,
      editDrawerOpen: false,
      editSet: {},
      deleteDialogOpen: false,
      deleteSnackbarOpen: false,
      deleteSet: {},
      settingsDialogOpen: false,
      statisticsDialogOpen: false,
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
  toggleNavDrawer = () => {
    this.setState({ navDrawerOpen: !this.state.navDrawerOpen });
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
      editSet: {},
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
      detailSet: {},
    });
  };
  openSettingsDialog = () => {
    this.openModal();
    this.setState({ settingsDialogOpen: true });
  };
  closeSettingsDialog = () => {
    this.closeModal();
    this.setState({ settingsDialogOpen: false });
  };
  openStatisticsDialog = () => {
    this.openModal();
    this.setState({ statisticsDialogOpen: true });
  };
  closeStatisticsDialog = () => {
    this.closeModal();
    this.setState({ statisticsDialogOpen: false });
  };
  toggleLoading = () => {
    this.setState({ loading: !this.state.loading });
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
        editSet={this.state.editSet}
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
    ) : this.props.failed ? (
      <ContentFailed getData={this.props.getData} />
    ) : (
      <ContentEmpty />
    );
    const editorElements =
      (this.props.user.isEditor || this.props.user.isDesigner) && this.props.page !== "statistics" ? (
        <div>
          <Fab className="create-fab" icon="add" onClick={this.openCreateDrawer} />
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
            <div>
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
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
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
    return (
      <div className={this.props.className + "app-container"}>
        <DesktopDrawerNav
          open={this.state.navDrawerOpen}
          page={this.props.page}
          changePage={this.props.changePage}
          close={this.toggleNavDrawer}
          openSettings={this.openSettingsDialog}
        />
        <DrawerAppContent className={this.props.page === "statistics" ? "statistics" : ""}>
          <TabletAppBar
            page={this.props.page}
            loading={this.props.loading}
            toggleNav={this.toggleNavDrawer}
            toggleFilter={this.openFilterDrawer}
            view={this.props.view}
            changeView={this.props.changeView}
            sort={this.props.sort}
            setSort={this.props.setSort}
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
          <main
            className={
              "main " +
              this.props.view +
              (this.props.content ? " content" : "") +
              (this.props.page === "statistics" ? " card content" : "")
            }
          >
            {content}
            <Footer />
          </main>
        </DrawerAppContent>
        {editorElements}
        <TabletDrawerDetails
          user={this.props.user}
          set={this.state.detailSet}
          open={this.state.detailsDrawerOpen}
          close={this.closeDetailsDrawer}
          edit={this.openEditDrawer}
          delete={this.openDeleteDialog}
          search={this.props.search}
          setSearch={this.props.setSearch}
          toggleLichTheme={this.props.toggleLichTheme}
        />
        <TabletDrawerFilter
          vendors={this.props.vendors}
          profiles={this.props.profiles}
          open={this.state.filterDrawerOpen}
          close={this.closeFilterDrawer}
          setWhitelist={this.props.setWhitelist}
          whitelist={this.props.whitelist}
        />
        <DialogSettings
          user={this.props.user}
          setUser={this.props.setUser}
          open={this.state.settingsDialogOpen}
          close={this.closeSettingsDialog}
          applyTheme={this.props.applyTheme}
          changeApplyTheme={this.props.changeApplyTheme}
          darkTheme={this.props.darkTheme}
          setDarkTheme={this.props.setDarkTheme}
          manualTheme={this.props.manualTheme}
          setManualTheme={this.props.setManualTheme}
          fromTimeTheme={this.props.fromTimeTheme}
          setFromTimeTheme={this.props.setFromTimeTheme}
          toTimeTheme={this.props.toTimeTheme}
          setToTimeTheme={this.props.setToTimeTheme}
          snackbarQueue={this.props.snackbarQueue}
          getData={this.props.getData}
        />
        {statsDialog}
      </div>
    );
  }
}

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterDialogOpen: false,
      createDialogOpen: false,
      detailsDrawerOpen: false,
      detailSet: {},
      navDrawerOpen: false,
      filterBy: "vendors",
      editDialogOpen: false,
      editSet: {},
      deleteDialogOpen: false,
      deleteSnackbarOpen: false,
      deleteSet: {},
      settingsDialogOpen: false,
      statisticsDialogOpen: false,
      searchBarOpen: false,
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
  openFilterDialog = (index) => {
    this.openModal();
    const filters = ["profiles", "vendors"];
    this.setState({ filterDialogOpen: true, filterBy: filters[index] });
  };
  closeFilterDialog = () => {
    this.closeModal();
    this.setState({ filterDialogOpen: false });
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
        editSet: {},
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
      detailSet: {},
    });
  };
  openSettingsDialog = () => {
    this.openModal();
    this.setState({ settingsDialogOpen: true });
  };
  closeSettingsDialog = () => {
    this.closeModal();
    this.setState({ settingsDialogOpen: false });
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
    ) : this.props.failed ? (
      <ContentFailed getData={this.props.getData} />
    ) : (
      <ContentEmpty />
    );
    const editorElements =
      (this.props.user.isEditor || this.props.user.isDesigner) && this.props.page !== "statistics" ? (
        <div>
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
            <div>
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
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      );
    const nav = this.props.bottomNav ? (
      <div className={"bottomNav" + (this.props.page === "statistics" ? " statistics " : "")}>
        <BottomDrawerNav
          open={this.state.navDrawerOpen}
          page={this.props.page}
          changePage={this.props.changePage}
          close={this.closeNavDrawer}
          openSettings={this.openSettingsDialog}
        />
        {(this.props.user.isEditor || this.props.user.isDesigner) && this.props.page !== "statistics" ? (
          <BottomAppBarIndent
            page={this.props.page}
            loading={this.props.loading}
            openFilter={this.openFilterDialog}
            openNav={this.openNavDrawer}
            view={this.props.view}
            changeView={this.props.changeView}
            sort={this.props.sort}
            setSort={this.props.setSort}
            openSearch={this.openSearchBar}
          />
        ) : (
          <BottomAppBar
            page={this.props.page}
            loading={this.props.loading}
            openFilter={this.openFilterDialog}
            openNav={this.openNavDrawer}
            view={this.props.view}
            changeView={this.props.changeView}
            sort={this.props.sort}
            setSort={this.props.setSort}
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
      <div className={this.props.page === "statistics" ? "statistics" : ""}>
        <MobileDrawerNav
          open={this.state.navDrawerOpen}
          page={this.props.page}
          changePage={this.props.changePage}
          close={this.closeNavDrawer}
          openSettings={this.openSettingsDialog}
        />
        <MobileAppBar
          page={this.props.page}
          loading={this.props.loading}
          openFilter={this.openFilterDialog}
          openNav={this.openNavDrawer}
          view={this.props.view}
          changeView={this.props.changeView}
          sort={this.props.sort}
          setSort={this.props.setSort}
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
      </div>
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
      this.props.bottomNav && (this.props.user.isEditor || this.props.user.isDesigner) ? (
        <SearchAppBar
          open={this.state.searchBarOpen}
          openBar={this.openSearchBar}
          close={this.closeSearchBar}
          search={this.props.search}
          setSearch={this.props.setSearch}
          sets={this.props.sets}
        />
      ) : (
        <div></div>
      );
    return (
      <div
        className={
          this.props.className +
          "app-container" +
          (this.props.user.isEditor || this.props.user.isDesigner ? " offset-snackbar" : "") +
          (this.props.bottomNav ? " bottom-nav" : "")
        }
      >
        {search}
        {nav}
        <main
          className={
            "main " +
            this.props.view +
            (this.props.content ? " content" : "") +
            (this.props.page === "statistics" ? " card content" : "")
          }
        >
          {content}
          <Footer />
        </main>
        {editorElements}
        <TabletDrawerDetails
          user={this.props.user}
          set={this.state.detailSet}
          open={this.state.detailsDrawerOpen}
          close={this.closeDetailsDrawer}
          edit={this.openEditDialog}
          delete={this.openDeleteDialog}
          search={this.props.search}
          setSearch={this.props.setSearch}
          toggleLichTheme={this.props.toggleLichTheme}
        />
        <DialogFilter
          vendors={this.props.vendors}
          profiles={this.props.profiles}
          open={this.state.filterDialogOpen}
          onClose={this.closeFilterDialog}
          filterBy={this.state.filterBy}
          setWhitelist={this.props.setWhitelist}
          whitelist={this.props.whitelist}
        />
        <DialogSettings
          user={this.props.user}
          setUser={this.props.setUser}
          open={this.state.settingsDialogOpen}
          close={this.closeSettingsDialog}
          applyTheme={this.props.applyTheme}
          changeApplyTheme={this.props.changeApplyTheme}
          darkTheme={this.props.darkTheme}
          setDarkTheme={this.props.setDarkTheme}
          manualTheme={this.props.manualTheme}
          setManualTheme={this.props.setManualTheme}
          fromTimeTheme={this.props.fromTimeTheme}
          setFromTimeTheme={this.props.setFromTimeTheme}
          toTimeTheme={this.props.toTimeTheme}
          setToTimeTheme={this.props.setToTimeTheme}
          bottomNav={this.props.bottomNav}
          changeBottomNav={this.props.changeBottomNav}
          snackbarQueue={this.props.snackbarQueue}
          getData={this.props.getData}
        />
        {statsDialog}
      </div>
    );
  }
}

export default DesktopContent;
