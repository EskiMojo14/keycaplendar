import React from 'react';
import { DesktopContent, TabletContent, MobileContent } from './components/Content';
import './App.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { page: 'live', view: 'card', transition: false };
    this.changeView = this.changeView.bind(this);
    this.changePage = this.changePage.bind(this);
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
  componentDidMount() {
    this.changeThemeColor();
  }
  render() {
    const device = this.props.device;
    let content;
    if (device === 'desktop') {
      content = <DesktopContent className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} />;
    } else if (device === 'tablet') {
      content = <TabletContent className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} />;
    } else {
      content = <MobileContent className={(this.state.transition ? 'view-transition' : '')} page={this.state.page} changePage={this.changePage} view={this.state.view} changeView={this.changeView} />;
    }
    return (
      <div className="app">
        {content}
      </div>
    );
  }
}

export default App;
