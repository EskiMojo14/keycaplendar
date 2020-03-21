import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from '@rmwc/dialog';
import firebase from "./firebase";

export class DialogDelete extends React.Component {
    deleteEntry = e => {
        e.preventDefault();
        const db = firebase.firestore();
        db.collection('keysets').doc(this.props.set.id).delete();
        this.props.getData();
        this.props.close();
        this.props.openSnackbar();
    };
    render() {
        return (
            <Dialog open={this.props.open}>
                <DialogTitle>Delete {this.props.set.profile + ' ' + this.props.set.colorway}</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete the entry for {this.props.set.profile + ' ' + this.props.set.colorway}?
                </DialogContent>
                <DialogActions>
                    <DialogButton action="close" onClick={this.props.close} isDefaultAction>Cancel</DialogButton>
                    <DialogButton action="accept" danger onClick={this.deleteEntry}>Delete</DialogButton>
                </DialogActions>
            </Dialog>
        );
    }
}

export default DialogDelete;