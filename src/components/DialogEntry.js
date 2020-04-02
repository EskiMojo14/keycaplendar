import React from 'react';
import firebase from "./firebase";
import './DialogEntry.scss';
import { ImageUpload } from './ImageUpload';
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle, TopAppBarNavigationIcon } from '@rmwc/top-app-bar';
import { Typography } from '@rmwc/typography';
import { Card, CardActions, CardActionButtons, CardActionButton } from '@rmwc/card';
import { Button } from '@rmwc/button';
import { TextField } from '@rmwc/textfield';

export class DialogCreate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opening: false,
            closing: false,
            animate: false,
            open: false,
            profile: '',
            colorway: '',
            designer: [],
            icDate: '',
            details: '',
            image: null,
            gbLaunch: '',
            gbEnd: '',
            vendors: [],
            storeLink: ''
        };
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }
    componentDidMount() {
        this.setState({ open: this.props.open });
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
        this.setState({ open: true, animate: true });
        setTimeout(() => {
            this.setState({ opening: true });
        }, 1);
        setTimeout(() => {
            this.setState({ animate: false, opening: false });
        }, 450);
    }
    closeDialog() {
        this.setState({
            closing: true,
            profile: '',
            colorway: '',
            designer: [],
            icDate: '',
            details: '',
            image: null,
            gbLaunch: '',
            gbEnd: '',
            vendors: [],
            storeLink: ''
        });
        setTimeout(() => {
            this.props.close();
            this.setState({ open: false, closing: false });
        }, 400);
    }

    setImage = (image) => {
        this.setState({
            image: image
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

    handleChangeVendor = e => {
        let vendors = this.state.vendors;
        const field = e.target.name.replace(/\d/g, '');
        const index = e.target.name.replace(/\D/g, '');
        vendors[index][field] = e.target.value;
        this.setState({
            vendors: vendors
        });
    };

    addVendor = () => {
        let vendors = this.state.vendors;
        const emptyVendor = {
            name: '',
            region: '',
            storeLink: ''
        }
        vendors.push(emptyVendor);
        this.setState({
            vendors: vendors
        });
    }

    removeVendor = (index) => {
        let vendors = this.state.vendors;
        vendors.splice(index, 1);
        this.setState({
            vendors: vendors
        });
    };

    moveVendor = (index) => {
        function array_move(arr, old_index, new_index) {
            if (new_index >= arr.length) {
                var k = new_index - arr.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr; // for testing
        };
        let vendors = this.state.vendors;
        array_move(vendors, index, index - 1);
        this.setState({
            vendors: vendors
        });
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
            vendors: this.state.vendors,
            storeLink: this.state.storeLink
        })
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
                this.props.snackbarQueue.notify({ title: "Entry written successfully." });
                this.props.getData();
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
                this.props.snackbarQueue.notify({ title: "Error adding entry: ", error });
            });
        this.closeDialog();
    };
    render() {
        return (
            <div className="full-screen-dialog-container">
                <div className={"full-screen-dialog create-dialog " + (this.state.open ? 'full-screen-dialog--open ' : '') + (this.state.opening ? 'full-screen-dialog--opening ' : '') + (this.state.closing ? 'full-screen-dialog--closing ' : '') + (this.state.animate ? 'full-screen-dialog--animate' : '')}>
                    <TopAppBar>
                        <TopAppBarRow>
                            <TopAppBarSection alignStart>
                                <TopAppBarNavigationIcon icon="close" onClick={this.closeDialog} />
                                <TopAppBarTitle>Create Entry</TopAppBarTitle>
                            </TopAppBarSection>
                            <TopAppBarSection alignEnd>
                                <Button label="Save" onClick={this.createEntry} />
                            </TopAppBarSection>
                        </TopAppBarRow>
                    </TopAppBar>
                    <div className="full-screen-dialog-content">
                        <form className="form">
                            <div className="form-double">
                                <div>
                                    <TextField className="select" outlined required label="Profile" value={this.state.profile} name='profile' helpText={{ persistent: false, validationMsg: true, children: 'Enter a profile' }} onChange={this.handleChange} />
                                </div>
                                <div className="field-container">
                                    <TextField className="field" outlined required label="Colorway" value={this.state.colorway} name='colorway' helpText={{ persistent: false, validationMsg: true, children: 'Enter a name' }} onChange={this.handleChange} />
                                </div>
                            </div>
                            <TextField outlined label="Designer" required pattern="(\w+)[^\s](,\s*.+)*" value={this.state.designer.toString().replace(/,/g, ", ")} name='designer' helpText={{ persistent: false, validationMsg: true, children: ((this.state.designer[0] ? (this.state.designer[0].indexOf(' ') >= 0 ? 'Separate multiple designers with a comma' : 'Enter a name') : 'Enter a name')) }} onChange={this.handleChange} />
                            <TextField icon={{
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                                )
                            }} outlined label="IC date" required pattern="^\d{4}-\d{1,2}-\d{1,2}$" value={this.state.icDate} name='icDate' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }} onChange={this.handleChange} />
                            <TextField icon="link" outlined label="Details" required pattern="https?:\/\/.+" value={this.state.details} name='details' helpText={{ persistent: false, validationMsg: true, children: (this.state.details.length > 0 ? 'Must be valid link' : 'Enter a link') }} onChange={this.handleChange} />
                            <ImageUpload image={this.state.image} setImage={this.setImage} />
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
                            {this.state.vendors.map((vendor, index) => {
                                const moveUp = (index !== 0 ? <CardActionButton label="Move Up" onClick={(e) => { e.preventDefault(); this.moveVendor(index); }} /> : '');
                                return (
                                    <Card key={index} outlined className="vendor-container">
                                        <Typography use="caption" tag="h3" className="vendor-title">Vendor {index + 1}</Typography>
                                        <div className="vendor-form">
                                            <TextField icon={{
                                                icon: (
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" /><path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" /></svg>
                                                )
                                            }} required outlined label="Name" value={vendor.name} name={'name' + index} onChange={this.handleChangeVendor} />
                                            <TextField icon={{
                                                icon: (
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M14.99 4.59V5c0 1.1-.9 2-2 2h-2v2c0 .55-.45 1-1 1h-2v2h6c.55 0 1 .45 1 1v3h1c.89 0 1.64.59 1.9 1.4C19.19 15.98 20 14.08 20 12c0-3.35-2.08-6.23-5.01-7.41zM8.99 16v-1l-4.78-4.78C4.08 10.79 4 11.39 4 12c0 4.07 3.06 7.43 6.99 7.93V18c-1.1 0-2-.9-2-2z" opacity=".3" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.01 17.93C7.06 19.43 4 16.07 4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z" /></svg>
                                                )
                                            }} required outlined label="Region" value={vendor.region} name={'region' + index} onChange={this.handleChangeVendor} />
                                            <TextField icon="link" outlined label="Store link" pattern="https?:\/\/.+" value={vendor.storeLink} name={'storeLink' + index} onChange={this.handleChangeVendor} helpText={{ persistent: false, validationMsg: true, children: 'Must be valid link' }} />
                                        </div>

                                        <CardActions className="remove-button">
                                            <CardActionButtons>
                                                <CardActionButton label="Remove" onClick={(e) => { e.preventDefault(); this.removeVendor(index); }} />
                                                {moveUp}
                                            </CardActionButtons>
                                        </CardActions>
                                    </Card>
                                )
                            })}
                            <div className="add-button">
                                <Button outlined label="Add vendor" onClick={(e) => { e.preventDefault(); this.addVendor(); }} />
                            </div>
                        </form>
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
        this.state = {
            opening: false,
            closing: false,
            animate: false,
            open: false,
            id: '',
            profile: '',
            colorway: '',
            designer: [],
            icDate: '',
            details: '',
            image: '',
            gbLaunch: '',
            gbEnd: '',
            vendors: [],
            storeLink: ''
        };
        this.openDialog = this.openDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
    }
    componentDidMount() {
        this.setState({ open: this.props.open });
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
        this.setState({ open: true, animate: true });
        setTimeout(() => {
            this.setState({ opening: true });
        }, 1);
        setTimeout(() => {
            this.setState({ animate: false, opening: false });
        }, 450);
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
            this.setState({ open: false, closing: false });
        }, 400);
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
            vendors: this.props.set.vendors,
            storeLink: this.props.set.storeLink
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

    handleChangeVendor = e => {
        let vendors = this.state.vendors;
        const field = e.target.name.replace(/\d/g, '');
        const index = e.target.name.replace(/\D/g, '');
        vendors[index][field] = e.target.value;
        this.setState({
            vendors: vendors
        });
    };

    addVendor = () => {
        let vendors = this.state.vendors;
        const emptyVendor = {
            name: '',
            region: '',
            storeLink: ''
        }
        vendors.push(emptyVendor);
        this.setState({
            vendors: vendors
        });
    }

    removeVendor = (index) => {
        let vendors = this.state.vendors;
        vendors.splice(index, 1);
        this.setState({
            vendors: vendors
        });
    };

    moveVendor = (index) => {
        function array_move(arr, old_index, new_index) {
            if (new_index >= arr.length) {
                var k = new_index - arr.length + 1;
                while (k--) {
                    arr.push(undefined);
                }
            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr; // for testing
        };
        let vendors = this.state.vendors;
        array_move(vendors, index, index - 1);
        this.setState({
            vendors: vendors
        });
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
            vendor: firebase.firestore.FieldValue.delete(),
            vendors: this.state.vendors,
            storeLink: this.state.storeLink
        })
            .then((docRef) => {
                console.log("Document updated with ID: ", docRef.id);
                this.props.snackbarQueue.notify({ title: "Entry edited successfully." })
                this.props.getData();
            })
            .catch((error) => {
                console.error("Error editing document: ", error);
                this.props.snackbarQueue.notify({ title: "Error editing document: " + error })
            });
        this.closeDialog();
    };

    render() {
        return (
            <div className="full-screen-dialog-container">
                <div className={"full-screen-dialog edit-dialog " + (this.state.open ? 'full-screen-dialog--open ' : '') + (this.state.opening ? 'full-screen-dialog--opening ' : '') + (this.state.closing ? 'full-screen-dialog--closing ' : '') + (this.state.animate ? 'full-screen-dialog--animate' : '')}>
                    <TopAppBar>
                        <TopAppBarRow>
                            <TopAppBarSection alignStart>
                                <TopAppBarNavigationIcon icon="close" onClick={this.closeDialog} />
                                <TopAppBarTitle>Edit Entry</TopAppBarTitle>
                            </TopAppBarSection>
                            <TopAppBarSection alignEnd>
                                <Button label="Save" onClick={this.editEntry} />
                            </TopAppBarSection>
                        </TopAppBarRow>
                    </TopAppBar>
                    <div className="full-screen-dialog-content">
                        <div className="form-container">
                            <form className="form">
                                <div className="form-double">
                                    <div>
                                        <TextField className="select" outlined required label="Profile" value={this.state.profile} name='profile' helpText={{ persistent: false, validationMsg: true, children: 'Enter a profile' }} onChange={this.handleChange} />
                                    </div>
                                    <div className="field-container">
                                        <TextField className="field" outlined required label="Colorway" value={this.state.colorway} name='colorway' helpText={{ persistent: false, validationMsg: true, children: 'Enter a name' }} onChange={this.handleChange} />
                                    </div>
                                </div>
                                <TextField outlined label="Designer" required pattern="(\w+)[^\s](,\s*.+)*" value={this.state.designer.toString().replace(/,/g, ", ")} name='designer' helpText={{ persistent: false, validationMsg: true, children: ((this.state.designer[0] ? (this.state.designer[0].indexOf(' ') >= 0 ? 'Separate multiple designers with a comma' : 'Enter a name') : 'Enter a name')) }} onChange={this.handleChange} />
                                <TextField icon={{
                                    icon: (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                                    )
                                }} outlined label="IC date" required pattern="^\d{4}-\d{1,2}-\d{1,2}$" value={this.state.icDate} name='icDate' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }} onChange={this.handleChange} />
                                <TextField icon="link" outlined label="Details" required pattern="https?:\/\/.+" value={this.state.details} name='details' helpText={{ persistent: false, validationMsg: true, children: (this.state.details.length > 0 ? 'Must be valid link' : 'Enter a link') }} onChange={this.handleChange} />
                                <TextField icon="link" outlined label="Image" required pattern="https?:\/\/.+" value={this.state.image} name='image' helpText={{ persistent: false, validationMsg: true, children: (this.state.image.length > 0 ? 'Must be valid link' : 'Enter a link') }} onChange={this.handleChange} />
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
                                {this.state.vendors.map((vendor, index) => {
                                    const moveUp = (index !== 0 ? <CardActionButton label="Move Up" onClick={(e) => { e.preventDefault(); this.moveVendor(index); }} /> : '');
                                    return (
                                        <Card key={index} outlined className="vendor-container">
                                            <Typography use="caption" tag="h3" className="vendor-title">Vendor {index + 1}</Typography>
                                            <div className="vendor-form">
                                                <TextField icon={{
                                                    icon: (
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" /><path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" /></svg>
                                                    )
                                                }} required outlined label="Name" value={vendor.name} name={'name' + index} onChange={this.handleChangeVendor} />
                                                <TextField icon={{
                                                    icon: (
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M14.99 4.59V5c0 1.1-.9 2-2 2h-2v2c0 .55-.45 1-1 1h-2v2h6c.55 0 1 .45 1 1v3h1c.89 0 1.64.59 1.9 1.4C19.19 15.98 20 14.08 20 12c0-3.35-2.08-6.23-5.01-7.41zM8.99 16v-1l-4.78-4.78C4.08 10.79 4 11.39 4 12c0 4.07 3.06 7.43 6.99 7.93V18c-1.1 0-2-.9-2-2z" opacity=".3" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.01 17.93C7.06 19.43 4 16.07 4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z" /></svg>
                                                    )
                                                }} required outlined label="Region" value={vendor.region} name={'region' + index} onChange={this.handleChangeVendor} />
                                                <TextField icon="link" outlined label="Store link" pattern="https?:\/\/.+" value={vendor.storeLink} name={'storeLink' + index} onChange={this.handleChangeVendor} helpText={{ persistent: false, validationMsg: true, children: 'Must be valid link' }} />
                                            </div>

                                            <CardActions className="remove-button">
                                                <CardActionButtons>
                                                    <CardActionButton label="Remove" onClick={(e) => { e.preventDefault(); this.removeVendor(index); }} />
                                                    {moveUp}
                                                </CardActionButtons>
                                            </CardActions>
                                        </Card>
                                    )
                                })}
                                <div className="add-button">
                                    <Button outlined label="Add vendor" onClick={(e) => { e.preventDefault(); this.addVendor(); }} />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="full-screen-dialog-scrim"></div>
            </div>
        );
    }
}

export default DialogCreate;