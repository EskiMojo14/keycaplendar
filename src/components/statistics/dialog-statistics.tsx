import { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
import { List, ListItem, ListItemMeta } from "@rmwc/list";
import { Radio } from "@rmwc/radio";
import { useAppSelector } from "~/app/hooks";
import { selectSettings, selectTab, setStatisticsSetting } from "@s/statistics";
import type { Categories, Properties } from "@s/statistics/types";
import { hasKey } from "@s/util/functions";
import "./dialog-statistics.scss";

type DialogStatisticsProps = {
  onClose: () => void;
  open: boolean;
};

export const DialogStatistics = ({ open, onClose }: DialogStatisticsProps) => {
  const statisticsTab = useAppSelector(selectTab);
  const settings = useAppSelector(selectSettings);

  const [statistics, setStatistics] = useState<Categories | Properties>(
    "profile"
  );

  useEffect(() => {
    if (open) {
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
  }, [open]);

  const handleChange = (stats: Categories | Properties) => {
    setStatistics(stats);
  };

  const applyStatistics = () => {
    const key =
      statisticsTab === "duration"
        ? "durationGroup"
        : statisticsTab === "timelines"
        ? "timelinesGroup"
        : statisticsTab;
    if (hasKey(settings, key) && settings[key] !== statistics) {
      setStatisticsSetting(key, statistics);
    }
  };

  return (
    <Dialog
      className="statistics-dialog"
      open={open}
      onClose={() => {
        onClose();
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
              <Radio
                tabIndex={-1}
                checked={statistics === "profile"}
                readOnly
              />
            </ListItemMeta>
          </ListItem>
          <ListItem
            onClick={() => {
              handleChange("designer");
            }}
          >
            Designer
            <ListItemMeta>
              <Radio
                tabIndex={-1}
                checked={statistics === "designer"}
                readOnly
              />
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
