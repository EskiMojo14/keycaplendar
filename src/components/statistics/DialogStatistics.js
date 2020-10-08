import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import { List, ListItem } from "@rmwc/list";
import { FormField } from "@rmwc/formfield";
import { Radio } from "@rmwc/radio";
import "./DialogStatistics.scss";

export class DialogStatistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      statistics: "profile",
    };
  }
  componentDidUpdate(prevProps) {
    if (this.props.open !== prevProps.open && this.props.open === true) {
      this.setState({
        statistics: this.props.statistics[
          this.props.statisticsTab === "duration" ? "durationGroup" : this.props.statisticsTab
        ],
      });
    }
  }
  setStatistics = (stats) => {
    this.setState({
      statistics: stats,
    });
  };
  changeStatistics = () => {
    if (
      this.props.statistics[this.props.statisticsTab === "duration" ? "durationGroup" : this.props.statisticsTab] !==
      this.state.statistics
    ) {
      this.props.setStatistics(
        this.props.statisticsTab === "duration" ? "durationGroup" : this.props.statisticsTab,
        this.state.statistics
      );
    }
  };
  render() {
    return (
      <Dialog
        className="statistics-dialog"
        open={this.props.open}
        onClose={() => {
          this.props.onClose();
        }}
      >
        <DialogTitle>Change category</DialogTitle>
        <DialogContent>
          <List className="statistics-list">
            <ListItem
              onClick={() => {
                this.setStatistics("profile");
              }}
            >
              <FormField>
                <Radio tabIndex="-1" checked={this.state.statistics === "profile"} readOnly />
                Profile
              </FormField>
            </ListItem>
            <ListItem
              onClick={() => {
                this.setStatistics("designer");
              }}
            >
              <FormField>
                <Radio tabIndex="-1" checked={this.state.statistics === "designer"} readOnly />
                Designer
              </FormField>
            </ListItem>
            <ListItem
              onClick={() => {
                this.setStatistics("vendor");
              }}
            >
              <FormField>
                <Radio tabIndex="-1" checked={this.state.statistics === "vendor"} readOnly />
                Vendor
              </FormField>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <DialogButton action="close">Cancel</DialogButton>
          <DialogButton action="accept" onClick={this.changeStatistics} isDefaultAction>
            Confirm
          </DialogButton>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DialogStatistics;
