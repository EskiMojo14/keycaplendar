import React from 'react';
import firebase from "./firebase";
import './DialogEntry.scss';
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle, TopAppBarNavigationIcon } from '@rmwc/top-app-bar';
import { Button } from '@rmwc/button';
import { TextField } from '@rmwc/textfield';
import { Select } from '@rmwc/select';

export class DialogCreate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opening: false, 
            closing: false, 
            animate: false, 
            open: false,
            newProfile: false,
            profile: '',
            colorway: '',
            designer: [],
            icDate: '',
            details: '',
            image: '',
            gbLaunch: '',
            gbEnd: '',
            vendor: '',
            storeLink: ''
        };
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.newProfile = this.newProfile.bind(this);
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
        this.setState({
            closing: true,
            newProfile: false,
            profile: '',
            colorway: '',
            designer: [],
            icDate: '',
            details: '',
            image: '',
            gbLaunch: '',
            gbEnd: '',
            vendor: '',
            storeLink: ''
        });
        setTimeout(() => {
            this.props.close();
            this.setState({open: false, closing: false});
        },400);
    }
    newProfile() {
        this.setState({
            newProfile: !this.state.newProfile
        });
    }

    handleChange = e => {
        if (e.target.name === 'designer') {
            this.setState({
                [e.target.name]: e.target.value.split(', ')
            });
        } else {
            this.setState({
                [e.target.name]: e.target.value
            });

        }
    };

    createEntry = e => {
        e.preventDefault();
        const db = firebase.firestore();
        db.collection('keysets').add({
            profile: this.state.profile,
            colorway: this.state.colorway,
            designer: this.state.designer,
            icDate: this.state.icDate,
            details: this.state.details,
            image: this.state.image,
            gbLaunch: this.state.gbLaunch,
            gbEnd: this.state.gbEnd,
            vendor: this.state.vendor,
            storeLink: this.state.storeLink
        })
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
        this.closeDialog();
        this.props.getData();
    };
    render() {
        const profileSelect = (this.state.newProfile ? (
            <TextField className="select" outlined required label="Profile" value={this.state.profile} name='profile' helpText={{ persistent: false, validationMsg: true, children: 'Enter a profile' }} onChange={this.handleChange} />
        ) : (
            <Select className="select" label="Profile" outlined enhanced required options={this.props.profiles} value={this.state.profile} name='profile' helpText={{ persistent: false, validationMsg: true, children: 'Choose a profile' }} onChange={(event) => {
                this.setState({ profile: event.target.value });
            }} />
        ));
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
                                <Button label="New Profile" onClick={this.newProfile}/>
                                <Button label="Save" onClick={this.createEntry}/>
                            </TopAppBarSection>
                        </TopAppBarRow>
                    </TopAppBar>
                    <form className="form">
                        <div className="form-double">
                            <div>
                                {profileSelect}
                            </div>
                            <div className="field-container">
                                <TextField className="field" outlined required label="Colorway" value={this.state.colorway} name='colorway' helpText={{ persistent: false, validationMsg: true, children: 'Enter a name' }} onChange={this.handleChange} />
                            </div>
                        </div>
                        <TextField outlined label="Designer" required pattern="(\w+)[^\s](,\s*.+)*" value={this.state.designer.toString().replace(/,/g, ", ")} name='designer' helpText={{ persistent: false, validationMsg: true, children: 'Separate multiple designers with a comma.' }} onChange={this.handleChange} />
                        <TextField icon={{
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                            )
                        }} outlined label="IC date" required pattern="^\d{4}-\d{1,2}-\d{1,2}$" value={this.state.icDate} name='icDate' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }} onChange={this.handleChange} />
                        <TextField icon="link" outlined label="Details" required pattern="https?://.+" value={this.state.details} name='details' helpText={{ persistent: false, validationMsg: true, children: 'Must be valid link' }} onChange={this.handleChange} />
                        <TextField icon="link" outlined label="Image" required pattern="https?://.+" value={this.state.image} name='image' helpText={{ persistent: false, validationMsg: true, children: 'Must be direct link' }} onChange={this.handleChange} />
                        <TextField icon={{
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                            )
                        }} outlined label="GB launch" pattern="^\d{4}-\d{1,2}-\d{1,2}$|^Q\d{1} \d{4}$" value={this.state.gbLaunch} name='gbLaunch' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD or Q1-4 YYYY' }} onChange={this.handleChange} />
                        <TextField icon={{
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                            )
                        }} outlined label="GB end" pattern="^\d{4}-\d{1,2}-\d{1,2}$" value={this.state.gbEnd} name='gbEnd' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }} onChange={this.handleChange} />
                        <TextField outlined label="Vendor" value={this.state.vendor} name='vendor' onChange={this.handleChange} />
                        <TextField icon="link" outlined label="Store link" pattern="https?://.+" value={this.state.storeLink} name='storeLink' onChange={this.handleChange} />
                    </form>
                </div>
                <div className="full-screen-dialog-scrim"></div>
            </div>
        );
    }
}

export class DialogEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opening: false, 
            closing: false, 
            animate: false, 
            open: false,
            newProfile: false,
            id: '',
            profile: '',
            colorway: '',
            designer: [],
            icDate: '',
            details: '',
            image: '',
            gbLaunch: '',
            gbEnd: '',
            vendor: '',
            storeLink: ''
        };
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }
    componentDidMount() {
        this.setState({open: this.props.open});
    }
    componentDidUpdate(prevProps) {
        if (this.props.open !== prevProps.open) {
            if (this.props.open) {
                this.setValues();
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
        this.setState({
            closing: true,
            newProfile: false,
            id: '',
            profile: '',
            colorway: '',
            designer: [],
            icDate: '',
            details: '',
            image: '',
            gbLaunch: '',
            gbEnd: '',
            vendor: '',
            storeLink: ''
        });
        setTimeout(() => {
            this.props.close();
            this.setState({open: false, closing: false});
        },400);
    }
    setValues() {
        this.setState({
            newProfile: false,
            id: this.props.set.id,
            profile: this.props.set.profile,
            colorway: this.props.set.colorway,
            icDate: this.props.set.icDate,
            details: this.props.set.details,
            image: this.props.set.image,
            gbLaunch: this.props.set.gbLaunch,
            gbEnd: this.props.set.gbEnd,
            vendor: this.props.set.vendor,
            storeLink: this.props.set.storeLink
        });
    }

    newProfile() {
        this.setState({
            newProfile: !this.state.newProfile
        });
    }

    handleChange = e => {
        if (e.target.name === 'designer') {
            this.setState({
                [e.target.name]: e.target.value.split(', ')
            });
        } else {
            this.setState({
                [e.target.name]: e.target.value
            });

        }
    };
    
    editEntry = e => {
        e.preventDefault();
        const db = firebase.firestore();
        db.collection('keysets').doc(this.state.id).update({
            profile: this.state.profile,
            colorway: this.state.colorway,
            designer: this.state.designer,
            icDate: this.state.icDate,
            details: this.state.details,
            image: this.state.image,
            gbLaunch: this.state.gbLaunch,
            gbEnd: this.state.gbEnd,
            vendor: this.state.vendor,
            storeLink: this.state.storeLink
        });
        this.closeDialog();
        this.props.getData();
    };

    render() {
        const profileSelect = (this.state.newProfile ? (
            <TextField className="select" outlined required label="Profile" value={this.state.profile} name='profile' helpText={{ persistent: false, validationMsg: true, children: 'Enter a profile' }} onChange={this.handleChange} />
        ) : (
            <Select className="select" label="Profile" outlined enhanced required options={this.props.profiles} value={this.state.profile} name='profile' helpText={{ persistent: false, validationMsg: true, children: 'Choose a profile' }} onChange={(event) => {
                this.setState({ profile: event.target.value });
            }} />
        ));
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
                                <Button label="New Profile" onClick={this.newProfile}/>
                                <Button label="Save" onClick={this.editEntry}/>
                            </TopAppBarSection>
                        </TopAppBarRow>
                    </TopAppBar>
                    <div className="form-container">
                        <form className="form">
                            <div className="form-double">
                                <div>
                                    {profileSelect}
                                </div>
                                <div>
                                    <TextField className="field" outlined required label="Colorway" value={this.state.colorway} name='colorway' helpText={{ persistent: false, validationMsg: true, children: 'Enter a name' }} onChange={this.handleChange} />
                                </div>
                            </div>
                            <TextField outlined label="Designer" required pattern="(\w+)[^\s](,\s*.+)*" value={this.state.designer.toString().replace(/,/g, ", ")} name='designer' helpText={{ persistent: false, validationMsg: true, children: 'Separate multiple designers with a comma.' }} onChange={this.handleChange} />
                            <TextField icon={{
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                                )
                            }} outlined label="IC date" required pattern="^\d{4}-\d{1,2}-\d{1,2}$" value={this.state.icDate} name='icDate' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }} onChange={this.handleChange} />
                            <TextField icon="link" outlined label="Details" required pattern="https?://.+" value={this.state.details} name='details' helpText={{ persistent: false, validationMsg: true, children: 'Must be valid link' }} onChange={this.handleChange} />
                            <TextField icon="link" outlined label="Image" required pattern="https?://.+" value={this.state.image} name='image' helpText={{ persistent: false, validationMsg: true, children: 'Must be direct link' }} onChange={this.handleChange} />
                            <TextField icon={{
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                                )
                            }} outlined label="GB launch" pattern="^\d{4}-\d{1,2}-\d{1,2}$|^Q\d{1} \d{4}$" value={this.state.gbLaunch} name='gbLaunch' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD or Q1-4 YYYY' }} onChange={this.handleChange} />
                            <TextField icon={{
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                                )
                            }} outlined label="GB end" pattern="^\d{4}-\d{1,2}-\d{1,2}$" value={this.state.gbEnd} name='gbEnd' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }} onChange={this.handleChange} />
                            <TextField outlined label="Vendor" value={this.state.vendor} name='vendor' onChange={this.handleChange} />
                            <TextField icon="link" outlined label="Store link" pattern="https?://.+" value={this.state.storeLink} name='storeLink' onChange={this.handleChange} />
                        </form>
                    </div>
                </div>
                <div className="full-screen-dialog-scrim"></div>
            </div>
        );
    }
}

export default DialogCreate;