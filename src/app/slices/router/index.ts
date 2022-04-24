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
import type { History, Location } from "history";
import type { RootState } from "~/app/store";
import { allPages, pageTitle } from "@s/common/constants";
import type { Page } from "@s/common/types";
import { arrayIncludes, objectEntries } from "@s/util/functions";
import type { UnionToTuple } from "@s/util/types";

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

export const navigationMatcher = isAnyOf(
  ...(Object.values(actionCreators) as UnionToTuple<
    ActionCreators[keyof ActionCreators]
  >)
);

export const addRouterListener = (history: History) =>
  addListener({
    effect: (action) => {
      for (const [key, actionCreator] of objectEntries(actionCreators)) {
        if (actionCreator.match(action)) {
          // @ts-expect-error heh
          history[key](...action.payload);
        }
      }
    },
    matcher: navigationMatcher,
  });

export const setupLocationChangeListener = (history: History) =>
  history.listen((location) => {
    const title = getPageTitle(location.pathname);
    document.title = title ? `KeycapLendar: ${title}` : "KeycapLendar";
  });

export const selectLocation = (state: RootState, location: Location) =>
  location;

export const selectPage = (state: RootState, location: Location) =>
  getPageName(location.pathname);

export const selectPageTitle = (state: RootState, location: Location) =>
  getPageTitle(location.pathname);

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
