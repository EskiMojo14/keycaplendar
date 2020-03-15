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
import { DrawerCreate, DrawerEdit } from './DrawerEntry';

export class DesktopContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { navDrawerOpen: true, filterDrawerOpen: false, createDrawerOpen: false, editDrawerOpen: false, editSet: {} };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.toggleFilterDrawer = this.toggleFilterDrawer.bind(this);
    this.closeFilterDrawer = this.closeFilterDrawer.bind(this);
    this.toggleCreateDrawer = this.toggleCreateDrawer.bind(this);
    this.closeCreateDrawer = this.closeCreateDrawer.bind(this);
    this.toggleEditDrawer = this.toggleEditDrawer.bind(this);
    this.closeEditDrawer = this.closeEditDrawer.bind(this);
  }
  toggleNavDrawer() {
    this.setState({ navDrawerOpen: !this.state.navDrawerOpen });
  }
  toggleFilterDrawer() {
    this.setState({ filterDrawerOpen: !this.state.filterDrawerOpen });
  }
  closeFilterDrawer() {
    this.setState({ filterDrawerOpen: false });
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
      editDrawerOpen: false,
      editSet: {}
    });
  }
  render() {
    const content = (this.props.content ? (
      <ContentGrid maxColumns={3} groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} admin={this.props.admin} edit={this.toggleEditDrawer} />
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
        <DrawerAppContent className={(this.state.filterDrawerOpen ? 'drawer-open ' : '') + (this.state.createDrawerOpen || this.state.editDrawerOpen ? 'modal-drawer-open' : '')}>
          <DesktopAppBar page={this.props.page} loading={this.props.loading} toggleLoading={this.props.toggleLoading} toggleNavDrawer={this.toggleNavDrawer} toggleFilterDrawer={this.toggleFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} />
          <div className="content-container">
            {content}
            <div className="drawer-container">
              <DesktopDrawerFilter vendors={this.props.vendors} profiles={this.props.profiles} open={this.state.filterDrawerOpen} closeFilterDrawer={this.closeFilterDrawer} />
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
    this.state = { navDrawerOpen: false, filterDrawerOpen: false, createDrawerOpen: false, editDrawerOpen: false, editSet: {}, hideFab: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.closeNavDrawer = this.closeNavDrawer.bind(this);
    this.toggleCreateDrawer = this.toggleCreateDrawer.bind(this);
    this.closeCreateDrawer = this.closeCreateDrawer.bind(this);
    this.toggleFilterDrawer = this.toggleFilterDrawer.bind(this);
    this.closeFilterDrawer = this.closeFilterDrawer.bind(this);
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
    this.setState({
      editDrawerOpen: !this.state.editDrawerOpen,
      editSet: set
    });
  }
  closeEditDrawer() {
    this.setState({
      editDrawerOpen: false,
      editSet: {}
    });
  }
  toggleFilterDrawer() {
    this.setState({ filterDrawerOpen: !this.state.filterDrawerOpen });
  }
  closeFilterDrawer() {
    this.setState({ filterDrawerOpen: false });
  }
  toggleLoading() {
    this.setState({ loading: !this.state.loading });
  }
  render() {
    const content = (this.props.content ? <ContentGrid maxColumns={2} groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} admin={this.props.admin} edit={this.toggleEditDrawer} /> : <ContentEmpty />);
    const adminElements = (this.props.admin ? (
      <div>
        <Fab className="create-fab" icon="add" onClick={this.toggleCreateDrawer} exited={this.state.hideFab}/>
        <DrawerCreate open={this.state.createDrawerOpen} close={this.closeCreateDrawer} profiles={this.props.profiles} getData={this.props.getData} />
        <DrawerEdit open={this.state.editDrawerOpen} close={this.closeEditDrawer} profiles={this.props.profiles} set={this.state.editSet} getData={this.props.getData} />
      </div>
    ) : '');
    return (
      <div className={(this.state.navDrawerOpen || this.state.createDrawerOpen || this.state.editDrawerOpen ? 'modal-drawer-open' : '') + ' ' + this.props.className}>
        <MobileNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} close={this.closeNavDrawer} />
        <TabletAppBar page={this.props.page} loading={this.props.loading} toggleLoading={this.props.toggleLoading} toggleNavDrawer={this.toggleNavDrawer} toggleFilterDrawer={this.toggleFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} />
        {content}
        {adminElements}
        <TabletDrawerFilter vendors={this.props.vendors} open={this.state.filterDrawerOpen} close={this.closeFilterDrawer} />
      </div>
    );
  }
}

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filterDialogOpen: false, createDialogOpen: false, editDialogOpen: false, navDrawerOpen: false, filterBy: 'vendors', editSet: {}, hideFab: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.closeNavDrawer = this.closeNavDrawer.bind(this);
    this.toggleFilterDialog = this.toggleFilterDialog.bind(this);
    this.closeFilterDialog = this.closeFilterDialog.bind(this);
    this.toggleCreateDialog = this.toggleCreateDialog.bind(this);
    this.closeCreateDialog = this.closeCreateDialog.bind(this);
    this.toggleEditDialog = this.toggleEditDialog.bind(this);
    this.closeEditDialog = this.closeEditDialog.bind(this);
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
    this.setState({
      editDialogOpen: !this.state.editDialogOpen,
      editSet: set
    });
  }
  closeEditDialog() {
    this.setState({
      editDialogOpen: false,
      editSet: {}
    });
  }
  hideFab(value) {
    this.setState({
      hideFab: value
    })
  }
  render() {
    const content = (this.props.content ? <ContentGrid maxColumns={(this.props.view === 'imageList' ? 2 : 1)}  groups={this.props.groups} sets={this.props.sets} sort={this.props.sort} page={this.props.page} view={this.props.view} admin={this.props.admin} edit={this.toggleEditDrawer} /> : <ContentEmpty />);
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
        <MobileAppBar page={this.props.page} loading={this.props.loading} toggleLoading={this.props.toggleLoading} toggleDialog={this.toggleFilterDialog} toggleNavDrawer={this.toggleNavDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.props.sort} setSort={this.props.setSort} />
        {content}
        {adminElements}
        <DialogFilter vendors={this.props.vendors} profiles={this.props.profiles} open={this.state.filterDialogOpen} onClose={this.closeFilterDialog} filterBy={this.state.filterBy}/>
      </div>
    );
  }
}

export default DesktopContent;