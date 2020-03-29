import React from 'react';
import firebase from "./components/firebase";
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { createSnackbarQueue, SnackbarQueue } from '@rmwc/snackbar';
import { DesktopContent, TabletContent, MobileContent } from './components/Content';
import { Login } from './components/Login';
import { Users } from './components/Users';
import './App.scss';
import { PrivacyPolicy, TermsOfService } from './components/Legal';

const queue = createSnackbarQueue();
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { device: 'desktop', theme: 'light', bottomNav: false, page: 'calendar', view: 'card', transition: false, sort: 'date', vendors: [], sets: [], profiles: [], filteredSets: [], groups: [], loading: false, content: true, search: '', user: { email: null, name: null, avatar: null, isEditor: false, isAdmin: false }, whitelist: { vendors: [], profiles: [], edited: false } };
    this.changeView = this.changeView.bind(this);
    this.changePage = this.changePage.bind(this);
    this.getData = this.getData.bind(this);
    this.filterData = this.filterData.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
    this.setSort = this.setSort.bind(this);
    this.setSearch = this.setSearch.bind(this);
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
        if (page === 'calendar') {
          this.setState({ sort: 'date' });
        } else if (page === 'live') {
          this.setState({ sort: 'vendor' });
        } else if (page === 'ic') {
          this.setState({ sort: 'profile' });
        } else if (page === 'previous') {
          this.setState({ sort: 'date' });
        } else if (page === 'timeline') {
          this.setState({ sort: 'date' });
        }
        this.filterData(page);
      }.bind(this), 90);
      setTimeout(function () {
        this.setState({ transition: false })
      }.bind(this), 300);
      const title = { calendar: 'Calendar', live: 'Live GBs', ic: 'IC Tracker', previous: 'Previous Sets', account: 'Account', timeline: 'Timeline' };
      document.title = 'KeycapLendar: ' + title[page];
    }
  }
  changeTheme = (theme) => {
    this.setState({ theme: theme });
    document.querySelector('html').classList = theme;
    document.querySelector("meta[name=theme-color]").setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue('--meta-color'));
  }
  changeBottomNav = (value) => {
    this.setState({ bottomNav: value });
  }
  toggleLoading() {
    let newState = (this.state.loading ? false : true);
    this.setState({ loading: newState });
  }
  getData() {
    this.setState({ loading: true });
    const db = firebase.firestore();
    db.collection("keysets").get().then((querySnapshot) => {
      let sets = [];
      querySnapshot.forEach((doc) => {
        sets.push({
          id: doc.id,
          profile: doc.data().profile,
          colorway: doc.data().colorway,
          designer: doc.data().designer,
          icDate: doc.data().icDate,
          details: doc.data().details,
          image: doc.data().image,
          gbLaunch: doc.data().gbLaunch,
          gbEnd: doc.data().gbEnd,
          vendors: (doc.data().vendor ? [{ name: doc.data().vendor, region: '', storeLink: doc.data().storeLink }] : doc.data().vendors)
        });
      });
      this.setState({
        sets: sets
      })
      this.filterData(this.state.page, sets);
    }).catch((error) => {
      console.log('Error getting data: ' + error);
      queue.notify({ title: 'Error getting data: ' + error});
    });
  }
  filterData(page = this.state.page, sets = this.state.sets, sort = this.state.sort, search = this.state.search, whitelist = this.state.whitelist) {
    const today = new Date();
    let pageSets = [];
    let allVendors = [];
    let allProfiles = [];
    let groups = [];

    // page logic
    if (page === 'calendar') {
      pageSets = sets.filter(set => {
        const startDate = new Date(set.gbLaunch);
        const endDate = new Date(set.gbEnd);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        return startDate > today || (startDate <= today && endDate >= today);
      })
    } else if (page === 'live') {
      pageSets = sets.filter(set => {
        const startDate = new Date(set.gbLaunch);
        const endDate = new Date(set.gbEnd);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        return startDate <= today && endDate >= today;
      })
    } else if (page === 'ic') {
      pageSets = sets.filter(set => {
        const startDate = (set.gbLaunch.includes('Q') || set.gbLaunch === '' ? set.gbLaunch : new Date(set.gbLaunch));
        return !startDate || startDate === '' || set.gbLaunch.includes('Q');
      })
    } else if (page === 'previous') {
      pageSets = sets.filter(set => {
        const endDate = new Date(set.gbEnd);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        return endDate <= today;
      })
    } else if (page === 'timeline') {
      pageSets = sets.filter(set => {
        return (set.gbLaunch !== '' && !set.gbLaunch.includes('Q'));
      });
    }

    // vendor list
    sets.forEach((set) => {
      if (set.vendors[0]) {
        if (!allVendors.includes(set.vendors[0].name)) {
          allVendors.push(set.vendors[0].name);
        }
      }
    });
    allVendors.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) { return -1; }
      if (x > y) { return 1; }
      return 0;
    });

    // profile list
    sets.forEach((set) => {
      if (!allProfiles.includes(set.profile)) {
        allProfiles.push(set.profile);
      }
    });
    allProfiles.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) { return -1; }
      if (x > y) { return 1; }
      return 0;
    });

    // whitelist logic

    if (!whitelist.edited) {
      this.setWhitelist('vendors', allVendors);
      this.setWhitelist('profiles', allProfiles);
    }

    const filteredSets = pageSets.filter(set => {
      if (set.vendors.length > 0) {
        return whitelist.vendors.indexOf(set.vendors[0].name) > -1 && whitelist.profiles.indexOf(set.profile) > -1;
      } else {
        return true;
      }
    });

    // search logic

    const searchSets = (search) => {
      return filteredSets.filter(set => {
        let setInfo = set.profile + ' ' + set.colorway + ' ' + set.vendors.map((vendor) => { return ' ' + vendor.name + ' ' + vendor.region }) + ' ' + set.designer.toString();
        return setInfo.toLowerCase().indexOf(search.toLowerCase()) > -1;
      })
    };

    const searchedSets = (search !== '' ? searchSets(search) : filteredSets);

    // group display
    searchedSets.forEach((set) => {
      if (sort === 'date') {
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const setDate = new Date((page === 'live' ? set.gbEnd : set.gbLaunch));
        let setMonth = month[setDate.getMonth()] + ' ' + setDate.getFullYear();
        if (!groups.includes(setMonth) && setMonth !== 'undefined NaN') {
          groups.push(setMonth);
        }
      } else if (sort === 'vendor') {
        if (set.vendors[0]) {
          if (!groups.includes(set.vendors[0].name)) {
            groups.push(set.vendors[0].name);
          }
        }
      } else {
        if (!groups.includes(set[sort])) {
          groups.push(set[sort]);
        }
      }
    });
    groups.sort(function (a, b) {
      if (sort === 'date') {
        const aMonth = new Date(a).getMonth();
        const aYear = new Date(a).getFullYear();
        const bMonth = new Date(b).getMonth();
        const bYear = new Date(b).getFullYear();
        const aDate = aYear + '' + aMonth;
        const bDate = bYear + '' + bMonth;
        if (page === 'previous') {
          if (aDate < bDate) { return 1; }
          if (aDate > bDate) { return -1; }

        } else {
          if (aDate < bDate) { return -1; }
          if (aDate > bDate) { return 1; }
        }
      } else {
        const x = a.toLowerCase();
        const y = b.toLowerCase();
        if (x < y) { return -1; }
        if (x > y) { return 1; }
      }
      return 0;
    });

    // set states
    this.setState({
      filteredSets: searchedSets,
      vendors: allVendors,
      profiles: allProfiles,
      groups: groups,
      content: (searchedSets.length > 0 ? true : false),
      loading: false
    });
  }
  setSort(sortBy) {
    const sort = ['vendor', 'date', 'profile'];
    this.setState({ sort: sort[sortBy] });
    this.filterData(this.state.page, this.state.sets, sort[sortBy]);
  }
  setSearch(query) {
    this.setState({
      search: query
    })
    this.filterData(this.state.page, this.state.sets, this.state.sort, query);
  }
  setUser = (user) => {
    this.setState({ user: user });
  }
  setWhitelist = (property, values) => {
    let whitelistCopy = this.state.whitelist;
    whitelistCopy[property] = values;
    whitelistCopy.edited = true;
    this.setState({
      whitelist: whitelistCopy
    });
    this.filterData(this.state.page, this.state.sets, this.state.sort, this.props.search, whitelistCopy);
  }
  setDevice = () => {
    let device;
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    if (vw >= 840) {
      device = 'desktop';
    } else if (vw < 840 && vw >= 480) {
      device = 'tablet';
    } else {
      device = 'mobile';
    };
    this.setState({ device: device });
  }
  componentDidMount() {
    this.setDevice();
    window.addEventListener("resize", this.setDevice);
    document.querySelector("meta[name=theme-color]").setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue('--meta-color'));
    document.querySelector('html').classList = this.state.theme;
    this.getData();
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
      (user) => {
        if (user) {
          const isEditorFn = firebase.functions().httpsCallable('isEditor');
          isEditorFn().then((result) => {
            const isEditor = result.data;
            const isAdminFn = firebase.functions().httpsCallable('isAdmin');
            isAdminFn().then((result) => {
              this.setUser({
                email: user.email,
                name: user.displayName,
                avatar: user.photoURL,
                isEditor: isEditor,
                isAdmin: result.data
              });
            }).catch((error) => {
              console.log('Error verifying admin access: ' + error);
              queue.notify({ title: 'Error verifying admin access: ' + error });
              this.setUser({
                email: user.email,
                name: user.displayName,
                avatar: user.photoURL,
                isEditor: isEditor,
                isAdmin: false
              });
            });
          }).catch((error) => {
            console.log('Error verifying editor access: ' + error);
            queue.notify({ title: 'Error verifying editor access: ' + error });
            this.setUser({
              email: user.email,
              name: user.displayName,
              avatar: user.photoURL,
              isEditor: false,
              isAdmin: false
            });
          });

        } else {
          this.setUser({
            email: null,
            name: null,
            avatar: null,
            isEditor: false,
            isAdmin: false
          });
        }
      }
    );
  }
  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    const device = this.state.device;
    let content;
    if (device === 'desktop') {
      content = <DesktopContent user={this.state.user} setUser={this.setUser} getData={this.getData} className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} profiles={this.state.profiles} vendors={this.state.vendors} sets={this.state.filteredSets} groups={this.state.groups} loading={this.state.loading} sort={this.state.sort} setSort={this.setSort} content={this.state.content} editor={this.state.user.isEditor} search={this.state.search} setSearch={this.setSearch} theme={this.state.theme} changeTheme={this.changeTheme} setWhitelist={this.setWhitelist} snackbarQueue={queue} />;
    } else if (device === 'tablet') {
      content = <TabletContent user={this.state.user} setUser={this.setUser} getData={this.getData} className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} profiles={this.state.profiles} vendors={this.state.vendors} sets={this.state.filteredSets} groups={this.state.groups} loading={this.state.loading} sort={this.state.sort} setSort={this.setSort} content={this.state.content} editor={this.state.user.isEditor} search={this.state.search} setSearch={this.setSearch} theme={this.state.theme} changeTheme={this.changeTheme} setWhitelist={this.setWhitelist} snackbarQueue={queue} />;
    } else {
      content = <MobileContent user={this.state.user} setUser={this.setUser} getData={this.getData} className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} profiles={this.state.profiles} vendors={this.state.vendors} sets={this.state.filteredSets} groups={this.state.groups} loading={this.state.loading} sort={this.state.sort} setSort={this.setSort} content={this.state.content} editor={this.state.user.isEditor} search={this.state.search} setSearch={this.setSearch} theme={this.state.theme} changeTheme={this.changeTheme} bottomNav={this.state.bottomNav} changeBottomNav={this.changeBottomNav} setWhitelist={this.setWhitelist} snackbarQueue={queue} />;
    }
    return (
      <Router>
        <Switch>
          <Route path="/users">
            <div>
              <Users admin={this.state.user.isAdmin} user={this.state.user} snackbarQueue={queue} />
              <SnackbarQueue messages={queue.messages} />
            </div>
          </Route>
          <Route path="/login">
            <Login device={this.state.device} user={this.state.user} setUser={this.setUser} />
          </Route>
          <Route path="/privacy">
            <PrivacyPolicy />
          </Route>
          <Route path="/terms">
            <TermsOfService />
          </Route>
          <Route path="/">
            <div className="app">
              {content}
              <SnackbarQueue messages={queue.messages} />
            </div>
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
