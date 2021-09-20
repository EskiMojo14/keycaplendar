import { HTMLAttributes } from "react";
import BEMHelper from "@s/common/bem-helper";
import { Select, SelectProps, SelectHTMLProps } from "@rmwc/select";
import { IconButton, IconButtonProps, IconButtonHTMLProps } from "@rmwc/icon-button";
import "./data-table-pagination.scss";

const bemClasses = new BEMHelper("mdc-data-table");

type DivProps = HTMLAttributes<HTMLDivElement>;

export const DataTablePagination = (props: DivProps) => (
  <div {...props} className={bemClasses({ element: "pagination", extra: props.className })}>
    {props.children}
  </div>
);

export const DataTablePaginationTrailing = (props: DivProps) => (
  <div {...props} className={bemClasses({ element: "pagination-trailing", extra: props.className })}>
    {props.children}
  </div>
);

export const DataTablePaginationRowsPerPage = (props: DivProps) => (
  <div {...props} className={bemClasses({ element: "pagination-rows-per-page", extra: props.className })}>
    {props.children}
  </div>
);

export const DataTablePaginationRowsPerPageLabel = (props: DivProps) => (
  <div {...props} className={bemClasses({ element: "pagination-rows-per-page-label", extra: props.className })}>
    {props.children}
  </div>
);

type DataTablePaginationRowsPerPageSelectProps = SelectProps & SelectHTMLProps;

export const DataTablePaginationRowsPerPageSelect = (props: DataTablePaginationRowsPerPageSelectProps) => (
  <Select
    {...props}
    outlined
    className={bemClasses({ element: "pagination-rows-per-page-select", extra: props.className })}
  >
    {props.children}
  </Select>
);

export const DataTablePaginationNavigation = (props: DivProps) => (
  <div {...props} className={bemClasses({ element: "pagination-navigation", extra: props.className })}>
    {props.children}
  </div>
);

export const DataTablePaginationTotal = (props: DivProps) => (
  <div {...props} className={bemClasses({ element: "pagination-total", extra: props.className })}>
    {props.children}
  </div>
);

type DataTablePaginationButtonProps = IconButtonProps & IconButtonHTMLProps;

export const DataTablePaginationButton = (props: DataTablePaginationButtonProps) => (
  <IconButton {...props} className={bemClasses({ element: "pagination-button", extra: props.className })}>
    {props.children}
  </IconButton>
);
