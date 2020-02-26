import React from 'react';
import './Content.scss';
import { DesktopAppBar, TabletAppBar, MobileAppBar } from './AppBar';
import { DrawerAppContent } from '@rmwc/drawer';
import { DesktopNavDrawer, MobileNavDrawer } from './NavDrawer';
import { ContentEmpty } from './ContentEmpty';
import { ContentGrid } from './ContentGrid';

export class DesktopContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: true, content: true, sort: 'vendor' };
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.setSort = this.setSort.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  setSort(sortBy) {
    const sort = ['vendor','date','profile'];
    this.setState({ sort: sort[sortBy] });
  }
  render() {
    const content = (this.state.content ? <ContentGrid view={this.props.view} /> : <ContentEmpty />);
    return (
      <div className={this.props.className}>
        <DesktopAppBar toggleDrawer={this.toggleDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        <DesktopNavDrawer open={this.state.drawerOpen} page={this.props.page} changePage={this.props.changePage} toggleDrawer={this.toggleDrawer} />
        <DrawerAppContent>
          {content}
        </DrawerAppContent>
      </div>
    );
  }
}
export class TabletContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: false, content: true, sort: 'vendor' };
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.setSort = this.setSort.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  setSort(sortBy) {
    const sort = ['vendor','date','profile'];
    this.setState({ sort: sort[sortBy] });
  }
  render() {
    const content = (this.state.content ? <ContentGrid view={this.props.view} /> : <ContentEmpty />);
    return (
      <div className={(this.state.drawerOpen ? 'drawer-open' : '') + ' ' + this.props.className}>
        <MobileNavDrawer open={this.state.drawerOpen}  page={this.props.page} changePage={this.props.changePage} toggleDrawer={this.toggleDrawer} />
        <TabletAppBar title={'Live GBs'} toggleDrawer={this.toggleDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        {content}
      </div>
    );
  }
}

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: false, content: true, sort: 'vendor' };
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.setSort = this.setSort.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  setSort(sortBy) {
    const sort = ['vendor','date','profile'];
    this.setState({ sort: sort[sortBy] });
  }
  render() {
    const content = (this.state.content ? <ContentGrid view={this.props.view} /> : <ContentEmpty />);
    return (
      <div className={(this.state.drawerOpen ? 'drawer-open' : '') + ' ' + this.props.className}>
        <MobileNavDrawer open={this.state.drawerOpen} page={this.props.page} changePage={this.props.changePage} toggleDrawer={this.toggleDrawer} />
        <MobileAppBar title={'Live GBs'} toggleDrawer={this.toggleDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        {content}
      </div>
    );
  }
}

export default DesktopContent;