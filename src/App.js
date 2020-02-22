import React from 'react';
import { DesktopContent, TabletContent, MobileContent } from './components/Content';
import './App.scss';

class App extends React.Component {
  render() {
    const device = this.props.device;
    let content;
    if (device === 'desktop') {
      content = <DesktopContent />;
    } else if (device === 'tablet') {
      content = <TabletContent />;
    } else {
      content = <MobileContent />;
    }
    return (
      <div className="app">
        {content}
      </div>
    );
  }
}

export default App;
