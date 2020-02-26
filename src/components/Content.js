import React from 'react';
import './Content.scss';
import { DesktopAppBar, TabletAppBar, MobileAppBar } from './AppBar';
import { DrawerAppContent } from '@rmwc/drawer';
import { DesktopNavDrawer, MobileNavDrawer } from './NavDrawer';
import { Fab } from '@rmwc/fab';
import { ContentEmpty } from './ContentEmpty';
import { ContentGrid } from './ContentGrid';

export class DesktopContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: true, content: true, sort: 'vendor', admin: true, loading: false };
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.setSort = this.setSort.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  setSort(sortBy) {
    const sort = ['vendor','date','profile'];
    this.setState({ sort: sort[sortBy] });
  }
  toggleLoading() {
    let newState = (this.state.loading ? false : true);
    this.setState({ loading: newState });
  }
  render() {
    const content = (this.state.content ? <ContentGrid view={this.props.view} admin={this.state.admin} loading={this.state.loading}/> : <ContentEmpty />);
    const FAB = (this.state.admin ? <Fab className="create-fab" icon="add" label="Create"/> : '');
    return (
      <div className={this.props.className}>
        <DesktopAppBar loading={this.state.loading} toggleLoading={this.toggleLoading} toggleDrawer={this.toggleDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        <DesktopNavDrawer open={this.state.drawerOpen} page={this.props.page} changePage={this.props.changePage} toggleDrawer={this.toggleDrawer} />
        <DrawerAppContent>
          {content}
        </DrawerAppContent>
        {FAB}
      </div>
    );
  }
}
export class TabletContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: false, content: true, sort: 'vendor', admin: true, loading: false };
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.setSort = this.setSort.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  toggleLoading() {
    let newState = (this.state.loading ? false : true);
    this.setState({ loading: newState });
  }
  closeDrawer() {
    this.setState({ drawerOpen: false });
  }
  setSort(sortBy) {
    const sort = ['vendor','date','profile'];
    this.setState({ sort: sort[sortBy] });
  }
  render() {
    const content = (this.state.content ? <ContentGrid view={this.props.view} admin={this.state.admin} /> : <ContentEmpty />);
    const FAB = (this.state.admin ? <Fab className="create-fab" icon="add" /> : '');
    return (
      <div className={(this.state.drawerOpen ? 'drawer-open' : '') + ' ' + this.props.className}>
        <MobileNavDrawer open={this.state.drawerOpen}  page={this.props.page} changePage={this.props.changePage} closeDrawer={this.closeDrawer} />
        <TabletAppBar page={this.props.page} loading={this.state.loading} toggleLoading={this.toggleLoading} toggleDrawer={this.toggleDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        {content}
        {FAB}
      </div>
    );
  }
}

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: false, content: true, sort: 'vendor', admin: true, loading: false };
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.closeDrawer = this.closeDrawer.bind(this);
    this.setSort = this.setSort.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  toggleLoading() {
    let newState = (this.state.loading ? false : true);
    this.setState({ loading: newState });
  }
  closeDrawer() {
    this.setState({ drawerOpen: false });
  }
  setSort(sortBy) {
    const sort = ['vendor','date','profile'];
    this.setState({ sort: sort[sortBy] });
  }
  render() {
    const content = (this.state.content ? <ContentGrid view={this.props.view} admin={this.state.admin} /> : <ContentEmpty />);
    const FAB = (this.state.admin ? <Fab className="create-fab" icon="add" /> : '');
    return (
      <div className={(this.state.drawerOpen ? 'drawer-open' : '') + ' ' + this.props.className}>
        <MobileNavDrawer open={this.state.drawerOpen} page={this.props.page} changePage={this.props.changePage} closeDrawer={this.closeDrawer} />
        <MobileAppBar page={this.props.page} loading={this.state.loading} toggleLoading={this.toggleLoading} toggleDrawer={this.toggleDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        {content}
        {FAB}
      </div>
    );
  }
}

export default DesktopContent;