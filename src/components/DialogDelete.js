import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from '@rmwc/dialog';
import firebase from "./firebase";

export class DialogDelete extends React.Component {
    deleteEntry = e => {
        e.preventDefault();
        const db = firebase.firestore();
        db.collection('keysets').doc(this.props.set.id).delete()
        .then(function (docRef) {
            console.log("Document deleted with ID: ", docRef.id);
            this.props.openSnackbar();
            this.props.getData();
        })
        .catch(function (error) {
            console.error("Error deleting document: ", error);
        });
        this.props.close();
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
                    <DialogButton action="accept" className="delete" onClick={this.deleteEntry}>Delete</DialogButton>
                </DialogActions>
            </Dialog>
        );
    }
}

export default DialogDelete;