import React from 'react';
import { DesktopContent, TabletContent, MobileContent } from './components/Content';
import './App.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { view: 'card', transition: false };
    this.changeView = this.changeView.bind(this);
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
  render() {
    const device = this.props.device;
    let content;
    if (device === 'desktop') {
      content = <DesktopContent className={(this.state.transition ? 'view-transition' : '')} view={this.state.view} changeView={this.changeView} />;
    } else if (device === 'tablet') {
      content = <TabletContent className={(this.state.transition ? 'view-transition' : '')} view={this.state.view} changeView={this.changeView} />;
    } else {
      content = <MobileContent className={(this.state.transition ? 'view-transition' : '')} view={this.state.view} changeView={this.changeView} />;
    }
    return (
      <div className="app">
        {content}
      </div>
    );
  }
}

export default App;
