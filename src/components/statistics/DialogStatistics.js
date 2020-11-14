import React from "react";
import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import { List, ListItem, ListItemMeta } from "@rmwc/list";
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
  setStatistics = () => {
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
              Profile
              <ListItemMeta>
                <Radio tabIndex="-1" checked={this.state.statistics === "profile"} readOnly />
              </ListItemMeta>
            </ListItem>
            <ListItem
              onClick={() => {
                this.setStatistics("designer");
              }}
            >
              Designer
              <ListItemMeta>
                <Radio tabIndex="-1" checked={this.state.statistics === "designer"} readOnly />
              </ListItemMeta>
            </ListItem>
            <ListItem
              onClick={() => {
                this.setStatistics("vendor");
              }}
            >
              Vendor
              <ListItemMeta>
                <Radio tabIndex="-1" checked={this.state.statistics === "vendor"} readOnly />
              </ListItemMeta>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <DialogButton action="close">Cancel</DialogButton>
          <DialogButton action="accept" onClick={this.setStatistics} isDefaultAction>
            Confirm
          </DialogButton>
        </DialogActions>
      </Dialog>
    );
  }
}

export default DialogStatistics;

DialogStatistics.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  setStatistics: PropTypes.func,
  statistics: PropTypes.object,
  statisticsTab: PropTypes.string,
};
