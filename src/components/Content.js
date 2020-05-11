import React from 'react';
import './Content.scss';
import { DesktopAppBar, TabletAppBar, MobileAppBar, BottomAppBar, BottomAppBarIndent } from './AppBar';
import { DrawerAppContent } from '@rmwc/drawer';
import { DesktopDrawerNav, MobileDrawerNav, BottomDrawerNav } from './DrawerNav';
import { Fab } from '@rmwc/fab';
import { ContentEmpty } from './ContentEmpty';
import { ContentStatistics } from './ContentStatistics';
import { ContentGrid } from './ContentGrid';
import { DialogFilter } from './DialogFilter';
import { DialogDelete } from './DialogDelete';
import { DialogSettings } from './DialogSettings';
import { DialogCreate, DialogEdit } from './DialogEntry';
import { DesktopDrawerFilter, TabletDrawerFilter } from './DrawerFilter';
import { DesktopDrawerDetails, TabletDrawerDetails } from './DrawerDetails';
import { DrawerCreate, DrawerEdit } from './DrawerEntry';
import { SnackbarDeleted } from './SnackbarDeleted';
import { SearchAppBar } from './SearchBar';
import { Footer } from './Footer';

const bodyScroll = require('body-scroll-toggle');

export class DesktopContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { navDrawerOpen: true, filterDrawerOpen: false, detailsDrawerOpen: false, detailSet: {}, createDrawerOpen: false, editDrawerOpen: false, editSet: {}, deleteDialogOpen: false, deleteSnackbarOpen: false, deleteSet: {}, settingsDialogOpen: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.toggleFilterDrawer = this.toggleFilterDrawer.bind(this);
    this.closeFilterDrawer = this.closeFilterDrawer.bind(this);
    this.openDetailsDrawer = this.openDetailsDrawer.bind(this);
    this.closeDetailsDrawer = this.closeDetailsDrawer.bind(this);
    this.openCreateDrawer = this.openCreateDrawer.bind(this);
    this.closeCreateDrawer = this.closeCreateDrawer.bind(this);
    this.openEditDrawer = this.openEditDrawer.bind(this);
    this.closeEditDrawer = this.closeEditDrawer.bind(this);
    this.openDeleteDialog = this.openDeleteDialog.bind(this);
    this.closeDeleteDialog = this.closeDeleteDialog.bind(this);
    this.openDeleteSnackbar = this.openDeleteSnackbar.bind(this);
    this.closeDeleteSnackbar = this.closeDeleteSnackbar.bind(this);
    this.openSettingsDialog = this.openSettingsDialog.bind(this);
    this.closeSettingsDialog = this.closeSettingsDialog.bind(this);
  }
  openModal() {
    if (window.scrollY > 0) {
      document.querySelector('body').classList.add('scrolled');
    }
    bodyScroll.disable();
  }
  closeModal() {
    setTimeout(() => { document.querySelector('body').classList.remove('scrolled'); }, 20);
    bodyScroll.enable();
  }
  toggleNavDrawer() {
    this.setState({ navDrawerOpen: !this.state.navDrawerOpen });
  }
  toggleFilterDrawer() {
    if (this.state.detailsDrawerOpen) {
      this.closeDetailsDrawer();
      setTimeout(() => {
        this.setState({ filterDrawerOpen: !this.state.filterDrawerOpen });
      }, 400);
    } else {
      this.setState({ filterDrawerOpen: !this.state.filterDrawerOpen });
    }
  }
  closeFilterDrawer() {
    this.setState({ filterDrawerOpen: false });
  }
  openDetailsDrawer(set) {
    if (this.state.filterDrawerOpen) {
      this.closeFilterDrawer();
      setTimeout(() => {
        this.setState({
          detailsDrawerOpen: true,
          detailSet: set
        });
      }, 400);
    } else {
      this.setState({
        detailsDrawerOpen: true,
        detailSet: set
      });
    }
  }
  closeDetailsDrawer() {
    this.setState({
      detailsDrawerOpen: false
    });
    setTimeout(() => {
      this.setState({
        detailSet: {}
      });
    }, 200);
  }
  openCreateDrawer() {
    this.openModal();
    this.setState({ createDrawerOpen: true });
  }
  closeCreateDrawer() {
    this.closeModal();
    this.setState({ createDrawerOpen: false });
  }
  openDeleteDialog(set) {
    this.closeDetailsDrawer();
    setTimeout(() => {
      this.openModal();
      this.setState({
        deleteDialogOpen: true,
        deleteSet: set
      });
    }, 200);
  }
  closeDeleteDialog() {
    this.closeModal();
    this.setState({ deleteDialogOpen: false });
  }
  openDeleteSnackbar() {
    this.setState({ deleteSnackbarOpen: true });
  }
  closeDeleteSnackbar() {
    this.setState({ deleteSnackbarOpen: false });
  }
  openEditDrawer(set) {
    this.openModal();
    this.setState({
      editDrawerOpen: true,
      editSet: set
    });
  }
  closeEditDrawer() {
    this.closeModal();
    this.setState({
      editDrawerOpen: false,
      editSet: {}
    });
  }
  openSettingsDialog() {
    this.openModal();
    this.setState({ settingsDialogOpen: true });
  }
  closeSettingsDialog() {
    this.closeModal();
    this.setState({ settingsDialogOpen: false });
  }
  componentDidUpdate(prevProps) {
    if (this.props.page !== prevProps.page && this.props.page === 'statistics') {
      if (this.state.filterDrawerOpen) {
        this.closeFilterDrawer();
      }
      if (this.state.detailsDrawerOpen) {
        this.closeDetailsDrawer();
      }
    }
  }
  render() {
    const content = (this.props.content ? (
      <ContentGrid groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} editor={this.props.editor} details={this.openDetailsDrawer} closeDetails={this.closeDetailsDrawer} detailSet={this.state.detailSet} editSet={this.state.editSet} />
    ) : (this.props.page === 'statistics' ? (
        <ContentStatistics profiles={this.props.profiles} sets={this.props.allSets} navOpen={this.state.navDrawerOpen} desktop/>
      ) : (
        <ContentEmpty />
    )));
    const editorElements = (this.props.editor && this.props.page !== 'statistics' ? (
      <div>
        <Fab className="create-fab" icon="add" label="Create" onClick={this.openCreateDrawer} />
        <DrawerCreate open={this.state.createDrawerOpen} close={this.closeCreateDrawer} profiles={this.props.profiles} allVendors={this.props.allVendors} allRegions={this.props.allRegions} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
        <DrawerEdit open={this.state.editDrawerOpen} close={this.closeEditDrawer} profiles={this.props.profiles} allVendors={this.props.allVendors} allRegions={this.props.allRegions} set={this.state.editSet} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
        <DialogDelete open={this.state.deleteDialogOpen} close={this.closeDeleteDialog} set={this.state.deleteSet} openSnackbar={this.openDeleteSnackbar} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
        <SnackbarDeleted open={this.state.deleteSnackbarOpen} close={this.closeDeleteSnackbar} set={this.state.deleteSet} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
      </div>
    ) : '');
    const drawers = (this.props.view === 'compact' ? (
      <div>
        <TabletDrawerDetails editor={this.props.editor} set={this.state.detailSet} open={this.state.detailsDrawerOpen} close={this.closeDetailsDrawer} edit={this.openEditDrawer} delete={this.openDeleteDialog} search={this.props.search} setSearch={this.props.setSearch} />
        <TabletDrawerFilter profiles={this.props.profiles} vendors={this.props.vendors} open={this.state.filterDrawerOpen} close={this.closeFilterDrawer} setWhitelist={this.props.setWhitelist} whitelist={this.props.whitelist} />
      </div>
    ) : (
      <div className="drawer-container">
        <DesktopDrawerDetails editor={this.props.editor} set={this.state.detailSet} open={this.state.detailsDrawerOpen} close={this.closeDetailsDrawer} edit={this.openEditDrawer} delete={this.openDeleteDialog} search={this.props.search} setSearch={this.props.setSearch} />
        <DesktopDrawerFilter profiles={this.props.profiles} vendors={this.props.vendors} open={this.state.filterDrawerOpen} close={this.closeFilterDrawer} setWhitelist={this.props.setWhitelist} whitelist={this.props.whitelist} />
      </div>
    ))
    return (
      <div className={this.props.className}>
        <DesktopDrawerNav open={this.state.navDrawerOpen} close={this.toggleNavDrawer} page={this.props.page} changePage={this.props.changePage} openSettings={this.openSettingsDialog} />
        <DrawerAppContent className={(this.state.detailsDrawerOpen && this.props.view !== 'compact' ? 'details-drawer-open ' : '') + (this.state.filterDrawerOpen && this.props.view !== 'compact' ? 'filter-drawer-open ' : '') + (this.props.page === 'statistics' ? 'statistics ' : '')}>
          <DesktopAppBar page={this.props.page} loading={this.props.loading} toggleNav={this.toggleNavDrawer} toggleFilter={this.toggleFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} search={this.props.search} setSearch={this.props.setSearch} />
          <div className="content-container">
            <main className={"main " + this.props.view + (this.props.content ? ' content' : '') + (this.props.page === 'statistics' ? ' card content' : '')}>
              {content}
              <Footer />
            </main>
            {drawers}
          </div>
        </DrawerAppContent>
        {editorElements}
        <DialogSettings user={this.props.user} setUser={this.props.setUser} open={this.state.settingsDialogOpen} close={this.closeSettingsDialog} theme={this.props.theme} changeTheme={this.props.changeTheme} snackbarQueue={this.props.snackbarQueue} getData={this.props.getData} />
      </div>
    );
  }
}
export class TabletContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { navDrawerOpen: false, filterDrawerOpen: false, detailsDrawerOpen: false, detailSet: {}, createDrawerOpen: false, editDrawerOpen: false, editSet: {}, deleteDialogOpen: false, deleteSnackbarOpen: false, deleteSet: {}, settingsDialogOpen: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.openCreateDrawer = this.openCreateDrawer.bind(this);
    this.closeCreateDrawer = this.closeCreateDrawer.bind(this);
    this.openFilterDrawer = this.openFilterDrawer.bind(this);
    this.closeFilterDrawer = this.closeFilterDrawer.bind(this);
    this.openDetailsDrawer = this.openDetailsDrawer.bind(this);
    this.closeDetailsDrawer = this.closeDetailsDrawer.bind(this);
    this.openEditDrawer = this.openEditDrawer.bind(this);
    this.closeEditDrawer = this.closeEditDrawer.bind(this);
    this.openDeleteDialog = this.openDeleteDialog.bind(this);
    this.closeDeleteDialog = this.closeDeleteDialog.bind(this);
    this.openDeleteSnackbar = this.openDeleteSnackbar.bind(this);
    this.closeDeleteSnackbar = this.closeDeleteSnackbar.bind(this);
    this.openSettingsDialog = this.openSettingsDialog.bind(this);
    this.closeSettingsDialog = this.closeSettingsDialog.bind(this);
  }
  openModal() {
    if (window.scrollY > 0) {
      document.querySelector('body').classList.add('scrolled');
    }
    bodyScroll.disable();
  }
  closeModal() {
    setTimeout(() => { document.querySelector('body').classList.remove('scrolled'); }, 20);
    bodyScroll.enable();
  }
  toggleNavDrawer() {
    this.setState({ navDrawerOpen: !this.state.navDrawerOpen });
  }
  openCreateDrawer() {
    this.openModal();
    this.setState({ createDrawerOpen: true });
  }
  closeCreateDrawer() {
    this.closeModal();
    this.setState({ createDrawerOpen: false });
  }
  openEditDrawer(set) {
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
        editSet: set
      });
    }
  }
  closeEditDrawer() {
    this.closeModal();
    this.setState({
      editDrawerOpen: false,
      editSet: {}
    });
  }
  openDeleteDialog(set) {
    this.closeDetailsDrawer();
    setTimeout(() => {
      this.openModal();
      this.setState({
        deleteDialogOpen: true,
        deleteSet: set
      });
    }, 200);
  }
  closeDeleteDialog() {
    this.closeModal();
    this.setState({ deleteDialogOpen: false });
  }
  openDeleteSnackbar() {
    this.setState({ deleteSnackbarOpen: true });
  }
  closeDeleteSnackbar() {
    this.setState({ deleteSnackbarOpen: false });
  }
  openFilterDrawer() {
    this.openModal();
    this.setState({ filterDrawerOpen: true });
  }
  closeFilterDrawer() {
    this.closeModal();
    this.setState({ filterDrawerOpen: false });
  }
  openDetailsDrawer(set) {
    this.openModal();
    this.setState({
      detailsDrawerOpen: true,
      detailSet: set
    });
  }
  closeDetailsDrawer() {
    this.closeModal();
    this.setState({
      detailsDrawerOpen: false,
      detailSet: {}
    });
  }
  openSettingsDialog() {
    this.openModal();
    this.setState({ settingsDialogOpen: true });
  }
  closeSettingsDialog() {
    this.closeModal();
    this.setState({ settingsDialogOpen: false });
  }
  toggleLoading() {
    this.setState({ loading: !this.state.loading });
  }
  render() {
    const content = (this.props.content ? (
      <ContentGrid groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} editor={this.props.editor} details={this.openDetailsDrawer} closeDetails={this.closeDetailsDrawer} detailSet={this.state.detailSet} editSet={this.state.editSet} />
      ) : (this.props.page === 'statistics' ? (
        <ContentStatistics profiles={this.props.profiles} sets={this.props.allSets} />
        ) : (
        <ContentEmpty />
    )));
    const editorElements = (this.props.editor && this.props.page !== 'statistics' ? (
      <div>
        <Fab className="create-fab" icon="add" onClick={this.openCreateDrawer} />
        <DrawerCreate open={this.state.createDrawerOpen} close={this.closeCreateDrawer} profiles={this.props.profiles} allVendors={this.props.allVendors} allRegions={this.props.allRegions} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
        <DrawerEdit open={this.state.editDrawerOpen} close={this.closeEditDrawer} profiles={this.props.profiles} allVendors={this.props.allVendors} allRegions={this.props.allRegions} set={this.state.editSet} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
        <DialogDelete open={this.state.deleteDialogOpen} close={this.closeDeleteDialog} set={this.state.deleteSet} openSnackbar={this.openDeleteSnackbar} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
        <SnackbarDeleted open={this.state.deleteSnackbarOpen} close={this.closeDeleteSnackbar} set={this.state.deleteSet} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
      </div>
    ) : '');
    return (
      <div className={this.props.className}>
        <DesktopDrawerNav open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} close={this.toggleNavDrawer} openSettings={this.openSettingsDialog} />
        <DrawerAppContent>
          <TabletAppBar page={this.props.page} loading={this.props.loading} toggleNav={this.toggleNavDrawer} toggleFilter={this.openFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} search={this.props.search} setSearch={this.props.setSearch} />
          <main className={"main " + this.props.view + (this.props.content ? ' content' : '') + (this.props.page === 'statistics' ? ' card content' : '')}>
            {content}
            <Footer />
          </main>
        </DrawerAppContent>
        {editorElements}
        <TabletDrawerDetails editor={this.props.editor} set={this.state.detailSet} open={this.state.detailsDrawerOpen} close={this.closeDetailsDrawer} edit={this.openEditDrawer} delete={this.openDeleteDialog} search={this.props.search} setSearch={this.props.setSearch} />
        <TabletDrawerFilter vendors={this.props.vendors} profiles={this.props.profiles} open={this.state.filterDrawerOpen} close={this.closeFilterDrawer} setWhitelist={this.props.setWhitelist} whitelist={this.props.whitelist} />
        <DialogSettings user={this.props.user} setUser={this.props.setUser} open={this.state.settingsDialogOpen} close={this.closeSettingsDialog} theme={this.props.theme} changeTheme={this.props.changeTheme} snackbarQueue={this.props.snackbarQueue} getData={this.props.getData} />
      </div>
    );
  }
}

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filterDialogOpen: false, createDialogOpen: false, detailsDrawerOpen: false, detailSet: {}, navDrawerOpen: false, filterBy: 'vendors', editDialogOpen: false, editSet: {}, deleteDialogOpen: false, deleteSnackbarOpen: false, deleteSet: {}, settingsDialogOpen: false, searchBarOpen: false };
    this.openNavDrawer = this.openNavDrawer.bind(this);
    this.closeNavDrawer = this.closeNavDrawer.bind(this);
    this.openFilterDialog = this.openFilterDialog.bind(this);
    this.closeFilterDialog = this.closeFilterDialog.bind(this);
    this.openCreateDialog = this.openCreateDialog.bind(this);
    this.closeCreateDialog = this.closeCreateDialog.bind(this);
    this.openEditDialog = this.openEditDialog.bind(this);
    this.closeEditDialog = this.closeEditDialog.bind(this);
    this.openDetailsDrawer = this.openDetailsDrawer.bind(this);
    this.closeDetailsDrawer = this.closeDetailsDrawer.bind(this);
    this.openDeleteDialog = this.openDeleteDialog.bind(this);
    this.closeDeleteDialog = this.closeDeleteDialog.bind(this);
    this.openDeleteSnackbar = this.openDeleteSnackbar.bind(this);
    this.closeDeleteSnackbar = this.closeDeleteSnackbar.bind(this);
    this.openSettingsDialog = this.openSettingsDialog.bind(this);
    this.closeSettingsDialog = this.closeSettingsDialog.bind(this);
    this.openSearchBar = this.openSearchBar.bind(this);
    this.closeSearchBar = this.closeSearchBar.bind(this);
  }
  openModal() {
    if (window.scrollY > 0) {
      document.querySelector('body').classList.add('scrolled');
    }
    bodyScroll.disable();
  }
  closeModal() {
    setTimeout(() => { document.querySelector('body').classList.remove('scrolled'); }, 20);
    bodyScroll.enable();
  }
  openNavDrawer() {
    this.openModal();
    this.setState({ navDrawerOpen: true });
  }
  closeNavDrawer() {
    this.closeModal();
    this.setState({ navDrawerOpen: false });
  }
  openFilterDialog(index) {
    this.openModal();
    const filters = ['profiles', 'vendors'];
    this.setState({ filterDialogOpen: true, filterBy: filters[index] });
  }
  closeFilterDialog() {
    this.closeModal();
    this.setState({ filterDialogOpen: false });
  }
  openCreateDialog() {
    this.openModal();
    this.setState({ createDialogOpen: !this.state.createDialogOpen });
  }
  closeCreateDialog() {
    this.closeModal();
    this.setState({ createDialogOpen: false });
  }
  openEditDialog(set) {
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
        editSet: set
      });
    }
  }
  closeEditDialog() {
    this.setState({
      editDialogOpen: false
    });
    setTimeout(() => {
      this.closeModal();
      this.setState({
        editSet: {}
      });
    }, 200);
  }
  openDeleteDialog(set) {
    this.closeDetailsDrawer();
    setTimeout(() => {
      this.openModal();
      this.setState({
        deleteDialogOpen: true,
        deleteSet: set
      });
    }, 200);
  }
  closeDeleteDialog() {
    this.closeModal();
    this.setState({ deleteDialogOpen: false });
  }
  openDeleteSnackbar() {
    this.setState({ deleteSnackbarOpen: true });
  }
  closeDeleteSnackbar() {
    this.setState({ deleteSnackbarOpen: false });
  }
  openDetailsDrawer(set) {
    this.openModal();
    this.setState({
      detailsDrawerOpen: true,
      detailSet: set
    });
  }
  closeDetailsDrawer() {
    this.closeModal();
    this.setState({
      detailsDrawerOpen: false,
      detailSet: {}
    });
  }
  openSettingsDialog() {
    this.openModal();
    this.setState({ settingsDialogOpen: true });
  }
  closeSettingsDialog() {
    this.closeModal();
    this.setState({ settingsDialogOpen: false });
  }
  openSearchBar() {
    this.setState({ searchBarOpen: true });
    document.getElementById('search').focus();
  }
  closeSearchBar() {
    this.setState({ searchBarOpen: false });
  }
  render() {
    const content = (this.props.content ? (
      <ContentGrid groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} editor={this.props.editor} details={this.openDetailsDrawer} closeDetails={this.closeDetailsDrawer} detailSet={this.state.detailSet} />
      ) : (this.props.page === 'statistics' ? (
        <ContentStatistics profiles={this.props.profiles} sets={this.props.allSets} />
        ) : (
        <ContentEmpty />
    )));
    const editorElements = (this.props.editor && this.props.page !== 'statistics' ? (
      <div>
        <Fab className={'create-fab' + (this.props.bottomNav ? ' middle' : '')} icon="add" onClick={this.openCreateDialog} />
        <DialogCreate open={this.state.createDialogOpen} close={this.closeCreateDialog} profiles={this.props.profiles} allVendors={this.props.allVendors} allRegions={this.props.allRegions} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
        <DialogEdit open={this.state.editDialogOpen} close={this.closeEditDialog} profiles={this.props.profiles} allVendors={this.props.allVendors} allRegions={this.props.allRegions} set={this.state.editSet} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
        <DialogDelete open={this.state.deleteDialogOpen} close={this.closeDeleteDialog} set={this.state.deleteSet} openSnackbar={this.openDeleteSnackbar} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
        <SnackbarDeleted open={this.state.deleteSnackbarOpen} close={this.closeDeleteSnackbar} set={this.state.deleteSet} getData={this.props.getData} snackbarQueue={this.props.snackbarQueue} />
      </div>
    ) : '');
    const nav = (this.props.bottomNav ? (
      <div className="bottomNav">
        <BottomDrawerNav open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} close={this.closeNavDrawer} openSettings={this.openSettingsDialog} />
        {(this.props.editor && this.props.page !== 'statistics' ? (
          <BottomAppBarIndent page={this.props.page} loading={this.props.loading} openFilter={this.openFilterDialog} openNav={this.openNavDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} openSearch={this.openSearchBar} />) : (
            <BottomAppBar page={this.props.page} loading={this.props.loading} openFilter={this.openFilterDialog} openNav={this.openNavDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} search={this.props.search} setSearch={this.props.setSearch} />
          ))}
      </div>
    ) : (
        <div>
          <MobileDrawerNav open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} close={this.closeNavDrawer} openSettings={this.openSettingsDialog} />
          <MobileAppBar page={this.props.page} loading={this.props.loading} openFilter={this.openFilterDialog} openNav={this.openNavDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} search={this.props.search} setSearch={this.props.setSearch} />
        </div>
      ));
    const search = (this.props.bottomNav && this.props.editor ? (
      <SearchAppBar open={this.state.searchBarOpen} openBar={this.openSearchBar} close={this.closeSearchBar} search={this.props.search} setSearch={this.props.setSearch} />
    ) : (<div></div>))
    return (
      <div className={this.props.className + 'app-container' + (this.props.editor ? ' offset-snackbar' : '')+ (this.props.bottomNav ? ' bottom-nav' : '')}>
        {search}
        {nav}
        <main className={"main " + this.props.view + (this.props.content ? ' content' : '') + (this.props.page === 'statistics' ? ' card content' : '')}>
          {content}
          <Footer />
        </main>
        {editorElements}
        <TabletDrawerDetails editor={this.props.editor} set={this.state.detailSet} open={this.state.detailsDrawerOpen} close={this.closeDetailsDrawer} edit={this.openEditDialog} delete={this.openDeleteDialog} search={this.props.search} setSearch={this.props.setSearch} />
        <DialogFilter vendors={this.props.vendors} profiles={this.props.profiles} open={this.state.filterDialogOpen} onClose={this.closeFilterDialog} filterBy={this.state.filterBy} setWhitelist={this.props.setWhitelist} whitelist={this.props.whitelist} />
        <DialogSettings user={this.props.user} setUser={this.props.setUser} open={this.state.settingsDialogOpen} close={this.closeSettingsDialog} theme={this.props.theme} changeTheme={this.props.changeTheme} bottomNav={this.props.bottomNav} changeBottomNav={this.props.changeBottomNav} snackbarQueue={this.props.snackbarQueue} getData={this.props.getData} />
      </div>
    );
  }
}

export default DesktopContent;