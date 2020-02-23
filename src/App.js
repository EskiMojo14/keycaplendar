import React from 'react';
import { DesktopContent, TabletContent, MobileContent } from './components/Content';
import './App.scss';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { view: 'card' };
  }
  render() {
    const device = this.props.device;
    let content;
    if (device === 'desktop') {
      content = <DesktopContent view={this.state.view} />;
    } else if (device === 'tablet') {
      content = <TabletContent view={this.state.view} />;
    } else {
      content = <MobileContent view={this.state.view} />;
    }
    return (
      <div className="app">
        {content}
      </div>
    );
  }
}

export default App;
