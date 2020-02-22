import React from 'react';
import { DesktopAppBar, MobileAppBar } from './AppBar';
import { DrawerAppContent } from '@rmwc/drawer';
import { DesktopNavDrawer, MobileNavDrawer } from './NavDrawer';

export function DesktopContent() {
  return (
    <div>
      <DesktopAppBar />
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <DesktopNavDrawer />
        <DrawerAppContent>
          {/* content goes here */}
        </DrawerAppContent>
      </div></div>
  );
}
export function TabletContent() {
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <MobileNavDrawer />
      <MobileAppBar />
      {/* content goes here */}
    </div>
  );
}

export function MobileContent() {
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <MobileNavDrawer />
      <MobileAppBar />
      {/* content goes here */}
    </div>
  );
}

export default DesktopContent;