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

export const DialogStatistics = ({ onClose, open }: DialogStatisticsProps) => {
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
      onClose={() => {
        onClose();
      }}
      open={open}
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
                checked={statistics === "profile"}
                readOnly
                tabIndex={-1}
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
                checked={statistics === "designer"}
                readOnly
                tabIndex={-1}
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
              <Radio checked={statistics === "vendor"} readOnly tabIndex={-1} />
            </ListItemMeta>
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <DialogButton action="close">Cancel</DialogButton>
        <DialogButton action="accept" isDefaultAction onClick={applyStatistics}>
          Confirm
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};

export default DialogStatistics;
