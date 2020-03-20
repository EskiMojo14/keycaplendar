import React from 'react';
import './Content.scss';
import { DesktopAppBar, TabletAppBar, MobileAppBar } from './AppBar';
import { DrawerAppContent } from '@rmwc/drawer';
import { DesktopNavDrawer, MobileNavDrawer } from './NavDrawer';
import { Fab } from '@rmwc/fab';
import { ContentEmpty } from './ContentEmpty';
import { ContentGrid } from './ContentGrid';
import { DialogFilter } from './DialogFilter';
import { DialogCreate, DialogEdit } from './DialogEntry';
import { DesktopDrawerFilter, TabletDrawerFilter } from './DrawerFilter';
import { DesktopDrawerDetails, TabletDrawerDetails } from './DrawerDetails';
import { DrawerCreate, DrawerEdit } from './DrawerEntry';

export class DesktopContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { navDrawerOpen: true, filterDrawerOpen: false, detailsDrawerOpen: false, createDrawerOpen: false, editDrawerOpen: false, editSet: {}, detailSet: {} };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.toggleFilterDrawer = this.toggleFilterDrawer.bind(this);
    this.closeFilterDrawer = this.closeFilterDrawer.bind(this);
    this.openDetailsDrawer = this.openDetailsDrawer.bind(this);
    this.closeDetailsDrawer = this.closeDetailsDrawer.bind(this);
    this.toggleCreateDrawer = this.toggleCreateDrawer.bind(this);
    this.closeCreateDrawer = this.closeCreateDrawer.bind(this);
    this.toggleEditDrawer = this.toggleEditDrawer.bind(this);
    this.closeEditDrawer = this.closeEditDrawer.bind(this);
  }
  toggleNavDrawer() {
    this.setState({ navDrawerOpen: !this.state.navDrawerOpen });
  }
  toggleFilterDrawer() {
    if (this.state.detailsDrawerOpen) {
      this.closeDetailsDrawer();
      setTimeout(() => {
        this.setState({filterDrawerOpen: !this.state.filterDrawerOpen });
      },400);
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
      },400);
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
    },200);
  }
  toggleCreateDrawer() {
    this.setState({ createDrawerOpen: !this.state.createDrawerOpen });
  }
  closeCreateDrawer() {
    this.setState({ createDrawerOpen: false });
  }
  toggleEditDrawer(set) {
    this.setState({
      editDrawerOpen: !this.state.editDrawerOpen,
      editSet: set
    });
  }
  closeEditDrawer() {
    this.setState({
      editDrawerOpen: false
    });
    setTimeout(() => {
      this.setState({
        editSet: {}
    });
    },200);
  } 
  render() {
    const content = (this.props.content ? (
      <ContentGrid maxColumns={6} groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} admin={this.props.admin} details={this.openDetailsDrawer} closeDetails={this.closeDetailsDrawer} detailSet={this.state.detailSet} editSet={this.state.editSet} />
    ) : <ContentEmpty />);
    const adminElements = (this.props.admin ? (
      <div>
        <Fab className="create-fab" icon="add" label="Create" onClick={this.toggleCreateDrawer} />
        <DrawerCreate open={this.state.createDrawerOpen} close={this.closeCreateDrawer} profiles={this.props.profiles} getData={this.props.getData} />
        <DrawerEdit open={this.state.editDrawerOpen} close={this.closeEditDrawer} profiles={this.props.profiles} set={this.state.editSet} getData={this.props.getData} />
      </div>
    ) : '');
    return (
      <div className={this.props.className}>
        <DesktopNavDrawer open={this.state.navDrawerOpen} close={this.toggleNavDrawer} page={this.props.page} changePage={this.props.changePage} />
        <DrawerAppContent className={(this.state.detailsDrawerOpen ? 'details-drawer-open ' : '') + (this.state.filterDrawerOpen ? 'filter-drawer-open ' : '') + (this.state.createDrawerOpen || this.state.editDrawerOpen ? 'modal-drawer-open' : '')}>
          <DesktopAppBar page={this.props.page} loading={this.props.loading} toggleNavDrawer={this.toggleNavDrawer} toggleFilterDrawer={this.toggleFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} search={this.props.search} setSearch={this.props.setSearch} />
          <div className="content-container">
            {content}
            <div className="drawer-container">
              <DesktopDrawerDetails set={this.state.detailSet} open={this.state.detailsDrawerOpen} close={this.closeDetailsDrawer} edit={this.toggleEditDrawer} search={this.props.search} setSearch={this.props.setSearch} />
              <DesktopDrawerFilter profiles={this.props.profiles} vendors={this.props.vendors} open={this.state.filterDrawerOpen} close={this.closeFilterDrawer} />
            </div>
          </div>
        </DrawerAppContent>
        {adminElements}

      </div>
    );
  }
}
export class TabletContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { navDrawerOpen: false, filterDrawerOpen: false, detailsDrawerOpen: false, createDrawerOpen: false, editDrawerOpen: false, editSet: {}, detailSet: {}, hideFab: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.closeNavDrawer = this.closeNavDrawer.bind(this);
    this.toggleCreateDrawer = this.toggleCreateDrawer.bind(this);
    this.closeCreateDrawer = this.closeCreateDrawer.bind(this);
    this.toggleFilterDrawer = this.toggleFilterDrawer.bind(this);
    this.closeFilterDrawer = this.closeFilterDrawer.bind(this);
    this.openDetailsDrawer = this.openDetailsDrawer.bind(this);
    this.closeDetailsDrawer = this.closeDetailsDrawer.bind(this);
    this.toggleEditDrawer = this.toggleEditDrawer.bind(this);
    this.closeEditDrawer = this.closeEditDrawer.bind(this);
  }
  componentDidMount() {
    function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this, args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };
    let lastScrollTop = 0;
    const onScroll = () => {
      var st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop) {
        this.setState({
          hideFab: true
        });
      } else {
        this.setState({
          hideFab: false
        });
      }
      lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
    };
    window.addEventListener("scroll", debounce(function() {
        onScroll();
    },100), false);
  }
  toggleNavDrawer() {
    let newState = (this.state.navDrawerOpen ? false : true);
    this.setState({ navDrawerOpen: newState });
  }
  closeNavDrawer() {
    this.setState({ navDrawerOpen: false });
  }
  toggleCreateDrawer() {
    this.setState({ createDrawerOpen: !this.state.createDrawerOpen });
  }
  closeCreateDrawer() {
    this.setState({ createDrawerOpen: false });
  }
  toggleEditDrawer(set) {
    if (this.state.detailsDrawerOpen) {
      this.closeDetailsDrawer();
      this.setState({ editSet: set });
      setTimeout(() => {
        this.setState({editDrawerOpen: !this.state.editDrawerOpen });
      },400);
    } else {
      this.setState({
        editDrawerOpen: !this.state.editDrawerOpen,
        editSet: set
      });
    }
  }
  closeEditDrawer() {
    this.setState({
      editDrawerOpen: false
    });
    setTimeout(() => {
      this.setState({
        editSet: {}
    });
    },200);
  }
  toggleFilterDrawer() {
    this.setState({ filterDrawerOpen: !this.state.filterDrawerOpen });
  }
  closeFilterDrawer() {
    this.setState({ filterDrawerOpen: false });
  }
  openDetailsDrawer(set) {
    this.setState({
      detailsDrawerOpen: true,
      detailSet: set
    });
  }
  closeDetailsDrawer() {
    this.setState({
      detailsDrawerOpen: false
    });
    setTimeout(() => {
      this.setState({
        detailSet: {}
    });
    },200);
  }
  toggleLoading() {
    this.setState({ loading: !this.state.loading });
  }
  render() {
    const content = (this.props.content ? <ContentGrid maxColumns={2} groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} admin={this.props.admin} details={this.openDetailsDrawer} closeDetails={this.closeDetailsDrawer} detailSet={this.state.detailSet} editSet={this.state.editSet} /> : <ContentEmpty />);
    const adminElements = (this.props.admin ? (
      <div>
        <Fab className="create-fab" icon="add" onClick={this.toggleCreateDrawer} exited={this.state.hideFab}/>
        <DrawerCreate open={this.state.createDrawerOpen} close={this.closeCreateDrawer} profiles={this.props.profiles} getData={this.props.getData} />
        <DrawerEdit open={this.state.editDrawerOpen} close={this.closeEditDrawer} profiles={this.props.profiles} set={this.state.editSet} getData={this.props.getData} />
      </div>
    ) : '');
    return (
      <div className={(this.state.navDrawerOpen || this.state.filterDrawerOpen || this.state.detailsDrawerOpen || this.state.createDrawerOpen || this.state.editDrawerOpen ? 'modal-drawer-open' : '') + ' ' + this.props.className}>
        <MobileNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} close={this.closeNavDrawer} />
        <TabletAppBar page={this.props.page} loading={this.props.loading} toggleNavDrawer={this.toggleNavDrawer} toggleFilterDrawer={this.toggleFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} search={this.props.search} setSearch={this.props.setSearch} />
        {content}
        {adminElements}
        <TabletDrawerDetails set={this.state.detailSet} open={this.state.detailsDrawerOpen} close={this.closeDetailsDrawer} edit={this.toggleEditDrawer} search={this.props.search} setSearch={this.props.setSearch} />
        <TabletDrawerFilter vendors={this.props.vendors} open={this.state.filterDrawerOpen} close={this.closeFilterDrawer} />
      </div>
    );
  }
}

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filterDialogOpen: false, createDialogOpen: false, editDialogOpen: false, detailsDrawerOpen: false, navDrawerOpen: false, filterBy: 'vendors', editSet: {}, detailSet: {}, hideFab: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.closeNavDrawer = this.closeNavDrawer.bind(this);
    this.toggleFilterDialog = this.toggleFilterDialog.bind(this);
    this.closeFilterDialog = this.closeFilterDialog.bind(this);
    this.toggleCreateDialog = this.toggleCreateDialog.bind(this);
    this.closeCreateDialog = this.closeCreateDialog.bind(this);
    this.toggleEditDialog = this.toggleEditDialog.bind(this);
    this.closeEditDialog = this.closeEditDialog.bind(this);
    this.openDetailsDrawer = this.openDetailsDrawer.bind(this);
    this.closeDetailsDrawer = this.closeDetailsDrawer.bind(this);
    this.hideFab = this.hideFab.bind(this);
  }
  componentDidMount() {
    function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this, args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };
    let lastScrollTop = 0;
    const onScroll = () => {
      var st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop) {
        this.setState({
          hideFab: true
        });
      } else {
        this.setState({
          hideFab: false
        });
      }
      lastScrollTop = st <= 0 ? 0 : st; // For Mobile or negative scrolling
    };
    window.addEventListener("scroll", debounce(function() {
        onScroll();
    },100), false);
  }
  toggleNavDrawer() {
    this.setState({ navDrawerOpen: !this.state.navDrawerOpen });
  }
  closeNavDrawer() {
    this.setState({ navDrawerOpen: false });
  }
  toggleFilterDialog(index) {
    const filters = ['vendors','profiles'];
    this.setState({ filterDialogOpen: !this.state.filterDialogOpen, filterBy: filters[index] });
  }
  closeFilterDialog() {
    this.setState({ filterDialogOpen: false });
  }
  toggleCreateDialog() {
    this.setState({ createDialogOpen: !this.state.createDialogOpen });
  }
  closeCreateDialog() {
    this.setState({ createDialogOpen: false });
  }
  toggleEditDialog(set) {
    if (this.state.detailsDrawerOpen) {
      this.closeDetailsDrawer();
      this.setState({ editSet: set });
      setTimeout(() => {
        this.setState({editDialogOpen: !this.state.editDialogOpen });
      },400);
    } else {
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
      this.setState({
        editSet: {}
    });
    },200);
  }
  openDetailsDrawer(set) {
    this.setState({
      detailsDrawerOpen: true,
      detailSet: set
    });
  }
  closeDetailsDrawer() {
    this.setState({
      detailsDrawerOpen: false
    });
    setTimeout(() => {
      this.setState({
        detailSet: {}
    });
    },200);
  }
  hideFab(value) {
    this.setState({
      hideFab: value
    })
  }
  render() {
    const content = (this.props.content ? <ContentGrid maxColumns={(this.props.view === 'imageList' ? 2 : 1)}  groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} admin={this.props.admin} details={this.openDetailsDrawer} closeDetails={this.closeDetailsDrawer} detailSet={this.state.detailSet} /> : <ContentEmpty />);
    const adminElements = (this.props.admin ? (
      <div>
        <Fab className="create-fab" icon="add" onClick={this.toggleCreateDialog} exited={this.state.hideFab}/>
        <DialogCreate open={this.state.createDialogOpen} close={this.closeCreateDialog} profiles={this.props.profiles} getData={this.props.getData} />
        <DialogEdit open={this.state.editDialogOpen} close={this.closeEditDialog} profiles={this.props.profiles} set={this.state.editSet} getData={this.props.getData} />
      </div>
    ) : '');
    return (
      <div className={(this.state.navDrawerOpen || this.state.createDialogOpen || this.state.editDialogOpen ? 'modal-drawer-open' : '') + ' ' + this.props.className}>
        <MobileNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} close={this.closeNavDrawer} />
        <MobileAppBar page={this.props.page} loading={this.props.loading} toggleDialog={this.toggleFilterDialog} toggleNavDrawer={this.toggleNavDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} search={this.props.search} setSearch={this.props.setSearch} />
        {content}
        {adminElements}
        <TabletDrawerDetails set={this.state.detailSet} open={this.state.detailsDrawerOpen} close={this.closeDetailsDrawer} edit={this.toggleEditDialog} search={this.props.search} setSearch={this.props.setSearch} />
        <DialogFilter vendors={this.props.vendors} profiles={this.props.profiles} open={this.state.filterDialogOpen} onClose={this.closeFilterDialog} filterBy={this.state.filterBy}/>
      </div>
    );
  }
}

export default DesktopContent;