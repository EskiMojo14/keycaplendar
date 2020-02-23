import React from 'react';
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarNavigationIcon, TopAppBarTitle, TopAppBarActionItem, TopAppBarFixedAdjust } from '@rmwc/top-app-bar';
import { Tooltip } from '@rmwc/tooltip';
import { Ripple } from '@rmwc/ripple';
import './AppBar.scss';
import logo from '../logo.svg';

export class DesktopAppBar extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDrawerIcon = this.toggleDrawerIcon.bind(this);
    }

    toggleDrawerIcon() {
        this.props.toggleDrawer();
    }
    render() {
        let viewIcon;
        if (this.props.view === 'card') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm-1 6H4V5h15v4zm1 4H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zm-1 6H4v-4h15v4z" /><path d="M4 15h15v4H4zM4 5h15v4H4z" opacity=".3" /></svg>;
        } else if (this.props.view === 'list') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3"/><path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z"/></svg>;
        } else if (this.props.view === 'imageGrid') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11 12.5h3V16h-3zM11 7h3v3.5h-3zm-5 5.5h3V16H6zM6 7h3v3.5H6zm10 0h3v3.5h-3zm0 5.5h3V16h-3z" opacity=".3"/><path d="M4 5v13h17V5H4zm5 11H6v-3.5h3V16zm0-5.5H6V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5z"/></svg>;
        } else {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M5 5h15v3H5zm12 5h3v9h-3zm-7 0h5v9h-5zm-5 0h3v9H5z" opacity=".3"/><path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-9h3v9zm7 0h-5v-9h5v9zm5 0h-3v-9h3v9zm0-11H5V5h15v3z"/></svg>;
        }
        return (
            <div>
                <TopAppBar fixed>
                    <TopAppBarRow>
                        <TopAppBarSection alignStart>
                            <TopAppBarNavigationIcon icon="menu" onClick={this.toggleDrawerIcon} />
                            <img className="logo" src={logo} alt="logo" />
                            <TopAppBarTitle>KeycapLendar</TopAppBarTitle>
                        </TopAppBarSection>
                        <TopAppBarSection alignEnd>
                            <Tooltip content="Sort" align="bottom"><TopAppBarActionItem icon="sort" /></Tooltip>
                            <Tooltip content="Filter" align="bottom"><TopAppBarActionItem icon="filter_list" /></Tooltip>
                            <Tooltip content="View" align="bottom">
                                <Ripple unbounded>
                                    <div className="svg-container mdc-icon-button">
                                        {viewIcon}
                                    </div>
                                </Ripple>
                            </Tooltip>
                        </TopAppBarSection>
                    </TopAppBarRow>
                </TopAppBar>
                <TopAppBarFixedAdjust />
            </div>
        );
    }
};

export class TabletAppBar extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDrawerIcon = this.toggleDrawerIcon.bind(this);
    }

    toggleDrawerIcon() {
        this.props.toggleDrawer();
    }
    render() {
        let viewIcon;
        if (this.props.view === 'card') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm-1 6H4V5h15v4zm1 4H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zm-1 6H4v-4h15v4z" /><path d="M4 15h15v4H4zM4 5h15v4H4z" opacity=".3" /></svg>;
        } else if (this.props.view === 'list') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3"/><path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z"/></svg>;
        } else if (this.props.view === 'imageGrid') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11 12.5h3V16h-3zM11 7h3v3.5h-3zm-5 5.5h3V16H6zM6 7h3v3.5H6zm10 0h3v3.5h-3zm0 5.5h3V16h-3z" opacity=".3"/><path d="M4 5v13h17V5H4zm5 11H6v-3.5h3V16zm0-5.5H6V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5z"/></svg>;
        } else {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M5 5h15v3H5zm12 5h3v9h-3zm-7 0h5v9h-5zm-5 0h3v9H5z" opacity=".3"/><path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-9h3v9zm7 0h-5v-9h5v9zm5 0h-3v-9h3v9zm0-11H5V5h15v3z"/></svg>;
        }
        return (
            <div>
                <TopAppBar fixed>
                    <TopAppBarRow>
                        <TopAppBarSection alignStart>
                            <TopAppBarNavigationIcon icon="menu" onClick={this.toggleDrawerIcon} />
                            <TopAppBarTitle>{this.props.title}</TopAppBarTitle>
                        </TopAppBarSection>
                        <TopAppBarSection alignEnd>
                            <Tooltip content="Sort" align="bottom"><TopAppBarActionItem icon="sort" /></Tooltip>
                            <Tooltip content="Filter" align="bottom"><TopAppBarActionItem icon="filter_list" /></Tooltip>
                            <Tooltip content="View" align="bottom">
                                <Ripple unbounded>
                                    <div className="svg-container mdc-icon-button">
                                    {viewIcon}
                                    </div>
                                </Ripple>
                            </Tooltip>
                        </TopAppBarSection>
                    </TopAppBarRow>
                </TopAppBar>
                <TopAppBarFixedAdjust />
            </div>
        );
    }
};

export class MobileAppBar extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDrawerIcon = this.toggleDrawerIcon.bind(this);
    }
    toggleDrawerIcon() {
        this.props.toggleDrawer();
    }
    scrollTop() {
        window.scrollTo(0,0);
    }
    render() {
        let viewIcon;
        if (this.props.view === 'card') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm-1 6H4V5h15v4zm1 4H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zm-1 6H4v-4h15v4z" /><path d="M4 15h15v4H4zM4 5h15v4H4z" opacity=".3" /></svg>;
        } else if (this.props.view === 'list') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M5 11h2v2H5zm0 4h2v2H5zm0-8h2v2H5zm4 0h9v2H9zm0 8h9v2H9zm0-4h9v2H9z" opacity=".3"/><path d="M3 5v14h17V5H3zm4 12H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V7h2v2zm11 8H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z"/></svg>;
        } else if (this.props.view === 'imageGrid') {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11 12.5h3V16h-3zM11 7h3v3.5h-3zm-5 5.5h3V16H6zM6 7h3v3.5H6zm10 0h3v3.5h-3zm0 5.5h3V16h-3z" opacity=".3"/><path d="M4 5v13h17V5H4zm5 11H6v-3.5h3V16zm0-5.5H6V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5zm5 5.5h-3v-3.5h3V16zm0-5.5h-3V7h3v3.5z"/></svg>;
        } else {
            viewIcon = <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M5 5h15v3H5zm12 5h3v9h-3zm-7 0h5v9h-5zm-5 0h3v9H5z" opacity=".3"/><path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-9h3v9zm7 0h-5v-9h5v9zm5 0h-3v-9h3v9zm0-11H5V5h15v3z"/></svg>;
        }
        return (
            <div>
                <TopAppBar short>
                    <TopAppBarRow>
                        <TopAppBarSection alignStart className="nav-icon">
                            <TopAppBarNavigationIcon icon="menu" onClick={this.toggleDrawerIcon} />
                            <TopAppBarTitle>{this.props.title}</TopAppBarTitle>
                        </TopAppBarSection>
                        <TopAppBarSection alignEnd className="actions">
                            <Tooltip content="Sort" align="bottom"><TopAppBarActionItem icon="sort" /></Tooltip>
                            <Tooltip content="Filter" align="bottom"><TopAppBarActionItem icon="filter_list" /></Tooltip>
                            <Tooltip content="View" align="bottom">
                                <Ripple unbounded>
                                    <div className="svg-container mdc-icon-button">
                                    {viewIcon}
                                    </div>
                                </Ripple>
                            </Tooltip>
                        </TopAppBarSection>
                        <TopAppBarSection alignEnd className="short-logo" onClick={this.scrollTop}>
                            <img className="logo" src={logo} alt="logo" />
                        </TopAppBarSection>
                    </TopAppBarRow>
                </TopAppBar>
                <TopAppBarFixedAdjust />
            </div>
        );
    }
};

export default DesktopAppBar;