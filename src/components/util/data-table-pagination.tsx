import type { HTMLAttributes } from "react";
import { IconButton } from "@rmwc/icon-button";
import type { IconButtonHTMLProps, IconButtonProps } from "@rmwc/icon-button";
import { Select } from "@rmwc/select";
import type { SelectHTMLProps, SelectProps } from "@rmwc/select";
import BEMHelper from "@s/common/bem-helper";
import "./data-table-pagination.scss";

const bemClasses = new BEMHelper("mdc-data-table");

export const DataTablePagination = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={bemClasses({ element: "pagination", extra: className })} />
);

export const DataTablePaginationTrailing = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={bemClasses({ element: "pagination-trailing", extra: className })} />
);

export const DataTablePaginationRowsPerPage = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={bemClasses({ element: "pagination-rows-per-page", extra: className })} />
);

export const DataTablePaginationRowsPerPageLabel = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={bemClasses({ element: "pagination-rows-per-page-label", extra: className })} />
);

type DataTablePaginationRowsPerPageSelectProps = SelectHTMLProps & SelectProps;

export const DataTablePaginationRowsPerPageSelect = ({
  className,
  ...props
}: DataTablePaginationRowsPerPageSelectProps) => (
  <Select
    {...props}
    outlined
    className={bemClasses({ element: "pagination-rows-per-page-select", extra: className })}
  />
);

export const DataTablePaginationNavigation = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={bemClasses({ element: "pagination-navigation", extra: className })} />
);

export const DataTablePaginationTotal = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={bemClasses({ element: "pagination-total", extra: className })} />
);

type DataTablePaginationButtonProps = IconButtonHTMLProps & IconButtonProps;

export const DataTablePaginationButton = ({ className, ...props }: DataTablePaginationButtonProps) => (
  <IconButton {...props} className={bemClasses({ element: "pagination-button", extra: className })} />
);
