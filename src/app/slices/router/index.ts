import { createDraftSafeSelector } from "@reduxjs/toolkit";
import type { Dictionary, EntityId, EntityState } from "@reduxjs/toolkit";
import type { Location } from "history";
import type { RootState } from "~/app/store";
import { allPages } from "@s/common/constants";
import type { Page } from "@s/common/types";
import { arrayIncludes } from "@s/util/functions";

export const selectLocation = (state: RootState, location: Location) =>
  location;

export const getPageName = (pathname: string): Page => {
  if (pathname === "/") {
    return "calendar";
  } else {
    const [, page] = pathname.split("/");
    if (arrayIncludes(allPages, page)) {
      return page;
    } else {
      // this won't happen - router directs to 404
      return "calendar";
    }
  }
};

export interface EntityLocatedSelectors<T, V> {
  selectAll: (state: V, location: Location) => T[];
  selectById: (state: V, location: Location, id: EntityId) => T | undefined;
  selectEntities: (state: V, location: Location) => Dictionary<T>;
  selectIds: (state: V, location: Location) => EntityId[];
  selectTotal: (state: V, location: Location) => number;
}

export const getLocatedSelectors = <T>(
  selectState: (state: RootState, location: Location) => EntityState<T>
): EntityLocatedSelectors<T, RootState> => {
  const selectIds = (state: EntityState<T>) => state.ids;

  const selectEntities = (state: EntityState<T>) => state.entities;

  const selectAll = createDraftSafeSelector(
    selectIds,
    selectEntities,
    (ids, entities) => ids.map((id) => entities[id]!)
  );

  const selectId = (_: unknown, __: unknown, id: EntityId) => id;

  const selectById = (entities: Dictionary<T>, id: EntityId) => entities[id];

  const selectTotal = createDraftSafeSelector(selectIds, (ids) => ids.length);

  const selectGlobalizedEntities = createDraftSafeSelector(
    selectState,
    selectEntities
  );

  return {
    selectAll: createDraftSafeSelector(selectState, selectAll),
    selectById: createDraftSafeSelector(
      selectGlobalizedEntities,
      selectId,
      selectById
    ),
    selectEntities: selectGlobalizedEntities,
    selectIds: createDraftSafeSelector(selectState, selectIds),
    selectTotal: createDraftSafeSelector(selectState, selectTotal),
  };
};
