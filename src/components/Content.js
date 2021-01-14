import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { UserContext, DeviceContext } from "../util/contexts";
import { mainPages } from "../util/constants";
import { openModal, closeModal } from "../util/functions";
import { setTypes, whitelistTypes, statisticsTypes, statisticsSortTypes, queueTypes } from "../util/propTypeTemplates";
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
import { DialogCreate, DialogEdit } from "./admin/DialogEntry";
import { DrawerFilter } from "./common/DrawerFilter";
import { DrawerDetails } from "./common/DrawerDetails";
import { DrawerFilterPreset } from "./common/DrawerFilterPreset";
import { DialogFilterPreset } from "./common/DialogFilterPreset";
import { DialogDeleteFilterPreset } from "./common/DialogDeleteFilterPreset";
import { DrawerCreate, DrawerEdit } from "./admin/DrawerEntry";
import { SnackbarDeleted } from "./admin/SnackbarDeleted";
import { SearchAppBar } from "./app_bar/SearchBar";
import { Footer } from "./common/Footer";
import "./Content.scss";

export const Content = (props) => {
  const { user } = useContext(UserContext);
  const device = useContext(DeviceContext);
  const [navOpen, setNavOpen] = useState(false);
  const openNav = () => {
    if (device !== "desktop") {
      openModal();
    }
    setNavOpen(true);
  };
  const closeNav = () => {
    if (device !== "desktop") {
      closeModal();
    }
    setNavOpen(false);
  };
  const contentStatistics =
    props.page === "statistics" ? (
      <ContentStatistics
        profiles={props.profiles}
        sets={props.allSets}
        bottomNav={props.bottomNav}
        navOpen={navOpen}
        openNav={openNav}
        statisticsTab={props.statisticsTab}
        setStatisticsTab={props.setStatisticsTab}
        allDesigners={props.allDesigners}
        allVendors={props.allVendors}
      />
    ) : null;
  const contentAudit =
    props.page === "audit" && user.isAdmin ? (
      <ContentAudit openNav={openNav} bottomNav={props.bottomNav} snackbarQueue={props.snackbarQueue} />
    ) : null;
  const contentUsers =
    props.page === "users" && user.isAdmin ? (
      <ContentUsers
        openNav={openNav}
        allDesigners={props.allDesigners}
        snackbarQueue={props.snackbarQueue}
        device={device}
      />
    ) : null;
  const contentSettings =
    props.page === "settings" ? (
      <ContentSettings
        openNav={openNav}
        bottomNav={props.bottomNav}
        setBottomNav={props.setBottomNav}
        lightTheme={props.lightTheme}
        setLightTheme={props.setLightTheme}
        darkTheme={props.darkTheme}
        setDarkTheme={props.setDarkTheme}
        applyTheme={props.applyTheme}
        setApplyTheme={props.setApplyTheme}
        manualTheme={props.manualTheme}
        setManualTheme={props.setManualTheme}
        fromTimeTheme={props.fromTimeTheme}
        setFromTimeTheme={props.setFromTimeTheme}
        toTimeTheme={props.toTimeTheme}
        setToTimeTheme={props.setToTimeTheme}
        density={props.density}
        setDensity={props.setDensity}
        snackbarQueue={props.snackbarQueue}
      />
    ) : null;
  return (
    <div className={classNames(props.className, props.page, "app-container")}>
      <DrawerNav
        bottomNav={props.bottomNav}
        view={props.view}
        open={navOpen}
        close={closeNav}
        page={props.page}
        setPage={props.setPage}
      />
      <DrawerAppContent>
        {contentStatistics}
        {contentAudit}
        {contentUsers}
        {contentSettings}
      </DrawerAppContent>
    </div>
  );
};

export class DesktopContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navDrawerOpen: true,
      filterDrawerOpen: false,
      filterPresetDrawerOpen: false,
      filterPreset: {
        name: "",
        id: "",
        whitelist: {
          favorites: false,
          profiles: [],
          shipped: ["Shipped", "Not shipped"],
          vendorMode: "include",
          vendors: [],
        },
      },
      filterPresetDeleteDialogOpen: false,
      deleteFilterPreset: {
        name: "",
        id: "",
        whitelist: {
          favorites: false,
          profiles: [],
          shipped: ["Shipped", "Not shipped"],
          vendorMode: "include",
          vendors: [],
        },
      },
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
    };
  }
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
          openModal();
        }
        this.setState((prevState) => {
          return { filterDrawerOpen: !prevState.filterDrawerOpen };
        });
      }, 300);
    } else {
      if (this.props.view === "compact") {
        openModal();
      }
      this.setState((prevState) => {
        return { filterDrawerOpen: !prevState.filterDrawerOpen };
      });
    }
  };
  closeFilterDrawer = () => {
    if (this.props.view === "compact") {
      closeModal();
    }
    this.setState({ filterDrawerOpen: false });
  };
  openFilterPresetDrawer = (preset) => {
    if (this.props.view === "compact") {
      this.closeFilterDrawer();
      this.setState({ filterPreset: preset });
      setTimeout(() => {
        openModal();
        this.setState({ filterPresetDrawerOpen: true });
      }, 300);
    } else {
      openModal();
      this.setState({ filterPresetDrawerOpen: true, filterPreset: preset });
    }
  };
  closeFilterPresetDrawer = () => {
    closeModal();
    this.setState({
      filterPresetDrawerOpen: false,
    });
    setTimeout(() => {
      this.setState({
        filterPreset: {
          name: "",
          id: "",
          whitelist: {
            favorites: false,
            profiles: [],
            shipped: ["Shipped", "Not shipped"],
            vendorMode: "include",
            vendors: [],
          },
        },
      });
    }, 300);
  };
  openFilterPresetDeleteDialog = (preset) => {
    openModal();
    this.setState({ filterPresetDeleteDialogOpen: true, deleteFilterPreset: preset });
  };
  closeFilterPresetDeleteDialog = () => {
    closeModal();
    this.setState({
      filterPresetDeleteDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        deleteFilterPreset: {
          name: "",
          id: "",
          whitelist: {
            favorites: false,
            profiles: [],
            shipped: ["Shipped", "Not shipped"],
            vendorMode: "include",
            vendors: [],
          },
        },
      });
    }, 300);
  };
  openDetailsDrawer = (set) => {
    if (this.state.filterDrawerOpen) {
      this.closeFilterDrawer();
      setTimeout(() => {
        if (this.props.view === "compact") {
          openModal();
        }
        this.setState({
          detailsDrawerOpen: true,
          detailSet: set,
        });
      }, 300);
    } else {
      if (this.props.view === "compact") {
        openModal();
      }
      this.setState({
        detailsDrawerOpen: true,
        detailSet: set,
      });
    }
  };
  closeDetailsDrawer = () => {
    if (this.props.view === "compact") {
      closeModal();
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
      openModal();
    }
    this.setState({
      salesDialogOpen: true,
      salesSet: set,
    });
  };
  closeSalesDialog = () => {
    if (this.props.view !== "compact") {
      closeModal();
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
    openModal();
    this.setState({ createDrawerOpen: true });
  };
  closeCreateDrawer = () => {
    closeModal();
    this.setState({ createDrawerOpen: false });
  };
  openDeleteDialog = (set) => {
    this.closeDetailsDrawer();
    setTimeout(() => {
      openModal();
      this.setState({
        deleteDialogOpen: true,
        deleteSet: set,
      });
    }, 200);
  };
  closeDeleteDialog = () => {
    closeModal();
    this.setState({ deleteDialogOpen: false });
  };
  openDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: true });
  };
  closeDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: false });
  };
  openEditDrawer = (set) => {
    openModal();
    this.setState({
      editDrawerOpen: true,
      editSet: set,
    });
  };
  closeEditDrawer = () => {
    closeModal();
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
  componentDidUpdate(prevProps) {
    if (this.props.page !== prevProps.page && !mainPages.includes(this.props.page)) {
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
        edit={this.openEditDrawer}
      />
    ) : (
      <ContentEmpty page={this.props.page} />
    );
    const editorElements =
      this.context.user.isEditor || this.context.user.isDesigner ? (
        <div className="editor-elements">
          <Fab className="create-fab" icon="add" label="Create" onClick={this.openCreateDrawer} />
          <DrawerCreate
            open={this.state.createDrawerOpen}
            close={this.closeCreateDrawer}
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
            profiles={this.props.profiles}
            allDesigners={this.props.allDesigners}
            allVendors={this.props.allVendors}
            allRegions={this.props.allRegions}
            set={this.state.editSet}
            getData={this.props.getData}
            snackbarQueue={this.props.snackbarQueue}
          />
          {this.context.user.isEditor ? (
            <>
              <DialogDelete
                open={this.state.deleteDialogOpen}
                close={this.closeDeleteDialog}
                set={this.state.deleteSet}
                openSnackbar={this.openDeleteSnackbar}
                getData={this.props.getData}
                snackbarQueue={this.props.snackbarQueue}
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
    const filterPresetElements =
      this.context.user.email && mainPages.includes(this.props.page) ? (
        <>
          <DrawerFilterPreset
            open={this.state.filterPresetDrawerOpen}
            close={this.closeFilterPresetDrawer}
            preset={this.state.filterPreset}
          />
          <DialogDeleteFilterPreset
            open={this.state.filterPresetDeleteDialogOpen}
            close={this.closeFilterPresetDeleteDialog}
            preset={this.state.deleteFilterPreset}
          />
        </>
      ) : null;
    const mainElements = mainPages.includes(this.props.page) ? (
      <>
        <DeviceContext.Consumer>
          {(device) => (
            <DrawerDetails
              view={this.props.view}
              set={this.state.detailSet}
              open={this.state.detailsDrawerOpen}
              close={this.closeDetailsDrawer}
              edit={this.openEditDrawer}
              delete={this.openDeleteDialog}
              search={this.props.search}
              setSearch={this.props.setSearch}
              toggleLichTheme={this.props.toggleLichTheme}
              openSales={this.openSalesDialog}
              device={device}
            />
          )}
        </DeviceContext.Consumer>
        <DialogSales open={this.state.salesDialogOpen} close={this.closeSalesDialog} set={this.state.salesSet} />
        <DrawerFilter
          view={this.props.view}
          profiles={this.props.profiles}
          vendors={this.props.allVendors}
          open={this.state.filterDrawerOpen}
          close={this.closeFilterDrawer}
          setWhitelist={this.props.setWhitelist}
          whitelist={this.props.whitelist}
          snackbarQueue={this.props.snackbarQueue}
          openPreset={this.openFilterPresetDrawer}
          deletePreset={this.openFilterPresetDeleteDialog}
          sort={this.props.sort}
        />
        {editorElements}
        {filterPresetElements}
      </>
    ) : null;
    return (
      <div className={classNames(this.props.className, this.props.page, "app-container")}>
        <DrawerNav
          view={this.props.view}
          open={this.state.navDrawerOpen}
          close={this.closeNavDrawer}
          page={this.props.page}
          setPage={this.props.setPage}
        />
        <DrawerAppContent
          className={classNames({
            "drawer-open":
              (this.state.detailsDrawerOpen || this.state.filterDrawerOpen) && this.props.view !== "compact",
          })}
        >
          <DesktopAppBar
            page={this.props.page}
            loading={this.props.loading}
            openNav={this.openNavDrawer}
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
          />
          <div className="content-container">
            {mainElements}
            <DrawerAppContent className={classNames("main", this.props.view, { content: this.props.content })}>
              {content}
              <Footer />
            </DrawerAppContent>
          </div>
        </DrawerAppContent>
      </div>
    );
  }
}

DesktopContent.contextType = UserContext;

export class TabletContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navDrawerOpen: false,
      filterDrawerOpen: false,
      filterPresetDrawerOpen: false,
      filterPreset: {
        name: "",
        id: "",
        whitelist: {
          favorites: false,
          profiles: [],
          shipped: ["Shipped", "Not shipped"],
          vendorMode: "include",
          vendors: [],
        },
      },
      filterPresetDeleteDialogOpen: false,
      deleteFilterPreset: {
        name: "",
        id: "",
        whitelist: {
          favorites: false,
          profiles: [],
          shipped: ["Shipped", "Not shipped"],
          vendorMode: "include",
          vendors: [],
        },
      },
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
    };
  }
  openNavDrawer = () => {
    openModal();
    this.setState({ navDrawerOpen: true });
  };
  closeNavDrawer = () => {
    closeModal();
    this.setState({ navDrawerOpen: false });
  };
  openCreateDrawer = () => {
    openModal();
    this.setState({ createDrawerOpen: true });
  };
  closeCreateDrawer = () => {
    closeModal();
    this.setState({ createDrawerOpen: false });
  };
  openEditDrawer = (set) => {
    openModal();
    if (this.state.detailsDrawerOpen) {
      this.closeDetailsDrawer();
      this.setState({ editSet: set });
      setTimeout(() => {
        this.setState((prevState) => {
          return { editDrawerOpen: !prevState.editDrawerOpen };
        });
      }, 300);
    } else {
      this.setState({
        editDrawerOpen: !this.state.editDrawerOpen,
        editSet: set,
      });
    }
  };
  closeEditDrawer = () => {
    closeModal();
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
      openModal();
      this.setState({
        deleteDialogOpen: true,
        deleteSet: set,
      });
    }, 200);
  };
  closeDeleteDialog = () => {
    closeModal();
    this.setState({ deleteDialogOpen: false });
  };
  openDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: true });
  };
  closeDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: false });
  };
  openFilterDrawer = () => {
    openModal();
    this.setState({ filterDrawerOpen: true });
  };
  closeFilterDrawer = () => {
    closeModal();
    this.setState({ filterDrawerOpen: false });
  };
  openFilterPresetDrawer = (preset) => {
    this.closeFilterDrawer();
    this.setState({ filterPreset: preset });
    setTimeout(() => {
      openModal();
      this.setState({ filterPresetDrawerOpen: true });
    }, 300);
  };
  closeFilterPresetDrawer = () => {
    closeModal();
    this.setState({
      filterPresetDrawerOpen: false,
    });
    setTimeout(() => {
      this.setState({
        filterPreset: {
          name: "",
          id: "",
          whitelist: {
            favorites: false,
            profiles: [],
            shipped: ["Shipped", "Not shipped"],
            vendorMode: "include",
            vendors: [],
          },
        },
      });
    }, 300);
  };
  openFilterPresetDeleteDialog = (preset) => {
    this.setState({ filterPresetDeleteDialogOpen: true, deleteFilterPreset: preset });
  };
  closeFilterPresetDeleteDialog = () => {
    this.setState({
      filterPresetDeleteDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        deleteFilterPreset: {
          name: "",
          id: "",
          whitelist: {
            favorites: false,
            profiles: [],
            shipped: ["Shipped", "Not shipped"],
            vendorMode: "include",
            vendors: [],
          },
        },
      });
    }, 300);
  };
  openDetailsDrawer = (set) => {
    openModal();
    this.setState({
      detailsDrawerOpen: true,
      detailSet: set,
    });
  };
  closeDetailsDrawer = () => {
    closeModal();
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
      />
    ) : (
      <ContentEmpty page={this.props.page} />
    );
    const editorElements =
      this.context.user.isEditor || this.context.user.isDesigner ? (
        <>
          <Fab key="CreateFab" className="create-fab" icon="add" onClick={this.openCreateDrawer} />
          <DrawerCreate
            open={this.state.createDrawerOpen}
            close={this.closeCreateDrawer}
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
            profiles={this.props.profiles}
            allDesigners={this.props.allDesigners}
            allVendors={this.props.allVendors}
            allRegions={this.props.allRegions}
            set={this.state.editSet}
            getData={this.props.getData}
            snackbarQueue={this.props.snackbarQueue}
          />
          {this.context.user.isEditor ? (
            <>
              <DialogDelete
                open={this.state.deleteDialogOpen}
                close={this.closeDeleteDialog}
                set={this.state.deleteSet}
                openSnackbar={this.openDeleteSnackbar}
                getData={this.props.getData}
                snackbarQueue={this.props.snackbarQueue}
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
    const filterPresetElements = this.context.user.email ? (
      <>
        <DrawerFilterPreset
          open={this.state.filterPresetDrawerOpen}
          close={this.closeFilterPresetDrawer}
          preset={this.state.filterPreset}
        />
        <DialogDeleteFilterPreset
          open={this.state.filterPresetDeleteDialogOpen}
          close={this.closeFilterPresetDeleteDialog}
          preset={this.state.deleteFilterPreset}
        />
      </>
    ) : null;
    const mainElements = mainPages.includes(this.props.page) ? (
      <>
        {editorElements}
        <DeviceContext.Consumer>
          {(device) => (
            <DrawerDetails
              view={this.props.view}
              set={this.state.detailSet}
              open={this.state.detailsDrawerOpen}
              close={this.closeDetailsDrawer}
              edit={this.openEditDrawer}
              delete={this.openDeleteDialog}
              search={this.props.search}
              setSearch={this.props.setSearch}
              toggleLichTheme={this.props.toggleLichTheme}
              openSales={this.openSalesDialog}
              device={device}
            />
          )}
        </DeviceContext.Consumer>
        <DialogSales open={this.state.salesDialogOpen} close={this.closeSalesDialog} set={this.state.salesSet} />
        <DrawerFilter
          view={this.props.view}
          profiles={this.props.profiles}
          vendors={this.props.allVendors}
          open={this.state.filterDrawerOpen}
          close={this.closeFilterDrawer}
          setWhitelist={this.props.setWhitelist}
          whitelist={this.props.whitelist}
          snackbarQueue={this.props.snackbarQueue}
          openPreset={this.openFilterPresetDrawer}
          deletePreset={this.openFilterPresetDeleteDialog}
          sort={this.props.sort}
        />
        {filterPresetElements}
      </>
    ) : null;
    return (
      <div className={classNames(this.props.className, this.props.page, "app-container")}>
        <DrawerNav
          view={this.props.view}
          open={this.state.navDrawerOpen}
          page={this.props.page}
          setPage={this.props.setPage}
          close={this.closeNavDrawer}
        />
        <TabletAppBar
          page={this.props.page}
          loading={this.props.loading}
          openNav={this.openNavDrawer}
          openFilter={this.openFilterDrawer}
          openAuditFilter={this.openAuditFilterDrawer}
          openStatisticsFilter={this.openStatisticsFilterDrawer}
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
        />
        <main className={classNames("main", this.props.view, { content: this.props.content })}>
          {content}
          <Footer />
        </main>
        {mainElements}
      </div>
    );
  }
}

TabletContent.contextType = UserContext;

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterDrawerOpen: false,
      filterPresetDialogOpen: false,
      filterPreset: {
        name: "",
        id: "",
        whitelist: {
          favorites: false,
          profiles: [],
          shipped: ["Shipped", "Not shipped"],
          vendorMode: "include",
          vendors: [],
        },
      },
      filterPresetDeleteDialogOpen: false,
      deleteFilterPreset: {
        name: "",
        id: "",
        whitelist: {
          favorites: false,
          profiles: [],
          shipped: ["Shipped", "Not shipped"],
          vendorMode: "include",
          vendors: [],
        },
      },
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
      searchBarOpen: false,
    };
  }
  openNavDrawer = () => {
    openModal();
    this.setState({ navDrawerOpen: true });
  };
  closeNavDrawer = () => {
    closeModal();
    this.setState({ navDrawerOpen: false });
  };
  openFilterDrawer = () => {
    openModal();
    this.setState({ filterDrawerOpen: true });
  };
  closeFilterDrawer = () => {
    closeModal();
    this.setState({ filterDrawerOpen: false });
  };
  openFilterPresetDialog = (preset) => {
    this.setState({ filterPresetDialogOpen: true, filterPreset: preset });
  };
  closeFilterPresetDialog = () => {
    this.setState({
      filterPresetDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        filterPreset: {
          name: "",
          id: "",
          whitelist: {
            favorites: false,
            profiles: [],
            shipped: ["Shipped", "Not shipped"],
            vendorMode: "include",
            vendors: [],
          },
        },
      });
    }, 400);
  };
  openFilterPresetDeleteDialog = (preset) => {
    this.setState({ filterPresetDeleteDialogOpen: true, deleteFilterPreset: preset });
  };
  closeFilterPresetDeleteDialog = () => {
    this.setState({
      filterPresetDeleteDialogOpen: false,
    });
    setTimeout(() => {
      this.setState({
        deleteFilterPreset: {
          name: "",
          id: "",
          whitelist: {
            favorites: false,
            profiles: [],
            shipped: ["Shipped", "Not shipped"],
            vendorMode: "include",
            vendors: [],
          },
        },
      });
    }, 300);
  };
  openCreateDialog = () => {
    openModal();
    this.setState((prevState) => {
      return { createDialogOpen: !prevState.createDialogOpen };
    });
  };
  closeCreateDialog = () => {
    closeModal();
    this.setState({ createDialogOpen: false });
  };
  openEditDialog = (set) => {
    if (this.state.detailsDrawerOpen) {
      this.closeDetailsDrawer();
      this.setState({ editSet: set });
      setTimeout(() => {
        openModal();
        this.setState((prevState) => {
          return { editDialogOpen: !prevState.editDialogOpen };
        });
      }, 300);
    } else {
      openModal();
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
      closeModal();
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
      openModal();
      this.setState({
        deleteDialogOpen: true,
        deleteSet: set,
      });
    }, 200);
  };
  closeDeleteDialog = () => {
    closeModal();
    this.setState({ deleteDialogOpen: false });
  };
  openDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: true });
  };
  closeDeleteSnackbar = () => {
    this.setState({ deleteSnackbarOpen: false });
  };
  openDetailsDrawer = (set) => {
    openModal();
    this.setState({
      detailsDrawerOpen: true,
      detailSet: set,
    });
  };
  closeDetailsDrawer = () => {
    closeModal();
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
        edit={this.openEditDialog}
        detailSet={this.state.detailSet}
      />
    ) : (
      <ContentEmpty page={this.props.page} />
    );
    const editorElements =
      this.context.user.isEditor || this.context.user.isDesigner ? (
        <>
          <Fab
            className={classNames("create-fab", { middle: this.props.bottomNav })}
            icon="add"
            onClick={this.openCreateDialog}
          />
          <DialogCreate
            open={this.state.createDialogOpen}
            close={this.closeCreateDialog}
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
            profiles={this.props.profiles}
            allDesigners={this.props.allDesigners}
            allVendors={this.props.allVendors}
            allRegions={this.props.allRegions}
            set={this.state.editSet}
            getData={this.props.getData}
            snackbarQueue={this.props.snackbarQueue}
          />
          {this.context.user.isEditor ? (
            <>
              <DialogDelete
                open={this.state.deleteDialogOpen}
                close={this.closeDeleteDialog}
                set={this.state.deleteSet}
                openSnackbar={this.openDeleteSnackbar}
                getData={this.props.getData}
                snackbarQueue={this.props.snackbarQueue}
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
    const appBar = this.props.bottomNav ? (
      <div className="bottomNav">
        {(this.context.user.isEditor || this.context.user.isDesigner) && mainPages.includes(this.props.page) ? (
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
            getActions={this.getAuditActions}
            openNav={this.openNavDrawer}
            view={this.props.view}
            setView={this.props.setView}
            sort={this.props.sort}
            setSort={this.props.setSort}
            search={this.props.search}
            setSearch={this.props.setSearch}
            sets={this.props.sets}
          />
        )}
      </div>
    ) : (
      <MobileAppBar
        page={this.props.page}
        loading={this.props.loading}
        openFilter={this.openFilterDrawer}
        openNav={this.openNavDrawer}
        view={this.props.view}
        setView={this.props.setView}
        sort={this.props.sort}
        setSort={this.props.setSort}
        search={this.props.search}
        setSearch={this.props.setSearch}
        sets={this.props.sets}
      />
    );
    const search =
      this.props.bottomNav &&
      (this.context.user.isEditor || this.context.user.isDesigner) &&
      mainPages.includes(this.props.page) ? (
        <SearchAppBar
          open={this.state.searchBarOpen}
          openBar={this.openSearchBar}
          close={this.closeSearchBar}
          search={this.props.search}
          setSearch={this.props.setSearch}
          sets={this.props.sets}
        />
      ) : null;
    const filterPresetElements = this.context.user.email ? (
      <>
        <DialogFilterPreset
          open={this.state.filterPresetDialogOpen}
          close={this.closeFilterPresetDialog}
          preset={this.state.filterPreset}
        />
        <DialogDeleteFilterPreset
          open={this.state.filterPresetDeleteDialogOpen}
          close={this.closeFilterPresetDeleteDialog}
          preset={this.state.deleteFilterPreset}
        />
      </>
    ) : null;
    const mainElements = mainPages.includes(this.props.page) ? (
      <>
        {editorElements}
        <DeviceContext.Consumer>
          {(device) => (
            <DrawerDetails
              view={this.props.view}
              set={this.state.detailSet}
              open={this.state.detailsDrawerOpen}
              close={this.closeDetailsDrawer}
              edit={this.openEditDrawer}
              delete={this.openDeleteDialog}
              search={this.props.search}
              setSearch={this.props.setSearch}
              toggleLichTheme={this.props.toggleLichTheme}
              openSales={this.openSalesDialog}
              device={device}
            />
          )}
        </DeviceContext.Consumer>
        <DialogSales open={this.state.salesDialogOpen} close={this.closeSalesDialog} set={this.state.salesSet} />
        <DrawerFilter
          view={this.props.view}
          profiles={this.props.profiles}
          vendors={this.props.allVendors}
          open={this.state.filterDrawerOpen}
          close={this.closeFilterDrawer}
          setWhitelist={this.props.setWhitelist}
          whitelist={this.props.whitelist}
          snackbarQueue={this.props.snackbarQueue}
          openPreset={this.openFilterPresetDialog}
          deletePreset={this.openFilterPresetDeleteDialog}
          sort={this.props.sort}
        />
        {filterPresetElements}
      </>
    ) : null;
    return (
      <div
        className={classNames(this.props.className, this.props.page, "app-container", {
          "offset-snackbar": this.context.user.isEditor || this.context.user.isDesigner,
          "bottom-nav": this.props.bottomNav,
        })}
      >
        <DrawerNav
          view={this.props.view}
          bottomNav={this.props.bottomNav}
          open={this.state.navDrawerOpen}
          page={this.props.page}
          setPage={this.props.setPage}
          close={this.closeNavDrawer}
        />
        {search}
        {appBar}
        <main className={classNames("main", this.props.view, { content: this.props.content })}>
          {content}
          <Footer />
        </main>
        {mainElements}
      </div>
    );
  }
}

MobileContent.contextType = UserContext;

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
  view: PropTypes.string,
  whitelist: PropTypes.shape(whitelistTypes),
};

TabletContent.propTypes = {
  ...DesktopContent.propTypes,
};

MobileContent.propTypes = {
  ...DesktopContent.propTypes,
  bottomNav: PropTypes.bool,
  setBottomNav: PropTypes.func,
};
