import React from 'react';
import firebase from "./firebase";
import './DialogEntry.scss';
import { ImageUpload } from './ImageUpload';
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle, TopAppBarNavigationIcon } from '@rmwc/top-app-bar';
import { Typography } from '@rmwc/typography';
import { LinearProgress } from '@rmwc/linear-progress';
import { Card, CardActions, CardActionButtons, CardActionButton } from '@rmwc/card';
import { Button } from '@rmwc/button';
import { Checkbox } from '@rmwc/checkbox';
import { TextField } from '@rmwc/textfield';
import { MenuSurfaceAnchor } from '@rmwc/menu';
import { Autocomplete } from './Autocomplete';

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
            gbMonth: true,
            gbLaunch: '',
            gbEnd: '',
            shipped: false,
            vendors: [],
            loading: false,
            imageUploadProgress: 0,
            imageURL: '',
            focused: ''
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
            gbMonth: true,
            gbLaunch: '',
            gbEnd: '',
            shipped: false,
            vendors: [],
            loading: false,
            imageUploadProgress: 0,
            imageURL: '',
            focused: ''
        });
        setTimeout(() => {
            this.props.close();
            this.setState({ open: false, closing: false });
        }, 400);
    }

    handleFocus = e => {
        this.setState({
            focused: e.target.name
        });
    };

    handleBlur = () => {
        this.setState({
            focused: ''
        });
    };

    selectValue = (prop, value) => {
        this.setState({
            [prop]: value,
            focused: ''
        });
    };

    selectVendor = (prop, value) => {
        const property = prop.slice(0, -1);
        const index = prop.slice(prop.length - 1);
        let vendorsCopy = this.state.vendors;
        vendorsCopy[index][property] = value;
        this.setState({
            vendors: vendorsCopy,
            focused: ''
        });
    };


    toggleDate = () => {
        this.setState({
            gbMonth: !this.state.gbMonth
        });
    }

    setImage = (image) => {
        //resize image to 480px height
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = event => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const elem = document.createElement('canvas');
                const width = img.width * (480 / img.height);
                const height = 480;
                elem.width = width;
                elem.height = height;
                const ctx = elem.getContext('2d');
                // img.width and img.height will contain the original dimensions
                ctx.drawImage(img, 0, 0, width, height);
                ctx.canvas.toBlob((blob) => {
                    this.setState({
                        image: blob
                    });
                }, 'image/png');
                reader.onerror = error => this.props.snackbarQueue.notify({ title: 'Failed to set image:' + error });
            };
        }
    }

    handleChange = e => {
        if (e.target.name === 'designer') {
            this.setState({
                [e.target.name]: e.target.value.split(', ')
            });
        } else if (e.target.name === 'shipped') {
            this.setState({
                [e.target.name]: e.target.checked
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

    uploadImage = () => {
        this.setState({ loading: true });
        const storageRef = firebase.storage().ref();
        const keysetsRef = storageRef.child('keysets');
        const fileName = this.state.profile.toLowerCase() + this.state.colorway.replace(/\W+(.)/g, function (match, chr) {
            return chr.toUpperCase();
        });
        const imageRef = keysetsRef.child(fileName + '.png');
        const uploadTask = imageRef.put(this.state.image);
        uploadTask.on('state_changed', (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.setState({ imageUploadProgress: progress });
        }, (error) => {
            // Handle unsuccessful uploads
            this.props.snackbarQueue.notify({ title: 'Failed to upload image: ' + error });
            this.setState({ loading: false });
        }, () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            this.props.snackbarQueue.notify({ title: 'Successfully uploaded image.' });
            imageRef.getDownloadURL().then((downloadURL) => {
                this.setState({
                    imageURL: downloadURL,
                    loading: false
                });
                this.createEntry();
            }).catch((error) => {
                this.props.snackbarQueue.notify({ title: 'Failed to get URL: ' + error });
                this.setState({
                    loading: false
                });
            });
        });
    }

    createEntry = () => {
        const db = firebase.firestore();
        db.collection('keysets').add({
            profile: this.state.profile,
            colorway: this.state.colorway,
            designer: this.state.designer,
            icDate: this.state.icDate,
            details: this.state.details,
            image: this.state.image,
            gbMonth: this.state.gbMonth,
            gbLaunch: this.state.gbLaunch,
            gbEnd: this.state.gbEnd,
            shipped: this.state.shipped,
            vendors: this.state.vendors,
            storeLink: this.state.storeLink
        })
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
                this.props.snackbarQueue.notify({ title: "Entry written successfully." });
                this.closeDialog();
                this.props.getData();
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
                this.props.snackbarQueue.notify({ title: "Error adding entry: ", error });
            });
    };
    render() {
        const formFilled = (this.state.profile !== '' && this.state.colorway !== '' && this.state.designer !== [] && this.state.icDate !== '' && this.state.details !== '' && this.state.image);
        const dateCard = (this.state.gbMonth ? (
            <Card outlined className="date-container">
                <Typography use="caption" tag="h3" className="date-title">Month</Typography>
                <div className="date-form">
                    <TextField autoComplete="off" icon={{
                        icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )
                    }} outlined label="GB month" pattern="^\d{4}-\d{1,2}$" value={this.state.gbLaunch} name='gbLaunch' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM' }} onChange={this.handleChange} />
                </div>
                <CardActions>
                    <CardActionButtons>
                        <CardActionButton label="Date" onClick={(e) => { e.preventDefault(); this.toggleDate(); }} />
                    </CardActionButtons>
                </CardActions>
            </Card>
        ) : (
                <Card outlined className="date-container">
                    <Typography use="caption" tag="h3" className="date-title">Date</Typography>
                    <div className="date-form">
                        <TextField autoComplete="off" icon={{
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                            )
                        }} outlined label="GB launch" pattern="^\d{4}-\d{1,2}-\d{1,2}$|^Q\d{1} \d{4}$" value={this.state.gbLaunch} name='gbLaunch' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD or Q1-4 YYYY' }} onChange={this.handleChange} />
                        <TextField autoComplete="off" icon={{
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                            )
                        }} outlined label="GB end" pattern="^\d{4}-\d{1,2}-\d{1,2}$" value={this.state.gbEnd} name='gbEnd' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }} onChange={this.handleChange} />
                    </div>
                    <CardActions>
                        <CardActionButtons>
                            <CardActionButton label="Month" onClick={(e) => { e.preventDefault(); this.toggleDate(); }} />
                        </CardActionButtons>
                    </CardActions>
                </Card>
            ));
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
                                <Button label="Save" onClick={(e) => { if (formFilled) { e.preventDefault(); this.uploadImage() } }} disabled={!formFilled} />
                            </TopAppBarSection>
                        </TopAppBarRow>
                        <LinearProgress closed={!this.state.loading} progress={this.state.imageUploadProgress} />
                    </TopAppBar>
                    <div className="full-screen-dialog-content">
                        <form className="form">
                            <div className="form-double">
                                <div className="select-container">
                                    <MenuSurfaceAnchor>
                                        <TextField autoComplete="off" className="select" outlined required label="Profile" value={this.state.profile} name='profile' onChange={this.handleChange} onFocus={this.handleFocus} onBlur={this.handleBlur} />
                                        <Autocomplete open={(this.state.focused === 'profile' && this.state.profile !== '')} array={this.props.profiles} query={this.state.profile} prop="profile" select={this.selectValue} />
                                    </MenuSurfaceAnchor>
                                </div>
                                <div className="field-container">
                                    <TextField autoComplete="off" className="field" outlined required label="Colorway" value={this.state.colorway} name='colorway' helpText={{ persistent: false, validationMsg: true, children: 'Enter a name' }} onChange={this.handleChange} />
                                </div>
                            </div>
                            <TextField autoComplete="off" outlined label="Designer" required pattern="(\w+)[^\s](,\s*.+)*" value={this.state.designer.toString().replace(/,/g, ", ")} name='designer' helpText={{ persistent: false, validationMsg: true, children: ((this.state.designer[0] ? (this.state.designer[0].indexOf(' ') >= 0 ? 'Separate multiple designers with a comma' : 'Enter a name') : 'Enter a name')) }} onChange={this.handleChange} />
                            <TextField autoComplete="off" icon={{
                                icon: (
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                                )
                            }} outlined label="IC date" required pattern="^\d{4}-\d{1,2}-\d{1,2}$" value={this.state.icDate} name='icDate' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }} onChange={this.handleChange} />
                            <TextField autoComplete="off" icon="link" outlined label="Details" required pattern="https?:\/\/.+" value={this.state.details} name='details' helpText={{ persistent: false, validationMsg: true, children: (this.state.details.length > 0 ? 'Must be valid link' : 'Enter a link') }} onChange={this.handleChange} />
                            <ImageUpload image={this.state.image} setImage={this.setImage} snackbarQueue={this.props.snackbarQueue} />
                            {dateCard}
                            <Checkbox label="Shipped" name="shipped" checked={this.state.shipped} onChange={this.handleChange}/>
                            {this.state.vendors.map((vendor, index) => {
                                const moveUp = (index !== 0 ? <CardActionButton label="Move Up" onClick={(e) => { e.preventDefault(); this.moveVendor(index); }} /> : '');
                                return (
                                    <Card key={index} outlined className="vendor-container">
                                        <Typography use="caption" tag="h3" className="vendor-title">{index > 0 ? 'Vendor ' + (index + 1) : 'Main vendor (typically US)'}</Typography>
                                        <div className="vendor-form">
                                            <MenuSurfaceAnchor>
                                                <TextField autoComplete="off" icon={{
                                                    icon: (
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" /><path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" /></svg>
                                                    )
                                                }} required outlined label="Name" value={vendor.name} name={'name' + index} onChange={this.handleChangeVendor} onFocus={this.handleFocus} onBlur={this.handleBlur} />
                                                <Autocomplete open={(this.state.focused === 'name' + index && this.state.vendors[index].name !== '')} array={this.props.allVendors} query={this.state.vendors[index].name} prop={"name" + index} select={this.selectVendor} />
                                            </MenuSurfaceAnchor>
                                            <MenuSurfaceAnchor>
                                                <TextField autoComplete="off" icon={{
                                                    icon: (
                                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M14.99 4.59V5c0 1.1-.9 2-2 2h-2v2c0 .55-.45 1-1 1h-2v2h6c.55 0 1 .45 1 1v3h1c.89 0 1.64.59 1.9 1.4C19.19 15.98 20 14.08 20 12c0-3.35-2.08-6.23-5.01-7.41zM8.99 16v-1l-4.78-4.78C4.08 10.79 4 11.39 4 12c0 4.07 3.06 7.43 6.99 7.93V18c-1.1 0-2-.9-2-2z" opacity=".3" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.01 17.93C7.06 19.43 4 16.07 4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z" /></svg>
                                                    )
                                                }} required outlined label="Region" value={vendor.region} name={'region' + index} onChange={this.handleChangeVendor} onFocus={this.handleFocus} onBlur={this.handleBlur} />
                                                <Autocomplete open={(this.state.focused === 'region' + index && this.state.vendors[index].region !== '')} array={this.props.allRegions} query={this.state.vendors[index].region} prop={"region" + index} select={this.selectVendor} />
                                            </MenuSurfaceAnchor>
                                            <TextField autoComplete="off" icon="link" outlined label="Store link" pattern="https?:\/\/.+" value={vendor.storeLink} name={'storeLink' + index} onChange={this.handleChangeVendor} helpText={{ persistent: false, validationMsg: true, children: 'Must be valid link' }} />
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
            gbMonth: false,
            gbLaunch: '',
            gbEnd: '',
            shipped: false,
            vendors: [],
            loading: false,
            imageUploadProgress: 0,
            imageURL: '',
            newImage: false,
            focused: ''
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
            id: '',
            profile: '',
            colorway: '',
            designer: [],
            icDate: '',
            details: '',
            image: '',
            gbMonth: false,
            gbLaunch: '',
            gbEnd: '',
            shipped: false,
            vendors: [],
            loading: false,
            imageUploadProgress: 0,
            imageURL: '',
            newImage: false,
            focused: ''
        });
        setTimeout(() => {
            this.props.close();
            this.setState({ open: false, closing: false });
        }, 400);
    }

    handleFocus = e => {
        this.setState({
            focused: e.target.name
        });
    };

    handleBlur = () => {
        this.setState({
            focused: ''
        });
    };

    selectValue = (prop, value) => {
        this.setState({
            [prop]: value,
            focused: ''
        });
    };

    selectVendor = (prop, value) => {
        const property = prop.slice(0, -1);
        const index = prop.slice(prop.length - 1);
        let vendorsCopy = this.state.vendors;
        vendorsCopy[index][property] = value;
        this.setState({
            vendors: vendorsCopy,
            focused: ''
        });
    };


    setValues() {
        let gbLaunch = '';
        if (this.props.set.gbMonth) {
            const twoNumRegExp = /^\d{4}-\d{1,2}-\d{2}$/g;
            const oneNumRegExp = /^\d{4}-\d{1,2}-\d{1}$/g;
            if (twoNumRegExp.test(this.props.set.gbLaunch)) {
                gbLaunch = this.props.set.gbLaunch.slice(0, -3)
            } else if (oneNumRegExp.test(this.props.set.gbLaunch)) {
                gbLaunch = this.props.set.gbLaunch.slice(0, -2);
            } else {
                gbLaunch = this.props.set.gbLaunch;
            }
        } else {
            gbLaunch = this.props.set.gbLaunch;
        }
        this.setState({
            id: this.props.set.id,
            profile: this.props.set.profile,
            colorway: this.props.set.colorway,
            designer: this.props.set.designer,
            icDate: this.props.set.icDate,
            details: this.props.set.details,
            image: this.props.set.image,
            imageURL: this.props.set.image,
            gbMonth: this.props.set.gbMonth,
            gbLaunch: gbLaunch,
            gbEnd: this.props.set.gbEnd,
            shipped: (this.props.set.shipped ? this.props.set.shipped : false),
            vendors: this.props.set.vendors,
            storeLink: this.props.set.storeLink
        });
    }

    setImage = (image) => {
        //resize image to 480px height
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = event => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const elem = document.createElement('canvas');
                const width = img.width * (480 / img.height);
                const height = 480;
                elem.width = width;
                elem.height = height;
                const ctx = elem.getContext('2d');
                // img.width and img.height will contain the original dimensions
                ctx.drawImage(img, 0, 0, width, height);
                ctx.canvas.toBlob((blob) => {
                    this.setState({
                        image: blob,
                        newImage: true
                    });
                }, 'image/png');
                reader.onerror = error => this.props.snackbarQueue.notify({ title: 'Failed to set image: ' + error });;
            };
        }
    }

    handleChange = e => {
        if (e.target.name === 'designer') {
            this.setState({
                [e.target.name]: e.target.value.split(', ')
            });
        } else if (e.target.name === 'shipped') {
            this.setState({
                [e.target.name]: e.target.checked
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

    toggleDate = () => {
        this.setState({
            gbMonth: !this.state.gbMonth
        });
    }

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

    uploadImage = () => {
        this.setState({ loading: true });
        const storageRef = firebase.storage().ref();
        const keysetsRef = storageRef.child('keysets');
        const fileName = this.state.profile.toLowerCase() + this.state.colorway.replace(/\W+(.)/g, function (match, chr) {
            return chr.toUpperCase();
        });
        const imageRef = keysetsRef.child(fileName + '.png');
        const uploadTask = imageRef.put(this.state.image);
        uploadTask.on('state_changed', (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.setState({ imageUploadProgress: progress });
        }, (error) => {
            // Handle unsuccessful uploads
            this.props.snackbarQueue.notify({ title: 'Failed to upload image: ' + error });
            this.setState({ loading: false });
        }, () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            this.props.snackbarQueue.notify({ title: 'Successfully uploaded image.' });
            imageRef.getDownloadURL().then((downloadURL) => {
                this.setState({
                    imageURL: downloadURL,
                    loading: false
                });
                this.editEntry();
            }).catch((error) => {
                this.props.snackbarQueue.notify({ title: 'Failed to get URL: ' + error });
                this.setState({
                    loading: false
                });
            });
        });
    }

    editEntry = () => {
        const db = firebase.firestore();
        db.collection('keysets').doc(this.state.id).update({
            profile: this.state.profile,
            colorway: this.state.colorway,
            designer: this.state.designer,
            icDate: this.state.icDate,
            details: this.state.details,
            image: this.state.imageURL,
            gbMonth: this.state.gbMonth,
            gbLaunch: this.state.gbLaunch,
            gbEnd: this.state.gbEnd,
            shipped: this.state.shipped,
            vendors: this.state.vendors
        })
            .then((docRef) => {
                this.props.snackbarQueue.notify({ title: "Entry edited successfully." })
                this.closeDialog();
                this.props.getData();
            })
            .catch((error) => {
                this.props.snackbarQueue.notify({ title: "Error editing document: " + error })
            });
    };

    render() {
        const formFilled = (this.state.profile !== '' && this.state.colorway !== '' && this.state.designer !== [] && this.state.icDate !== '' && this.state.details !== '' && this.state.image);
        const dateCard = (this.state.gbMonth ? (
            <Card outlined className="date-container">
                <Typography use="caption" tag="h3" className="date-title">Month</Typography>
                <div className="date-form">
                    <TextField autoComplete="off" icon={{
                        icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                        )
                    }} outlined label="GB month" pattern="^\d{4}-\d{1,2}$" value={this.state.gbLaunch} name='gbLaunch' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM' }} onChange={this.handleChange} />
                </div>
                <CardActions>
                    <CardActionButtons>
                        <CardActionButton label="Date" onClick={(e) => { e.preventDefault(); this.toggleDate(); }} />
                    </CardActionButtons>
                </CardActions>
            </Card>
        ) : (
                <Card outlined className="date-container">
                    <Typography use="caption" tag="h3" className="date-title">Date</Typography>
                    <div className="date-form">
                        <TextField autoComplete="off" icon={{
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                            )
                        }} outlined label="GB launch" pattern="^\d{4}-\d{1,2}-\d{1,2}$|^Q\d{1} \d{4}$" value={this.state.gbLaunch} name='gbLaunch' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD or Q1-4 YYYY' }} onChange={this.handleChange} />
                        <TextField autoComplete="off" icon={{
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                            )
                        }} outlined label="GB end" pattern="^\d{4}-\d{1,2}-\d{1,2}$" value={this.state.gbEnd} name='gbEnd' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }} onChange={this.handleChange} />
                    </div>
                    <CardActions>
                        <CardActionButtons>
                            <CardActionButton label="Month" onClick={(e) => { e.preventDefault(); this.toggleDate(); }} />
                        </CardActionButtons>
                    </CardActions>
                </Card>
            ));
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
                                <Button label="Save" onClick={(e) => { e.preventDefault(); if (formFilled) { if (this.state.newImage) { this.uploadImage(); } else { this.editEntry(); } } }} disabled={!formFilled} />
                            </TopAppBarSection>
                        </TopAppBarRow>

                        <LinearProgress closed={!this.state.loading} progress={this.state.imageUploadProgress} />
                    </TopAppBar>
                    <div className="full-screen-dialog-content">
                        <div className="form-container">
                            <form className="form">
                                <div className="form-double">
                                    <div className="select-container">
                                        <MenuSurfaceAnchor>
                                            <TextField autoComplete="off" className="select" outlined required label="Profile" value={this.state.profile} name='profile' onChange={this.handleChange} onFocus={this.handleFocus} onBlur={this.handleBlur} />
                                            <Autocomplete open={(this.state.focused === 'profile' && this.state.profile !== '')} array={this.props.profiles} query={this.state.profile} prop="profile" select={this.selectValue} />
                                        </MenuSurfaceAnchor>
                                    </div>
                                    <div className="field-container">
                                        <TextField autoComplete="off" className="field" outlined required label="Colorway" value={this.state.colorway} name='colorway' helpText={{ persistent: false, validationMsg: true, children: 'Enter a name' }} onChange={this.handleChange} />
                                    </div>
                                </div>
                                <TextField autoComplete="off" outlined label="Designer" required pattern="(\w+)[^\s](,\s*.+)*" value={this.state.designer.toString().replace(/,/g, ", ")} name='designer' helpText={{ persistent: false, validationMsg: true, children: ((this.state.designer[0] ? (this.state.designer[0].indexOf(' ') >= 0 ? 'Separate multiple designers with a comma' : 'Enter a name') : 'Enter a name')) }} onChange={this.handleChange} />
                                <TextField autoComplete="off" icon={{
                                    icon: (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 2v3H4V5h16zM4 21V10h16v11H4z" /><path d="M4 5.01h16V8H4z" opacity=".3" /></svg>
                                    )
                                }} outlined label="IC date" required pattern="^\d{4}-\d{1,2}-\d{1,2}$" value={this.state.icDate} name='icDate' helpText={{ persistent: true, validationMsg: true, children: 'Format: YYYY-MM-DD' }} onChange={this.handleChange} />
                                <TextField autoComplete="off" icon="link" outlined label="Details" required pattern="https?:\/\/.+" value={this.state.details} name='details' helpText={{ persistent: false, validationMsg: true, children: (this.state.details.length > 0 ? 'Must be valid link' : 'Enter a link') }} onChange={this.handleChange} />
                                <ImageUpload image={this.state.image} setImage={this.setImage} snackbarQueue={this.props.snackbarQueue} />
                                {dateCard}
                                <Checkbox label="Shipped" name="shipped" checked={this.state.shipped} onChange={this.handleChange}/>
                                {this.state.vendors.map((vendor, index) => {
                                    const moveUp = (index !== 0 ? <CardActionButton label="Move Up" onClick={(e) => { e.preventDefault(); this.moveVendor(index); }} /> : '');
                                    return (
                                        <Card key={index} outlined className="vendor-container">
                                            <Typography use="caption" tag="h3" className="vendor-title">{index > 0 ? 'Vendor ' + (index + 1) : 'Main vendor (typically US)'}</Typography>
                                            <div className="vendor-form">
                                                <MenuSurfaceAnchor>
                                                    <TextField autoComplete="off" icon={{
                                                        icon: (
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M5.64 9l-.6 3h13.92l-.6-3z" opacity=".3" /><path d="M4 4h16v2H4zm16 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zm-8 11H6v-4h6v4zm-6.96-6l.6-3h12.72l.6 3H5.04z" /></svg>
                                                        )
                                                    }} required outlined label="Name" value={vendor.name} name={'name' + index} onChange={this.handleChangeVendor} onFocus={this.handleFocus} onBlur={this.handleBlur} />
                                                    <Autocomplete open={(this.state.focused === 'name' + index && this.state.vendors[index].name !== '')} array={this.props.allVendors} query={this.state.vendors[index].name} prop={"name" + index} select={this.selectVendor} />
                                                </MenuSurfaceAnchor>
                                                <MenuSurfaceAnchor>
                                                    <TextField autoComplete="off" icon={{
                                                        icon: (
                                                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" /><path d="M14.99 4.59V5c0 1.1-.9 2-2 2h-2v2c0 .55-.45 1-1 1h-2v2h6c.55 0 1 .45 1 1v3h1c.89 0 1.64.59 1.9 1.4C19.19 15.98 20 14.08 20 12c0-3.35-2.08-6.23-5.01-7.41zM8.99 16v-1l-4.78-4.78C4.08 10.79 4 11.39 4 12c0 4.07 3.06 7.43 6.99 7.93V18c-1.1 0-2-.9-2-2z" opacity=".3" /><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.01 17.93C7.06 19.43 4 16.07 4 12c0-.61.08-1.21.21-1.78L8.99 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41C17.92 5.77 20 8.65 20 12c0 2.08-.81 3.98-2.11 5.4z" /></svg>
                                                        )
                                                    }} required outlined label="Region" value={vendor.region} name={'region' + index} onChange={this.handleChangeVendor} onFocus={this.handleFocus} onBlur={this.handleBlur} />
                                                    <Autocomplete open={(this.state.focused === 'region' + index && this.state.vendors[index].region !== '')} array={this.props.allRegions} query={this.state.vendors[index].region} prop={"region" + index} select={this.selectVendor} />
                                                </MenuSurfaceAnchor>
                                                <TextField autoComplete="off" icon="link" outlined label="Store link" pattern="https?:\/\/.+" value={vendor.storeLink} name={'storeLink' + index} onChange={this.handleChangeVendor} helpText={{ persistent: false, validationMsg: true, children: 'Must be valid link' }} />
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