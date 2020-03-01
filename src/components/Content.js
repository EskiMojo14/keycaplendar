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
    this.state = { navDrawerOpen: true, content: true, filterDrawerOpen: false, createDrawerOpen: false, editDrawerOpen: false, sort: 'vendor', admin: true, loading: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.toggleFilterDrawer = this.toggleFilterDrawer.bind(this);
    this.closeFilterDrawer = this.closeFilterDrawer.bind(this);
    this.toggleCreateDrawer = this.toggleCreateDrawer.bind(this);
    this.closeCreateDrawer = this.closeCreateDrawer.bind(this);
    this.toggleEditDrawer = this.toggleEditDrawer.bind(this);
    this.closeEditDrawer = this.closeEditDrawer.bind(this);
    this.setSort = this.setSort.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
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
  toggleEditDrawer() {
    this.setState({ editDrawerOpen: !this.state.editDrawerOpen });
  }
  closeEditDrawer() {
    this.setState({ editDrawerOpen: false });
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
    let vendors = ['Vendor'];
    let i;
    for (i = 0; i < 11; i++) {
      vendors.push('Vendor');
    };
    const katLich = {
      profile: 'KAT',
      colourway: 'Lich',
      icDate: '2019-10-31',
      details: 'https://geekhack.org/index.php?topic=104129.0',
      image: 'https://i.imgur.com/x0EkNCQ.jpg',
      gbLaunch: '2020-01-07',
      gbEnd: '2020-01-31',
      vendor: 'NovelKeys',
      storeLink: 'https://novelkeys.xyz/products/kat-lich-gb'
    };
    const katAtlantis = {
      profile: 'KAT',
      colourway: 'Atlantis',
      icDate: '2019-09-14',
      details: 'https://geekhack.org/index.php?topic=102423.0',
      image: 'https://i.imgur.com/zugxfzk.png',
      gbLaunch: '2020-03-01',
      gbEnd: '2020-04-01',
      vendor: 'CannonKeys',
      storeLink: 'https://cannonkeys.com/collections/featured/products/gb-kat-atlantis'
    };
    const katOasis = {
      profile: 'KAT',
      colourway: 'Oasis',
      icDate: '2018-05-01',
      details: 'https://geekhack.org/index.php?topic=104467.0',
      image: 'https://i.imgur.com/g7IHiiT.jpg',
      gbLaunch: '2020-01-31',
      gbEnd: '2020-03-06',
      vendor: 'Kono',
      storeLink: 'https://kono.store/collections/keycap-sets/products/kat-oasis'
    };
    let sets = [katLich, katAtlantis, katOasis];
    const content = (this.state.content ? (
      <ContentGrid vendors={vendors} sets={sets} view={this.props.view} admin={this.state.admin} loading={this.state.loading} edit={this.toggleEditDrawer}/>
    ) : <ContentEmpty />);
    const adminElements = (this.state.admin ? (
    <div>
      <Fab className="create-fab" icon="add" label="Create" onClick={this.toggleCreateDrawer} />
      <DrawerCreate open={this.state.createDrawerOpen} close={this.closeCreateDrawer}/>
      <DrawerEdit open={this.state.editDrawerOpen} close={this.toggleEditDrawer}/>
    </div>
    ) : '');
    return (
      <div className={this.props.className}>
        <DesktopAppBar loading={this.state.loading} toggleLoading={this.toggleLoading} toggleNavDrawer={this.toggleNavDrawer} toggleFilterDrawer={this.toggleFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        <DesktopNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} toggleDrawer={this.toggleNavDrawer} />
        <DrawerAppContent className={(this.state.filterDrawerOpen ? 'drawer-open ' : '') + (this.state.createDrawerOpen || this.state.editDrawerOpen ? 'modal-drawer-open' : '')}>
          <div className="content-container">
            {content}
            <div className="drawer-container">
              <DesktopDrawerFilter vendors={vendors} open={this.state.filterDrawerOpen} closeFilterDrawer={this.closeFilterDrawer}/>
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
    this.state = { navDrawerOpen: false, content: true, filterDrawerOpen: false, createDrawerOpen: false, editDrawerOpen: false, sort: 'vendor', admin: true, loading: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.closeNavDrawer = this.closeNavDrawer.bind(this);
    this.toggleCreateDrawer = this.toggleCreateDrawer.bind(this);
    this.closeCreateDrawer = this.closeCreateDrawer.bind(this);
    this.toggleFilterDrawer = this.toggleFilterDrawer.bind(this);
    this.closeFilterDrawer = this.closeFilterDrawer.bind(this);
    this.toggleEditDrawer = this.toggleEditDrawer.bind(this);
    this.closeEditDrawer = this.closeEditDrawer.bind(this);
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
  toggleCreateDrawer() {
    this.setState({ createDrawerOpen: !this.state.createDrawerOpen });
  }
  closeCreateDrawer() {
    this.setState({ createDrawerOpen: false });
  }
  toggleEditDrawer() {
    this.setState({ editDrawerOpen: !this.state.editDrawerOpen });
  }
  closeEditDrawer() {
    this.setState({ editDrawerOpen: false });
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
  setSort(sortBy) {
    const sort = ['vendor', 'date', 'profile'];
    this.setState({ sort: sort[sortBy] });
  }
  render() {
    let vendors = ['Vendor'];
    let i;
    for (i = 0; i < 11; i++) {
      vendors.push('Vendor');
    };
    const katLich = {
      profile: 'KAT',
      colourway: 'Lich',
      icDate: '2019-10-31',
      details: 'https://geekhack.org/index.php?topic=104129.0',
      image: 'https://i.imgur.com/x0EkNCQ.jpg',
      gbLaunch: '2020-01-07',
      gbEnd: '2020-01-31',
      vendor: 'NovelKeys',
      storeLink: 'https://novelkeys.xyz/products/kat-lich-gb'
    };
    const katAtlantis = {
      profile: 'KAT',
      colourway: 'Atlantis',
      icDate: '2019-09-14',
      details: 'https://geekhack.org/index.php?topic=102423.0',
      image: 'https://i.imgur.com/zugxfzk.png',
      gbLaunch: '2020-03-01',
      gbEnd: '2020-04-01',
      vendor: 'CannonKeys',
      storeLink: 'https://cannonkeys.com/collections/featured/products/gb-kat-atlantis'
    };
    const katOasis = {
      profile: 'KAT',
      colourway: 'Oasis',
      icDate: '2018-05-01',
      details: 'https://geekhack.org/index.php?topic=104467.0',
      image: 'https://i.imgur.com/g7IHiiT.jpg',
      gbLaunch: '2020-01-31',
      gbEnd: '2020-03-06',
      vendor: 'Kono',
      storeLink: 'https://kono.store/collections/keycap-sets/products/kat-oasis'
    };
    let sets = [katLich, katAtlantis, katOasis];
    const content = (this.state.content ? <ContentGrid vendors={vendors} sets={sets} view={this.props.view} admin={this.state.admin} edit={this.toggleEditDrawer} /> : <ContentEmpty />);
    const adminElements = (this.state.admin ? (
      <div>
        <Fab className="create-fab" icon="add" onClick={this.toggleCreateDrawer} />
        <DrawerCreate open={this.state.createDrawerOpen} closeCreateDrawer={this.closeCreateDrawer}/>
        <DrawerEdit open={this.state.editDrawerOpen} close={this.toggleEditDrawer}/>
      </div>
    ) : '');
    return (
      <div className={(this.state.navDrawerOpen || this.state.createDrawerOpen || this.state.editDrawerOpen ? 'modal-drawer-open' : '') + ' ' + this.props.className}>
        <MobileNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} closeNavDrawer={this.closeNavDrawer} />
        <TabletAppBar page={this.props.page} loading={this.state.loading} toggleLoading={this.toggleLoading} toggleNavDrawer={this.toggleNavDrawer} toggleFilterDrawer={this.toggleFilterDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        {content}
        {adminElements}
        <TabletDrawerFilter vendors={vendors} open={this.state.filterDrawerOpen} closeFilterDrawer={this.closeFilterDrawer}/>
      </div>
    );
  }
}

export class MobileContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { filterDialogOpen: false, createDialogOpen: false, editDialogOpen: false, navDrawerOpen: false, content: true, sort: 'vendor', admin: true, loading: false };
    this.toggleNavDrawer = this.toggleNavDrawer.bind(this);
    this.closeNavDrawer = this.closeNavDrawer.bind(this);
    this.toggleFilterDialog = this.toggleFilterDialog.bind(this);
    this.closeFilterDialog = this.closeFilterDialog.bind(this);
    this.toggleCreateDialog = this.toggleCreateDialog.bind(this);
    this.closeCreateDialog = this.closeCreateDialog.bind(this);
    this.toggleEditDialog = this.toggleEditDialog.bind(this);
    this.closeEditDialog = this.closeEditDialog.bind(this);
    this.setSort = this.setSort.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
  }
  toggleLoading() {
    this.setState({ loading: !this.state.loading });
  }
  toggleNavDrawer() {
    this.setState({ navDrawerOpen: !this.state.navDrawerOpen });
  }
  closeNavDrawer() {
    this.setState({ navDrawerOpen: false });
  }
  toggleFilterDialog() {
    this.setState({ filterDialogOpen: !this.state.filterDialogOpen });
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
  toggleEditDialog() {
    this.setState({ editDialogOpen: !this.state.editDialogOpen });
  }
  closeEditDialog() {
    this.setState({ editDialogOpen: false });
  }
  setSort(sortBy) {
    const sort = ['vendor', 'date', 'profile'];
    this.setState({ sort: sort[sortBy] });
  }
  render() {
    let vendors = ['Vendor'];
    let i;
    for (i = 0; i < 11; i++) {
      vendors.push('Vendor');
    };
    const katLich = {
      profile: 'KAT',
      colourway: 'Lich',
      icDate: '2019-10-31',
      details: 'https://geekhack.org/index.php?topic=104129.0',
      image: 'https://i.imgur.com/x0EkNCQ.jpg',
      gbLaunch: '2020-01-07',
      gbEnd: '2020-01-31',
      vendor: 'NovelKeys',
      storeLink: 'https://novelkeys.xyz/products/kat-lich-gb'
    };
    const katAtlantis = {
      profile: 'KAT',
      colourway: 'Atlantis',
      icDate: '2019-09-14',
      details: 'https://geekhack.org/index.php?topic=102423.0',
      image: 'https://i.imgur.com/zugxfzk.png',
      gbLaunch: '2020-03-01',
      gbEnd: '2020-04-01',
      vendor: 'CannonKeys',
      storeLink: 'https://cannonkeys.com/collections/featured/products/gb-kat-atlantis'
    };
    const katOasis = {
      profile: 'KAT',
      colourway: 'Oasis',
      icDate: '2018-05-01',
      details: 'https://geekhack.org/index.php?topic=104467.0',
      image: 'https://i.imgur.com/g7IHiiT.jpg',
      gbLaunch: '2020-01-31',
      gbEnd: '2020-03-06',
      vendor: 'Kono',
      storeLink: 'https://kono.store/collections/keycap-sets/products/kat-oasis'
    };
    let sets = [katLich, katAtlantis, katOasis];
    const content = (this.state.content ? <ContentGrid vendors={vendors} sets={sets} view={this.props.view} admin={this.state.admin} edit={this.toggleEditDialog}/> : <ContentEmpty />);
    const adminElements = (this.state.admin ? (
      <div>
        <Fab className="create-fab" icon="add" onClick={this.toggleCreateDialog}/>
        <DialogCreate open={this.state.createDialogOpen} close={this.closeCreateDialog}/>
        <DialogEdit open={this.state.editDialogOpen} close={this.closeEditDialog}/>
      </div>
    ) : '');
    return (
      <div className={(this.state.navDrawerOpen || this.state.createDialogOpen || this.state.editDialogOpen ? 'modal-drawer-open' : '') + ' ' + this.props.className}>
        <MobileNavDrawer open={this.state.navDrawerOpen} page={this.props.page} changePage={this.props.changePage} closeDrawer={this.closeNavDrawer} />
        <MobileAppBar page={this.props.page} loading={this.state.loading} toggleLoading={this.toggleLoading} toggleDialog={this.toggleFilterDialog} toggleNavDrawer={this.toggleNavDrawer} view={this.props.view} changeView={this.props.changeView} sort={this.state.sort} setSort={this.setSort} />
        {content}
        {adminElements}
        <DialogFilter vendors={vendors} open={this.state.filterDialogOpen} onClose={this.closeFilterDialog} />
      </div>
    );
  }
}

export default DesktopContent;