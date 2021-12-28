import type { HTMLAttributes } from "react";
import { IconButton } from "@rmwc/icon-button";
import type { IconButtonHTMLProps, IconButtonProps } from "@rmwc/icon-button";
import { Select } from "@rmwc/select";
import type { SelectHTMLProps, SelectProps } from "@rmwc/select";
import BEMHelper from "@s/common/bem-helper";
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

type DataTablePaginationRowsPerPageSelectProps = SelectHTMLProps & SelectProps;

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

type DataTablePaginationButtonProps = IconButtonHTMLProps & IconButtonProps;

export const DataTablePaginationButton = (props: DataTablePaginationButtonProps) => (
  <IconButton {...props} className={bemClasses({ element: "pagination-button", extra: props.className })}>
    {props.children}
  </IconButton>
);
