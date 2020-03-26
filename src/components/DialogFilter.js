import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from '@rmwc/dialog';
import { FormField } from '@rmwc/formfield';
import { CheckboxFilter } from './CheckboxFilter';
import './DialogFilter.scss';

export class DialogFilter extends React.Component {
    render() {
        return (
            <Dialog className="filter-dialog" open={this.props.open} onClose={evt => { this.props.onClose(); }}>
                <DialogTitle>Filter {this.props.filterBy}</DialogTitle>
                <DialogContent>
                    <div className="checkbox-list">
                        {this.props[this.props.filterBy].map((value, index) => {
                            return (
                                <FormField key={index}>
                                    <CheckboxFilter label={value}/>
                                </FormField>
                            )
                        })}
                    </div>
                </DialogContent>
                <DialogActions>
                    <DialogButton action="close">Cancel</DialogButton>
                    <DialogButton action="accept" isDefaultAction>Confirm</DialogButton>
                </DialogActions>
            </Dialog>
        );
    }
}

export default DialogFilter;