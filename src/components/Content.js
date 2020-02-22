import React from 'react';
import { DesktopAppBar, MobileAppBar } from './AppBar';
import { DrawerAppContent } from '@rmwc/drawer';
import { DesktopNavDrawer, MobileNavDrawer } from './NavDrawer';

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
          <DrawerAppContent style={{height: '100rem'}}>
            {/* content goes here */}
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
        <MobileAppBar view={'Live GBs'} toggleDrawer={this.toggleDrawer} />
        {/* content goes here */}
        <div style={{height: '100rem'}}></div>
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
        <div style={{height: '100rem'}}></div>
        {/* content goes here */}
      </div>
    );
  }
}

export default DesktopContent;