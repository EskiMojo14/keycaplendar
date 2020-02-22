import React from 'react';
import { DesktopAppBar } from './components/desktopAppBar';
import { MobileAppBar } from './components/mobileAppBar';
import './App.scss';

class App extends React.Component {
  render() {
    const device = this.props.device;
    let appBar;
    if (device === 'desktop') {
      appBar = <DesktopAppBar />;
    } else {
      appBar = <MobileAppBar />;
    }
    return (
      <div className="app">
        {appBar}
        <div style={{ height: '100rem', padding: '1rem' }}>Scroll Me</div>
      </div>
    );
  }
}

export default App;
