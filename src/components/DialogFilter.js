import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from '@rmwc/dialog';
import { FormField } from '@rmwc/formfield';
import { CheckboxFilter } from './CheckboxFilter';
import './DialogFilter.scss';

export class DialogFilter extends React.Component {
    constructor(props) {
        super(props);
        this.state = { checkedValues: [] }
    }
    handleChange = () => {
        const checkedBoxes = document.querySelectorAll('#checkboxList input[type=checkbox]:checked');
        let checkedNames = [];
        checkedBoxes.forEach((checkbox) => {
            checkedNames.push(checkbox.name);
        });
        this.setState({
            checkedValues: checkedNames
        });
    }
    render() {
        return (
            <Dialog className="filter-dialog" open={this.props.open} onClose={evt => { this.props.onClose(); }}>
                <DialogTitle>Filter {this.props.filterBy}</DialogTitle>
                <DialogContent>
                    <div id="checkboxList" className="checkbox-list">
                        {this.props[this.props.filterBy].map((value, index) => {
                            return (
                                <FormField key={index}>
                                    <CheckboxFilter label={value} onChange={this.handleChange}/>
                                </FormField>
                            )
                        })}
                    </div>
                </DialogContent>
                <DialogActions>
                    <DialogButton action="close">Cancel</DialogButton>
                    <DialogButton action="accept" onClick={() => this.props.setWhitelist(this.props.filterBy, this.state.checkedValues)} isDefaultAction>Confirm</DialogButton>
                </DialogActions>
            </Dialog>
        );
    }
}

export default DialogFilter;