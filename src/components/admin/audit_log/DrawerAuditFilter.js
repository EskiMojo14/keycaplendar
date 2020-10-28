import React, { useState } from "react";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { Select } from "@rmwc/select";
import { Slider } from "@rmwc/slider";
import { TextField } from "@rmwc/textfield";
import { Tooltip } from "@rmwc/tooltip";
import { Typography } from "@rmwc/typography";
import "./DrawerAuditFilter.scss";

export const DrawerAuditFilter = (props) => {
  const [auditLength, setAuditLength] = useState(props.auditLength);
  const closeButton =
    props.device === "desktop" ? (
      <Tooltip enterDelay={500} content="Close" align="bottom">
        <IconButton className="close-icon" icon="close" onClick={props.close} />
      </Tooltip>
    ) : null;
  const getActions = (num) => {
    if (props.auditLength !== num) {
      props.getActions(num);
    }
  };
  const handleChange = (e) => {
    setAuditLength(e.target.value);
    if (e.target.value >= 50 && e.target.value % 50 === 0) {
      getActions(e.target.value);
    }
  };
  return (
    <Drawer
      open={props.open}
      dismissible={props.device === "desktop"}
      modal={props.device !== "desktop"}
      className="drawer-right filter-drawer audit-filter"
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
              onChange={handleChange}
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
