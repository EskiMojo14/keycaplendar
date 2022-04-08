import type { EntityId } from "@reduxjs/toolkit";

export const paginateUsers = (
  ids: EntityId[],
  page: number,
  rowsPerPage: number
) => {
  const first = (page - 1) * rowsPerPage;
  const last = page * rowsPerPage - 1;
  const paginated = ids.slice(first, last + 1);
  return { first, ids: paginated, last: Math.min(last, ids.length - 1) };
};
