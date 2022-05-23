import { useMemo } from "react";
import type { ChangeEvent } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@rmwc/drawer";
import { IconButton } from "@rmwc/icon-button";
import { Select } from "@rmwc/select";
import { Slider } from "@rmwc/slider";
import { TextField } from "@rmwc/textfield";
import { Typography } from "@rmwc/typography";
import { withTooltip } from "@c/util/hocs";
import { useAppDispatch, useAppSelector } from "@h";
import useDevice from "@h/use-device";
import {
  filterAction,
  filterUser,
  lengthChange,
  selectFilterAction,
  selectFilterUser,
  selectLength,
  selectUsers,
  useGetActionsQuery,
} from "@s/audit";
import { arrayIncludes } from "@s/util/functions";
import "./drawer-audit-filter.scss";

type DrawerAuditFilterProps = {
  close: () => void;
  open: boolean;
};

export const DrawerAuditFilter = ({ close, open }: DrawerAuditFilterProps) => {
  const dispatch = useAppDispatch();

  const device = useDevice();

  const auditLength = useAppSelector(selectLength);
  const filteredAction = useAppSelector(selectFilterAction);
  const filteredUser = useAppSelector(selectFilterUser);

  const { users = [], isFetching } = useGetActionsQuery(auditLength, {
    selectFromResult: ({ data, isFetching }) => ({
      isFetching,
      users: data && selectUsers(data),
    }),
  });

  const userOptions = useMemo(
    () => [
      { label: "All", value: "all" },
      ...users.map((user) => ({ label: user, value: user })),
    ],
    [users]
  );

  const handleFilterChange = (
    prop: "filterAction" | "filterUser",
    val: string
  ) => {
    if (prop === "filterUser") {
      dispatch(filterUser(val));
    } else if (
      prop === "filterAction" &&
      arrayIncludes(["none", "created", "updated", "deleted"] as const, val)
    ) {
      dispatch(filterAction(val));
    }
  };

  const closeButton =
    device === "desktop" &&
    withTooltip(
      <IconButton className="close-icon" icon="close" onClick={close} />,
      "Close"
    );
  const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const length = parseInt(e.target.value);
    if (!isFetching && length >= 50 && length % 50 === 0 && length <= 250) {
      dispatch(lengthChange(length));
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
              disabled={isFetching}
              discrete
              displayMarkers
              max={250}
              min={50}
              onInput={(e) => {
                if (e.detail.value !== auditLength) {
                  dispatch(lengthChange(e.detail.value));
                }
              }}
              step={50}
              value={auditLength}
            />
            <TextField
              disabled={isFetching}
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
            onChange={(e) =>
              handleFilterChange("filterAction", e.currentTarget.value)
            }
            options={[
              { label: "None", value: "none" },
              { label: "Created", value: "created" },
              { label: "Updated", value: "updated" },
              { label: "Deleted", value: "deleted" },
            ]}
            outlined
            value={filteredAction}
          />
        </div>
        <div className="filter-group">
          <div className="subheader">
            <Typography use="caption">User</Typography>
          </div>
          <Select
            className="user-select"
            enhanced={{ fixed: true }}
            onChange={(e) =>
              handleFilterChange("filterUser", e.currentTarget.value)
            }
            options={userOptions}
            outlined
            value={filteredUser}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerAuditFilter;
