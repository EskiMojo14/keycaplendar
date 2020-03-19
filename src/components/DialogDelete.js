import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from '@rmwc/dialog';

export class DialogDelete extends React.Component {
    render() {
        return (
            <Dialog open={true} onClose={evt => {console.log(evt.detail.action);}}>
                <DialogTitle>Delete Entry</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this entry?
                </DialogContent>
                <DialogActions>
                    <DialogButton action="close" isDefaultAction>Cancel</DialogButton>
                    <DialogButton action="accept" danger>Delete</DialogButton>
                </DialogActions>
            </Dialog>
        );
    }
}

export default DialogDelete;