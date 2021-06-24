import React from "react";
import BEMHelper from "@s/common/bemHelper";
import { HTMLProps } from "@s/common/types";
import { Select, SelectProps } from "@rmwc/select";
import { IconButton, IconButtonProps } from "@rmwc/icon-button";
import "./DataTablePagination.scss";

const bemClasses = new BEMHelper("mdc-data-table");

export const DataTablePagination = (props: HTMLProps) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination", extra: props.className })}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationTrailing = (props: HTMLProps) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination-trailing", extra: props.className })}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationRowsPerPage = (props: HTMLProps) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination-rows-per-page", extra: props.className })}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationRowsPerPageLabel = (props: HTMLProps) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination-rows-per-page-label", extra: props.className })}>
      {props.children}
    </div>
  );
};

type DataTablePaginationRowsPerPageSelectProps = HTMLProps & SelectProps;

export const DataTablePaginationRowsPerPageSelect = (props: DataTablePaginationRowsPerPageSelectProps) => {
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

export const DataTablePaginationNavigation = (props: HTMLProps) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination-navigation", extra: props.className })}>
      {props.children}
    </div>
  );
};

export const DataTablePaginationTotal = (props: HTMLProps) => {
  return (
    <div {...props} className={bemClasses({ element: "pagination-total", extra: props.className })}>
      {props.children}
    </div>
  );
};

type DataTablePaginationButtonProps = HTMLProps & IconButtonProps;

export const DataTablePaginationButton = (props: DataTablePaginationButtonProps) => {
  return (
    <IconButton {...props} className={bemClasses({ element: "pagination-button", extra: props.className })}>
      {props.children}
    </IconButton>
  );
};
