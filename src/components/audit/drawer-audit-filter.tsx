import type { ChangeEvent } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { Select } from "@rmwc/select";
import { Slider } from "@rmwc/slider";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { withTooltip } from "@c/util/hocs";
import {
  selectFilterAction,
  selectFilterUser,
  selectLength,
  selectUsers,
  setLength,
} from "@s/audit";
import { getActions } from "@s/audit/functions";
import { selectDevice } from "@s/common";
import "./drawer-audit-filter.scss";

type DrawerAuditFilterProps = {
  close: () => void;
  handleFilterChange: (e: any, prop: string) => void;
  open: boolean;
};

export const DrawerAuditFilter = ({
  close,
  handleFilterChange,
  open,
}: DrawerAuditFilterProps) => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);

  const auditLength = useAppSelector(selectLength);
  const filterAction = useAppSelector(selectFilterAction);
  const filterUser = useAppSelector(selectFilterUser);
  const users = useAppSelector(selectUsers);

  const closeButton =
    device === "desktop"
      ? withTooltip(
          <IconButton className="close-icon" icon="close" onClick={close} />,
          "Close"
        )
      : null;
  const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const length = parseInt(e.target.value);
    dispatch(setLength(length));
    if (length >= 50 && length % 50 === 0 && length <= 250) {
      getActions();
    }
  };
  return (
    <Drawer
      className="drawer-right audit-filter"
      dismissible={device === "desktop"}
      modal={device !== "desktop"}
      onClose={close}
      open={open}
    >
      <DrawerHeader>
        <DrawerTitle>Filters</DrawerTitle>
        {closeButton}
      </DrawerHeader>
      <DrawerContent>
        <div className="filter-group">
          <div className="subheader">
            <Typography use="caption">Length</Typography>
          </div>
          <div className="slider-container">
            <Slider
              discrete
              displayMarkers
              max={250}
              min={50}
              onChange={() => {
                getActions();
              }}
              onInput={(e) => {
                dispatch(setLength(e.detail.value));
              }}
              step={50}
              value={auditLength}
            />
            <TextField
              max={250}
              min={50}
              onChange={handleLengthChange}
              outlined
              step={50}
              type="number"
              value={auditLength}
            />
          </div>
        </div>
        <div className="filter-group">
          <div className="subheader">
            <Typography use="caption">Action</Typography>
          </div>
          <Select
            className="action-select"
            enhanced={{ fixed: true }}
            onChange={(e) => {
              handleFilterChange(e, "filterAction");
            }}
            options={[
              { label: "None", value: "none" },
              { label: "Created", value: "created" },
              { label: "Updated", value: "updated" },
              { label: "Deleted", value: "deleted" },
            ]}
            outlined
            value={filterAction}
          />
        </div>
        <div className="filter-group">
          <div className="subheader">
            <Typography use="caption">User</Typography>
          </div>
          <Select
            className="user-select"
            enhanced={{ fixed: true }}
            onChange={(e) => {
              handleFilterChange(e, "filterUser");
            }}
            options={[
              { label: "All", value: "all" },
              ...users.map((user) => ({ label: user, value: user })),
            ]}
            outlined
            value={filterUser}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerAuditFilter;
