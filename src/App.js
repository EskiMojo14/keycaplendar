import React from 'react';
import firebase from "./components/firebase";
import { DesktopContent, TabletContent, MobileContent } from './components/Content';
import './App.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { page: 'live', view: 'card', transition: false, vendors: [], sets: [], filteredSets: [], loading: false };
    this.changeView = this.changeView.bind(this);
    this.changePage = this.changePage.bind(this);
    this.getData = this.getData.bind(this);
    this.filterData = this.filterData.bind(this);
    this.createExampleData = this.createExampleData.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
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
      this.setState({ transition: true });
      setTimeout(function () {
        this.setState({ page: page })
        this.filterData(page, this.state.sets);
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
      let vendors = [];
      let profiles = [];
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
        if (vendors.includes(doc.data().vendor)) {
          return;
        } else {
          vendors.push(doc.data().vendor);
        };
        if (profiles.includes(doc.data().profile)) {
          return;
        } else {
          profiles.push(doc.data().profile);
        };
      });
      vendors.sort(function (a, b) {
        var x = a.toLowerCase();
        var y = b.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
        return 0;
      });
      this.setState({
        sets: sets,
        vendors: vendors,
        profiles: profiles
      })
      this.filterData(this.state.page, sets);
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
      vendor: 'TX Keyboard',
      storeLink: ''
    };
    const sets = [katLich, katAtlantis, gmkModernDolchLight, gmkForge, gmkMasterpiece, gmkBleached];
    this.setState({
      sets: sets,
      profiles: ['KAT', 'GMK']
    })
    this.filterData(this.state.page, sets);
  }
  filterData(page, sets) {
    const today = new Date();
    let filteredSets = [];
    let filteredVendors = [];
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
    filteredSets.forEach((set) => {
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
    this.setState({
      filteredSets: filteredSets,
      vendors: filteredVendors
    });
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
      content = <DesktopContent getData={this.getData} className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} profiles={this.state.profiles} vendors={this.state.vendors} sets={this.state.filteredSets} loading={this.state.loading} toggleLoading={this.toggleLoading} />;
    } else if (device === 'tablet') {
      content = <TabletContent getData={this.getData} className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} profiles={this.state.profiles} vendors={this.state.vendors} sets={this.state.filteredSets} loading={this.state.loading} toggleLoading={this.toggleLoading} />;
    } else {
      content = <MobileContent getData={this.getData} className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} profiles={this.state.profiles} vendors={this.state.vendors} sets={this.state.filteredSets} loading={this.state.loading} toggleLoading={this.toggleLoading} />;
    }
    return (
      <div className="app">
        {content}
      </div>
    );
  }
}

export default App;
