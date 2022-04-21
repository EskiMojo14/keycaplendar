import {
  addListener,
  createAction,
  createDraftSafeSelector,
  isAnyOf,
} from "@reduxjs/toolkit";
import type {
  ActionCreatorWithPreparedPayload,
  Dictionary,
  EntityId,
  EntityState,
} from "@reduxjs/toolkit";
import type { Action, History, Location } from "history";
import type { AppDispatch, RootState } from "~/app/store";
import { allPages, pageTitle } from "@s/common/constants";
import type { Page } from "@s/common/types";
import { arrayIncludes, objectEntries } from "@s/util/functions";

export const getPageName = (pathname: string): Page => {
  if (pathname === "/") {
    return "calendar";
  } else {
    const [, page] = pathname.split("/");
    if (arrayIncludes(allPages, page)) {
      return page;
    } else {
      // this won't happen - router directs to 404
      return "" as Page;
    }
  }
};

export const getPageTitle = (pathname: string) => {
  const page = getPageName(pathname);
  return page && pageTitle[page];
};

export const locationChange = createAction(
  "router/locationChange",
  (location: Location, action: Action) => ({ payload: { action, location } })
);

export const setupLocationChangeListener = (
  listen: History["listen"],
  dispatch: AppDispatch
) =>
  listen((location, action) => {
    const title = getPageTitle(location.pathname);
    document.title = title ? `KeycapLendar: ${title}` : "KeycapLendar";
    dispatch(locationChange(location, action));
  });

const idKeys = <Keys extends [keyof History, ...(keyof History)[]]>(
  ...keys: Keys
) => keys;

const keys = idKeys("push", "replace", "go", "goBack", "goForward");

type ActionCreators = {
  [Key in typeof keys[number]]: ActionCreatorWithPreparedPayload<
    /* eslint-disable no-use-before-define */
    Parameters<History[Key]>,
    Parameters<History[Key]>,
    `router/${Key}`
    /* eslint-enable no-use-before-define */
  >;
};

export const actionCreators = Object.fromEntries(
  keys.map((key) => [
    key,
    createAction(`router/${key}`, (...args) => ({ payload: args })),
  ])
) as ActionCreators;

export const { go, goBack, goForward, push, replace } = actionCreators;

export const addRouterListener = (history: History) =>
  addListener({
    effect: (action) => {
      objectEntries(actionCreators).forEach(([key, actionCreator]) => {
        if (actionCreator.match(action)) {
          // @ts-expect-error heh
          history[key](...action.payload);
        }
      });
    },
    // @ts-expect-error object values doesn't give a tuple
    matcher: isAnyOf(...Object.values(actionCreators)),
  });

export const selectLocation = (state: RootState, location: Location) =>
  location;

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
