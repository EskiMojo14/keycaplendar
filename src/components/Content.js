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
    this.state = { drawerOpen: true, content: true };
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  render() {
    const content = (this.state.content ? <ContentGrid view={this.props.view}/> : <ContentEmpty />);
    return (
      <div>
        <DesktopAppBar toggleDrawer={this.toggleDrawer} view={this.props.view}/>
        <div>
          <DesktopNavDrawer open={this.state.drawerOpen} toggleDrawer={this.toggleDrawer} />
          <DrawerAppContent>
            {content}
          </DrawerAppContent>
        </div>
      </div>
    );
  }
}
export class TabletContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: false, content: true };
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  render() {
    const content = (this.state.content ? <ContentGrid view={this.props.view}/> : <ContentEmpty />);
    return (
      <div className={(this.state.drawerOpen ? 'drawer-open' : '')}>
        <MobileNavDrawer open={this.state.drawerOpen} toggleDrawer={this.toggleDrawer} />
        <TabletAppBar title={'Live GBs'} toggleDrawer={this.toggleDrawer} view={this.props.view}/>
        {content}
      </div>
    );
  }
}

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { drawerOpen: false, content: true };
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }
  toggleDrawer() {
    let newState = (this.state.drawerOpen ? false : true);
    this.setState({ drawerOpen: newState });
  }
  render() {
    const content = (this.state.content ? <ContentGrid view={this.props.view}/> : <ContentEmpty />);
    return (
      <div className={(this.state.drawerOpen ? 'drawer-open' : '')}>
        <MobileNavDrawer open={this.state.drawerOpen} toggleDrawer={this.toggleDrawer} />
        <MobileAppBar title={'Live GBs'} toggleDrawer={this.toggleDrawer} view={this.props.view}/>
        {content}
      </div>
    );
  }
}

export default DesktopContent;