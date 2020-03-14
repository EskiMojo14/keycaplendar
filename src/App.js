import React from 'react';
import firebase from "./components/firebase";
import { DesktopContent, TabletContent, MobileContent } from './components/Content';
import './App.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { page: 'live', view: 'card', transition: false, sort: 'vendor', vendors: [], sets: [], profiles: [], filteredSets: [], groups: [], loading: false };
    this.changeView = this.changeView.bind(this);
    this.changePage = this.changePage.bind(this);
    this.getData = this.getData.bind(this);
    this.filterData = this.filterData.bind(this);
    this.createExampleData = this.createExampleData.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
    this.setSort = this.setSort.bind(this);
  }
  changeView(view) {
    if (view !== this.state.view) {
      this.setState({ transition: true });
      setTimeout(function () {
        this.setState({ view: view })
      }.bind(this), 90);
      setTimeout(function () {
        this.setState({ transition: false })
      }.bind(this), 300);
    }
  }
  changePage(page) {
    if (page !== this.state.page) {
      if (page === 'calendar') {
        this.setState({sort: 'date'});
      } else if (page === 'live') {
        this.setState({sort: 'vendor'});
      } else if (page === 'ic') {
        this.setState({sort: 'profile'});
      } else if (page === 'previous') {
        this.setState({sort: 'date'});
      }
      this.setState({ transition: true });
      setTimeout(function () {
        this.setState({ page: page })
        this.filterData(page, this.state.sets, this.state.sort);
      }.bind(this), 90);
      setTimeout(function () {
        this.setState({ transition: false })
      }.bind(this), 300);
    }
  }
  changeThemeColor() {
    var metaColor = getComputedStyle(document.documentElement).getPropertyValue('--meta-color');
    var metaElement = document.querySelector("meta[name=theme-color]");
    metaElement.setAttribute("content", metaColor);
  }
  toggleLoading() {
    let newState = (this.state.loading ? false : true);
    this.setState({ loading: newState });
  }
  getData() {
    const db = firebase.firestore();
    db.collection("keysets").get().then((querySnapshot) => {
      let sets = [];
      querySnapshot.forEach((doc) => {
        sets.push({
          id: doc.id,
          profile: doc.data().profile,
          colorway: doc.data().colorway,
          icDate: doc.data().icDate,
          details: doc.data().details,
          image: doc.data().image,
          gbLaunch: doc.data().gbLaunch,
          gbEnd: doc.data().gbEnd,
          vendor: doc.data().vendor,
          storeLink: doc.data().storeLink
        });
      });
      this.setState({
        sets: sets
      })
      this.filterData(this.state.page, sets, this.state.sort);
    });
  }
  createExampleData() {
    const katLich = {
      id: 'katLich',
      profile: 'KAT',
      colorway: 'Lich',
      icDate: '2019-10-31',
      details: 'https://geekhack.org/index.php?topic=104129.0',
      image: 'https://i.imgur.com/x0EkNCQ.jpg',
      gbLaunch: '2020-01-07',
      gbEnd: '2020-01-31',
      vendor: 'NovelKeys',
      storeLink: 'https://novelkeys.xyz/products/kat-lich-gb'
    };
    const katAtlantis = {
      id: 'katAtlantis',
      profile: 'KAT',
      colorway: 'Atlantis',
      icDate: '2019-09-14',
      details: 'https://geekhack.org/index.php?topic=102423.0',
      image: 'https://i.imgur.com/BohSuAU.png',
      gbLaunch: '2020-03-01',
      gbEnd: '2020-04-01',
      vendor: 'CannonKeys',
      storeLink: 'https://cannonkeys.com/collections/featured/products/gb-kat-atlantis'
    };
    const gmkModernDolchLight = {
      id: 'gmkModernDolchLight',
      profile: 'GMK',
      colorway: 'Modern Dolch Light',
      icDate: '2019-10-13',
      details: 'https://geekhack.org/index.php?topic=104498.0',
      image: 'https://i.imgur.com/OQa2VP3.jpg',
      gbLaunch: '2020-02-02',
      gbEnd: '2020-03-01',
      vendor: 'DixieMech',
      storeLink: 'https://dixiemech.com/gmkmodolight'
    };
    const gmkForge = {
      id: 'gmkForge',
      profile: 'GMK',
      colorway: 'Forge',
      icDate: '2019-08-10',
      details: 'https://geekhack.org/index.php?topic=101948.0',
      image: 'https://i.imgur.com/tpiRJN4.jpg',
      gbLaunch: '2020-03-20',
      gbEnd: '2020-04-20',
      vendor: 'TX Keyboards',
      storeLink: ''
    };
    const gmkMasterpiece = {
      id: 'gmkMasterpiece',
      profile: 'GMK',
      colorway: 'Masterpiece',
      icDate: '2019-10-25',
      details: 'https://geekhack.org/index.php?topic=103111.0',
      image: 'https://imgur.com/DLOqWxC.png',
      gbLaunch: 'Q2 2020',
      gbEnd: '',
      vendor: 'Project Keyboard',
      storeLink: ''
    };
    const gmkBleached = {
      id: 'gmkBleached',
      profile: 'GMK',
      colorway: 'Bleached',
      icDate: '2020-01-28',
      details: 'https://geekhack.org/index.php?topic=104430.0',
      image: 'https://i.imgur.com/XK1Pgrr.png',
      gbLaunch: '',
      gbEnd: '',
      vendor: 'TX Keyboards',
      storeLink: ''
    };
    const sets = [katLich, katAtlantis, gmkModernDolchLight, gmkForge, gmkMasterpiece, gmkBleached];
    this.setState({
      sets: sets
    })
    this.filterData(this.state.page, sets, this.state.sort);
  }
  filterData(page, sets, sort) {
    const today = new Date();
    let filteredSets = [];
    let filteredVendors = [];
    let filteredProfiles = [];
    let groups = [];
    if (page === 'calendar') {
      filteredSets = sets.filter(set => {
        const startDate = new Date(set.gbLaunch);
        const endDate = new Date(set.gbEnd);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        return startDate > today || (startDate <= today && endDate >= today);
      })
    } else if (page === 'live') {
      filteredSets = sets.filter(set => {
        const startDate = new Date(set.gbLaunch);
        const endDate = new Date(set.gbEnd);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        return startDate <= today && endDate >= today;
      })
    } else if (page === 'ic') {
      filteredSets = sets.filter(set => {
        const startDate = (set.gbLaunch.includes('Q') || set.gbLaunch === '' ? set.gbLaunch : new Date(set.gbLaunch));
        return !startDate || startDate === '' || set.gbLaunch.includes('Q');
      })
    } else if (page === 'previous') {
      filteredSets = sets.filter(set => {
        const endDate = new Date(set.gbEnd);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        return endDate <= today;
      })

    } else {
      filteredSets = sets;
    }
    sets.forEach((set) => {
      if (!filteredVendors.includes(set.vendor)) {
        filteredVendors.push(set.vendor);
      }
    });
    filteredVendors.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) { return -1; }
      if (x > y) { return 1; }
      return 0;
    });
    sets.forEach((set) => {
      if (!filteredProfiles.includes(set.profile)) {
        filteredProfiles.push(set.profile);
      }
    });
    filteredProfiles.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) { return -1; }
      if (x > y) { return 1; }
      return 0;
    });
    filteredSets.forEach((set) => {
      if (sort === 'date') {
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const setDate = new Date((page === 'live' ? set.gbEnd : set.gbLaunch));
        const setMonth = month[setDate.getMonth()];
        if (!groups.includes(setMonth)) {
          groups.push(setMonth);
        }
      } else {
        if (!groups.includes(set[sort])) {
          groups.push(set[sort]);
        }
      }
    });
    groups.sort(function (a, b) {
      let x;
      let y;
      if (sort === 'date') {
        x = new Date(a).getMonth();
        y = new Date(b).getMonth();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
      } else {
        x = a.toLowerCase();
        y = b.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
      }
    });
    this.setState({
      filteredSets: filteredSets,
      vendors: filteredVendors,
      profiles: filteredProfiles,
      groups: groups
    });
  }
  setSort(sortBy) {
    const sort = ['vendor', 'date', 'profile'];
    this.setState({ sort: sort[sortBy] });
    this.filterData(this.state.page, this.state.sets, sort[sortBy]);
  }
  componentDidMount() {
    this.changeThemeColor();
    //this.getData();
    this.createExampleData();
  }
  render() {
    const device = this.props.device;
    let content;
    if (device === 'desktop') {
      content = <DesktopContent getData={this.getData} className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} profiles={this.state.profiles} vendors={this.state.vendors} sets={this.state.filteredSets} groups={this.state.groups} loading={this.state.loading} toggleLoading={this.toggleLoading} sort={this.state.sort} setSort={this.setSort} />;
    } else if (device === 'tablet') {
      content = <TabletContent getData={this.getData} className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} profiles={this.state.profiles} vendors={this.state.vendors} sets={this.state.filteredSets} groups={this.state.groups} loading={this.state.loading} toggleLoading={this.toggleLoading} sort={this.state.sort} setSort={this.setSort} />;
    } else {
      content = <MobileContent getData={this.getData} className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} profiles={this.state.profiles} vendors={this.state.vendors} sets={this.state.filteredSets} groups={this.state.groups} loading={this.state.loading} toggleLoading={this.toggleLoading} sort={this.state.sort} setSort={this.setSort} />;
    }
    return (
      <div className="app">
        {content}
      </div>
    );
  }
}

export default App;
