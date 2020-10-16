import React from "react";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { Select } from "@rmwc/select";
import { Slider } from "@rmwc/slider";
import { Typography } from "@rmwc/typography";
import "./AuditFilter.scss";

export const AuditFilter = (props) => {
  const closeButton =
    props.device === "desktop" ? <IconButton className="close-icon" icon="close" onClick={props.close} /> : null;
  return (
    <Drawer
      open={props.open}
      dismissible={props.device === "desktop"}
      modal={props.device !== "desktop"}
      className="drawer-right filter-drawer"
      onClose={props.close}
    >
      <DrawerHeader>
        <DrawerTitle>Filters</DrawerTitle>
        {closeButton}
      </DrawerHeader>
      <DrawerContent>
        <div className="subheader">
          <Typography use="caption">Length</Typography>
        </div>
        <Slider
          discrete
          displayMarkers
          min={50}
          max={500}
          step={50}
          onChange={(e) => {
            if (props.filterLength !== e.detail.value) {
              props.getActions(e.detail.value);
            }
          }}
        />
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
      </DrawerContent>
    </Drawer>
  );
};

export default AuditFilter;
