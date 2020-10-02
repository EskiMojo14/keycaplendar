import React from "react";
import { Select } from "@rmwc/select";
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
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
        <Select
          outlined
          enhanced={{ fixed: true }}
          label="Action"
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
        <Select
          outlined
          enhanced={{ fixed: true }}
          label="User"
          options={props.users}
          value={props.filterUser}
          className="user-select"
          onChange={(e) => {
            props.handleFilterChange(e, "filterUser");
          }}
        />
        <Select
          outlined
          enhanced={{ fixed: true }}
          label="Length"
          options={[
            { label: "25", value: 25 },
            { label: "50", value: 50 },
            { label: "100", value: 100 },
            { label: "200", value: 200 },
          ]}
          value={props.filterLength}
          className="action-select"
          onChange={(e) => {
            props.getActions(e.currentTarget.value);
          }}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default AuditFilter;
