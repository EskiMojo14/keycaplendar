import React, { useEffect, useState } from "react";
import { hasKey } from "../../util/functions";
import { StatisticsType, StatsTab } from "../../util/types";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import { List, ListItem, ListItemMeta } from "@rmwc/list";
import { Radio } from "@rmwc/radio";
import "./DialogStatistics.scss";

type DialogStatisticsProps = {
  onClose: () => void;
  open: boolean;
  setStatistics: (prop: string, query: string) => void;
  statistics: StatisticsType;
  statisticsTab: StatsTab;
};

export const DialogStatistics = (props: DialogStatisticsProps) => {
  const [statistics, setStatistics] = useState("profile");

  useEffect(() => {
    if (props.open) {
      const key =
        props.statisticsTab === "duration"
          ? "durationGroup"
          : props.statisticsTab === "timelines"
          ? "timelinesGroup"
          : props.statisticsTab;
      if (hasKey(props.statistics, key)) {
        setStatistics(props.statistics[key]);
      }
    }
  }, [props.open]);

  const handleChange = (stats: string) => {
    setStatistics(stats);
  };

  const applyStatistics = () => {
    const key =
      props.statisticsTab === "duration"
        ? "durationGroup"
        : props.statisticsTab === "timelines"
        ? "timelinesGroup"
        : props.statisticsTab;
    if (hasKey(props.statistics, key) && props.statistics[key] !== statistics) {
      props.setStatistics(key, statistics);
    }
  };

  return (
    <Dialog
      className="statistics-dialog"
      open={props.open}
      onClose={() => {
        props.onClose();
      }}
    >
      <DialogTitle>Change category</DialogTitle>
      <DialogContent>
        <List className="statistics-list">
          <ListItem
            onClick={() => {
              handleChange("profile");
            }}
          >
            Profile
            <ListItemMeta>
              <Radio tabIndex={-1} checked={statistics === "profile"} readOnly />
            </ListItemMeta>
          </ListItem>
          <ListItem
            onClick={() => {
              handleChange("designer");
            }}
          >
            Designer
            <ListItemMeta>
              <Radio tabIndex={-1} checked={statistics === "designer"} readOnly />
            </ListItemMeta>
          </ListItem>
          <ListItem
            onClick={() => {
              handleChange("vendor");
            }}
          >
            Vendor
            <ListItemMeta>
              <Radio tabIndex={-1} checked={statistics === "vendor"} readOnly />
            </ListItemMeta>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <DialogButton action="close">Cancel</DialogButton>
        <DialogButton action="accept" onClick={applyStatistics} isDefaultAction>
          Confirm
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};

export default DialogStatistics;
