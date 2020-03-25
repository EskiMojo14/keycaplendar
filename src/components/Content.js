import React from 'react';
import './Content.scss';
import { DesktopAppBar, TabletAppBar, MobileAppBar, BottomAppBar, BottomAppBarIndent } from './AppBar';
import { DrawerAppContent } from '@rmwc/drawer';
import { DesktopNavDrawer, MobileNavDrawer, BottomNavDrawer } from './NavDrawer';
import { Fab } from '@rmwc/fab';
import { ContentEmpty } from './ContentEmpty';
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
    this.openModal();
    this.setState({
      deleteDialogOpen: true,
      deleteSet: set
    });
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
      editDrawerOpen: false
    });
    setTimeout(() => {
      this.setState({
        editSet: {}
      });
    }, 200);
  }
  openSettingsDialog() {
    this.openModal();
    this.setState({ settingsDialogOpen: true });
  }
  closeSettingsDialog() {
    this.closeModal();
    this.setState({ settingsDialogOpen: false });
  }
  render() {
    const content = (this.props.content ? (
      <ContentGrid maxColumns={6} groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} admin={this.props.admin} details={this.openDetailsDrawer} closeDetails={this.closeDetailsDrawer} detailSet={this.state.detailSet} editSet={this.state.editSet} />
    ) : <ContentEmpty />);
    const adminElements = (this.props.admin ? (
      <div>
        <Fab className="create-fab" icon="add" label="Create" onClick={this.openCreateDrawer} />
        <DrawerCreate open={this.state.createDrawerOpen} close={this.closeCreateDrawer} profiles={this.props.profiles} getData={this.props.getData} />
        <DrawerEdit open={this.state.editDrawerOpen} close={this.closeEditDrawer} profiles={this.props.profiles} set={this.state.editSet} getData={this.props.getData} />
        <DialogDelete open={this.state.deleteDialogOpen} close={this.closeDeleteDialog} set={this.state.deleteSet} openSnackbar={this.openDeleteSnackbar} getData={this.props.getData} />
        <SnackbarDeleted open={this.state.deleteSnackbarOpen} close={this.closeDeleteSnackbar} set={this.state.deleteSet} getData={this.props.getData} />
      </div>
    ) : '');
    return (
      <div className={this.props.className}>
        <DesktopNavDrawer open={this.state.navDrawerOpen} close={this.toggleNavDrawer} page={this.props.page} changePage={this.props.changePage} openSettings={this.openSettingsDialog} />
        <DrawerAppContent className={(this.state.detailsDrawerOpen ? 'details-drawer-open ' : '') + (this.state.filterDrawerOpen ? 'filter-drawer-open ' : '')}>
          <DesktopAppBar page={this.props.page} loading={this.props.loading} toggleNav={this.toggleNavDrawer} toggleFilter={this.toggleFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} search={this.props.search} setSearch={this.props.setSearch} />
          <div className="content-container">
            <main className="main">
              {content}
              <Footer />
            </main>
            <div className="drawer-container">
              <DesktopDrawerDetails admin={this.props.admin} set={this.state.detailSet} open={this.state.detailsDrawerOpen} close={this.closeDetailsDrawer} edit={this.openEditDrawer} delete={this.openDeleteDialog} search={this.props.search} setSearch={this.props.setSearch} />
              <DesktopDrawerFilter profiles={this.props.profiles} vendors={this.props.vendors} open={this.state.filterDrawerOpen} close={this.closeFilterDrawer} />
            </div>
          </div>
        </DrawerAppContent>
        {adminElements}
        <DialogSettings open={this.state.settingsDialogOpen} close={this.closeSettingsDialog} theme={this.props.theme} changeTheme={this.props.changeTheme} />
      </div>
    );
  }
}
export class TabletContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { navDrawerOpen: false, filterDrawerOpen: false, detailsDrawerOpen: false, detailSet: {}, createDrawerOpen: false, editDrawerOpen: false, editSet: {}, deleteDialogOpen: false, deleteSnackbarOpen: false, deleteSet: {}, settingsDialogOpen: false };
    this.openNavDrawer = this.openNavDrawer.bind(this);
    this.closeNavDrawer = this.closeNavDrawer.bind(this);
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
  openNavDrawer() {
    this.openModal();
    this.setState({ navDrawerOpen: !this.state.navDrawerOpen });
  }
  closeNavDrawer() {
    this.closeModal();
    this.setState({ navDrawerOpen: false });
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
      editDrawerOpen: false
    });
    setTimeout(() => {
      this.setState({
        editSet: {}
      });
    }, 200);
  }
  openDeleteDialog(set) {
    this.openModal();
    this.setState({
      deleteDialogOpen: true,
      deleteSet: set
    });
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
      detailsDrawerOpen: false
    });
    setTimeout(() => {
      this.setState({
        detailSet: {}
      });
    }, 200);
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
    const content = (this.props.content ? <ContentGrid maxColumns={2} groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} admin={this.props.admin} details={this.openDetailsDrawer} closeDetails={this.closeDetailsDrawer} detailSet={this.state.detailSet} editSet={this.state.editSet} /> : <ContentEmpty />);
    const adminElements = (this.props.admin ? (
      <div>
        <Fab className="create-fab" icon="add" onClick={this.openCreateDrawer} />
        <DrawerCreate open={this.state.createDrawerOpen} close={this.closeCreateDrawer} profiles={this.props.profiles} getData={this.props.getData} />
        <DrawerEdit open={this.state.editDrawerOpen} close={this.closeEditDrawer} profiles={this.props.profiles} set={this.state.editSet} getData={this.props.getData} />
        <DialogDelete open={this.state.deleteDialogOpen} close={this.closeDeleteDialog} set={this.state.deleteSet} openSnackbar={this.openDeleteSnackbar} getData={this.props.getData} />
        <SnackbarDeleted open={this.state.deleteSnackbarOpen} close={this.closeDeleteSnackbar} set={this.state.deleteSet} getData={this.props.getData} />
      </div>
    ) : '');
    return (
      <div className={this.props.className}>
        <MobileNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} close={this.closeNavDrawer} openSettings={this.openSettingsDialog} />
        <TabletAppBar page={this.props.page} loading={this.props.loading} openNav={this.openNavDrawer} toggleFilter={this.openFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} search={this.props.search} setSearch={this.props.setSearch} />
        <main className="main">
          {content}
          <Footer />
        </main>
        {adminElements}
        <TabletDrawerDetails admin={this.props.admin} set={this.state.detailSet} open={this.state.detailsDrawerOpen} close={this.closeDetailsDrawer} edit={this.openEditDrawer} delete={this.openDeleteDialog} search={this.props.search} setSearch={this.props.setSearch} />
        <TabletDrawerFilter vendors={this.props.vendors} open={this.state.filterDrawerOpen} close={this.closeFilterDrawer} />
        <DialogSettings open={this.state.settingsDialogOpen} close={this.closeSettingsDialog} theme={this.props.theme} changeTheme={this.props.changeTheme} />
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
    const filters = ['vendors', 'profiles'];
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
    this.openModal();
    this.setState({
      deleteDialogOpen: true,
      deleteSet: set
    });
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
      detailsDrawerOpen: false
    });
    setTimeout(() => {
      this.setState({
        detailSet: {}
      });
    }, 200);
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
  }
  closeSearchBar() {
    this.setState({ searchBarOpen: false });
  }
  render() {
    const content = (this.props.content ? <ContentGrid maxColumns={(this.props.view === 'imageList' ? 2 : 1)} groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} admin={this.props.admin} details={this.openDetailsDrawer} closeDetails={this.closeDetailsDrawer} detailSet={this.state.detailSet} /> : <ContentEmpty />);
    const adminElements = (this.props.admin ? (
      <div>
        <Fab className={'create-fab' + (this.props.bottomNav ? ' middle' : '')} icon="add" onClick={this.openCreateDialog} />
        <DialogCreate open={this.state.createDialogOpen} close={this.closeCreateDialog} profiles={this.props.profiles} getData={this.props.getData} />
        <DialogEdit open={this.state.editDialogOpen} close={this.closeEditDialog} profiles={this.props.profiles} set={this.state.editSet} getData={this.props.getData} />
        <DialogDelete open={this.state.deleteDialogOpen} close={this.closeDeleteDialog} set={this.state.deleteSet} openSnackbar={this.openDeleteSnackbar} getData={this.props.getData} />
        <SnackbarDeleted open={this.state.deleteSnackbarOpen} close={this.closeDeleteSnackbar} set={this.state.deleteSet} getData={this.props.getData} />
      </div>
    ) : '');
    const nav = (this.props.bottomNav ? (
      <div className="bottomNav">
        <BottomNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} close={this.closeNavDrawer} openSettings={this.openSettingsDialog} />
        {(this.props.admin ? (
          <BottomAppBarIndent page={this.props.page} loading={this.props.loading} openFilter={this.openFilterDialog} openNav={this.openNavDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} openSearch={this.openSearchBar} />) : (
            <BottomAppBar page={this.props.page} loading={this.props.loading} openFilter={this.openFilterDialog} openNav={this.openNavDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} search={this.props.search} setSearch={this.props.setSearch} />
          ))}
      </div>
    ) : (
        <div>
          <MobileNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} close={this.closeNavDrawer} openSettings={this.openSettingsDialog} />
          <MobileAppBar page={this.props.page} loading={this.props.loading} openFilter={this.openFilterDialog} openNav={this.openNavDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} search={this.props.search} setSearch={this.props.setSearch} />
        </div>
      ));
    const search = (this.props.bottomNav && this.props.admin ? (
      <SearchAppBar open={this.state.searchBarOpen} openBar={this.openSearchBar} close={this.closeSearchBar} search={this.props.search} setSearch={this.props.setSearch} />
    ) : (<div></div>))
    return (
      <div className={this.props.className + 'app-container'}>
        {search}
        {nav}
        <main className="main">
          {content}
          <Footer />
        </main>
        {adminElements}
        <TabletDrawerDetails admin={this.props.admin} set={this.state.detailSet} open={this.state.detailsDrawerOpen} close={this.closeDetailsDrawer} edit={this.openEditDialog} delete={this.openDeleteDialog} search={this.props.search} setSearch={this.props.setSearch} />
        <DialogFilter vendors={this.props.vendors} profiles={this.props.profiles} open={this.state.filterDialogOpen} onClose={this.closeFilterDialog} filterBy={this.state.filterBy} />
        <DialogSettings open={this.state.settingsDialogOpen} close={this.closeSettingsDialog} theme={this.props.theme} changeTheme={this.props.changeTheme} bottomNav={this.props.bottomNav} changeBottomNav={this.props.changeBottomNav} />
      </div>
    );
  }
}

export default DesktopContent;