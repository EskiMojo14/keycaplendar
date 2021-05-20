import React, { useEffect, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { hasKey } from "../../app/slices/common/functions";
import { selectStatsSettings, selectStatsTab, setStatisticsSetting } from "../../app/slices/statistics/statisticsSlice";
import { Categories, Properties } from "../../app/slices/statistics/types";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import { List, ListItem, ListItemMeta } from "@rmwc/list";
import { Radio } from "@rmwc/radio";
import "./DialogStatistics.scss";

type DialogStatisticsProps = {
  onClose: () => void;
  open: boolean;
};

export const DialogStatistics = (props: DialogStatisticsProps) => {
  const statisticsTab = useAppSelector(selectStatsTab);
  const settings = useAppSelector(selectStatsSettings);

  const [statistics, setStatistics] = useState<Properties | Categories>("profile");

  useEffect(() => {
    if (props.open) {
      const key =
        statisticsTab === "duration"
          ? "durationGroup"
          : statisticsTab === "timelines"
          ? "timelinesGroup"
          : statisticsTab;
      if (hasKey(settings, key)) {
        setStatistics(settings[key]);
      }
    }
  }, [props.open]);

  const handleChange = (stats: Properties | Categories) => {
    setStatistics(stats);
  };

  const applyStatistics = () => {
    const key =
      statisticsTab === "duration" ? "durationGroup" : statisticsTab === "timelines" ? "timelinesGroup" : statisticsTab;
    if (hasKey(settings, key) && settings[key] !== statistics) {
      setStatisticsSetting({ key: key, value: statistics });
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
