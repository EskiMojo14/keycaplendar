import React, { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { selectDevice } from "../../app/slices/commonSlice";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { Select } from "@rmwc/select";
import { Slider } from "@rmwc/slider";
import { TextField } from "@rmwc/textfield";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import "./DrawerAuditFilter.scss";

type DrawerAuditFilterProps = {
  auditLength: number;
  close: () => void;
  filterAction: string;
  filterUser: string;
  getActions: (num: number) => void;
  handleFilterChange: (e: any, prop: string) => void;
  open: boolean;
  users: { label: string; value: string }[];
};

export const DrawerAuditFilter = (props: DrawerAuditFilterProps) => {
  const [auditLength, setAuditLength] = useState(props.auditLength);
  const device = useAppSelector(selectDevice);
  const closeButton =
    device === "desktop" ? (
      <Tooltip enterDelay={500} content="Close" align="bottom">
        <IconButton className="close-icon" icon="close" onClick={props.close} />
      </Tooltip>
    ) : null;
  const getActions = (num: number) => {
    if (props.auditLength !== num) {
      props.getActions(num);
    }
  };
  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const length = parseInt(e.target.value);
    setAuditLength(length);
    if (length >= 50 && length % 50 === 0) {
      getActions(length);
    }
  };
  return (
    <Drawer
      open={props.open}
      dismissible={device === "desktop"}
      modal={device !== "desktop"}
      className="drawer-right audit-filter"
      onClose={props.close}
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
              min={50}
              max={250}
              step={50}
              value={auditLength}
              onInput={(e) => {
                setAuditLength(e.detail.value);
              }}
              onChange={(e) => {
                getActions(e.detail.value);
              }}
            />
            <TextField
              outlined
              type="number"
              min={50}
              max={250}
              step={50}
              value={auditLength}
              onChange={handleLengthChange}
            />
          </div>
        </div>
        <div className="filter-group">
          <div className="subheader">
            <Typography use="caption">Action</Typography>
          </div>
          <Select
            outlined
            enhanced={{ fixed: true }}
            options={[
              { label: "None", value: "none" },
              { label: "Created", value: "created" },
              { label: "Updated", value: "updated" },
              { label: "Deleted", value: "deleted" },
            ]}
            value={props.filterAction}
            className="action-select"
            onChange={(e) => {
              props.handleFilterChange(e, "filterAction");
            }}
          />
        </div>
        <div className="filter-group">
          <div className="subheader">
            <Typography use="caption">User</Typography>
          </div>
          <Select
            outlined
            enhanced={{ fixed: true }}
            options={props.users}
            value={props.filterUser}
            className="user-select"
            onChange={(e) => {
              props.handleFilterChange(e, "filterUser");
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerAuditFilter;
