import React from 'react';
import { DesktopAppBar, TabletAppBar, MobileAppBar } from './AppBar';
import { DrawerAppContent } from '@rmwc/drawer';
import { DesktopNavDrawer, MobileNavDrawer } from './NavDrawer';
import { EmptyContent } from './EmptyContent';
import './Content.scss';

export class DesktopContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: true };
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  render() {
    return (
      <div>
        <DesktopAppBar toggleDrawer={this.toggleDrawer} />
        <div style={{ overflow: 'hidden', position: 'relative' }}>
          <DesktopNavDrawer open={this.state.drawerOpen} toggleDrawer={this.toggleDrawer} />
          <DrawerAppContent>
            <EmptyContent />
          </DrawerAppContent>
        </div>
      </div>
    );
  }
}
export class TabletContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: false };
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  render() {
    return (
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <MobileNavDrawer open={this.state.drawerOpen} toggleDrawer={this.toggleDrawer} />
        <TabletAppBar view={'Live GBs'} toggleDrawer={this.toggleDrawer} />
        <EmptyContent />
      </div>
    );
  }
}

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: false };
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  render() {
    return (
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <MobileNavDrawer open={this.state.drawerOpen} toggleDrawer={this.toggleDrawer} />
        <MobileAppBar  view={'Live GBs'} toggleDrawer={this.toggleDrawer} />
        <EmptyContent />
      </div>
    );
  }
}

export default DesktopContent;