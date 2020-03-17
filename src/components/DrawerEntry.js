import React from 'react';
import firebase from "./firebase";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from '@rmwc/drawer';
import { TextField } from '@rmwc/textfield';
import { Button } from '@rmwc/button';
import { Select } from '@rmwc/select';
import './DrawerEntry.scss';

export class DrawerCreate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
        this.closeDrawer = this.closeDrawer.bind(this);
        this.newProfile = this.newProfile.bind(this);
    }

    closeDrawer() {
        this.props.close();
        this.setState({
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
        this.closeDrawer();
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
            <Drawer modal open={this.props.open} onClose={this.closeDrawer} className="entry-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Create Entry</DrawerTitle>
                </DrawerHeader>
                <DrawerContent>
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
                </DrawerContent>
                <div className="drawer-footer">
                    <Button label="New Profile" onClick={this.newProfile} />
                    <Button label="Save" onClick={this.createEntry} />
                </div>
            </Drawer>
        );
    }
};

export class DrawerEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
        this.closeDrawer = this.closeDrawer.bind(this);
        this.newProfile = this.newProfile.bind(this);
        this.setValues = this.setValues.bind(this);
    }

    setValues() {
        this.setState({
            newProfile: false,
            id: this.props.set.id,
            profile: this.props.set.profile,
            colorway: this.props.set.colorway,
            designer: this.props.set.designer,
            icDate: this.props.set.icDate,
            details: this.props.set.details,
            image: this.props.set.image,
            gbLaunch: this.props.set.gbLaunch,
            gbEnd: this.props.set.gbEnd,
            vendor: this.props.set.vendor,
            storeLink: this.props.set.storeLink
        });
    }

    closeDrawer() {
        this.setState({
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
        this.props.close();
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
        this.closeDrawer();
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
            <Drawer modal open={this.props.open} onOpen={this.setValues} onClose={this.props.close} className="entry-drawer drawer-right">
                <DrawerHeader>
                    <DrawerTitle>Edit Entry</DrawerTitle>
                </DrawerHeader> 
                <DrawerContent>
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
                </DrawerContent>
                <div className="drawer-footer">
                    <Button label="New Profile" onClick={this.newProfile} />
                    <Button label="Save" onClick={this.editEntry} />
                </div>
            </Drawer>
        );
    }
};

export default DrawerCreate;