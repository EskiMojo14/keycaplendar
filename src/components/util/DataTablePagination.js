import React from "react";
import classNames from "classnames";
import { Select } from "@rmwc/select";
import { IconButton } from "@rmwc/icon-button";
import "./DataTablePagination.scss";

export const DataTablePagination = (props) => {
  return (
    <div {...props} className={classNames("mdc-data-table__pagination", props.className)}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationTrailing = (props) => {
  return (
    <div {...props} className={classNames("mdc-data-table__pagination-trailing", props.className)}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationRowsPerPage = (props) => {
  return (
    <div {...props} className={classNames("mdc-data-table__pagination-rows-per-page", props.className)}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationRowsPerPageLabel = (props) => {
  return (
    <div {...props} className={classNames("mdc-data-table__pagination-rows-per-page-label", props.className)}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationRowsPerPageSelect = (props) => {
  return (
    <Select
      {...props}
      outlined
      className={classNames("mdc-data-table__pagination-rows-per-page-select", props.className)}
    >
      {props.children}
    </Select>
  );
};

export const DataTablePaginationNavigation = (props) => {
  return (
    <div {...props} className={classNames("mdc-data-table__pagination-navigation", props.className)}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationTotal = (props) => {
  return (
    <div {...props} className={classNames("mdc-data-table__pagination-total", props.className)}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationButton = (props) => {
  return (
    <IconButton {...props} className={classNames("mdc-data-table__pagination-button", props.className)}>
      {props.children}
    </IconButton>
  );
};
