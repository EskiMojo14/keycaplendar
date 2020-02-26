import React from 'react';
import './Content.scss';
import { DesktopAppBar, TabletAppBar, MobileAppBar } from './AppBar';
import { DrawerAppContent } from '@rmwc/drawer';
import { DesktopNavDrawer, MobileNavDrawer } from './NavDrawer';
import { Fab } from '@rmwc/fab';
import { ContentEmpty } from './ContentEmpty';
import { ContentGrid } from './ContentGrid';
import { DialogFilter } from './DialogFilter';
import { DesktopDrawerFilter, TabletDrawerFilter } from './DrawerFilter';

export class DesktopContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { navDrawerOpen: true, content: true, filterDrawerOpen: false, sort: 'vendor', admin: true, loading: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.toggleFilterDrawer = this.toggleFilterDrawer.bind(this);
    this.closeFilterDrawer = this.closeFilterDrawer.bind(this);
    this.setSort = this.setSort.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
  }
  toggleNavDrawer() {
    let newState = (this.state.navDrawerOpen ? false : true);
    this.setState({ navDrawerOpen: newState });
  }
  toggleFilterDrawer() {
    let newState = (this.state.filterDrawerOpen ? false : true);
    this.setState({ filterDrawerOpen: newState });
  }
  closeFilterDrawer() {
    this.setState({ filterDrawerOpen: false });
  }
  setSort(sortBy) {
    const sort = ['vendor', 'date', 'profile'];
    this.setState({ sort: sort[sortBy] });
  }
  toggleLoading() {
    let newState = (this.state.loading ? false : true);
    this.setState({ loading: newState });
  }
  render() {
    let vendors = ['NovelKeys'];
    let i;
    for (i = 0; i < 12; i++) {
      vendors.push('NovelKeys');
    };
    const katLich = {
      profile: 'KAT',
      colourway: 'Lich',
      icDate: '2019-10-31',
      ghThread: 'https://geekhack.org/index.php?topic=104129.0',
      image: 'https://i.imgur.com/x0EkNCQ.jpg',
      gbLaunch: '2020-01-07',
      gbEnd: '2020-01-31',
      vendor: 'NovelKeys',
      storeLink: 'https://novelkeys.xyz/products/kat-lich-gb'
    };
    let sets = [katLich];
    for (i = 0; i < 2; i++) {
      sets.push(katLich);
    };
    const content = (this.state.content ? (
      <ContentGrid vendors={vendors} sets={sets} view={this.props.view} admin={this.state.admin} loading={this.state.loading} />
    ) : <ContentEmpty />);
    const FAB = (this.state.admin ? <Fab className="create-fab" icon="add" label="Create" /> : '');
    return (
      <div className={this.props.className}>
        <DesktopAppBar loading={this.state.loading} toggleLoading={this.toggleLoading} toggleNavDrawer={this.toggleNavDrawer} toggleFilterDrawer={this.toggleFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        <DesktopNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} toggleDrawer={this.toggleNavDrawer} />
        <DrawerAppContent className={(this.state.filterDrawerOpen ? 'drawer-open' : '')}>
          <div class="content-container">
            {content}
            <div className="drawer-container" dir="rtl">
              <DesktopDrawerFilter vendors={vendors} open={this.state.filterDrawerOpen} closeFilterDrawer={this.closeFilterDrawer}/>
            </div>
          </div>
        </DrawerAppContent>
        {FAB}
      </div>
    );
  }
}
export class TabletContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { navDrawerOpen: false, content: true, filterDrawerOpen: false, sort: 'vendor', admin: true, loading: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.closeNavDrawer = this.closeNavDrawer.bind(this);
    this.toggleFilterDrawer = this.toggleFilterDrawer.bind(this);
    this.closeFilterDrawer = this.closeFilterDrawer.bind(this);
    this.setSort = this.setSort.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
  }
  toggleNavDrawer() {
    let newState = (this.state.navDrawerOpen ? false : true);
    this.setState({ navDrawerOpen: newState });
  }
  closeNavDrawer() {
    this.setState({ navDrawerOpen: false });
  }
  toggleFilterDrawer() {
    let newState = (this.state.filterDrawerOpen ? false : true);
    this.setState({ filterDrawerOpen: newState });
  }
  closeFilterDrawer() {
    this.setState({ filterDrawerOpen: false });
  }
  toggleLoading() {
    let newState = (this.state.loading ? false : true);
    this.setState({ loading: newState });
  }
  setSort(sortBy) {
    const sort = ['vendor', 'date', 'profile'];
    this.setState({ sort: sort[sortBy] });
  }
  render() {
    let vendors = ['NovelKeys'];
    let i;
    for (i = 0; i < 12; i++) {
      vendors.push('NovelKeys');
    };
    const katLich = {
      profile: 'KAT',
      colourway: 'Lich',
      icDate: '2019-10-31',
      ghThread: 'https://geekhack.org/index.php?topic=104129.0',
      image: 'https://i.imgur.com/x0EkNCQ.jpg',
      gbLaunch: '2020-01-07',
      gbEnd: '2020-01-31',
      vendor: 'NovelKeys',
      storeLink: 'https://novelkeys.xyz/products/kat-lich-gb'
    };
    let sets = [katLich];
    for (i = 0; i < 2; i++) {
      sets.push(katLich);
    };
    const content = (this.state.content ? <ContentGrid vendors={vendors} sets={sets} view={this.props.view} admin={this.state.admin} /> : <ContentEmpty />);
    const FAB = (this.state.admin ? <Fab className="create-fab" icon="add" /> : '');
    return (
      <div className={(this.state.navDrawerOpen ? 'drawer-open' : '') + ' ' + this.props.className}>
        <MobileNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} closeNavDrawer={this.closeNavDrawer} />
        <TabletAppBar page={this.props.page} loading={this.state.loading} toggleLoading={this.toggleLoading} toggleNavDrawer={this.toggleNavDrawer} toggleFilterDrawer={this.toggleFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        {content}
        {FAB}
        <div dir="rtl">
          <TabletDrawerFilter vendors={vendors} open={this.state.filterDrawerOpen} closeFilterDrawer={this.closeFilterDrawer}/>
        </div>
      </div>
    );
  }
}

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dialogOpen: false, navDrawerOpen: false, content: true, sort: 'vendor', admin: true, loading: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.closeNavDrawer = this.closeNavDrawer.bind(this);
    this.toggleDialog = this.toggleDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.setSort = this.setSort.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
  }
  toggleLoading() {
    let newState = (this.state.loading ? false : true);
    this.setState({ loading: newState });
  }
  toggleNavDrawer() {
    let newState = (this.state.navDrawerOpen ? false : true);
    this.setState({ navDrawerOpen: newState });
  }
  closeNavDrawer() {
    this.setState({ navDrawerOpen: false });
  }
  toggleDialog() {
    let newState = (this.state.dialogOpen ? false : true);
    this.setState({ dialogOpen: newState });
  }
  closeDialog() {
    this.setState({ dialogOpen: false });
  }
  setSort(sortBy) {
    const sort = ['vendor', 'date', 'profile'];
    this.setState({ sort: sort[sortBy] });
  }
  render() {
    let vendors = ['NovelKeys'];
    let i;
    for (i = 0; i < 12; i++) {
      vendors.push('NovelKeys');
    };
    const katLich = {
      profile: 'KAT',
      colourway: 'Lich',
      icDate: '2019-10-31',
      ghThread: 'https://geekhack.org/index.php?topic=104129.0',
      image: 'https://i.imgur.com/x0EkNCQ.jpg',
      gbLaunch: '2020-01-07',
      gbEnd: '2020-01-31',
      vendor: 'NovelKeys',
      storeLink: 'https://novelkeys.xyz/products/kat-lich-gb'
    };
    let sets = [katLich];
    for (i = 0; i < 2; i++) {
      sets.push(katLich);
    };
    const content = (this.state.content ? <ContentGrid vendors={vendors} sets={sets} view={this.props.view} admin={this.state.admin} /> : <ContentEmpty />);
    const FAB = (this.state.admin ? <Fab className="create-fab" icon="add" /> : '');
    return (
      <div className={(this.state.navDrawerOpen ? 'drawer-open' : '') + ' ' + this.props.className}>
        <MobileNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} closeDrawer={this.closeNavDrawer} />
        <MobileAppBar page={this.props.page} loading={this.state.loading} toggleLoading={this.toggleLoading} toggleDialog={this.toggleDialog} toggleNavDrawer={this.toggleNavDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        {content}
        {FAB}
        <DialogFilter vendors={vendors} open={this.state.dialogOpen} onClose={this.closeDialog} />
      </div>
    );
  }
}

export default DesktopContent;