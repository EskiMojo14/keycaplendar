import React from "react";
import { hasKey } from "../../util/functions";
import { StatisticsType } from "../../util/types";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import { List, ListItem, ListItemMeta } from "@rmwc/list";
import { Radio } from "@rmwc/radio";
import "./DialogStatistics.scss";

type DialogStatisticsProps = {
  onClose: () => void;
  open: boolean;
  setStatistics: (prop: string, query: string) => void;
  statistics: StatisticsType;
  statisticsTab: string;
};

type DialogStatisticsState = {
  statistics: string;
};

export class DialogStatistics extends React.Component<DialogStatisticsProps, DialogStatisticsState> {
  state = {
    statistics: "profile",
  };
  componentDidUpdate(prevProps: DialogStatisticsProps) {
    if (this.props.open !== prevProps.open && this.props.open === true) {
      const key = this.props.statisticsTab === "duration" ? "durationGroup" : this.props.statisticsTab;
      if (hasKey(this.props.statistics, key)) {
        this.setState({
          statistics: this.props.statistics[key],
        });
      }
    }
  }
  handleChange = (stats: string) => {
    this.setState({
      statistics: stats,
    });
  };
  setStatistics = () => {
    const key = this.props.statisticsTab === "duration" ? "durationGroup" : this.props.statisticsTab;
    if (hasKey(this.props.statistics, key) && this.props.statistics[key] !== this.state.statistics) {
      this.props.setStatistics(key, this.state.statistics);
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
                this.handleChange("profile");
              }}
            >
              Profile
              <ListItemMeta>
                <Radio tabIndex={-1} checked={this.state.statistics === "profile"} readOnly />
              </ListItemMeta>
            </ListItem>
            <ListItem
              onClick={() => {
                this.handleChange("designer");
              }}
            >
              Designer
              <ListItemMeta>
                <Radio tabIndex={-1} checked={this.state.statistics === "designer"} readOnly />
              </ListItemMeta>
            </ListItem>
            <ListItem
              onClick={() => {
                this.handleChange("vendor");
              }}
            >
              Vendor
              <ListItemMeta>
                <Radio tabIndex={-1} checked={this.state.statistics === "vendor"} readOnly />
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
