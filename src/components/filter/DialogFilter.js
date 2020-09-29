import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import { FormField } from "@rmwc/formfield";
import { Checkbox } from "@rmwc/checkbox";
import "./DialogFilter.scss";

export class DialogFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      allChecked: true,
      allUnchecked: false,
    };
  }
  componentDidUpdate(prevProps) {
    if (this.props.filterBy !== prevProps.filterBy && prevProps[this.props.filterBy].length > 0) {
      let values = {};
      let valuesProcessed = 0;
      this.props[this.props.filterBy].forEach((prop, index, array) => {
        values[prop.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())] = {
          name: prop,
          checked: this.props.whitelist[this.props.filterBy].indexOf(prop) > -1,
        };
        valuesProcessed++;
        if (valuesProcessed === array.length) {
          this.setState({
            values: values,
          });
          this.checkValues(values);
        }
      });
    }
  }
  handleChange = (e) => {
    const valuesCopy = this.state.values;
    valuesCopy[e.target.name].checked = e.target.checked;
    this.setState({
      values: valuesCopy,
    });
    this.checkValues();
  };
  changeWhitelist = () => {
    let whitelist = [];
    Object.keys(this.state.values).forEach((key) => {
      const value = this.state.values[key];
      if (value.checked) {
        whitelist.push(value.name);
      }
    });
    this.props.setWhitelist(this.props.filterBy, whitelist);
  };
  checkAll = () => {
    const valuesCopy = this.state.values;
    Object.keys(valuesCopy).forEach((key) => {
      valuesCopy[key].checked = true;
    });
    this.setState({
      values: valuesCopy,
    });
    this.checkValues();
  };
  uncheckAll = () => {
    const valuesCopy = this.state.values;
    Object.keys(valuesCopy).forEach((key) => {
      valuesCopy[key].checked = false;
    });
    this.setState({
      values: valuesCopy,
    });
    this.checkValues();
  };
  checkValues = (values = this.state.values) => {
    let allChecked = true;
    Object.keys(values).forEach((key) => {
      if (values[key].checked === false) {
        allChecked = false;
      }
    });
    let allUnchecked = true;
    Object.keys(values).forEach((key) => {
      if (values[key].checked === true) {
        allUnchecked = false;
      }
    });
    this.setState({
      allChecked: allChecked,
      allUnchecked: allUnchecked,
    });
  };
  render() {
    return (
      <Dialog
        className="filter-dialog"
        open={this.props.open}
        onClose={(evt) => {
          this.props.onClose();
        }}
      >
        <DialogTitle>Filter {this.props.filterBy}</DialogTitle>
        <DialogContent>
          <div className="select-all">
            <FormField>
              <Checkbox
                label="Select all"
                checked={this.state.allChecked}
                indeterminate={!this.state.allChecked && !this.state.allUnchecked}
                onClick={() => {
                  if (!this.state.allChecked) {
                    this.checkAll();
                  } else {
                    this.uncheckAll();
                  }
                }}
              />
            </FormField>
          </div>
          <div id="checkboxList" className="checkbox-list">
            {Object.keys(this.state.values).map((key) => {
              const value = this.state.values[key];
              return (
                <FormField
                  key={
                    "checkbox-" + value.name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
                  }
                >
                  <Checkbox
                    checked={value.checked}
                    name={value.name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())}
                    label={value.name}
                    onChange={this.handleChange}
                  />
                </FormField>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <DialogButton action="close">Cancel</DialogButton>
          <DialogButton action="accept" onClick={this.changeWhitelist} isDefaultAction>
            Confirm
          </DialogButton>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DialogFilter;
