import React from "react";
import BEMHelper from "../../util/bemHelper";
import { Select } from "@rmwc/select";
import { IconButton } from "@rmwc/icon-button";
import "./DataTablePagination.scss";

const bemClasses = new BEMHelper("mdc-data-table");

export const DataTablePagination = (props) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination", extra: props.className })}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationTrailing = (props) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination-trailing", extra: props.className })}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationRowsPerPage = (props) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination-rows-per-page", extra: props.className })}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationRowsPerPageLabel = (props) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination-rows-per-page-label", extra: props.className })}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationRowsPerPageSelect = (props) => {
  return (
    <Select
      {...props}
      outlined
      className={bemClasses({ element: "pagination-rows-per-page-select", extra: props.className })}
    >
      {props.children}
    </Select>
  );
};

export const DataTablePaginationNavigation = (props) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination-navigation", extra: props.className })}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationTotal = (props) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination-total", extra: props.className })}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationButton = (props) => {
  return (
    <IconButton {...props} className={bemClasses({ element: "pagination-button", extra: props.className })}>
      {props.children}
    </IconButton>
  );
};
