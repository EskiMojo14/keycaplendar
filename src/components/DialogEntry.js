import React from 'react';
import './DialogEntry.scss';
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle, TopAppBarNavigationIcon } from '@rmwc/top-app-bar';
import { Button } from '@rmwc/button';
import { TextField } from '@rmwc/textfield';
import { Select } from '@rmwc/select';

export class DialogCreate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {opening: false, closing: false, animate: false, open: false};
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }
    componentDidMount() {
        this.setState({open: this.props.open});
    }
    componentDidUpdate(prevProps) {
        if (this.props.open !== prevProps.open) {
            if (this.props.open) {
                this.openDialog();
            } else {
                this.closeDialog();
            }
        }
    }
    openDialog() {
        this.setState({open: true, animate: true});
        setTimeout(() => {
            this.setState({opening: true});
        },1);
        setTimeout(() => {
            this.setState({animate: false, opening: false});
        },450);
    }
    closeDialog() {
        this.setState({closing: true});
        setTimeout(() => {
            this.props.close();
            this.setState({open: false, closing: false});
        },400);
    }
    render() {
        return (
            <div className="full-screen-dialog-container">
                <div className={"full-screen-dialog create-dialog " + (this.state.open ? 'full-screen-dialog--open ' : '') + (this.state.opening ? 'full-screen-dialog--opening ' : '')+ (this.state.closing ? 'full-screen-dialog--closing ' : '') + (this.state.animate ? 'full-screen-dialog--animate' : '')}>
                    <TopAppBar>
                        <TopAppBarRow>
                            <TopAppBarSection alignStart>
                                <TopAppBarNavigationIcon icon="close" onClick={this.closeDialog} />
                                <TopAppBarTitle>Create Entry</TopAppBarTitle>
                            </TopAppBarSection>
                            <TopAppBarSection alignEnd>
                                <Button label="Save" onClick={this.closeDialog}/>
                            </TopAppBarSection>
                        </TopAppBarRow>
                    </TopAppBar>
                    <div className="form" >
                        <div className="form-double">
                            <Select className="select" label="Profile" outlined enhanced required options={['KAT']}/>
                            <TextField className="field" outlined required label="Colourway" />
                        </div>
                        <TextField icon={{icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="IC date" required pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>
                        <TextField icon="link" outlined label="Geekhack/IC" required pattern="https?://.+"/>
                        <TextField icon="link" outlined label="Image" required pattern="https?://.+" helpText={{ persistent: true, validationMsg: true, children: 'Must be direct link' }}/>
                        <TextField icon={{icon: (            
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="GB launch" pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>
                        <TextField icon={{icon: (            
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="GB end" pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>           
                        <TextField outlined label="Vendor" />
                        <TextField icon="link" outlined label="Store link" pattern="https?://.+"/>
                    </div>
                </div>
                <div className="full-screen-dialog-scrim"></div>
            </div>
        );
    }
}

export class DialogEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {opening: false, closing: false, animate: false, open: false};
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }
    componentDidMount() {
        this.setState({open: this.props.open});
    }
    componentDidUpdate(prevProps) {
        if (this.props.open !== prevProps.open) {
            if (this.props.open) {
                this.openDialog();
            } else {
                this.closeDialog();
            }
        }
    }
    openDialog() {
        this.setState({open: true, animate: true});
        setTimeout(() => {
            this.setState({opening: true});
        },1);
        setTimeout(() => {
            this.setState({animate: false, opening: false});
        },450);
    }
    closeDialog() {
        this.setState({closing: true});
        setTimeout(() => {
            this.props.close();
            this.setState({open: false, closing: false});
        },400);
    }
    render() {
        return (
            <div className="full-screen-dialog-container">
                <div className={"full-screen-dialog edit-dialog " + (this.state.open ? 'full-screen-dialog--open ' : '') + (this.state.opening ? 'full-screen-dialog--opening ' : '')+ (this.state.closing ? 'full-screen-dialog--closing ' : '') + (this.state.animate ? 'full-screen-dialog--animate' : '')}>
                    <TopAppBar>
                        <TopAppBarRow>
                            <TopAppBarSection alignStart>
                                <TopAppBarNavigationIcon icon="close" onClick={this.closeDialog} />
                                <TopAppBarTitle>Edit Entry</TopAppBarTitle>
                            </TopAppBarSection>
                            <TopAppBarSection alignEnd>
                                <Button label="Save" onClick={this.closeDialog}/>
                            </TopAppBarSection>
                        </TopAppBarRow>
                    </TopAppBar>
                    <div className="form" >
                        <div className="form-double">
                            <Select className="select" label="Profile" outlined enhanced required options={['KAT']}/>
                            <TextField className="field" outlined required label="Colourway" />
                        </div>
                        <TextField icon={{icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="IC date" required pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>
                        <TextField icon="link" outlined label="Geekhack/IC" required pattern="https?://.+"/>
                        <TextField icon="link" outlined label="Image" required pattern="https?://.+" helpText={{ persistent: true, validationMsg: true, children: 'Must be direct link' }}/>
                        <TextField icon={{icon: (            
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="GB launch" pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>
                        <TextField icon={{icon: (            
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )}} outlined label="GB end" pattern="^\d{4}-\d{1,2}-\d{1,2}$" helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }}/>           
                        <TextField outlined label="Vendor" />
                        <TextField icon="link" outlined label="Store link" pattern="https?://.+"/>
                    </div>
                </div>
                <div className="full-screen-dialog-scrim"></div>
            </div>
        );
    }
}

export default DialogCreate;